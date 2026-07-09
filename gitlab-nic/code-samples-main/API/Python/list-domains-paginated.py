#!/usr/bin/env python3

# Retrieves the list of all your domains

import requests
import json

import afnic

PAGE_SIZE=100 # The maximum value, over 100, you'll get a 400 HTTP error.

s = requests.session()
s.headers.update(afnic.get_headers())
got_all = False
page = 0
total_domains = None
domains = 0
while not got_all:
    response = s.get("https://api-sandbox.nic.fr/v1/domains?pageSize=%i&page=%i" % \
                            (PAGE_SIZE, page))
    body = json.loads(response.text)
    if response.status_code != 200:
        print(body)
        raise Exception("HTTP status code for list is %s" % response.status_code)
    total_domains = body["totalElements"]
    for domain in body["content"]:
        print(domain["name"])
        domains += 1
    print("%i domains retrieved" % domains)
    if domains >= total_domains or len(body["content"]) == 0:
        got_all = True
    else:
        page += 1
s.close()
