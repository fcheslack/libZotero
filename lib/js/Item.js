Zotero.Item = function(entryEl){
    this.instance = "Zotero.Item";
    this.apiObj = {};
    this.dataFields = {};
    if(typeof entryEl != 'undefined'){
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry();

Zotero.Item.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    };
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    };
    //TODO: load secondary data structures
    
    return this;
};

Zotero.Item.prototype.loadObject = function(ob) {
    Z.debug('Zotero.Item.loadObject');
    if(typeof(ob) === 'string'){
        ob = JSON.parse(ob);
    }
    this.title = ob.title;
    this.itemKey = ob.itemKey;
    this.itemType = ob.itemType;
    this.creatorSummary = ob.creatorSummary;
    this.numChildren = ob.numChildren;
    this.numTags = ob.numTags;
    this.creators = ob.creators;
    this.createdByUserID = ob.createdByUserID;
    this.lastModifiedByUserID = ob.lastModifiedByUserID;
    this.note = ob.note;
    this.linkMode = ob.linkMode;
    this.mimeType = ob.mimeType;
    this.links = ob.links;
    this.apiObj = ob.apiObject;
    this.dateAdded = ob.dateAdded;
    this.published = this.dateAdded;
    this.dateModified = ob.dateModified;
    this.updated = this.dateModified;
};

Zotero.Item.prototype.parseXmlItem = function (iel) {
    this.parseXmlEntry(iel);
    
    //parse entry metadata
    this.itemKey = iel.find("zapi\\:key, key").text();
    this.itemType = iel.find("zapi\\:itemType, itemType").text();
    this.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    this.year = iel.find("zapi\\:year, year").text();
    this.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text());
    this.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text());
    
    if(isNaN(this.numChildren)){
        this.numChildren = 0;
    }
    
    this.parentKey = false;
    //set parent if can find up link in entry
    if(this.links['up']){
        var parentLink = this.links['up']['href'];
        var re = new RegExp("items\/([A-Z0-9]{8})");
        this.parentKey = re.exec(parentLink)[1];
    }
    
    //parse content block
    var contentEl = iel.children("content");
    if(contentEl.attr('type') == 'application/json' || contentEl.attr('zapi:type') == 'json'){
        this.parseJsonItemContent(contentEl);
    }
    else if(contentEl.attr('type') == 'xhtml'){
        this.parseXmlItemContent(contentEl);
    }
    
};

