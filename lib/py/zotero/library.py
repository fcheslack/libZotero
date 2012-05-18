import urllib
import urllib2
import urlparse
#import requests
import json
import xml.dom.minidom
import logging
import pickle
import zotero


def apiRequestUrl(params={}, base=None):
    """ """
    if base == None:
        base = zotero.ZOTERO_URI
    if 'target' not in params:
        raise Exception("No target defined for api request")
    if 'libraryType' not in params and params['target'] != 'itemTemplate':
        raise Exception("No libraryType defined for api request")
    if 'libraryID' not in params and params['target'] != 'itemTemplate':
        raise Exception("No libraryID defined for api request")
    #special elif for www based api requests until those methods are mapped for api.zotero
    if params['target'] == 'user' or params['target'] == 'cv':
        base = 'https://www.zotero.org/api'
    elif params['target'] == 'itemTemplate':
        return base + '/items/new'
    url = base + '/' + params['libraryType'] + 's/' + str(params['libraryID'])

    if ('collectionKey' in params) and (params['collectionKey']):
        if params['collectionKey'] == 'trash':
            url += '/items/trash'
            return url
        else:
            url += '/collections/' + params['collectionKey']

    if params['target'] == 'items':
        url += '/items'
    elif params['target'] == 'item':
        if 'itemKey' in params:
            url += '/items/' + params['itemKey']
        else:
            url += '/items'
    elif params['target'] == 'collections':
        url += '/collections'
    elif params['target'] == 'collection':
        pass
    elif params['target'] == 'tags':
        url += '/tags'
    elif params['target'] == 'children':
        url += '/items/' + params['itemKey'] + '/children'
    elif params['target'] == 'itemTemplate':
        url = base + '/items/new'
    elif params['target'] == 'key':
        url = base + '/users/' + str(params['userID']) + '/keys/' + params['apiKey']
    elif params['target'] == 'userGroups':
        url = base + '/users/' + str(params['userID']) + '/groups'
    elif params['target'] == 'trash':
        url += '/items/trash'
    elif params['target'] == 'cv':
        url += '/cv'
    if 'targetModifier' in params:
        if params['targetModifier'] == 'top':
            url += '/top'
        elif params['targetModifier'] == 'children':
            url += '/children'
        elif params['targetModifier'] == 'file':
            if params['target'] != 'item':
                raise Exception('Trying to get file on non-item target')
            url += '/file'
        elif params['targetModifier'] == 'fileview':
            if params['target'] != 'item':
                raise Exception('Trying to get file on non-item target')
            url += '/file/view'
    #print "apiRequestUrl: " . url . "\n"
    return url


def apiQueryString(passedParams={}):
    # Tags query formats
    #
    # ?tag=foo
    # ?tag=foo bar # phrase
    # ?tag=-foo # negation
    # ?tag=\-foo # literal hyphen (only for first character)
    # ?tag=foo&tag=bar # AND
    # ?tag=foo&tagType=0
    # ?tag=foo bar || bar&tagType=0
    queryParamOptions = ['start',
                         'limit',
                         'order',
                         'sort',
                         'content',
                         'q',
                         'itemType',
                         'locale',
                         'key',
                         'itemKey',
                         'tag',
                         'tagType',
                         'style',
                         'format',
                         'linkMode']
    #build simple api query parameters object
    logging.info(passedParams)
    queryParams = []
    for val in queryParamOptions:
        if (val in passedParams) and (passedParams[val] != ''):
            if (val == 'itemKey') and ('target' in passedParams) and (passedParams['target'] != 'items'):
                #itemKey belongs in url, not querystring
                pass
            else:
                queryParams.append((val, passedParams[val]))
    #print(queryParams)
    return '?' + urllib.urlencode(queryParams)


