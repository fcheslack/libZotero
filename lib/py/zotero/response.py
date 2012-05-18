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
