#import logging
import json
from entry import *


class Collection(Entry):
    def __init__(self, entryNode=None, library=None):
        self.libraryUrlIdentifier = ''
        self.title = ''
        self.name = ''
        self.collectionKey = None
        self.collectionVersion = 0
        self.numCollections = 0
        self.numItems = 0
        self.parentCollectionKey = False
        self.apiObject = {}
        self.pristine = {}

        if library != None:
            self.associateWithLibrary(library)
        if entryNode == None:
            return
        super(Collection, self).__init__(entryNode)
        self.collectionKey = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'key').item(0).childNodes.item(0).nodeValue
        self.collectionVersion = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'version').item(0).childNodes.item(0).nodeValue
        self.numCollections = entryNode.getElementsByTagName('http://zotero.org/ns/api', 'numCollections').item(0).childNodes.item(0).nodeValue
        self.numItems = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'numItems').item(0).childNodes.item(0).nodeValue

        contentNode = entryNode.getElementsByTagName('content').item(0)
        if contentNode:
            contentType = contentNode.getAttribute('type')
            if contentType == 'application/json':
                jsonstring = contentNode.childNodes.item(0).nodeValue
                self.pristine = json.loads(jsonstring)
                self.apiObject = json.loads(jsonstring)
                self.parentCollectionKey = self.apiObject['parentCollection']
                self.name = self.apiObject['name']

    def writeApiObject(self):
        return dict(self.pristine.items() + self.apiObject.items())

    def get(self, key):
        if key == 'title' or key == 'name':
            return self.name
        elif key == 'collectionKey' or key == 'key':
            return self.collectionKey
        elif key == 'collectionVersion' or key == 'version':
            return self.collectionVersion
        elif key == 'parentCollection' or key == 'parentCollectionKey':
            return self.parentCollectionKey

        if key in self.apiObject:
            return self.apiObject[key]

        if key in dir(self):
            return self.__getattribute__(key)

        return None

    def set(self, key, val):
        if key in self.apiObject:
            self.apiObject[key] = val

        if key == 'title' or key == 'name':
            self.name = val
            self.apiObject['name'] = val
        elif key == 'collectionKey' or key == 'key':
            self.collectionKey = val
            self.apiObject['collectionKey'] = val
        elif key == 'parentCollection' or key == 'parentCollectionKey':
            self.parentCollectionKey = val
            self.apiObject['parentCollection'] = val
        elif key == 'collectionVersion' or key == 'version':
            self.collectionVersion = val
            self.apiObject['collectionVersion'] = val

        if key in self.apiObject:
            self.apiObject[key] = val

        if key in dir(self):
            self.__setattr__(key, val)
