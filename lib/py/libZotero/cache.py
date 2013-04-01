import time
import logging


class Cache(object):
    def __init__(self, backend='', ttl=300):
        self.store = {}
        self.expirations = {}
        self.ttl = ttl
        self.garbageInterval = 60  # how many operations between garbage collection
        self.opCount = 0  # count of operations for garbage collection purposes
        return

    def cache_store(self, key, value, lifetime=None):
        if lifetime == None:
            lifetime = self.ttl
        expiration = time.time() + lifetime
        self.store[key] = value
        self.expirations[key] = expiration
        logging.info("value stored in cache - " + key)
        #increment opCount and possibly garbage collect
        self.opCount += 1
        if self.opCount > self.garbageInterval:
            logging.info("sweeping cache")
            self._sweep_cache()
        return None

    def cache_fetch(self, key):
        now = time.time()
        if key in self.expirations:
            if self.expirations[key] < now:
                logging.info("Cache hit, but expired - returning None")
                return None
            else:
                if key in self.store:
                    logging.info('Cache hit - returning cached value')
                    return self.store[key]
        else:
            logging.info("Cache miss - returning None")
            return None

    def _sweep_cache(self):
        now = time.time()
        for key in self.expirations.keys():
            if self.expirations[key] < now:
                del self.store[key]
                del self.expirations[key]
