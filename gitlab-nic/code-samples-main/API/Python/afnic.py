#!/usr/bin/env python3

import requests
import json
import os.path

class AuthFileNotFound(Exception):
    pass

class AuthFileEmpty(Exception):
    pass

class AuthenticationError(Exception):
    pass

authfile = "%s/.afnic-api" % os.environ['HOME']

def get_token():
    if not os.path.exists(authfile):
        raise AuthFileNotFound("Authentication file %s not found" % authfile)
    auth = open(authfile)
    login = auth.readline()
    if login is None or login == "":
        raise AuthFileEmpty("Authentication file %s empty or missing a end-of-line at the end" % authfile)
    login = login.rstrip("\n")
    password = auth.readline()
    if password is None or password == "":
        raise AuthFileEmpty("Authentication file %s empty or missing a end-of-line at the end" % authfile)
    password = password.rstrip("\n")
    auth.close()

    payload = {'client_id': 'registrars-api-client', 'username': login, 'password': password,
               'grant_type': 'password'}
    r = requests.post("https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token",
                      data=payload)
    if r.status_code != 200:
        raise AuthenticationError("HTTP status code for token request is %s" % r.status_code)
    body = json.loads(r.text)
    return body["access_token"]

def get_headers():
    token = get_token()
    return {'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Extensions': 'FRNIC_V2, SECDNS_V1_1',
            'Authorization': "Bearer %s" % token}


