import logging
import xml.dom.minidom
import re
import json
from entry import *


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

    def __init__(self, entryNode=None):
        self.itemKey = ''
        self.itemType = None
        self.creatorSummary = ''
        self.numChildren = 0
        self.numTags = 0
        self.childKeys = []
        self.parentKey = ''
        self.creators = []
        self.createdByUserID = None
        self.lastModifiedByUserID = None
        self.note = None
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
        self.apiObject = {}

        if entryNode == None:
            return
        elif isinstance(entryNode, basestring):
            doc = xml.dom.minidom.parseString(entryNode)
            entryNode = doc.getElementsByTagName("entry").item(0)
        super(Item, self).__init__(entryNode)
        #check if we have multiple subcontent nodes
        subcontentNodes = entryNode.getElementsByTagNameNS("*", "subcontent")

        #save raw Content node in case we need it
        if entryNode.getElementsByTagName("content").length > 0:
            d = entryNode.ownerDocument
            self.contentNode = entryNode.getElementsByTagName("content").item(0)
            self.content = d.toxml()
        # Extract the itemId and itemType
        self.itemKey = entryNode.getElementsByTagNameNS('*', 'key').item(0).childNodes.item(0).nodeValue
        self.itemType = entryNode.getElementsByTagNameNS('*', 'itemType').item(0).childNodes.item(0).nodeValue

        # Look for numChildren node
        numChildrenNode = entryNode.getElementsByTagNameNS('*', "numChildren").item(0)
        if numChildrenNode:
            self.numChildren = numChildrenNode.childNodes.item(0).nodeValue

        # Look for numTags node
        numTagsNode = entryNode.getElementsByTagNameNS('*', "numTags").item(0)
        if numTagsNode:
            self.numTags = numTagsNode.childNodes.item(0).nodeValue

        creatorSummaryNode = entryNode.getElementsByTagNameNS('*', "creatorSummary").item(0)
        if creatorSummaryNode:
            self.creatorSummary = creatorSummaryNode.childNodes.item(0).nodeValue

        if subcontentNodes.length > 0:
            for scnode in subcontentNodes:
                sctype = scnode.getAttribute('zapi:type')
                if (sctype == 'application/json') or (sctype == 'json'):
                    self.apiObject = json.loads(scnode.childNodes.item(0).nodeValue)
                    self.etag = scnode.getAttribute('zapi:etag')
                    if 'creators' in self.apiObject:
                        self.creators = self.apiObject['creators']
                    else:
                        self.creators = []
                elif sctype == 'bib':
                    bibNode = scnode.getElementsByTagName('div').item(0)
                    self.bibContent = bibNode.toxml()

                contentString = ''
                childNodes = scnode.childNodes
                for childNode in childNodes:
                    contentString += childNode.toxml()
                self.subContents[sctype] = contentString
        else:
            contentNode = entryNode.getElementsByTagName('content').item(0)
            contentType = contentNode.getAttribute('type')
            zcType = contentNode.getAttribute('zapi:type')

            if (contentType == 'application/json') or (contentType == 'json') or (zcType == 'json'):
                self.apiObject = json.loads(contentNode.childNodes.item(0).nodeValue)
                self.etag = contentNode.getAttribute('zapi:etag')
                if 'creators' in self.apiObject:
                    self.creators = self.apiObject['creators']
                else:
                    self.creators = []
            elif (contentType == 'bib') or (zcType == 'bib'):
                bibNode = contentNode.getElementsByTagName('div').item(0)
                self.bibContent = bibNode.ownerDocument.saveXML(bibNode)
            else:
                #didn't find a content type we deal with
                pass

        if 'up' in self.links:
            parentLink = self.links['up']['href']
            matches = re.findall("/items\/([A-Z0-9]{8})/", parentLink)
            if len(matches):
                self.parentKey = matches[0]
        else:
            self.parentKey = False

    def get(self, key):
        if key == 'tags':
            if 'tags' in self.apiObject:
                return self.apiObject['tags']
            else:
                return []
        elif key == 'creators':
            if 'creators' in self.apiObject:
                return self.apiObject['creators']
            else:
                return []
        else:
            if key in self.apiObject:
                return self.apiObject[key]
            else:
                return None

    def set(self, key, val):
        self.apiObject[key] = val

    def updateItemObject(self):
        updateItem = self.apiObject
        if 'notes' in updateItem:
            del updateItem['notes']
        newCreators = []
        #ignore empty creators, keep actual ones
        for creator in updateItem['creators']:
            if 'creatorType' in creator:
                if ('name' not in creator) and ('firstName' not in creator) and ('lastName' not in creator):
                    continue
                else:
                    newCreators.append(creator)
        updateItem['creators'] = newCreators
        return updateItem

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

    def compareItem(self, item):
        pass
        