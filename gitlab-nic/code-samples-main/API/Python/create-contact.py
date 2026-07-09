#!/usr/bin/env python3

import requests
import json

import afnic

my_contact = {
  "email": "foobar@example.com",
  "localizedPostalInfo": {
    "contactName": "Directeur",
    "organizationName": "FooBar",
    "postalAddress": {
      "cityName": "Paris",
      "countryCode": "FO",
      "firstStreet": "1, rue",
      "postalCode": "12345"
    }
  },
  "telephoneIdentificationCode": "33",
  "telephoneNumber": "+33.12345678",
  "extensions": {
    "frnic": {
        "eligibilityVerified": True,
        "reachable":  {
            "reachable": True,
            "medium": "VOICE"
        },
        "moral": {
            "legalStatus": "COMPANY",
            "sirenSiret": "1234"
        }
   }
  }
}

headers = afnic.get_headers()
response = requests.post("https://api-sandbox.nic.fr/v1/contacts",
                         headers=headers, data=json.dumps(my_contact))
if response.status_code != 201:
    raise Exception("HTTP status code for create contact is %s" % response.status_code)
body = json.loads(response.text)
print(body)
    
