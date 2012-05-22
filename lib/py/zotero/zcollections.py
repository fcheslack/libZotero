import logging
from collection import *


class Collections(object):
    def __init__(self):
        self.orderedArray = []
        self.collectionObjects = {}
        self.dirty = False
        self.loaded = False

    def __len__(self):
        return len(self.collectionObjects)

    def __getitem__(self, collectionKey):
        if collectionKey in self.collectionObjects:
            return self.collectionObjects[collectionKey]
        else:
            raise KeyError

    def __setitem__(self, collectionKey, item):
        self.collectionObjects[collectionKey] = item

    def __delitem__(self, collectionKey):
        del self.collectionObjects[collectionKey]

    def __iter__(self):
        return self.collectionObjects.__iter__()

    def __reversed__(self):
        ritems = Items()
        ritems.collectionObjects = self.collectionObjects.reversed()
        return ritems

    def __contains__(self, collectionKey):
        return collectionKey in self.collectionObjects

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