Zotero.Item.prototype.parseXmlItemContent = function (cel) {
    var contentRows = [];
    var dataFields = {};
    cel.find("div > table").children("tr").each(function(){
        contentRows.push({
            field : J(this).attr("class"),
            fieldMapped : J(this).children("th").text(),
            fieldValue : J(this).children("td").text()
        });
    });
    this.contentRows = contentRows;
    J.each(contentRows, function(index, value){
        dataFields[value.field] = value.fieldValue;
    });
    this.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function (cel) {
    Z.debug("Zotero.Item.parseJsonItemContent", 3);
    this.etag = cel.attr('zapi:etag');
    var dataFields = JSON.parse(cel.text());
    var contentRows = [];
    var item = this;
    J.each(dataFields, function(index, value){
        //Z.debug("dataField " + index + " : ");
        //Z.debug(value);
        if(index == 'tags'){
            item.tags = value;
        }
        else if(index == 'creators'){
            item.creators = value;
        }
        else{
            contentRows.push({
                field: index,
                fieldMapped: item.fieldMap[index],
                fieldValue: value
            });
            item.dataFields[index] = value;
        }
    });
    this.contentRows = contentRows;
    this.apiObj = dataFields;
    
    if(this.dataFields['itemType'] == 'attachment'){
        this.mimeType = this.dataFields['mimeType'];
        this.translatedMimeType = Zotero.utils.translateMimeType(this.mimeType);
    }
    if(this.dataFields.hasOwnProperty('linkMode')){
        this.linkMode = this.dataFields['linkMode'];
    }
    
    this.attachmentDownloadLink = Zotero.url.attachmentDownloadLink(this);
};

Zotero.Item.prototype.initEmpty = function(itemType){
    Z.debug("Zotero.Item.initEmpty - itemType:" + itemType, 3);
    this.etag = '';
    var item = this;
    var deferred = new J.Deferred();
    var d = this.getItemTemplate(itemType);
    
    var callback = J.proxy(function(template){
        Z.debug("Zotero.Item.initEmpty callback", 3);
        this.itemType = template.itemType;
        this.itemKey = '';
        var dataFields = template;
        var contentRows = [];
        J.each(dataFields, function(index, value){
            if(index == 'tags'){
                item.tags = value;
            }
            else if(index == 'creators'){
                item.creators = value;
            }
            else{
                contentRows.push({
                    field: index,
                    fieldMapped: item.fieldMap[index],
                    fieldValue: value
                });
            }
        });
        this.contentRows = contentRows;
        this.apiObj = dataFields;
        deferred.resolve(item);
    }, this);
    
    d.done(callback);
    
    return deferred.promise();
};

Zotero.Item.prototype.writeItem = function(){
    Z.debug("Zotero.Item.writeItem", 3);
    var target = 'item';
    var item = this;
    var newItem = true;
    if(this.parentItemKey){
        target = 'children';
    }
    
    if(this.itemKey){
        newItem = false;
    }
    
    var config = {'target':target, 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    if(!newItem){
        var childrenConfig = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
        var newChildrenRequestUrl = Zotero.ajax.apiRequestUrl(childrenConfig) + Zotero.ajax.apiQueryString(childrenConfig);
    }
    Z.debug(this.apiObj);
    
    //add empty creators if we don't have any so we don't get an error
    if(!this.apiObj.hasOwnProperty('creators')){
        this.apiObj.creators = [];
    }
    
    //remove any creators that have no names
    var newCreatorsArray = this.apiObj.creators.filter(function(c){
        if(c.name || c.firstName || c.lastName){
            return true;
        }
        return false;
    });
    this.apiObj.creators = newCreatorsArray;
    
    //update item with server response if successful
    var successCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem successCallback", 3);
        var entryEl = J(data).find("entry");
        this.parseXmlItem(entryEl);
    }, this);
    
    var childSuccessCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem childSuccessCallback");
        if(item.numChildren){
            item.numChildren++;
        }
        else {
            item.numChildren = 1;
            J.publish("hasFirstChild", [item.itemKey]);
        }
    }, this);
    
    //copy apiObj and remove unwriteable fields
    var writeApiObj = J.extend({}, this.apiObj);
    delete writeApiObj['linkMode'];
    delete writeApiObj['mimeType'];
    delete writeApiObj['charset'];
    
    var requests = [];
    
    if(!newItem){
        Z.debug("have itemKey, making PUT writeItem request", 3);
        
        //take notes out of apiObj and make them separate children requests
        var notes = this.apiObj.notes;
        delete this.apiObj.notes;
        delete writeApiObj.notes;
        
        //make request to update item
        var requestData = JSON.stringify(writeApiObj);
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'PUT'), 
            {data: requestData,
             type: "PUT",
             processData: false,
             headers:{'If-Match': this.etag},
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
        
        //make requests to add new children if we have any
        if(J.isArray(notes) && notes.length){
            Z.debug("have child notes for existing item - making separate requests to create children", 3);
            var noteItemsObj = {items:notes};
            Z.debug("new child notes on existing item", 3);
            Z.debug(noteItemsObj, 3);
            var requestData = JSON.stringify(noteItemsObj);
            var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(newChildrenRequestUrl, 'POST'), 
                {data: requestData,
                 type: "POST",
                 processData: false,
                 success: childSuccessCallback,
                 cache:false,
                 error: Zotero.ajax.errorCallback
                }
            );
            requests.push(jqxhr);
        }
    }
    else{
        Z.debug("have no itemKey, making POST writeItem request", 3);
        var requestData = JSON.stringify({items:[writeApiObj]});
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'), 
            {data: requestData,
             type: "POST",
             processData: false,
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
    }
    
    J.each(requests, function(){
        Zotero.ajax.activeRequests.push(this);
    });
    
    return J.when.apply(J, requests);
//    J.publish("itemWriteRequest", [this, jqxhr]);
};

