import xml.dom.minidom


class Entry(object):
    def __init__(self, entryNode):
        if isinstance(entryNode, basestring):
            entryNode = xml.dom.minidom.parseString(entryNode)
            if not entryNode:
                raise Exception("Error constructing feed Domdoc")

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
        self.contentType = contentNode.getAttribute('type')
        self.contentZType = contentNode.getAttribute('zapi:type')
