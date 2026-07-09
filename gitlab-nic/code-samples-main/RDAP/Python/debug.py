#!/usr/bin/env python3

"""Only for debugging."""

import sys
import urllib

import requests

# Local module
import ianardap

TIMEOUT=10

def usage(msg=None):
    print("Usage: %s domain-name" % sys.argv[0], end="")
    if msg is not None and msg != "":
        print(" (%s)" % msg)
    else:
        print("")

def error(msg=None):
    if msg is None:
        msg = "Unknown error"
    print("%s: %s" % (domain, msg), file=sys.stderr)
    sys.exit(1)


if len(sys.argv) != 2:
    usage()
    sys.exit(1)

domain = sys.argv[1]
database = ianardap.IanaRDAPDatabase()
server = database.find(domain)
if server is None:
    error("No RDAP server found for %s" % domain)
if server.endswith("/"):
    server = server[:-1] # Donuts RDAP server balks when there are two slashes and reply 404
try:
    response = requests.get("%s/domain/%s" % (server, urllib.parse.quote(domain)), timeout=TIMEOUT)
except requests.exceptions.Timeout:
    error("Timeout (maximum time is %i seconds) when trying to reach %s" % (TIMEOUT, server))
if response.status_code != 200:
    error("Invalid RDAP return code: %s" % response.status_code)
print(response.content.decode())
