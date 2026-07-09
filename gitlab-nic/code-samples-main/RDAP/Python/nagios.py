# Various constants and functions that are useful for RDAP Nagios plugins.

# Do not touch
# https://www.monitoring-plugins.org/doc/guidelines.html#AEN78
STATE_OK = 0
STATE_WARNING = 1
STATE_CRITICAL = 2
STATE_UNKNOWN = 3
STATE_DEPENDENT = 4

import sys

class Utils:

    def __init__(self, database, domain, server, verbose=False):
        self.database = database
        self.domain = domain
        self.server = server
        self.verbose=verbose
        
    def details(self):
        if self.verbose:
            print(" RDAP database \"%s\", version %s published on %s, retrieved on %s, RDAP server is %s" % \
                  (self.database.description, self.database.version, self.database.publication, self.database.retrieved, self.server))
        else:
            print("")

    def error(self, msg=None):
        if msg is None:
            msg = "Unknown error"
        print("%s CRITICAL: %s" % (self.domain, msg), end="")
        self.details()
        sys.exit(STATE_CRITICAL)

    def warning(self, msg=None):
        if msg is None:
            msg = "Unknown warning"
        print("%s WARNING: %s" % (self.domain, msg), end="")
        self.details()
        sys.exit(STATE_WARNING)

    def unknown(self, msg=None):
        if msg is None:
            msg = "Unknown"
        print("%s UNKNOWN: %s" % (self.domain, msg), end="")
        self.details()
        sys.exit(STATE_UNKNOWN)

    def ok(self, msg=None):
        if msg is None:
            msg = "Unknown message but everything is OK"
        print("%s OK: %s" % (self.domain, msg), end="")
        self.details()
        sys.exit(STATE_OK)

