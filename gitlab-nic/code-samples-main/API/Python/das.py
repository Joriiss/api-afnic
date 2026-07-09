#!/usr/bin/env python3

# DAS (Domain Availability Service)

import requests
import json
import sys
import string

import afnic

list = list(map(lambda s: s.lower(), sys.argv[1:])) # The API lowercases the names :-(
if len(list) == 0:
    raise Exception("Usage: das domain ...")
jlist = {"names": list} 
headers = afnic.get_headers()
response = requests.post("https://api-sandbox.nic.fr/v1/domains/check",
                         headers=headers, data=json.dumps(jlist))
if response.status_code != 200:
    raise Exception("HTTP status code for check is %s" % response.status_code)
body = json.loads(response.text)
domains = {}
domains_extra = {}
for domain in body["extensions"]["frnic"]["response"]:
    domains_extra[domain["name"]] = domain
for domain in body["response"]:
    if domain["name"] not in list:
        print("Strange, %s is in the response but not in the questions" % domain["name"],
              file=sys.stderr)
    else:
        domains[domain["name"]] = {"available": domain["available"],
                                 "forbidden": domains_extra[domain["name"]]["forbidden"],
                                 "reserved": domains_extra[domain["name"]]["reserved"]}
        if "reason" not in domains_extra[domain["name"]]:
            if "reason" in domain:
                domains[domain["name"]]["reason"] = domain["reason"]
            else:
                domains[domain["name"]]["reason"] = None
        else:
            domains[domain["name"]]["reason"] = domains_extra[domain["name"]]["reason"]
for name in domains:
    domain = domains[name]
    if domain["available"]:
        available = "available"
    else:
        available = "NOT available"
    if domain["forbidden"]:
        reason = " (forbidden word %s)" % domain["reason"]
    elif domain["reserved"]:
        reason = " (special handling %s)" % domain["reason"]
    elif domain["reason"] is not None:
        reason = " (%s)" % domain["reason"]
    else:
        reason = ""
    print("%s: %s%s" % (name, available, reason))
    
