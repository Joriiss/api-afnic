#!/usr/bin/env python3

"""Monitoring plugin (Nagios-compatible) to check the impeding
expiration of a domain name, through RDAP.

The monitoring plugin API is documented at
<https://www.monitoring-plugins.org/doc/guidelines.html>.

"""

import sys
import json
import datetime
import getopt
import re
import urllib

# http://python-requests.org/ for easier HTTPS retrieval
import requests

# Local modules
import ianardap
import nagios

VERSION = "0.0"

# Funny diversity in RDAP servers' output...
RFC3339 = "%Y-%m-%dT%H:%M:%SZ%z"
RFC3339TZ = "%Y-%m-%dT%H:%M:%S%z" # We cannot use it directly, Python uses HHMM as offset, not HH:MM as RFC 3339 does :-(
RFC3339LONG = "%Y-%m-%dT%H:%M:%S.%fZ%z" # Microseconds support (%f) does not seem documented

UTCINFO = datetime.timezone(offset=datetime.timedelta(seconds=0))

# Can be changed on the command-line
verbose = False
domain = None
critical_t = datetime.timedelta(days=2)
warning_t = datetime.timedelta(days=7)
unixtime = False
timeout = 20 # Seconds

def usage(msg=None):
    print("Usage: %s -H domain-name [-c critical -w warning -u -t timeout]" % sys.argv[0], end="")
    if msg is not None and msg != "":
        print(" (%s)" % msg)
    else:
        print("")

try:
    optlist, args = getopt.getopt (sys.argv[1:], "c:hH:t:uvVw:",
                                   ["critical=", "expiration", "help",
                                    "timeout=", "unixtime", "verbose",
                                    "version", "warning="])
    for option, value in optlist:
        if option == "--critical" or option == "-c":
            critical_t = datetime.timedelta(days=int(value))
        elif option == "--help" or option == "-h":
            usage()
            sys.exit(nagios.STATE_OK)
        elif option == "--hostname" or option == "-H":
            domain = value
        elif option == "--timeout" or option == "-t":
            timeout = int(value) 
        elif option == "--unixtime" or option == "-u":
            unixtime = True
        elif option == "--verbose" or option == "-v":
            verbose = True
        elif option == "--version" or option == "-V":
            print("%s version %s" % (sys.argv[0], VERSION))
            sys.exit(nagios.STATE_OK)
        elif option == "--warning" or option == "-w":
            warning_t = datetime.timedelta(days=int(value))
        else:
            # Should never occur, it is trapped by getopt
            print("Unknown option %s" % option)
            sys.exit(nagios.STATE_UNKNOWN)
except getopt.error as reason:
    usage(reason)
    sys.exit(nagios.STATE_UNKNOWN)
utils = nagios.Utils(None, domain, None)        
if len(args) != 0:
    usage("Extraneous arguments")
    sys.exit(nagios.STATE_UNKNOWN)
if domain is None:
    usage("-H is mandatory")
    sys.exit(nagios.STATE_UNKNOWN)
try:
    database = ianardap.IanaRDAPDatabase()
except Exception as e:
    utils.unknown("Exception when retrieving the IANA database: \"%s\"" % e)
utils = nagios.Utils(database, domain, None)            
servers = database.find(domain)
if servers is None:
    utils.unknown("No RDAP server found for %s" % domain)
# In theory, we could have several servers for the TLD but in
# practice, it does not seem actually used, so we are lazy, we just
# take the first one.
server = servers[0]
if server.endswith("/"):
    server = server[:-1] # Donuts RDAP server balks when there are two slashes and reply 404
utils = nagios.Utils(database, domain, server, verbose)    
try:
    response = requests.get("%s/domain/%s" % (server, urllib.parse.quote(domain)), timeout=timeout)
except requests.exceptions.Timeout:
    utils.unknown("Timeout when trying to reach %s" % server)    
if response.status_code != 200:
    utils.error("Invalid RDAP return code: %s" % response.status_code)
rdap = json.loads(response.content)
for event in rdap["events"]:
    if event["eventAction"] == "expiration":
        try:
            expiration = datetime.datetime.strptime(event["eventDate"] + "+0000", RFC3339LONG)
        except ValueError:
            try:
                expiration = datetime.datetime.strptime(event["eventDate"] + "+0000", RFC3339)
            except ValueError:
                # Python standard library offers no way to parse all RFC3339-compliant datetimes, so we have to hack.
                if re.search(r"\+[0-9]{2}:[0-9]{2}$", event["eventDate"]):
                    dt = re.sub(r"\+([0-9]{2}):([0-9]{2})$", r"+\1\2",  event["eventDate"])
                    expiration = datetime.datetime.strptime(dt, RFC3339TZ)
                else:
                    utils.unknown("No recognized format for datetime \"%s\"" % event["eventDate"])
        now = datetime.datetime.now(tz=UTCINFO)
        if unixtime == True:
            print(int(expiration.strftime("%s")))
            sys.exit(nagios.STATE_OK)
        if expiration < now:
            utils.error("domain %s is already expired (%s ago)" % (domain, (now-expiration)))
        rest = expiration-now
        if rest < critical_t:
            utils.error("expires in %s, HURRY UP!!!" % (rest))
        elif rest < warning_t:
            utils.warning("expires in %s, renew now" % (rest))
        else:
            utils.ok("expires in %s." % (rest))
utils.error("No expiration found")
