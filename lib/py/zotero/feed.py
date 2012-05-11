import xml.dom.minidom


class Feed(object):
    def __init__(self, doc):
        #construct dom doc if we were passed a string
        if isinstance(doc, basestring):
            print("doc is a string. make it a dom")
            doc = xml.dom.minidom.parseString(doc)
            if not doc:
                print(doc)
                raise Exception("Error constructing feed Domdoc")
        feedEl = doc.getElementsByTagName('feed').item(0)
        if not feedEl:
            raise Exception("No feed node in passed doc")
        self.title = feedEl.getElementsByTagName('title').item(0).childNodes.item(0).nodeValue
        self.id = feedEl.getElementsByTagName("id").item(0).childNodes.item(0).nodeValue
        self.dateUpdated = feedEl.getElementsByTagName("updated").item(0).childNodes.item(0).nodeValue
        self.apiVersion = feedEl.getElementsByTagName("zapi:apiVersion").item(0).childNodes.item(0).nodeValue
        self.totalResults = feedEl.getElementsByTagName("zapi:totalResults").item(0).childNodes.item(0).nodeValue
        #grab links of the feed element (and not all the entries)
        self.links = {}
        for n in feedEl.childNodes:
            if n.nodeName == 'link':
                linkrel = n.getAttribute('rel')
                linktype = n.getAttribute('type')
                linkhref = n.getAttribute('href')
                self.links[linkrel] = {'type': linktype, 'href': linkhref, 'rel': linkrel}

        self.entries = feedEl.getElementsByTagName('entry')
