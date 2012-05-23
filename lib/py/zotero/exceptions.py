class ZoteroError(Exception):
    """Base class for exceptions in this module."""
    pass


class ZoteroUrlError(ZoteroError):
    pass


class ZoteroApiError(ZoteroError):
    pass


class ZoteroParseError(ZoteroError):
    pass
