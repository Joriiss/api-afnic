#!/usr/bin/env python3

# Requests an authorization code. 

import requests
import json
import sys

import afnic

client = "CTC71772"

if len(sys.argv) != 2:
    raise Exception("Usage: %s domain-name" % sys.argv[0])
domain = sys.argv[1]
headers = afnic.get_headers()
payload = {'domainName': domain, 'registrantClientId': client, 'justification': "Parce que c'est mon PROOOOJET !"}
response = requests.post("https://api-sandbox.nic.fr/v1/registrar/authorization-code-requests",
                         headers=headers, data=json.dumps(payload))
body = json.loads(response.text)
if response.status_code != 201:
    raise Exception("HTTP status code for auth. code request is %s (reason \"%s\")" % (response.status_code, body))
print("Authorization code %s requested" % body["repositoryObjectId"])


    
