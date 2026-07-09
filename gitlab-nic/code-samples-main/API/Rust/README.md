Sample code to access Afnic's API in Rust
=========================================

Configuration file
------------------

The configuration file consists of two or more lines. It contains your
secret password so *protect this file accordingly*. By default all
programs use ~/.afnic-api as a configuration file.

* The first line must be the username (login),
* the second line must be the password,
* the optionnal third line is the authorization endpoint. Defaults to
  `https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token`
  if empty or omitted,
* the optionnal fourth line is the service endpoint. Defaults to
  `https://api-sandbox.nic.fr/v1/` if empty or omitted.
* the optionnal fifth line is the `client_id`. Defaults to
  `registrars-api-client` if empty or omitted,

Available commands
------------------

To run a command use `cargo run --bin <command>`.

Currently available commands are:

* create-contact
* create-domain
* create-host
* das
* info-authorization-code-requests
* info-domain
* list-articles
* list-authorization-code-requests
* list-contacts
* list-domains
* list-domains-associated-with-host
* list-hosts
* renew-domain
* request-authorization-code
* update-domain
* update-host

Specifying the DS record sor DNSSEC signed delegations
------------------------------------------------------

Signed delegations can be registered with `create-domain` or
`update-domain`. The syntax is [the DS RR presentation
format](https://www.rfc-editor.org/rfc/rfc4034#section-5.3), but
*without* the possibility of parntheses or multiline. Note that you
will have to quote the argument to prevent the shell from interpreting
the four fields of the record as separate command line arguments.

The key algorithm and digest algorithm fields can also be specified as
text strings.

### Examples

    cargo run --bin update-domain -- \
        --add-ds "60485 5 1 2BB183AF5F22588179A53B0A 98631FAD1A292118" \
        example.fr

    cargo run --bin update-domain -- \
        --add-ds "60485 RSASHA1 SHA1 2BB183AF5F22588179A53B0A 98631FAD1A292118" \
        example.fr
