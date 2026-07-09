#!/usr/bin/env python3

"""A simple module to get the RDAP server for a given domain name,
from the IANA database specified in RFC 7484.

"""

# http://python-requests.org/ for easier HTTPS retrieval
import requests

import datetime
import json
import os
import sys

IANABASE = "https://data.iana.org/rdap/dns.json"
CACHE = os.environ["HOME"] + "/.ianardapcache.json" 
MAXAGE = 24 # Hours

class IanaRDAPDatabase():

    def __init__(self, maxage=MAXAGE, cachefile=CACHE):
        """ Retrieves the IANA databse, if not already cached. maxage is in hours. """
        cache_valid = False
        if os.path.exists(cachefile) and \
           datetime.datetime.fromtimestamp(os.path.getmtime(cachefile)) >= \
           (datetime.datetime.utcnow() - datetime.timedelta(hours = maxage)):
            cache = open(cachefile, "rb")
            content = cache.read()
            cache.close()
            cache_valid = True
        else:
            response = requests.get(IANABASE)
            if response.status_code != 200:
                raise Exception("Invalid HTTPS return code when trying to get %s: %s" % (IANABASE, response.status_code))
            content = response.content
        database = json.loads(content)
        self.description = database["description"]
        self.publication = database["publication"]
        self.version = database["version"]
        self.services = {}
        for service in database["services"]:
            for tld in service[0]:
                for server in service[1]:
                    self.services[tld] = server
        if not cache_valid:
            cache = open(cachefile, "wb")
            cache.write(content)
            cache.close()
        
    def find(self, domain):
        """ Get the RDAP server for a given domain name. None if there is none."""
        labels = domain.split(".")
        tld = labels[len(labels)-1]
        if tld in self.services:
            return self.services[tld]
        else:
            return None

if __name__ == "__main__":
    rdap = IanaRDAPDatabase(maxage=1)
    print("Database \"%s\", version %s published on %s, %i services" % \
          (rdap.description, rdap.version, rdap.publication, len(rdap.services)))
    for domain in sys.argv[1:]:
        print("%s -> %s" % (domain, rdap.find(domain)))