Zotero.Item.prototype.getChildren = function(library){
    Z.debug("Zotero.Item.getChildren", 3);
    Z.debug(library);
    var deferred = J.Deferred();
    //short circuit if has item has no children
    if(!(this.numChildren) || (this.parentKey != false)){
        deferred.resolve([]);
        return deferred;
    }
    
    var config = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var callback = J.proxy(function(data, textStatus, jqxhr){
        Z.debug('getChildren proxied callback');
        Z.debug(library);
        var itemfeed = new Zotero.Feed(data);
        var items = library.items;
        var childItems = items.addItemsFromFeed(feed);
        for (var i = childItems.length - 1; i >= 0; i--) {
            childItems[i].associateWithLibrary(library);
        };
        
        deferred.resolve(childItems);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'), 
        {type: "GET",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});//.fail(Zotero.ui.ajaxErrorMessage);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred.promise();
//    J.publish('getItemChildren', [this, jqxhr]);
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    
};

Zotero.Item.prototype.getItemTypes = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if(!locale){
        var locale = 'en-US';
    }
    var itemTypes = Zotero.cache.load({locale:locale, target:'itemTypes'});
    if(itemTypes){
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = itemTypes;//JSON.parse(Zotero.storage.localStorage['itemTypes']);
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var url = Zotero.config.baseApiUrl + '/itemTypes' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(url, 'GET'), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 3);
                Z.debug(data, 3);
                Zotero.Item.prototype.itemTypes = data;
                Zotero.cache.save({locale:locale, target:'itemTypes'}, Zotero.Item.prototype.itemTypes);
            }
    );
};

Zotero.Item.prototype.getItemFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemFields");
    if(!locale){
        var locale = 'en-US';
    }
    
    var itemFields = Zotero.cache.load({locale:locale, target:'itemFields'});
    if(itemFields){
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = itemFields;//JSON.parse(Zotero.storage.localStorage['itemFields']);
        J.each(Zotero.Item.prototype.itemFields, function(ind, val){
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var requestUrl = Zotero.config.baseApiUrl + '/itemFields' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response");
                Zotero.Item.prototype.itemFields = data;
                Zotero.cache.save({locale:locale, target:'itemFields'}, data);
                //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
                J.each(Zotero.Item.prototype.itemFields, function(ind, val){
                    Zotero.localizations.fieldMap[val.field] = val.localized;
                });
            }
    );
};

Zotero.Item.prototype.getItemTemplate = function (itemType) {
    Z.debug("Zotero.Item.prototype.getItemTemplate");
    var deferred = new J.Deferred();
    
    if(typeof itemType == 'undefined') itemType = 'document';
    var query = Zotero.ajax.apiQueryString({itemType:itemType});
    var requestUrl = Zotero.config.baseApiUrl + '/items/new' + query;
    
    var cacheConfig = {itemType:itemType, target:'itemTemplate'};
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if(itemTemplate){
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;// JSON.parse(Zotero.storage.localStorage[url]);
        deferred.resolve(template);
        return deferred.promise();
    }
    
    //callback always executed in this context
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug("got itemTemplate response", 3);
        Z.debug(data);
        Zotero.cache.save(cacheConfig, data);
        //Zotero.storage.localStorage[url] = JSON.stringify(data);
        deferred.resolve(data);
    }, this);
    
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            callback
    );
    
    return deferred.promise();
};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        var itemType = 'document';
    }
    
    var deferred = new J.Deferred();
    
    //parse stored creatorTypes object if it exists
    //creatorTypes maps itemType to the possible creatorTypes
    var creatorTypes = Zotero.cache.load({target:'creatorTypes'});
    if(creatorTypes){
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = creatorTypes;//JSON.parse(Zotero.storage.localStorage['creatorTypes']);
    }
    
    if(Zotero.Item.prototype.creatorTypes[itemType]){
        Z.debug("creatorTypes of requested itemType available in localStorage");
        Z.debug(Zotero.Item.prototype.creatorTypes);
        deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes");
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
                    Z.debug("got creatorTypes response");
                    Zotero.Item.prototype.creatorTypes[itemType] = data;
                    //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Zotero.Item.prototype.creatorTypes);
                    Zotero.cache.save({target:'creatorTypes'}, Zotero.Item.prototype.creatorTypes);
                    deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
                }, this);
        
        J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
                {},
                callback
        );
    }
    return deferred.promise();
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields");
    var creatorFields = Zotero.cache.load({target:'creatorFields'});
    if(creatorFields){
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;// JSON.parse(Zotero.storage.localStorage['creatorFields']);
        return;
    }
    
    //if(typeof itemType == 'undefined') itemType = 'document';
    var requestUrl = Zotero.config.baseApiUrl + '/creatorFields';
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response");
                Zotero.Item.prototype.creatorFields = data;
                //Zotero.storage.localStorage['creatorFields'] = JSON.stringify(data);
                Zotero.cache.save({target:'creatorFields'}, data);
            }
    );
};

