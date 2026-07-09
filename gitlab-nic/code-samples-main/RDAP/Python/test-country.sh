#!/bin/sh

# Testing various RDAP servers

# France
./country.py elysee.fr
# Personal domain, information not sent
./country.py bortzmeyer.fr
# Non-existing domain
./country.py rsdfsqsdfghgqsdfdsqhdf65675567.fr
# Tax heaven
./country.py amazon.fr

# Brazil
./country.py guaranifc.com.br

# Germany
# No RDAP server
./country.py taz.de

# Indonesia
./country.py manhwaindo.id
# Empty "entities" member
./country.py nic.id

# Iceland
# Country written in full, not as a ISO-3166 code
./country.py leikhusid.is

# ICANN TLD
# REDACTED_FOR_PRIVACY
% ./country.py nic.total

