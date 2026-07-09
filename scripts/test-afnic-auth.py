#!/usr/bin/env python3
"""Test AFNIC token retrieval — same payload as official afnic.py sample."""

import argparse
import json
import sys
import urllib.parse
import urllib.request

ENVIRONMENTS = {
    "sandbox": "https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token",
    "production": "https://login.nic.fr/auth/realms/fr/protocol/openid-connect/token",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Test AFNIC OAuth token request")
    parser.add_argument("username", help="AFNIC identifier (line 1 of ~/.afnic-api)")
    parser.add_argument("password", help="AFNIC password (line 2 of ~/.afnic-api)")
    parser.add_argument(
        "--env",
        choices=["sandbox", "production"],
        default="sandbox",
        help="Target environment (default: sandbox)",
    )
    args = parser.parse_args()

    token_url = ENVIRONMENTS[args.env]
    payload = urllib.parse.urlencode(
        {
            "grant_type": "password",
            "client_id": "registrars-api-client",
            "username": args.username,
            "password": args.password,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        token_url,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    print(f"Environment: {args.env}")
    print(f"Token URL:   {token_url}")
    print(f"Client ID:   registrars-api-client")
    print(f"Username:    {args.username}")
    print()

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read().decode("utf-8"))
            print("SUCCESS — access token received")
            print(f"expires_in: {body.get('expires_in')}s")
            print(f"token_type: {body.get('token_type')}")
            return 0
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        print(f"FAILED — HTTP {error.code}")
        print(raw)
        return 1


if __name__ == "__main__":
    sys.exit(main())
