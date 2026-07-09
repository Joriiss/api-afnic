#!/usr/bin/env python3

# Gets information about an authorization code. 

import requests
import json
import sys

import afnic

if len(sys.argv) != 2:
    raise Exception("Usage: %s request-ID" % sys.argv[0])
requestId = sys.argv[1]
headers = afnic.get_headers()
response = requests.get("https://api-sandbox.nic.fr/v1/registrar/authorization-code-requests/%s" % requestId,
                         headers=headers)
body = json.loads(response.text)
if response.status_code != 200:
    raise Exception("HTTP status code for this demand is %s (reason \"%s\")" % (response.status_code, body))
print("Request %s for domain %s is in state %s" % (body["repositoryObjectId"], body["domainName"], body["status"]))
if "code" in body:
    print("Authorization code is %s (valid until %s)" % (body["code"], body["codeExpirationDate"]))
    
      


    
