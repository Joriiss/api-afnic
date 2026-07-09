#!/usr/bin/env python3

"""A simple module to get the RDAP server for a given domain name, IP
prefix or object, from the IANA databases specified in RFC 9224/8521.
"""

# http://python-requests.org/ for easier HTTPS retrieval
import requests

import datetime
import json
import os
import sys
import time
import fcntl
import pickle
import pathlib

IANABASES = {"domains": "https://data.iana.org/rdap/dns.json",
             "v4prefixes": "https://data.iana.org/rdap/ipv4.json",
             "v6prefixes": "https://data.iana.org/rdap/ipv6.json",
             "as": "https://data.iana.org/rdap/asn.json",
             "objects": "https://data.iana.org/rdap/object-tags.json"}
CACHE = os.environ["HOME"] + "/.ianardapcaches" 
MAXAGE = 24 # Hours. Used only if the server no longer gives the information.
IANATIMEOUT = 10 # Seconds
MAXTESTS = 3 # Maximum attempts to get the database

# Don't touch
HTTP_DATE_FORMAT = "%a, %d %b %Y %H:%M:%S %Z"

# RFC 9111, section 5.2
def parse_cachecontrol(h):
    result = {}
    directives = h.split(",")
    for directive in directives:
        directive = directive.strip()
        if "=" in directive:
            (key, value) = directive.split("=")
        else:
            key = directive
            value = None
        result[key.lower()] = value
    return result

def parse_expires(h):
    d = datetime.datetime.strptime(h, HTTP_DATE_FORMAT)
    return d

