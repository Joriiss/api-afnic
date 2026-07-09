#!/usr/bin/env python3

import requests
import json
import sys

import afnic

if len(sys.argv) != 2:
    raise Exception("Usage: add-nameserver-to-all hostname")
ns = sys.argv[1]
headers = afnic.get_headers()
response = requests.get("https://api-sandbox.nic.fr/v1/domains",
                        headers=headers)
if response.status_code != 200:
    raise Exception("HTTP status code for list is %s" % response.status_code)
body = json.loads(response.text)
for domain in body["content"]:
    args = {'name': domain['name'], 'nameServersToAdd': [ns]}
    response = requests.patch("https://api-sandbox.nic.fr/v1/domains/",
                         headers=headers, data=json.dumps(args))
    body = json.loads(response.text)
    if response.status_code != 200:
        print("HTTP status code for patch of %s is %s (%s)" % \
                        (domain['name'], response.status_code, body['errors'][0]['message']),
              file=sys.stderr)
    else:
        print("%s updated at %s" % (domain['name'], body['updateDate']))
    

    
