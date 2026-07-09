#!/usr/bin/env python3

import requests
import json
import sys
import urllib
import afnic

if len(sys.argv) != 2:
    raise Exception("Usage: delete-domain name")
domain = sys.argv[1]
headers = afnic.get_headers()
response = requests.delete("https://api-sandbox.nic.fr/v1/domains/%s" % \
                           urllib.parse.quote(domain),
                         headers=headers)
if response.status_code != 200:
    raise Exception("HTTP status code for delete is %s" % response.status_code)
body = json.loads(response.text)
print(body)

    
