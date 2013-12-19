import logging
import xml.dom.minidom
import re
import json
from copy import deepcopy
from entry import *
from zotero import responseIsError
import zotero

class Item(Entry):
    fieldMap = {
        "creator"             : "Creator",
        "itemType"            : "Type",
        "title"               : "Title",
        "dateAdded"           : "Date Added",
        "dateModified"        : "Modified",
        "source"              : "Source",
        "notes"               : "Notes",
        "tags"                : "Tags",
        "attachments"         : "Attachments",
        "related"             : "Related",
        "url"                 : "URL",
        "rights"              : "Rights",
        "series"              : "Series",
        "volume"              : "Volume",
        "issue"               : "Issue",
        "edition"             : "Edition",
        "place"               : "Place",
        "publisher"           : "Publisher",
        "pages"               : "Pages",
        "ISBN"                : "ISBN",
        "publicationTitle"    : "Publication",
        "ISSN"                : "ISSN",
        "date"                : "Date",
        "section"             : "Section",
        "callNumber"          : "Call Number",
        "archiveLocation"     : "Loc. in Archive",
        "distributor"         : "Distributor",
        "extra"               : "Extra",
        "journalAbbreviation" : "Journal Abbr",
        "DOI"                 : "DOI",
        "accessDate"          : "Accessed",
        "seriesTitle"         : "Series Title",
        "seriesText"          : "Series Text",
        "seriesNumber"        : "Series Number",
        "institution"         : "Institution",
        "reportType"          : "Report Type",
        "code"                : "Code",
        "session"             : "Session",
        "legislativeBody"     : "Legislative Body",
        "history"             : "History",
        "reporter"            : "Reporter",
        "court"               : "Court",
        "numberOfVolumes"     : "# of Volumes",
        "committee"           : "Committee",
        "assignee"            : "Assignee",
        "patentNumber"        : "Patent Number",
        "priorityNumbers"     : "Priority Numbers",
        "issueDate"           : "Issue Date",
        "references"          : "References",
        "legalStatus"         : "Legal Status",
        "codeNumber"          : "Code Number",
        "artworkMedium"       : "Medium",
        "number"              : "Number",
        "artworkSize"         : "Artwork Size",
        "libraryCatalog"      : "Library Catalog",
        "videoRecordingType"  : "Recording Type",
        "interviewMedium"     : "Medium",
        "letterType"          : "Type",
        "manuscriptType"      : "Type",
        "mapType"             : "Type",
        "scale"               : "Scale",
        "thesisType"          : "Type",
        "websiteType"         : "Website Type",
        "audioRecordingType"  : "Recording Type",
        "label"               : "Label",
        "presentationType"    : "Type",
        "meetingName"         : "Meeting Name",
        "studio"              : "Studio",
        "runningTime"         : "Running Time",
        "network"             : "Network",
        "postType"            : "Post Type",
        "audioFileType"       : "File Type",
        "version"             : "Version",
        "system"              : "System",
        "company"             : "Company",
        "conferenceName"      : "Conference Name",
        "encyclopediaTitle"   : "Encyclopedia Title",
        "dictionaryTitle"     : "Dictionary Title",
        "language"            : "Language",
        "programmingLanguage" : "Language",
        "university"          : "University",
        "abstractNote"        : "Abstract",
        "websiteTitle"        : "Website Title",
        "reportNumber"        : "Report Number",
        "billNumber"          : "Bill Number",
        "codeVolume"          : "Code Volume",
        "codePages"           : "Code Pages",
        "dateDecided"         : "Date Decided",
        "reporterVolume"      : "Reporter Volume",
        "firstPage"           : "First Page",
        "documentNumber"      : "Document Number",
        "dateEnacted"         : "Date Enacted",
        "publicLawNumber"     : "Public Law Number",
        "country"             : "Country",
        "applicationNumber"   : "Application Number",
        "forumTitle"          : "Forum/Listserv Title",
        "episodeNumber"       : "Episode Number",
        "blogTitle"           : "Blog Title",
        "caseName"            : "Case Name",
        "nameOfAct"           : "Name of Act",
        "subject"             : "Subject",
        "proceedingsTitle"    : "Proceedings Title",
        "bookTitle"           : "Book Title",
        "shortTitle"          : "Short Title",
        "docketNumber"        : "Docket Number",
        "numPages"            : "# of Pages"
        }

    typeMap = {
        "note"                : "Note",
        "attachment"          : "Attachment",
        "book"                : "Book",
        "bookSection"         : "Book Section",
        "journalArticle"      : "Journal Article",
        "magazineArticle"     : "Magazine Article",
        "newspaperArticle"    : "Newspaper Article",
        "thesis"              : "Thesis",
        "letter"              : "Letter",
        "manuscript"          : "Manuscript",
        "interview"           : "Interview",
        "film"                : "Film",
        "artwork"             : "Artwork",
        "webpage"             : "Web Page",
        "report"              : "Report",
        "bill"                : "Bill",
        "case"                : "Case",
        "hearing"             : "Hearing",
        "patent"              : "Patent",
        "statute"             : "Statute",
        "email"               : "E-mail",
        "map"                 : "Map",
        "blogPost"            : "Blog Post",
        "instantMessage"      : "Instant Message",
        "forumPost"           : "Forum Post",
        "audioRecording"      : "Audio Recording",
        "presentation"        : "Presentation",
        "videoRecording"      : "Video Recording",
        "tvBroadcast"         : "TV Broadcast",
        "radioBroadcast"      : "Radio Broadcast",
        "podcast"             : "Podcast",
        "computerProgram"     : "Computer Program",
        "conferencePaper"     : "Conference Paper",
        "document"            : "Document",
        "encyclopediaArticle" : "Encyclopedia Article",
        "dictionaryEntry"     : "Dictionary Entry",
        }

    creatorMap = {
        "author"         : "Author",
        "contributor"    : "Contributor",
        "editor"         : "Editor",
        "translator"     : "Translator",
        "seriesEditor"   : "Series Editor",
        "interviewee"    : "Interview With",
        "interviewer"    : "Interviewer",
        "director"       : "Director",
        "scriptwriter"   : "Scriptwriter",
        "producer"       : "Producer",
        "castMember"     : "Cast Member",
        "sponsor"        : "Sponsor",
        "counsel"        : "Counsel",
        "inventor"       : "Inventor",
        "attorneyAgent"  : "Attorney/Agent",
        "recipient"      : "Recipient",
        "performer"      : "Performer",
        "composer"       : "Composer",
        "wordsBy"        : "Words By",
        "cartographer"   : "Cartographer",
        "programmer"     : "Programmer",
        "reviewedAuthor" : "Reviewed Author",
        "artist"         : "Artist",
        "commenter"      : "Commenter",
        "presenter"      : "Presenter",
        "guest"          : "Guest",
        "podcaster"      : "Podcaster"
        }

    def __init__(self, entryNode=None, library=None):
        self.itemKey = ''
        self.itemType = None
        self.creatorSummary = ''
        self.numChildren = 0
        self.numTags = 0
        self.year = ""
        self.childKeys = []
        self.parentKey = ''
        self.creators = []
        self.createdByUserID = None
        self.lastModifiedByUserID = None
        self.notes = []
        """
        @var int Represents the relationship of the child to the parent.
        0:file, 1:file, 2:snapshot, 3:web-link
        """
        self.linkMode = None
        self.mimeType = None
        self.parsedJson = None
        self.etag = ''
        """
        @var string content node of response useful if formatted bib
        request and we need to use the raw content
        """
        self.content = None
        self.bibContent = None
        self.subContents = {}
        self.apiObject = {'itemType': None, 'tags': [], 'collections': [], 'relations': []}
        self.pristine = {}
        self.owningLibrary = library
        if entryNode == None:
            return
        elif isinstance(entryNode, basestring):
            doc = xml.dom.minidom.parseString(entryNode)
            entryNode = doc.getElementsByTagName("entry").item(0)
        super(Item, self).__init__(entryNode)
        #check if we have multiple subcontent nodes
        subcontentNodes = entryNode.getElementsByTagNameNS("http://zotero.org/ns/api", "subcontent")

        #save raw Content node in case we need it
        if entryNode.getElementsByTagName("content").length > 0:
            d = entryNode.ownerDocument
            self.contentNode = entryNode.getElementsByTagName("content").item(0)
            self.content = d.toxml()
        # Extract the itemId and itemType
        self.itemKey = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'key').item(0).childNodes.item(0).nodeValue
        self.itemVersion = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'version').item(0).childNodes.item(0).nodeValue
        self.itemType = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', 'itemType').item(0).childNodes.item(0).nodeValue

        # Look for numTags node
        numTagsNode = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', "numTags").item(0)
        if numTagsNode:
            self.numTags = numTagsNode.childNodes.item(0).nodeValue

        # Look for year node
        yearNode = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', "year").item(0)
        if yearNode:
            if yearNode.childNodes.item(0):
                self.year = yearNode.childNodes.item(0).nodeValue

        # Look for numChildren node
        numChildrenNode = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', "numChildren").item(0)
        if numChildrenNode:
            self.numChildren = numChildrenNode.childNodes.item(0).nodeValue

        # Look for creatorSummary node
        creatorSummaryNode = entryNode.getElementsByTagNameNS('http://zotero.org/ns/api', "creatorSummary").item(0)
        if creatorSummaryNode:
            self.creatorSummary = creatorSummaryNode.childNodes.item(0).nodeValue

        #parse each subcontent node or the single content node
        if subcontentNodes.length > 0:
            for scnode in subcontentNodes:
                self.parseContentNode(scnode)
        else:
            contentNode = entryNode.getElementsByTagName('content').item(0)
            self.parseContentNode(contentNode)
        """
        if 'up' in self.links:
            parentLink = self.links['up']['href']
            matches = re.findall("/items\/([A-Z0-9]{8})/", parentLink)
            if len(matches):
                self.parentKey = matches[0]
        else:
            self.parentKey = False
        """

    def parseContentNode(self, contentNode):
        contentType = contentNode.getAttribute('type')
        zcontentType = contentNode.getAttributeNS('http://zotero.org/ns/api', 'type')

        if contentType == "" and zcontentType != "":
            contentType = zcontentType
        if (contentType == 'application/json') or (contentType == 'json'):
            self.pristine = json.loads(contentNode.childNodes.item(0).nodeValue)
            self.apiObject = json.loads(contentNode.childNodes.item(0).nodeValue)
            if 'creators' in self.apiObject:
                self.creators = self.apiObject['creators']
            else:
                self.creators = []

            self.itemVersion = self.apiObject['itemVersion'] if 'itemVersion' in self.apiObject else 0
            self.parentItemKey = self.apiObject['parentItem'] if 'parentItem' in self.apiObject else False

            if self.itemType == 'attachment':
                self.mimeType = self.apiObject['contentType']
                #TODO:translate mimetype
            if 'linkMode' in self.apiObject:
                self.linkMode = self.apiObject['linkMode']
            self.synced = True
        elif (contentType == 'bib'):
            bibNode = contentNode.getElementsByTagName('div').item(0)
            self.bibContent = bibNode.toxml()  # ownerDocument.saveXML(bibNode)

        contentString = ''
        childNodes = contentNode.childNodes
        for childNode in childNodes:
            contentString += childNode.toxml()
        self.subContents[contentType] = contentString

    def initItemFromTemplate(self, template):
        self.itemVersion = 0
        self.itemType = template['itemType']
        self.itemKey = ''
        self.pristine = deepcopy(template)
        self.apiObject = deepcopy(template)

    def get(self, key):
        if key == 'itemKey' or key == 'key':
            return self.itemKey
        elif key == 'itemVersion' or key == 'version':
            return self.itemVersion
        elif key == 'title':
            return self.title
        elif key == 'creatorSummary':
            return self.creatorSummary
        elif key == 'year':
            return self.year
        elif key == 'parentItem' or key == 'parentItemKey':
            return self.parentItemKey
        else:
            if key in self.apiObject:
                return self.apiObject[key]
            elif key in dir(self):
                return self.__getattribute__(key)
            else:
                return None

    def set(self, key, val):
        if key == "itemKey" or key == 'key':
            self.itemKey = val
            self.apiObject['itemKey'] = val
        elif key == "itemVersion" or key == 'version':
            self.itemVersion = val
            self.apiObject['itemVersion'] = val
        elif key == "title":
            self.title = val
        elif key == "itemType":
            self.itemType = val
            #TODO:translate fields
        elif key == "linkMode":
            #TODO:something here probably
            pass
        elif key == 'deleted':
            self.apiObject['deleted'] = val
        elif key == 'parentItem' or key == 'parentKey' or key == 'parentItemKey':
            if val == '':
                val = False
            self.parentItemKey = val
            self.apiObject['parentItem'] = val
        elif key == "dateAdded":
            self.apiObject['dateAdded'] = val
            self.dateAdded = val
        elif key == "dateModified":
            self.apiObject['dateModified'] = val
            self.dateModified = val
        elif key == "path":
            self.path = val

        if key in self.apiObject:
            self.apiObject[key] = val
        if key in dir(self):
            self.__setattr__(key, val)

    def addCreator(self, creator):
        self.creators.append(creator)
        self.apiObject['creators'].append(creator)

    def writeApiObject(self):
        updateItem = dict(self.pristine.items() + self.apiObject.items())
        if 'creators' not in updateItem:
            return updateItem
        if len(updateItem['creators']) == 0:
            return updateItem

        newCreators = []
        for creator in updateItem['creators']:
            if creator.get('name', '') == '' and creator.get('firstName', '') == '' and creator.get('lastName', '') == '':
                continue
            else:
                newCreators.append(creator)
        updateItem['creators'] = newCreators
        return updateItem

    def updateItemObject(self):
        return self.writeApiObject()

    def newItemObject(self):
        newItem = self.apiObject
        newCreators = []
        if 'creators' in newItem:
            for creator in newItem['creators']:
                if 'creatorType' in creator:
                    if ('name' not in creator) and ('firstName' not in creator) and ('lastName' not in creator):
                        continue
                else:
                    newCreators.append(creator)
        newItem['creators'] = newCreators
        return newItem

    def addToCollection(self, collection):
        if isinstance(collection, basestring):
            collectionKey = collection
        else:
            collectionKey = collection.get('collectionKey')

        curCollections = self.get('collections')
        if collectionKey not in curCollections:
            curCollections.append(collectionKey)
        self.set('collections', curCollections)

    def removeFromCollection(self, collection):
        if isinstance(collection, basestring):
            collectionKey = collection
        else:
            collectionKey = collection.get('collectionKey')

        curCollections = self.get('collections')
        if collectionKey in curCollections:
            curCollections.remove(collectionKey)
            self.set('collections', curCollections)

    def addTag(self, newtagname, type=None):
        itemTags = self.get('tags')
        #assumes we'll get an array
        for tag in itemTags:
            if isinstance(tag, basestring) and tag == newtagname:
                return
            elif 'tag' in tag and tag['tag'] == newtagname:
                return

        if type != None:
            itemTags.append({'tag': newtagname, 'type': type})
        else:
            itemTags.append({'tag': newtagname})
        self.set('tags', itemTags)

    def removeTag(self, rmtagname):
        itemTags = self.get('tags')
        #assumes we'll get an array
        for tag in itemTags[:]:
            if (isinstance(tag, basestring) and tag == rmtagname) or (isinstance(tag, dict) and 'tag' in tag and tag['tag'] == rmtagname):
                del itemTags[itemTags.index(tag)]
                self.set('tags', itemTags)
                return

    def addNote(self, note):
        self.notes.append(note)
        parentItemKey = self.get('itemKey')
        if parentItemKey != None:
            note.set('parentItem', parentItemKey)
        return

    def trashItem(self):
        self.set('deleted', 1)

    def untrashItem(self):
        self.set('deleted', 0)

    def save(self):
        self.owningLibrary.items.writeItems([self])

    def getChildren(self):
        #short circuit if has item has no children
        if self.numChildren == 0 or self.parentItemKey != False:
            return []

        config = {'target': 'children', 'libraryType': self.owningLibrary.libraryType, 'libraryID': self.owningLibrary.libraryID, 'itemKey': self.itemKey, 'content': 'json'}
        requestUrl = self.owningLibrary.apiRequestString(config)

        response = self.owningLibrary._request(requestUrl, 'GET')

        #load response into item objects
        fetchedItems = []
        if responseIsError(response):
            return False

        feed = zotero.Feed(response.text)
        fetchedItems = self.owningLibrary.items.addItemsFromFeed(feed)
        return fetchedItems

    def compareItem(self, item):
        pass
