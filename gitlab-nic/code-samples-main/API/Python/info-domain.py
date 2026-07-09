#!/usr/bin/env python3

import requests
import json
import sys
import afnic

list = sys.argv[1:]
if len(list) == 0:
    raise Exception("Usage: info-domain name ...")
headers = afnic.get_headers()
for domain in list:
    response = requests.get("https://api-sandbox.nic.fr/v1/domains/%s" % domain,
                         headers=headers)
    if response.status_code != 200:
        raise Exception("HTTP status code for info of %s is %s" % (domain, response.status_code))
    body = json.loads(response.text)
    print(body)

    
