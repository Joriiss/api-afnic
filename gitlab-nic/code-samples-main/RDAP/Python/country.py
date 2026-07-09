#!/usr/bin/env python3

"""Get the country of the holder of a domaine name.

Note that RFC 6350 (vCard) says that the country must be a full name,
but most RDAP servers use instead an ISO 3166 two-letter code (which
is certainly better). .is is an exception.

"""

import sys
import json
import getopt
import re
import urllib

# http://python-requests.org/ for easier HTTPS retrieval
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
servers = database.find(domain)
if servers is None:
    error("No RDAP server found for %s" % domain)
server = servers[0]
if server.endswith("/"):
    server = server[:-1] # Donuts RDAP server balks when there are two slashes and reply 404
try:
    response = requests.get("%s/domain/%s" % (server, urllib.parse.quote(domain)), timeout=TIMEOUT)
except requests.exceptions.Timeout:
    error("Timeout (maximum time is %i seconds) when trying to reach %s" % (TIMEOUT, server))
if response.status_code != 200:
    error("Invalid RDAP return code: %s (%s)" % (response.status_code, response.content.decode()))
rdap = json.loads(response.content)
country = None
# RFC 9083 does not really mandate to have the "entities" member. But
# everyone has one. For nic.id, it is empty.
if "entities" not in rdap:
    error("No entities in RDAP response")
if rdap["entities"] is not None: 
    for entity in rdap["entities"]: # jCard/vCard is awful to parse,
                                    # with its embedded arrays (no
                                    # dictionaries) of a fixed number
                                    # of elements.
        if "registrant" in entity["roles"]: # "registrant" role is
                                            # registered in
                                            # <https://www.iana.org/assignments/rdap-json-values/rdap-json-values.xml#rdap-json-values-1>
            if "vcardArray" in entity: 
                for item in entity["vcardArray"][1]:
                    if item[0] == "adr":
                        country = item[3][6]
if country is not None and country != "":
    print(country)
else:
    error("No country found for %s, may be restricted access for privacy reasons" % domain)
