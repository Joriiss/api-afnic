#!/usr/bin/env python3

import requests
import json
import sys

import afnic

if len(sys.argv) < 3:
    raise Exception("Usage: add-nameserver nameserver domain ...")
ns = sys.argv[1]
list = sys.argv[2:]
headers = afnic.get_headers()
for domain in list:
    args = {'name': domain, 'nameServersToAdd': [ns]}
    response = requests.patch("https://api-sandbox.nic.fr/v1/domains/",
                         headers=headers, data=json.dumps(args))
    body = json.loads(response.text)
    print(body)
    if response.status_code != 200:
        raise Exception("HTTP status code for patch is %s" % response.status_code)
    
