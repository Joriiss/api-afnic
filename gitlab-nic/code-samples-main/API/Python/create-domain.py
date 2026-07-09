#!/usr/bin/env python3

import requests
import json
import sys
import afnic

if len(sys.argv) != 2:
    raise Exception("Usage: create-domain name")
contact = "CTC65093"
args = {'name': sys.argv[1], "authorizationInformation": "Vachement1234sur",
        "registrantClientId": contact, "contacts": [
            {
                "clientId": contact,
                "role": "ADMINISTRATIVE"
            },
            {
                "clientId": contact,
                "role": "TECHNICAL"
            }
        ]} 
headers = afnic.get_headers()
response = requests.post("https://api-sandbox.nic.fr/v1/domains",
                         headers=headers, data=json.dumps(args))
try:
    body = json.loads(response.text)
except json.JSONDecodeError: # For some errors (5xx), the API returns HTML :-(
    body = response.text
print(body)
if response.status_code != 201:
    raise Exception("HTTP status code for create is %s" % response.status_code)
    
