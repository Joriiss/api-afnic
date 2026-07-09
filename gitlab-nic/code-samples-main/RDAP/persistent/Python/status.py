#!/usr/bin/env python3

"""A Python program to get the creation date of several domain names,
through RDAP, using only one HTTP
connection. https://requests.readthedocs.io/en/latest/user/advanced/

"""

import sys
import json
import datetime
import getopt
import re

# http://python-requests.org/ for easier HTTPS retrieval
import requests

# Local module
import ianardap

# Can be changed on the command-line
verbose = False
persistent = True

def usage(msg=None):
    print("Usage: %s domain-name(s) ..." % sys.argv[0], end="", file=sys.stderr)
    if msg is not None and msg != "":
        print(" (%s)" % msg, file=sys.stderr)
    else:
        print("", file=sys.stderr)

try:
    optlist, args = getopt.getopt (sys.argv[1:], "hnv",
                                   ["help", "no-reuse", "verbose"])
    for option, value in optlist:
        if option == "--help" or option == "-h":
            usage()
            sys.exit(0)
        elif option == "--no-reuse" or option == "-n":
            persistent = False
        elif option == "--verbose" or option == "-v":
            verbose = True
        else:
            usage("Unknown internal error")
            sys.exit(1)
except getopt.error as reason:
    usage(reason)
    sys.exit(1)
if len(args) < 1:
    usage()
    sys.exit(1)

database = ianardap.IanaRDAPDatabase()
if verbose:
    print("Using database \"%s\", version %s published on %s" % \
          (database.description, database.version, database.publication))
servers = {}
for domain in args:
    domain = domain.lower()
    server = database.find(domain)
    if server is None:
        raise Exception("No RDAP server found for %s" % domain)
    if server.endswith("/"):
        server = server[:-1] # Donuts RDAP server balks when there are two slashes and reply 404
    if verbose:
        print("RDAP server is %s" % server)
    if persistent:
        if server in servers:
            session = servers[server]
        else:
            session = requests.Session()
            servers[server] = session
        if verbose:
            print("Session is %s" % session)
    if persistent:
        response = session.get("%s/domain/%s" % (server, domain))
    else:
        response = requests.get("%s/domain/%s" % (server, domain))
    if response.status_code != 200:
        raise Exception("Invalid RDAP return code: %s" % response.status_code)
    rdap = json.loads(response.content)
    print("%s: %s" % (domain, rdap["status"]))

    
