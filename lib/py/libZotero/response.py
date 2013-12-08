import logging


class Response(object):
    def __init__(self, res=None):
        logging.info("Initializing zotero.Response object")
        #info = res.info()
        self.url = res.geturl()
        #self.headers = info.dict
        self.headers = res.headers
        self.status_code = res.getcode()
        self.text = res.read()
        # capture backoff request from zotero API
        if 'backoff' in res.headers.keys():
            try:
                self.backoff = int(res.headers['backoff'])
            except:
                raise zotero.ZoteroApiError("can't parse backoff header value of '%s'" % res.headers['backoff'])
            else:
                l.debug("Zotero API has requested we back off for %s seconds" % self.backoff)
