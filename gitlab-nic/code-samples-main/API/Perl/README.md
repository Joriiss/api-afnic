Examples to access the new Afnic public API in Perl.

The credentials have to be stored in a file in `$HOME/.afnic-api` (similar to
Python examples) or set as environment variables `API_USERNAME` and
`API_PASSWORD`.

Once retrieved, the token is stored in `$HOME/.afnic-api-token` and reused. If
expired, it is automatically reused.

You need the Perl JSON package. You can install it from CPAN, or with a system package (for instance on Debian/Ubuntu/Mint `libjson-perl`).

Currently the following commands are supported:

* list-domains
* info-domain
* das
