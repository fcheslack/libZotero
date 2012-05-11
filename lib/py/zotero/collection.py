from entry import *


class Collection(Entry):
    def __init__(self, entryNode=None):
        if entryNode == None:
            return
        super(Collection, self).__init__(entryNode)
        self.libraryUrlIdentifier = ''
        self.collectionKey = entryNode.getElementsByTagName('zapi:key').item(0).childNodes.item(0).nodeValue
        self.numCollections = entryNode.getElementsByTagName('zapi:numCollections').item(0).childNodes.item(0).nodeValue
        self.numItems = entryNode.getElementsByTagName('zapi:numItems').item(0).childNodes.item(0).nodeValue

        contentNode = entryNode.getElementsByTagName('content').item(0)
        contentType = self.contentType
        if contentType == 'application/json':
            self.contentArray = json.loads(contentNode.childNodes.item(0).nodeValue)
            self.etag = contentNode.getAttribute('etag')
            self.parentCollectionKey = self.contentArray['parent']
            self.name = self.contentArray['name']