def zrequest(url, method='GET', body=None, headers={}):
    """Make a request to the Zotero API and return the response object."""
    opener = urllib2.build_opener(urllib2.HTTPHandler)
    req = urllib2.Request(url, body)
    for key, val in headers.items():
        req.add_header(key, val)
    req.get_method = lambda: method
    r = None
    try:
        res = opener.open(req)
        r = zotero.Response(res)
        return r
    except (urllib2.URLError, urllib2.HTTPError) as err:
        r = zotero.Response(err)
        return r
        pass
    """
    if method == 'GET':
        r = requests.get(url, headers=headers)
    elif method == 'POST':
        r = requests.post(url, data=body, headers=headers)
    elif method == 'PUT':
        r = requests.put(url, data=body, headers=headers)
    elif method == 'DELETE':
        r = requests.delete(url, data=body, headers=headers)
    return r
    """


def getTemplateItem(itemType, linkMode=None):
    newItem = zotero.Item()
    aparams = {'target': 'itemTemplate', 'itemType': itemType}
    if linkMode != None:
        aparams['linkMode'] = linkMode

    reqUrl = apiRequestUrl(aparams) + apiQueryString(aparams)
    response = zrequest(reqUrl)
    if response.status_code != 200:
        raise Exception("Error getting template item")
    itemTemplate = json.loads(response.text)
    newItem.apiObject = itemTemplate
    return newItem



def loadLibrary(picklestring):
    return pickle.loads(picklestring)


