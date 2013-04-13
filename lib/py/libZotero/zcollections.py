import logging
from collection import *
from zotero import getKey, responseIsError, updateObjectsFromWriteResponse


class Collections(object):
    def __init__(self):
        self.orderedArray = []
        self.collectionObjects = {}
        self.dirty = False
        self.loaded = False
        self.owningLibrary = None
        self.collectionsVersion = 0

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
            collectionsArray.append(collection)

        aparams = {'target': 'collections', 'content': 'json'}
        reqUrl = self.owningLibrary.apiRequestString(aparams)

        chunks = [collectionsArray[i:i + 50] for i in range(0, len(collectionsArray), 50)]
        for chunk in chunks:
            writeArray = []
            for collection in chunk:
                writeArray.append(collection.writeApiObject())
            requestData = json.dumps({'collections': writeArray})

            writeResponse = self.owningLibrary._request(reqUrl, 'POST', requestData, {'Content-Type': 'application/json'})
            if responseIsError(writeResponse):
                logging.info('writeCollections Error')
                logging.info(writeResponse.status_code)
                #entire request failed but we get no per-item write failure messages
                #so update all items with writeFailure manually
                for collection in chunk:
                    collection.writeFailure = {'key': collection.get('key'), 'code': writeResponse.status_code, 'message': writeResponse.text}
            else:
                updateObjectsFromWriteResponse(chunk, writeResponse)

        return collections

    def nestCollections(self):
        pass

    def orderCollections(self):
        pass

    def topCollectionKeys(self):
        pass
