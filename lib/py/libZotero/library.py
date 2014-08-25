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
    """Build and return a valid url to request a Zotero API resource."""
    if base == None:
        base = zotero.ZOTERO_URI
    if 'target' not in params:
        raise zotero.ZoteroUrlError("No target defined for api request")
    if 'libraryType' not in params and params['target'] != 'itemTemplate':
        raise zotero.ZoteroUrlError("No libraryType defined for api request")
    if 'libraryID' not in params and params['target'] != 'itemTemplate':
        raise zotero.ZoteroUrlError("No libraryID defined for api request")
    #special elif for www based api requests until those methods are mapped for api.zotero
    if params['target'] == 'user' or params['target'] == 'cv':
        base = 'https://www.zotero.org/api'
    elif params['target'] == 'itemTemplate':
        return base + '/items/new'

    if (params['libraryType'] == 'user') or (params['libraryType'] == 'group'):
        url = base + '/' + params['libraryType'] + 's/' + str(params['libraryID'])
    else:
        url = base

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
                raise zotero.ZoteroUrlError('Trying to get file on non-item target')
            url += '/file'
        elif params['targetModifier'] == 'fileview':
            if params['target'] != 'item':
                raise zotero.ZoteroUrlError('Trying to get file on non-item target')
            url += '/file/view'
    #print "apiRequestUrl: " . url . "\n"
    return url


def apiQueryString(passedParams={}):
    """Build and return a valid query string for a request for a Zotero API resource."""
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
                         'linkMode',
                         'upload',
                         'algorithm']
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
    req.add_header('Zotero-API-Version', zotero.ZOTERO_API_VERSION)
    req.add_header('User-Agent', 'LibZotero-php-' + zotero.LIBZOTERO_VERSION)
    req.get_method = lambda: method
    r = None
    try:
        res = opener.open(req)
        r = zotero.Response(res)
        return r
    except (urllib2.URLError, urllib2.HTTPError) as err:
        r = zotero.Response(err)
        return r