class Library(object):
    def __init__(self,
                 libraryType,
                 libraryID,
                 libraryUrlIdentifier,
                 apiKey,
                 baseWebsiteUrl="http://www.zotero.org",
                 cachettl=300):
        self.ZOTERO_URI = 'https://api.zotero.org'
        self._apiKey = apiKey
        self._followRedirects = True
        self.libraryType = libraryType
        self.libraryID = libraryID
        self.libraryString = self.libraryString(libraryType, libraryID)
        self.libraryUrlIdentifier = libraryUrlIdentifier
        self.libraryBaseWebsiteUrl = baseWebsiteUrl
        self.items = zotero.Items()
        self.collections = zotero.Collections()
        self.dirty = False
        self.useLibraryAsContainer = True
        self._lastResponse = None
        self._lastFeed = None
        self._cachettl = cachettl
        self._cachePrefix = 'libZotero'
        self._cache = zotero.Cache()
        if cachettl > 0:
            self._cacheResponses = True
        else:
            self._cacheResponses = False

    def libraryString(self, ltype, libraryID):
        lstring = ''
        if(ltype == 'user'):
            lstring = 'u'
        elif(ltype == 'group'):
            lstring = 'g'
        lstring += str(libraryID)
        return lstring

    def apiRequestUrl(self, params={}, base=None):
        if 'target' not in params:
            raise Exception("No target defined for api request")
        #fill library specific params in if not present
        if 'libraryType' not in params:
            params['libraryType'] = self.libraryType
        if 'libraryID' not in params:
            params['libraryID'] = self.libraryID

        return apiRequestUrl(params)

    def apiQueryString(self, passedParams={}):
        if 'key' not in passedParams:
            passedParams['key'] = self._apiKey
        return apiQueryString(passedParams)

    def _request(self, url, method='GET', body=None, headers={}):
        logging.debug("zotero.Library._request")
        #check for cached result before http request
        r = None
        logging.debug("checking for cached request")
        if (self._cacheResponses) and (method.upper() == 'GET'):
            r = self._cache.cache_fetch(url)
        if(r != None):
            self._lastResponse = r
            return r
        r = zrequest(url, method, body, headers)
        if self._cacheResponses and (method.upper() == 'GET'):
            self._cache.cache_store(url, r)
        self._lastResponse = r
        return r

    def fetchCollections(self, params={}):
        aparams = {'target': 'collections', 'content': 'json', 'limit': 100}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise Exception("Error fetching collections")
        feed = zotero.Feed(response.text)
        self._lastFeed = feed
        addedCollections = self.collections.addCollectionsFromFeed(feed)

        if 'next' in feed.links:
            nextUrl = feed.links['next']['href']
            parsedNextUrl = urlparse.urlparse(nextUrl)
            parsedNextQuery = urlparse.parse_qs(parsedNextUrl.query)
            parsedNextQuery = self.apiQueryString(parsedNextQuery.update({'key': self._apiKey}))
            #parsedNextUrl['query'] = self.apiQueryString(array_merge({'key': self._apiKey}, self.parseQueryString(parsedNextUrl['query']) ) )
            reqUrl = parsedNextUrl['scheme'] + '://' + parsedNextUrl['host'] + parsedNextUrl['path'] + parsedNextQuery
        else:
            reqUrl = False
        return addedCollections

    def fetchItemsTop(self, params={}):
        params['targetModifier'] = 'top'
        return self.fetchItems(params)

    def fetchItems(self, params={}):
        fetchedItems = []
        aparams = {'target': 'items', 'content': 'json', 'key': self._apiKey}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        logging.info(reqUrl)
        response = self._request(reqUrl)
        if(response.status_code != 200):
            raise Exception("Error fetching items. " + str(response.status_code))
        body = response.text
        feed = zotero.Feed(body)
        self._lastFeed = feed

        fetchedItems = self.items.addItemsFromFeed(feed)

        return fetchedItems

    def fetchItemKeys(self, params={}):
        logging.info('zotero.Library.fetchItemKeys')
        fetchedKeys = []
        aparams = {'target': 'items', 'format': 'keys'}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise Exception("Error fetching item keys" + str(response.status_code))
        body = response.text
        fetchedKeys = body.strip().split("\n")
        return fetchedKeys

    def fetchTrashedItems(self, params={}):
        pass
        fetchedItems = []
        aparams = {'target': 'trash', 'content': 'json'}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise Exception("Error fetching items" + str(response.status_code))
        body = response.text
        feed = zotero.Feed(body)
        self._lastFeed = feed
        fetchedItems = self.items.addItemsFromFeed(feed)
        return fetchedItems

    def fetchItemsAfter(self, itemKey, params={}):
        #this might be completely broken
        pass
        fetchedItems = []
        itemKeys = self.fetchItemKeys(params)
        if itemKey != '':
            if itemKey not in itemKeys:
                return fetchedItems

        index = itemKeys.index(itemKey)
        offset = 0
        while (offset < index):
            if index - offset > 50:
                uindex = offset + 50
            else:
                uindex = index
            itemKeysToFetch = itemKeys[0:uindex]
            offset = uindex
            params['itemKey'] = itemKeysToFetch.join(',')
            fetchedSet = self.fetchItems(params)
            fetchedItems = fetchedItems.concat(fetchedSet)

        return fetchedItems

    def fetchItem(self, itemKey):
        aparams = {'target': 'item', 'content': 'json', 'itemKey': itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("Error fetching items")

        body = response.text
        item = zotero.Item(body)
        if not item:
            return False
        self.items.addItem(item)
        return item

    def fetchItemBib(self, itemKey, style=None):
        pass
        #TODO:parse correctly and return just bib
        aparams = {'target': 'item', 'content': 'bib', 'itemKey': itemKey}
        if style != None:
            aparams['style'] = style
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("Error fetching items")
        body = response.text
        feed = zotero.Feed(body)
        if len(feed.entries) == 0:
            return False
        else:
            item = zotero.Item(feed.entries[0])
            self.items.addItem(item)
            return item

    def itemDownloadLink(self, itemKey):
        pass
        aparams = {'target': 'item', 'itemKey': itemKey, 'targetModifier': 'file'}
        return self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

    def writeUpdatedItem(self, item):
        pass
        updateItemJson = json.dumps(item.updateItemObject())
        etag = item.etag

        aparams = {'target': 'item', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'PUT', updateItemJson, {'If-Match': etag})
        return response

    def uploadNewAttachedFile(self, item, file, fileinfo):
        pass

    def createAttachmentItem(self, parentItem, attachmentInfo):
        pass

    def getTemplateItem(self, itemType):
        return getTemplateItem(itemType)

    def createItem(self, item):
        createItemObject = item.newItemObject()
        #unset variables the api won't accept
        #del createItemObject['mimeType']
        #del createItemObject['charset']
        #del createItemObject['contentType']
        #del createItemObject['filename']
        #del createItemObject['md5']
        #del createItemObject['mtime']
        #del createItemObject['zip']

        createItemJson = json.dumps({'items': [createItemObject]})
        aparams = {'target': 'items'}
        #alter if item is a child
        if item.parentKey:
            aparams['itemKey'] = item.parentKey
            aparams['target'] = 'item'
            aparams['targetModifier'] = 'children'
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'POST', createItemJson)
        return response

    def addNotes(self, parentItem, noteItem):
        logging.info(noteItem)
        aparams = {'target': 'children', 'itemKey': parentItem.itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        if isinstance(noteItem, zotero.Item):
            noteJson = json.dumps({'items': [noteItem.newItemObject()]})
        else:
            notesArray = []
            for nitem in noteItem:
                notesArray.append(nitem.newItemObject())
            noteJson = json.dumps({'items': notesArray})

        response = self._request(reqUrl, 'POST', noteJson)
        return response

    def createCollection(self, name, parent=None):
        collection = zotero.Collection()
        collection.name = name
        collection.parentCollectionKey = parent
        json = collection.collectionJson()

        aparams = {'target': 'collections'}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'POST', json)
        return response
        pass

    def removeCollection(self, collection):
        aparams = {'target': 'collection', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': collection.etag})
        return response
        pass

    def addItemsToCollection(self, collection, items):
        aparams = {'target': 'items', 'collectionKey': collection.collectionKey}
        itemKeysString = ''
        for item in items:
            itemKeysString += item.itemKey
        itemKeysString = itemKeysString.strip()

        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'POST', itemKeysString)
        return response
        pass

    def removeItemFromCollection(self, collection, item):
        aparams = {'target': 'items', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': collection.etag})
        return response

    def removeItemsFromCollection(self, collection, items):
        removedItemKeys = []
        for item in items:
            response = self.removeItemFromCollection(collection, item)
            if response.status_code == 204:
                removedItemKeys.append(item.itemKey)
        return removedItemKeys
        pass

    def writeUpdatedCollection(self, collection):
        json = collection.collectionJson()

        aparams = {'target': 'collection', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'PUT', json, {'If-Match': collection.etag})
        return response
        pass

    def deleteItem(self, item):
        aparams = {'target': 'item', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': item.etag})
        return response
        pass

    def trashItem(self, item):
        item.set('deleted', 1)
        self.writeUpdatedItem(item)
        pass

    def fetchItemChildren(self, item):
        aparams = {'target': 'children', 'itemKey': item.itemKey, 'content': 'json'}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'GET')

        #load response into item objects
        fetchedItems = []
        if response.status_code != 200:
            return False
        feed = zotero.Feed(response.text)
        self._lastFeed = feed
        fetchedItems = self.items.addItemsFromFeed(feed)
        return fetchedItems
        pass

    def getItemTypes(self):
        reqUrl = zotero.ZOTERO_URI + 'itemTypes'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("failed to fetch itemTypes")
        itemTypes = json.loads(response.getBody())
        return itemTypes
        pass

    def getItemFields(self, itemType):
        reqUrl = zotero.ZOTERO_URI + 'itemFields'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("failed to fetch itemFields")
        itemFields = json.loads(response.getBody())
        return itemFields
        pass

    def getCreatorTypes(self, itemType):
        reqUrl = zotero.ZOTERO_URI + 'itemTypeCreatorTypes?itemType=' + itemType
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("failed to fetch creatorTypes")
        creatorTypes = json.loads(response.getBody())
        return creatorTypes
        pass

    def getCreatorFields(self, creatorType):
        reqUrl = zotero.ZOTERO_URI + 'creatorFields'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise Exception("failed to fetch creatorFields")
        creatorFields = json.loads(response.getBody())
        return creatorFields
        pass

    def fetchAllTags(self, params):
        aparams = {'target': 'tags', 'content': 'json', 'limit': 50}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        while True:
            response = self._request(reqUrl, 'GET')
            if response.status_code != 200:
                return False
            feed = zotero.Feed(response.text)
            entries = feed.entries
            tags = []
            for entry in entries:
                tag = zotero.Tag(entry)
                tags.append(tag)

            if 'next' in feed.links:
                nextUrl = feed.links['next']['href']
                #Add the apikey to the reqUrl querystring since feeds leave it out
                parsedNextUrl = urlparse.urlparse(nextUrl)
                parsedNextQuery = urlparse.parse_qs(parsedNextUrl.query)
                parsedNextQuery = self.apiQueryString(parsedNextQuery.update({'key': self._apiKey}))
                #parsedNextUrl['query'] = self.apiQueryString(array_merge({'key': self._apiKey}, self.parseQueryString(parsedNextUrl['query']) ) )
                reqUrl = parsedNextUrl['scheme'] + '://' + parsedNextUrl['host'] + parsedNextUrl['path'] + parsedNextQuery
            else:
                break
        return tags
        pass

    def fetchTags(self, params):
        aparams = {'target': 'tags', 'content': 'json', 'limit': 50}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            return False
        feed = zotero.Feed(response.text)
        entries = feed.entries
        tags = []
        for entry in entries:
            tag = zotero.Tag(entry)
            tags.append(tag)
        return tags
        pass

    def getKeyPermissions(self, userID, key):
        if userID == None:
            userID = self.libraryID
        if key == False:
            if self._apiKey == '':
                return False
            key = self._apiKey

        reqUrl = self.apiRequestUrl({'target': 'key', 'apiKey': key, 'userID': userID})
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            return False
        doc = xml.dom.minidom.parseString(response.text)
        keyNode = doc.getElementsByTagName('key').item(0)
        keyPerms = self.parseKey(keyNode)
        return keyPerms
        pass

    def parseKey(self, keyNode):
        keyPerms = {"library": "0", "notes": "0", "write": "0", 'groups': {}}

        accessEls = keyNode.getElementsByTagName('access')
        for access in accessEls:
            libraryAccess = access.getAttribute("library")
            notesAccess = access.getAttribute("notes")
            writeAccess = access.getAttribute("write")
            groupAccess = access.getAttribute("group")
            groupPermission = 'write' if access.getAttribute("write") else 'read'

            if libraryAccess:
                keyPerms['library'] = libraryAccess
            if notesAccess:
                keyPerms['notes'] = notesAccess
            if groupAccess:
                keyPerms['groups'][groupAccess] = groupPermission
            elif writeAccess:
                keyPerms['write'] = writeAccess
        return keyPerms
        pass

    def fetchGroups(self, userID):
        if not userID:
            userID = self.libraryID
        aparams = {'target': 'userGroups', 'userID': userID, 'content': 'json'}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            return False

        doc = xml.dom.minidom.parseString(response.text)
        entries = doc.getElementsByTagName('entry')
        groups = []
        for entry in entries:
            group = zotero.Group(entry)
            groups.append(group)
        return groups
        pass

    def getCV(self, userID):
        if userID == '' and self.libraryType == 'user':
            userID = self.libraryID
        aparams = {'target': 'cv', 'libraryType': 'user', 'libraryID': userID}
        reqUrl = self.apiRequestUrl(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            return False

        doc = xml.dom.minidom.parseString(response.text)
        sectionNodes = doc.getElementsByTagNameNS('*', 'cvsection')
        sections = []
        for sectionNode in sectionNodes:
            sectionTitle = sectionNode.getAttribute('title')
            c = sectionNode.nodeValue
            sections.append({'title':  sectionTitle, 'content': c})
        return sections
        pass

    def saveLibrary(self):
        """Return the library, excluding cache and lastResponse, in a serialized string."""
        #Library can't be pickled as long as there are http request objects in _lastResponse and _cache
        #this might be a job for __getstate__ but we'll leave it in here for now
        #save unpicklables temporarily, then put them back in the library
        c = self._cache
        self._cache = zotero.Cache()
        ls = self._lastResponse
        self._lastResponse = None
        s = pickle.dumps(self)
        #restore unpicklables for this process
        self._cache = c
        self._lastResponse = ls
        return s

if __name__ == "__main__":
    pass
