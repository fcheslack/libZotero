import logging
from collection import *


class Collections(object):
    def __init__(self):
        self.orderedArray = []
        self.collectionObjects = {}
        self.dirty = False
        self.loaded = False

    def addCollection(self, collection):
        self.collectionObjects[collection.collectionKey] = collection
        self.orderedArray.append(collection)

    def getCollection(self, collectionKey):
        if collectionKey in self.collectionObjects:
            return self.collectionObjects[collectionKey]
        else:
            return False

    def addCollectionsFromFeed(self, feed):
        addedCollections = []
        for entry in feed.entries:
            collection = Collection(entry)
            self.addCollection(collection)
            addedCollections.append(collection)

        return addedCollections

    def nestCollections(self):
        pass

    def orderCollections(self):
        pass

    def topCollectionKeys(self):
        pass
