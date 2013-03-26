import logging
from exceptions import *
import xml.dom.minidom


class Entry(object):
    def __init__(self, entryNode):
        if isinstance(entryNode, basestring):
            logging.info("doc is a string. make it a dom")
            entryNode = xml.dom.minidom.parseString(entryNode)
            if not entryNode:
                raise ZoteroParseError("Error constructing feed Domdoc")

        self.title = entryNode.getElementsByTagName('title').item(0).childNodes.item(0).nodeValue
        self.id = entryNode.getElementsByTagName('id').item(0).childNodes.item(0).nodeValue
        self.dateAdded = entryNode.getElementsByTagName('published').item(0).childNodes.item(0).nodeValue
        self.dateUpdated = entryNode.getElementsByTagName('updated').item(0).childNodes.item(0).nodeValue
        self.links = {}
        for n in entryNode.childNodes:
            if n.nodeName == 'link':
                linkrel = n.getAttribute('rel')
                linktype = n.getAttribute('type')
                linkhref = n.getAttribute('href')
                self.links[linkrel] = {'type': linktype, 'href': linkhref, 'rel': linkrel}
                if linkrel == 'enclosure':
                    self.links[linkrel]['title'] = n.getAttribute('title')
                    self.links[linkrel]['size'] = n.getAttribute('size')

        contentNode = entryNode.getElementsByTagName("content").item(0)
        if(contentNode):
            self.contentType = contentNode.getAttribute('type')
            self.contentZType = contentNode.getAttribute('zapi:type')

    def associateWithLibrary(self, library):
        self.libraryType = library.libraryType
        self.libraryID = library.libraryID
        self.owningLibrary = library
