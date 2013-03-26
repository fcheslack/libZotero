import logging
from collection import *
from zotero import getKey, responseIsError, updateObjectsFromWriteResponse


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

    def writeCollection(self, collection):
        cols = self.writeCollections([collection])
        if cols == False:
            return False
        return cols[0]

    def writeCollections(self, collections):
        collectionsArray = []
        for collection in collections:
            collectionKey = collection.get('collectionKey')
            if collectionKey == '' or collectionKey == None:
                newCollectionKey = getKey()
                collection.set('collectionKey', newCollectionKey)
                collection.set('collectionVersion', 0)
            collectionsArray.append(collection.writeApiObject())

        jsonString = json.dumps({'collections': collectionsArray})

        aparams = {'target': 'collections', 'content': 'json'}
        reqUrl = self.owningLibrary.apiRequestString(aparams)
        response = self.owningLibrary._request(reqUrl, 'POST', jsonString)
        updateObjectsFromWriteResponse(collections, response)
        if responseIsError(response):
            return False

        return collections

    def nestCollections(self):
        pass

    def orderCollections(self):
        pass

    def topCollectionKeys(self):
        pass