class IanaRDAPDatabase():

    def __init__(self, category="domains", maxage=None, cachedir=CACHE,
                 pickleformat=False):
        """Retrieves the IANA database, if not already cached. maxage is in
hours. The cachedir is a directory (it will be created if not already
existant). pickleformat is not the default because it is not really
faster *and* it introduces security risks if someone can write in the
file (see the documentation of the module).

        """
        
        cache_valid = False
        if not os.path.exists(cachedir):
            os.mkdir(cachedir)
        self.category = category
        cachefile = os.path.join(cachedir, category)
        if pickleformat:
            self.cachefile = cachefile + ".pickle"
        else:
            self.cachefile = cachefile + ".json"
        self.lockname = self.cachefile + ".lock"
        self.expirationfile = self.cachefile + ".expires"
        if maxage is not None:
            with open(self.expirationfile, 'w'):
                self.expirationtime = time.mktime((datetime.datetime.now() + \
                                                  datetime.timedelta(hours=maxage)).timetuple())
                os.utime(self.expirationfile,
                         times = (self.expirationtime, self.expirationtime))
        loaded = False
        tests = 0
        errmsg = "No error"
        while not loaded and tests < MAXTESTS:
            self.lock()
            if os.path.exists(self.cachefile) and \
               (pathlib.Path(self.expirationfile).exists() and \
                datetime.datetime.fromtimestamp(os.path.getmtime(self.expirationfile)) > \
                datetime.datetime.now()):
                cache = open(self.cachefile, "rb")
                content = cache.read()
                cache.close()
                self.unlock()
                if pickleformat:
                    try:
                        database = pickle.loads(content)
                        loaded = True
                        self.retrieved = datetime.datetime.fromtimestamp(os.path.getmtime(self.cachefile))
                        cache_valid = True
                    except (pickle.UnpicklingError, EOFError):
                        tests += 1
                        errmsg = "Invalid pickle content in %s" % self.cachefile
                        # Delete it without mercy
                        os.remove(self.cachefile)
                        continue                        
                else:
                    try:
                        database = json.loads(content)
                        loaded = True
                        self.retrieved = datetime.datetime.fromtimestamp(os.path.getmtime(self.cachefile))
                        cache_valid = True
                    except json.decoder.JSONDecodeError:
                        tests += 1
                        errmsg = "Invalid JSON content in %s" % self.cachefile
                        # Delete it without mercy
                        os.remove(self.cachefile)
                        continue
            else:
                self.unlock()
                response = requests.get(IANABASES[category], timeout=IANATIMEOUT)
                expirationtime = None
                if "cache-control" in response.headers:
                    directives = parse_cachecontrol(response.headers["cache-control"])
                    if "max-age" in directives:
                        maxage = int(directives["max-age"])
                        expirationtime = datetime.datetime.now() + datetime.timedelta(seconds=maxage)
                if not expirationtime:
                    if "expires" in response.headers:
                        expirationtime = parse_expires(response.headers["expires"])
                    else:
                        expirationtime = datetime.datetime.now() + datetime.timedelta(hours=MAXAGE)
                self.expirationtime = time.mktime(expirationtime.timetuple())
                if response.status_code != 200:
                    time.sleep(2)
                    tests += 1
                    errmsg = "Invalid HTTPS return code when trying to get %s: %s" % (IANABASE, response.status_code)
                    continue
                else:
                    loaded = True
                    self.retrieved = datetime.datetime.now()
                try:
                    content = response.content
                    database = json.loads(content)
                    with open(self.expirationfile, 'w'):
                        os.utime(self.expirationfile,
                                 times = (self.expirationtime, self.expirationtime))
                except json.decoder.JSONDecodeError:
                    tests += 1
                    errmsg = "Invalid JSON retrieved from %s" % IANABASE
                    continue
        if not loaded:
            raise Exception("Cannot read IANA database: %s" % errmsg)
        self.description = database["description"]
        self.publication = database["publication"]
        self.version = database["version"]
        self.services = {}
        if self.category == "domains":
            for service in database["services"]:
                for tld in service[0]:
                    if tld.lower() not in self.services:
                        self.services[tld.lower()] =[]
                    for server in service[1]:
                        # server is an URL so case-sensitive.
                        self.services[tld.lower()].append(server) 
        elif self.category == "objects":
            for service in database["services"]:
                maintainer = service[0]
                for registry in service[1]:
                    if registry.upper() not in self.services:
                        self.services[registry.upper()] =[]
                    for server in service[2]:
                        self.services[registry.upper()]
                    for server in service[2]:
                        self.services[registry.upper()].append(server)
        else: # IP addresses will be complicated, because of the
              # longest prefix rule.
            raise Exception("Unsupported category %s" % self.category)
        if not cache_valid:
            self.lock()
            cache = open(self.cachefile, "wb")
            if pickleformat:
                cache.write(pickle.dumps(database))
            else:
                cache.write(content)
            cache.close()
            self.unlock()
        
    def lock(self):
        self.lockhandle = open(self.lockname, 'w')
        fcntl.lockf(self.lockhandle, fcntl.LOCK_EX)

    def unlock(self):
        fcntl.lockf(self.lockhandle, fcntl.LOCK_UN)
        self.lockhandle.close()

    def find(self, id):
        """Get the RDAP server(s), as an array, for a given identifier. None
if there is none."""
        if self.category == "domains":
            domain = id
            if domain.endswith("."):
                domain = domain[:-1]
            labels = domain.lower().split(".")
            tld = labels[len(labels)-1]
            if tld in self.services:
                return self.services[tld]
            else:
                return None
        elif self.category == "objects":
            try:
                (handle, registry) = id.rsplit("-", maxsplit=1) 
            except ValueError:
                raise Exception("Not a valid RFC 8521 identifier: \"%s\"" % id)
            if registry.upper() in self.services:
                return self.services[registry.upper()]
            else:
                return None
        else:
            raise Exception("Unsupported category %s" % self.category)

if __name__ == "__main__":
    rdap = IanaRDAPDatabase(maxage=1)
    print("Database \"%s\", version %s published on %s, retrieved on %s, %i services" % \
          (rdap.description, rdap.version, rdap.publication, rdap.retrieved, len(rdap.services)))
    for domain in sys.argv[1:]:
        print("%s -> %s" % (domain, rdap.find(domain)))

