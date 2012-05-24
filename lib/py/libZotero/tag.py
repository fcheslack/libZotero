import logging
import xml.dom.minidom
import re
import json
from entry import *


class Tag(Entry):
    def __init__(self, entryNode):
        self.tagID = None
        self.libraryID = None
        self.key = None
        self.name = None
        self.dateAdded = None
        self.dateModified = None
        self.type = None
        self.numItems = 0

        if entryNode == None:
            return
        elif isinstance(entryNode, basestring):
            doc = xml.dom.minidom.parseString(entryNode)
            entryNode = doc.getElementsByTagName("entry").item(0)
        super(Tag, self).__init__(entryNode)
        self.name = self.title
        numItems = entryNode.getElementsByTagNameNS('*', "numItems").item(0).childNodes.item(0).nodeValue
        if(numItems):
            self.numItems = int(numItems)

        tagElements = entryNode.getElementsByTagName("tag")
        self.tagElement = tagElements.item(0)

    def dataObject(self):
        tagDict = {}
        tagDict.title = self.title
        tagDict.dateAdded = self.dateAdded
        tagDict.dateUpdated = self.dateUpdated
        tagDict.id = self.id
        tagDict.properties = self.properties

        return tagDict
