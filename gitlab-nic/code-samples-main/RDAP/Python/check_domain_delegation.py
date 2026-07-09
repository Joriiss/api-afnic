#!/usr/bin/env python3

"""Monitoring plugin (Nagios-compatible) for watching a domain name
with RDAP and checks that the name servers are what we expect. The
goal is to monitor DNS hijackings.

The monitoring plugin API is documented at
<https://www.monitoring-plugins.org/doc/guidelines.html>.

"""

# Default values
timeout = 10 # seconds

# An example of what we expect as the delegation of the domain
# name. If there is no glue for the server, use an empty array.
#{"ns1.nic.fr": ["192.134.4.1", "2001:67c:2218:2::4:1"],
#  "ns2.nic.fr": [],
#  "ns3.nic.fr": ["192.134.0.49", "2001:660:3006:1::1:1"],
#  "ns6.ext.nic.fr": ["130.59.31.29", "2001:620:0:ff::2f"]}

import sys
import json
import getopt
import urllib

# https://requests.readthedocs.io
import requests

# Local packages
import ianardap
import nagios

def usage(msg=None):
    print("Usage: %s -H domain-name -D delegation-as-JSON-object" % sys.argv[0], end="")
    if msg is not None and msg != "":
        print(" (%s)" % msg)
    else:
        print("")

domain = None
delegation = None
verbose = False
try:
    optlist, args = getopt.getopt (sys.argv[1:], "hvH:t:D:",
                                   ["help", "verbose", "delegation=",
                                    "timeout=", "hostname="])
    for option, value in optlist:
        if option == "--help" or option == "-h":
            usage()
            sys.exit(nagios.STATE_OK)
        elif option == "--verbose" or option == "-v":
            verbose = True
        elif option == "--hostname" or option == "-H":
            domain = value
        elif option == "--delegation" or option == "-D":
            delegation = value
        elif option == "--timeout" or option == "-t":
            timeout = int(value)
        else:
            # Should never occur, it is trapped by getopt
            print("Unknown option %s" % option)
            sys.exit(nagios.STATE_UNKNOWN)
except getopt.error as reason:
    usage(reason)
    sys.exit(nagios.STATE_UNKNOWN)
if len(args) != 0:
    usage("Extraneous arguments")
    sys.exit(nagios.STATE_UNKNOWN)
if domain is None or delegation is None:
    usage("-H and -D are mandatory")
    sys.exit(nagios.STATE_UNKNOWN)
utils = nagios.Utils(None, domain, None)        
try:
    delegation = json.loads(delegation)
except json.decoder.JSONDecodeError:
    utils.unknown("--delegation value must be a JSON object")
try:
    for nameserver in delegation:
        for address in delegation[nameserver]:
            pass # We just want to raise exceptions in case the object is
        # not the expected one.
except TypeError:
    utils.unknown("--delegation value must be a dictionary of nameservers, values being arrays of IP addresses")    
try:
    database = ianardap.IanaRDAPDatabase()
except Exception as e:
    utils.unknown("Exception when retrieving the IANA database: \"%s\"" % e)
utils = nagios.Utils(database, domain, None)    
servers = database.find(domain)
if servers is None:
    utils.unknown("No RDAP server found for %s" % domain)
server = servers[0]
if server.endswith("/"):
    server = server[:-1] # Donuts RDAP server balks when there are two slashes and reply 404

utils = nagios.Utils(database, domain, server, verbose)
try:
    success = False
    r = requests.get("%s/domain/%s" % (server, urllib.parse.quote(domain)), timeout=timeout)
    if r.status_code != 200:
        utils.unknown("Wrong reply from the RDAP server: %s" % r.status_code)
    nameservers = {}
    response = json.loads(r.text)
    for ns in response["nameservers"]:
        nameservers[ns["ldhName"]] = []
        for family in ["v4", "v6"]:
            if "ipAddresses" in ns:
                if family in ns["ipAddresses"]:
                    for addr in ns["ipAddresses"][family]:
                        nameservers[ns["ldhName"]].append(addr)
    if len(nameservers) == 0:
        utils.unknown("No name servers found")
    error = ""
    for ns in nameservers:
        if ns not in delegation:
            error += "Name server %s should not be there\n" % ns
        else:
            if nameservers[ns] is not None:
                for addr in nameservers[ns]:
                    if delegation[ns] is None or addr not in delegation[ns]:
                        error += "Glue record %s should not be there for server %s " % (addr, ns)
    for ns in delegation:
        if ns not in nameservers:
            error += "Name server %s is missing\n" % ns
        else:
            if delegation[ns] is not None:
                for addr in delegation[ns]:
                    if nameservers[ns] is None or addr not in nameservers[ns]:
                        error += "Glue record %s is missing for server %s " % (addr, ns)
    if error == "":
        utils.ok("Correct delegation")
    else:
        utils.error(error)
except Exception as e:
    utils.unknown("Unknown internal error %s" % e)