Zotero.Item.prototype.fieldMap = {
    "itemType"            : "Type",
    "title"               : "Title",
    "dateAdded"           : "Date Added",
    "dateModified"        : "Date Modified",
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
    "year"                : "Year",
    "section"             : "Section",
    "callNumber"          : "Call Number",
    "archive"             : "Archive",
    "archiveLocation"     : "Loc. in Archive",
    "libraryCatalog"      : "Library Catalog",
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
    "repository"          : "Repository",
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
    "numPages"            : "# of Pages",
    "note"                : "Note",
    "numChildren"         : "# of Children",
    "addedBy"             : "Added By",
    "creator"             : "Creator"
};

Zotero.localizations.fieldMap = Zotero.Item.prototype.fieldMap;

Zotero.Item.prototype.typeMap = {
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
    "dictionaryEntry"     : "Dictionary Entry"
};

Zotero.localizations.typeMap = Zotero.Item.prototype.typeMap;

Zotero.Item.prototype.creatorMap = {
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
};

Zotero.localizations.creatorMap = Zotero.Item.prototype.creatorMap;

Zotero.Item.prototype.itemTypeImageSrc = {
    "note"                : "note",
    "attachment"          : "attachment-pdf",
    "attachmentPdf"       : "attachment-pdf",
    "attachmentWeblink"   : "attachment-web-link",
    "attachmentSnapshot"  : "attachment-snapshot",
    "attachmentFile"      : "attachment-file",
    "attachmentLink"      : "attachment-link",
    "book"                : "book",
    "bookSection"         : "book_open",
    "journalArticle"      : "page_white_text",
    "magazineArticle"     : "layout",
    "newspaperArticle"    : "newspaper",
    "thesis"              : "report",
    "letter"              : "email_open",
    "manuscript"          : "script",
    "interview"           : "comments",
    "film"                : "film",
    "artwork"             : "picture",
    "webpage"             : "page",
    "report"              : "report",
    "bill"                : "page_white",
    "case"                : "page_white",
    "hearing"             : "page_white",
    "patent"              : "page_white",
    "statute"             : "page_white",
    "email"               : "email",
    "map"                 : "map",
    "blogPost"            : "layout",
    "instantMessage"      : "page_white",
    "forumPost"           : "page",
    "audioRecording"      : "ipod",
    "presentation"        : "page_white",
    "videoRecording"      : "film",
    "tvBroadcast"         : "television",
    "radioBroadcast"      : "transmit",
    "podcast"             : "ipod_cast",
    "computerProgram"     : "page_white_code",
    "conferencePaper"     : "treeitem-conferencePaper",
    "document"            : "page_white",
    "encyclopediaArticle" : "page_white",
    "dictionaryEntry"     : "page_white"
};

Zotero.Item.prototype.itemTypeImageClass = function(){
    var item = this;
    if(item.itemType == 'attachment'){
        switch(item.linkMode){
            case 0:
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentFile'];
            case 1:
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentSnapshot'];
            case 2:
                return this.itemTypeImageSrc['attachmentLink'];
            case 3:
                return this.itemTypeImageSrc['attachmentWeblink'];
        }
    }
    else {
        return item.itemType;
    }
};
