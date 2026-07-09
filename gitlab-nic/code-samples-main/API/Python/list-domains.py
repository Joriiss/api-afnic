#!/usr/bin/env python3

# Retrieves the list of your domains. WARNING: it will find only the
# first N (N being curerntly 20, by default). See
# list-domains-paginated.py to get the entire list.

import requests
import json

import afnic

headers = afnic.get_headers()
response = requests.get("https://api-sandbox.nic.fr/v1/domains",
                        headers=headers)
if response.status_code != 200:
    raise Exception("HTTP status code for list is %s" % response.status_code)
body = json.loads(response.text)
for domain in body["content"]:
    print(domain["name"])
    