def getTemplateItem(itemType, linkMode=None):
    """Return a template for a Zotero API item of a particular type."""
    newItem = zotero.Item()
    aparams = {'target': 'itemTemplate', 'itemType': itemType}
    if linkMode != None:
        aparams['linkMode'] = linkMode

    reqUrl = apiRequestUrl(aparams) + apiQueryString(aparams)
    response = zrequest(reqUrl)
    if response.status_code != 200:
        raise zotero.ZoteroApiError("Error getting template item")
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
        """Return a string that uniquely identifies a library for use as a cache key."""
        lstring = ''
        if(ltype == 'user'):
            lstring = 'u'
        elif(ltype == 'group'):
            lstring = 'g'
        lstring += str(libraryID)
        return lstring

    def apiRequestUrl(self, params={}, base=None):
        """Build and return a valid url to request a Zotero API resource."""
        if 'target' not in params:
            raise zotero.ZoteroUrlError("No target defined for api request")
        #fill library specific params in if not present
        if 'libraryType' not in params:
            params['libraryType'] = self.libraryType
        if 'libraryID' not in params:
            params['libraryID'] = self.libraryID

        return apiRequestUrl(params)

    def apiQueryString(self, passedParams={}):
        """Build and return a valid query string for a request for a Zotero API resource."""
        if 'key' not in passedParams:
            passedParams['key'] = self._apiKey
        return apiQueryString(passedParams)

    def _request(self, url, method='GET', body=None, headers={}):
        """Make a request to the Zotero API and return the response object."""
        logging.debug("zotero.Library._request")
        #check for cached result before http request
        r = None
        logging.debug("checking for cached request")
        if (self._cacheResponses) and (method.upper() == 'GET'):
            logging.debug("caching responses and get request - checking cache")
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
        """Fetch a set of collections."""
        aparams = {'target': 'collections', 'content': 'json', 'limit': 100}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise zotero.ZoteroApiError("Error fetching collections")
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
        """Fetch a set of top level items."""
        params['targetModifier'] = 'top'
        return self.fetchItems(params)

    def fetchItems(self, params={}):
        """Fetch a set of items."""
        fetchedItems = []
        aparams = {'target': 'items', 'content': 'json', 'key': self._apiKey}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        logging.info(reqUrl)
        response = self._request(reqUrl)
        if(response.status_code != 200):
            raise zotero.ZoteroApiError("Error fetching items. " + str(response.status_code))
        body = response.text
        feed = zotero.Feed(body)
        self._lastFeed = feed

        fetchedItems = self.items.addItemsFromFeed(feed)

        return fetchedItems

    def fetchItemKeys(self, params={}):
        """Fetch all item keys in the library, specified by params."""
        logging.info('zotero.Library.fetchItemKeys')
        fetchedKeys = []
        aparams = {'target': 'items', 'format': 'keys'}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise zotero.ZoteroApiError("Error fetching item keys" + str(response.status_code))
        body = response.text
        fetchedKeys = body.strip().split("\n")
        return fetchedKeys

    def fetchTrashedItems(self, params={}):
        """Fetch a set of items marked for deletion."""
        fetchedItems = []
        aparams = {'target': 'trash', 'content': 'json'}
        aparams.update(params)
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl)
        if response.status_code != 200:
            raise zotero.ZoteroApiError("Error fetching items" + str(response.status_code))
        body = response.text
        feed = zotero.Feed(body)
        self._lastFeed = feed
        fetchedItems = self.items.addItemsFromFeed(feed)
        return fetchedItems

    def fetchItemsAfter(self, itemKey, params={}):
        """Fetch a set of items after the specified itemKey."""
        #this might be completely broken
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
        """Fetch a single item."""
        aparams = {'target': 'item', 'content': 'json', 'itemKey': itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("Error fetching items")

        body = response.text
        item = zotero.Item(body)
        if not item:
            return False
        self.items.addItem(item)
        return item

    def fetchItemBib(self, itemKey, style=None):
        """Fetch a bibliography entry for an item."""
        #TODO:parse correctly and return just bib
        aparams = {'target': 'item', 'content': 'bib', 'itemKey': itemKey}
        if style != None:
            aparams['style'] = style
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("Error fetching items")
        body = response.text
        feed = zotero.Feed(body)
        if len(feed.entries) == 0:
            return False
        else:
            item = zotero.Item(feed.entries[0])
            self.items.addItem(item)
            return item

    def itemDownloadLink(self, itemKey):
        """Get the link to download an attached item file."""
        aparams = {'target': 'item', 'itemKey': itemKey, 'targetModifier': 'file'}
        return self.apiRequestUrl(aparams) + self.apiQueryString(aparams)

    def writeUpdatedItem(self, item):
        """Attempt to write a modified item back to the server."""
        updateItemJson = json.dumps(item.updateItemObject())
        etag = item.etag

        aparams = {'target': 'item', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'PUT', updateItemJson, {'If-Match': etag})
        return response

    def uploadNewAttachedFile(self, item, filedata, fileinfo):
        """Create an attachment item as a child of the passed item and upload
        a file as the attachment.
        """
        #get upload authorization
        #post file or patch
        uaparams = {'target': 'item', 'targetModifier': 'file', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(uaparams) + self.apiQueryString(uaparams)
        uaPostData = urllib.urlencode(fileinfo)
        uploadAuthResponse = zrequest(reqUrl, 'POST', uaPostData, {'If-None-Match': '*'})
        if uploadAuthResponse.status_code != 200:
            logging.info('upload new attached file - uploadAuthResponse: ')
            logging.info(uploadAuthResponse.status_code)
            logging.info(uploadAuthResponse.text)
            raise zotero.ZoteroApiError("Upload Authorization Failed")
        #full upload
        upAuthOb = json.loads(uploadAuthResponse.text)
        if 'exists' in upAuthOb and upAuthOb['exists'] == 1:
            #file already exists with this hash
            return None
        #uploadBody = u'' + upAuthOb['prefix'] + filedata + upAuthOb['suffix']
        uploadBody = bytearray(upAuthOb['prefix'].encode())
        uploadBody.extend(filedata)
        uploadBody.extend(bytearray(upAuthOb['suffix'].encode()))

        uploadResponse = zrequest(upAuthOb['url'], 'POST', uploadBody, {'Content-Type': upAuthOb['contentType']})
        if uploadResponse.status_code != 201:
            raise zotero.ZoteroApiError("Error uploading attachment file")
        ucparams = {'target': 'item', 'targetModifier': 'file', 'itemKey': item.itemKey}
        ucReqUrl = self.apiRequestUrl(ucparams) + self.apiQueryString(ucparams)
        registerUploadBody = uaPostData = urllib.urlencode({'upload': upAuthOb['uploadKey']})
        ucResponse = zrequest(ucReqUrl, 'POST', registerUploadBody, {'Content-Type': 'application/x-www-form-urlencoded',
                                                                     'If-None-Match': '*'})
        if ucResponse.status_code != 204:
            raise zotero.ZoteroApiError("Error confirming upload to Zotero API - " + ucResponse.text)
        return True
        pass

    def uploadAttachedFilePatch(self, item, patchdata, fileinfo, algorithm='bsdiff'):
        """Upload a patch for an attached file already present on the server."""
        #get upload authorization
        #post file or patch
        uaparams = {'target': 'item', 'targetModifier': 'file', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(uaparams) + self.apiQueryString(uaparams)
        uaPostData = urllib.urlencode(fileinfo)
        uploadAuthResponse = zrequest(reqUrl, 'POST', uaPostData, {'If-Match': item.get('md5')})
        if uploadAuthResponse.status_code != 200:
            logging.info('upload new attached file - uploadAuthResponse: ')
            logging.info(uploadAuthResponse.status_code)
            logging.info(uploadAuthResponse.text)
            raise zotero.ZoteroApiError("Upload Authorization Failed")
        #patch upload
        upAuthOb = json.loads(uploadAuthResponse.text)
        if 'exists' in upAuthOb and upAuthOb['exists'] == 1:
            #file already exists with this hash
            return None
        upparams = {'target': 'item', 'targetModifier': 'file', 'itemKey': item.itemKey, 'upload': upAuthOb['uploadKey'], 'algorithm': algorithm}
        uploadUrl = self.apiRequestUrl(upparams) + self.apiQueryString(upparams)
        logging.info(upAuthOb)
        #uploadBody = bytearray(upAuthOb['prefix'].encode())
        #uploadBody.extend(patchdata)
        #uploadBody.extend(bytearray(upAuthOb['suffix'].encode()))
        uploadBody = bytearray(patchdata)
        logging.info(uploadBody)
        logging.info(upAuthOb['contentType'])
        uploadResponse = zrequest(uploadUrl, 'PATCH', uploadBody, {'Content-Type': upAuthOb['contentType'],
                                                                   'If-Match': item.get('md5')})
        if uploadResponse.status_code != 204:
            logging.info(uploadResponse.status_code)
            logging.info(uploadResponse.text)
            raise zotero.ZoteroApiError("Error uploading or applying attachment file patch")
        return True

    def uploadExistingAttachedFile(self, item, f, fileinfo):
        """Upload a full copy of a file for an attachment that already exists on the server."""
        pass

    def createAttachmentItem(self, parentItem, attachmentInfo):
        """Create a new attachment item as a child of parentItem."""
        logging.info("createAttachmentItem")
        #get attachment template
        adata = {'attachmentType': 'imported_file', 'contentType': None, 'filename': ''}
        adata.update(attachmentInfo)
        logging.info("createAttachmentItem: " + str(adata))
        templateItem = self.getTemplateItem('attachment', adata['attachmentType'])
        templateItem.parentKey = parentItem.itemKey
        templateItem.set('title', adata['filename'])
        templateItem.set('contentType', adata['contentType'])
        #create child item
        logging.info("creating attachment Item: ")
        return self.createItem(templateItem)

    def getTemplateItem(self, itemType, linkMode=None):
        """Return a template for a Zotero API item of a particular type."""
        return getTemplateItem(itemType, linkMode)

    def createItem(self, item):
        """Create a new item on the server."""
        logging.info("createItem")
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
        logging.info('createItemResponse')
        logging.info(response)
        return response

    def addNotes(self, parentItem, noteItem):
        """Add note items as children of parentItem."""
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
        """Create a new collection on the server."""
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
        """Remove an existing collection from the server."""
        aparams = {'target': 'collection', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': collection.etag})
        return response
        pass

    def addItemsToCollection(self, collection, items):
        """Add specified items to the specified collection."""
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
        """Remove item from collection."""
        aparams = {'target': 'items', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': collection.etag})
        return response

    def removeItemsFromCollection(self, collection, items):
        """Remove multiple items from the specified collection."""
        removedItemKeys = []
        for item in items:
            response = self.removeItemFromCollection(collection, item)
            if response.status_code == 204:
                removedItemKeys.append(item.itemKey)
        return removedItemKeys
        pass

    def writeUpdatedCollection(self, collection):
        """Submit a modified collection to be saved on the server."""
        json = collection.collectionJson()

        aparams = {'target': 'collection', 'collectionKey': collection.collectionKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'PUT', json, {'If-Match': collection.etag})
        return response
        pass

    def deleteItem(self, item):
        """Permanently delete an existing item."""
        aparams = {'target': 'item', 'itemKey': item.itemKey}
        reqUrl = self.apiRequestUrl(aparams) + self.apiQueryString(aparams)
        response = self._request(reqUrl, 'DELETE', None, {'If-Match': item.etag})
        return response
        pass

    def trashItem(self, item):
        """Mark an existing item for deletion, adding it to the trash metacollection."""
        item.set('deleted', 1)
        self.writeUpdatedItem(item)
        pass

    def fetchItemChildren(self, item):
        """Fetch child items of the specified item."""
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
        """Get the list of possible Zotero item types."""
        reqUrl = zotero.ZOTERO_URI + 'itemTypes'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("failed to fetch itemTypes")
        itemTypes = json.loads(response.getBody())
        return itemTypes
        pass

    def getItemFields(self, itemType):
        """Get the list of possible item fields for a particular Zotero item type."""
        reqUrl = zotero.ZOTERO_URI + 'itemFields'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("failed to fetch itemFields")
        itemFields = json.loads(response.getBody())
        return itemFields
        pass

    def getCreatorTypes(self, itemType):
        """Get the list of possible creator types for a particular Zotero item type."""
        reqUrl = zotero.ZOTERO_URI + 'itemTypeCreatorTypes?itemType=' + itemType
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("failed to fetch creatorTypes")
        creatorTypes = json.loads(response.getBody())
        return creatorTypes
        pass

    def getCreatorFields(self, creatorType):
        """Get the list of creator fields and translations for a particular creator type."""
        reqUrl = zotero.ZOTERO_URI + 'creatorFields'
        response = self._request(reqUrl, 'GET')
        if response.status_code != 200:
            raise zotero.ZoteroApiError("failed to fetch creatorFields")
        creatorFields = json.loads(response.getBody())
        return creatorFields
        pass

    def fetchAllTags(self, params):
        """Fetch all tags, even over multiple requests, present in the library."""
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
        """Make a single request to get a set of tags."""
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
        """Get information about the permissions a particular key has."""
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
        """Parse the api key xml returned by the Zotero API."""
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
        """Fetch the set of groups a user is a member of."""
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
        """Get a user's C.V."""
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
        """Return pickled self for storage"""
        return pickle.dumps(self)

if __name__ == "__main__":
    pass
