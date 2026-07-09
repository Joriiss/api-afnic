#!/usr/bin/env python3

# Another version of the DAS (Domain Availability Service), this time
# doing one HTTP request per domain (it makes the processing of the
# responses simpler). We keep the HTTP connection open, with session
# objects
# <https://requests.readthedocs.io/en/latest/user/advanced/?highlight=several#session-objects>

import requests
import json
import sys
import string

import afnic

list = list(map(lambda s: s.lower(), sys.argv[1:])) # The API lowercases the names :-(
if len(list) == 0:
    raise Exception("Usage: das domain ...")
s = requests.session()
s.headers.update(afnic.get_headers())
for domain in list:
    jlist = {"names": [domain]} 
    response = s.post("https://api-sandbox.nic.fr/v1/domains/check",
                      data=json.dumps(jlist))
    if response.status_code != 200:
        raise Exception("HTTP status code for check is %s" % response.status_code)
    body = json.loads(response.text)
    data = body["response"][0]
    data.update(body["extensions"]["frnic"]["response"][0])
    if data["available"]:
        available = "available"
    else:
        available = "NOT available"
    if data["forbidden"]:
        reason = " (forbidden word %s)" % data["reason"]
    elif data["reserved"]:
        reason = " (special handling %s)" % data["reason"]
    elif "reason" in data and data["reason"] is not None:
        reason = " (%s)" % data["reason"]
    else:
        reason = ""
    print("%s: %s%s" % (domain, available, reason))
    
