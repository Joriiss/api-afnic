#!/usr/bin/env python3

""" Add a DNSSEC key. 

Example of use:
./add-dnskey.py café.fr 52726 RSASHA256 SHA256 91E907DB04319EAE1BAF14CE3006D94C4C94618BC4BF4CD7FA36DCF15B8AA8C9

"""

import requests
import json
import sys

import afnic

if len(sys.argv) != 6:
    raise Exception("Usage: add-dnskey domain tag algorithm digest-type digest")
domain = sys.argv[1]
tag = int(sys.argv[2])
algorithm = sys.argv[3]
digest_type = sys.argv[4]
digest = sys.argv[5]
headers = afnic.get_headers()
args = {"name": domain,
        "extensions": {
            "dnsSec": {"keysToAdd": [{"keyTag": tag, "algorithm": algorithm,
                                              "digestType": digest_type, "digest": digest}]}}}
response = requests.patch("https://api-sandbox.nic.fr/v1/domains/",
                          headers=headers, data=json.dumps(args))
body = json.loads(response.text)
print(body)
if response.status_code != 200:
    raise Exception("HTTP status code for patch is %s" % response.status_code)
    
