#!/usr/bin/env python3

import requests
import json
import sys

import afnic

if len(sys.argv) != 2:
    raise Exception("Usage: create-host hostname")
headers = afnic.get_headers()
my_host = {
    'name': sys.argv[1]
}
response = requests.post("https://api-sandbox.nic.fr/v1/hosts",
                         headers=headers, data=json.dumps(my_host))
if response.status_code != 201:
    raise Exception("HTTP status code for create host is %s" % response.status_code)
body = json.loads(response.text)
print(body)
    
