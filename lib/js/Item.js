/*
 * TODO: several functions should not work unless we build a fresh item with a template
 * or parsed an item from the api with json content (things that depend on apiObj)
 * There should be a flag to note whether this is the case and throwing on attempts to
 * use these functions when it is not.
 */
Zotero.Item = function(entryEl){
    this.instance = "Zotero.Item";
    this.itemVersion = 0;
    this.itemKey = '';
    this.synced = false;
    this.apiObj = {};
    this.pristine = null;
    this.dataFields = {};
    this.childItemKeys = [];
    this.writeErrors = [];
    this.itemContentTypes = [];
    this.itemContentBlocks = {};
    this.notes = [];
    this.tagstrings = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry();

Zotero.Item.prototype.dump = function(){
    var item = this;
    var dump = item.dumpEntry();
    var dumpProperties = [
        'apiObj',
        'pristine',
        'itemKey',
        'itemVersion',
        'synced',
        'creatorSummary',
        'year',
        'parentItemKey',
        'numChildren'
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = item[dumpProperties[i]];
    }
    //add tagstrings to dump for indexedDB searching purposes
    dump['tagstrings'] = item.tagstrings;
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump){
    var item = this;
    item.loadDumpEntry(dump);
    var dumpProperties = [
        'apiObj',
        'pristine',
        'itemKey',
        'itemVersion',
        'synced',
        'creatorSummary',
        'year',
        'parentItemKey',
        'numChildren'
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        item[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    //TODO: load secondary data structures
    item.numTags = item.apiObj.tags.length;
    item.initSecondaryData();

    return item;
};

Zotero.Item.prototype.parseXmlItem = function (iel) {
    var item = this;
    item.parseXmlEntry(iel);
    
    //parse entry metadata
    item.itemKey = iel.find("zapi\\:key, key").text();
    item.itemType = iel.find("zapi\\:itemType, itemType").text();
    item.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    item.year = iel.find("zapi\\:year, year").text();
    item.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text(), 10);
    item.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text(), 10);
    
    if(isNaN(item.numChildren)){
        item.numChildren = 0;
    }
    
    item.parentItemKey = false;
    
    //parse content block
    var contentEl = iel.children("content");
    //check for multi-content response
    var subcontents = iel.find("zapi\\:subcontent, subcontent");
    if(subcontents.size() > 0){
        for(var i = 0; i < subcontents.size(); i++){
            var sc = J(subcontents.get(i));
            item.parseContentBlock(sc);
        }
    }
    else{
        item.parseContentBlock(contentEl);
    }
};

/**
 * Parse a content or subcontent node based on its type
 * @param  {jQuery wrapped node} cel content or subcontent element
 */
Zotero.Item.prototype.parseContentBlock = function(contentEl){
    var item = this;
    var zapiType = contentEl.attr('zapi:type');
    var contentText = contentEl.text();
    item.itemContentTypes.push(zapiType);
    item.itemContentBlocks[zapiType] = contentText;
    
    switch(zapiType){
        case 'json':
            item.parseJsonItemContent(contentEl);
            break;
        case 'bib':
            item.bibContent = contentText;
            item.parsedBibContent = true;
            break;
        case 'html':
            item.parseXmlItemContent(contentEl);
            break;
    }
};

Zotero.Item.prototype.parseXmlItemContent = function (cel) {
    var item = this;
    var dataFields = {};
    cel.find("div > table").children("tr").each(function(){
        dataFields[J(this).attr("class")] = J(this).children("td").text();
    });
    item.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function (cel) {
    var item = this;
    if(typeof cel === "string"){
        item.apiObj = JSON.parse(cel);
        item.pristine = JSON.parse(cel);
    }
    else {
        item.apiObj = JSON.parse(cel.text());
        item.pristine = JSON.parse(cel.text());
    }
    
    item.initSecondaryData();
};

//populate property values derived from json content
Zotero.Item.prototype.initSecondaryData = function(){
    var item = this;
    
    item.itemVersion = item.apiObj.itemVersion;
    item.parentItemKey = item.apiObj.parentItem;
    
    if(item.apiObj.itemType == 'attachment'){
        item.mimeType = item.apiObj.contentType;
        item.translatedMimeType = Zotero.utils.translateMimeType(item.mimeType);
    }
    if('linkMode' in item.apiObj){
        item.linkMode = item.apiObj.linkMode;
    }
    
    item.creators = item.apiObj.creators;
    
    item.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
    
    item.synced = true;

    var tagstrings = [];
    for (i = 0; i < item.apiObj.tags.length; i++) {
        tagstrings.push(item.apiObj.tags[i].tag);
    }
    item.tagstrings = tagstrings;
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode){
    var item = this;
    var deferred = new J.Deferred();
    var d = item.getItemTemplate(itemType, linkMode);
    
    var callback = J.proxy(function(template){
        item.initEmptyFromTemplate(template);
        deferred.resolve(item);
    }, this);
    
    d.done(callback);
    
    return deferred;
};

//special case note initialization to guarentee synchronous and simplify some uses
Zotero.Item.prototype.initEmptyNote = function(){
    var item = this;
    item.itemVersion = 0;
    var noteTemplate = {"itemType":"note","note":"","tags":[],"collections":[],"relations":{}};
    
    item.initEmptyFromTemplate(noteTemplate);
    
    return item;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(template){
    var item = this;
    item.itemVersion = 0;
    
    item.itemType = template.itemType;
    item.itemKey = '';
    item.pristine = J.extend({}, template);
    item.apiObj = template;
    
    return item;
};

Zotero.Item.prototype.updateObjectKey = function(objectKey){
    return this.updateItemKey(objectKey);
};

Zotero.Item.prototype.updateItemKey = function(itemKey){
    var item = this;
    item.itemKey = itemKey;
    item.apiObj.itemKey = itemKey;
    item.pristine.itemKey = itemKey;
    return item;
};

/*
 * Write updated information for the item to the api and potentiallyp
 * create new child notes (or attachments?) of this item
 */
Zotero.Item.prototype.writeItem = function(){
    var item = this;
    if(!item.owningLibrary){
        throw "Item must be associated with a library";
    }
    return item.owningLibrary.items.writeItems([item]);
};

//get the JS object to be PUT/POSTed for write
Zotero.Item.prototype.writeApiObj = function(){
    var item = this;
    
    //remove any creators that have no names
    if(item.apiObj.creators){
        var newCreatorsArray = item.apiObj.creators.filter(function(c){
            if(c.name || c.firstName || c.lastName){
                return true;
            }
            return false;
        });
        item.apiObj.creators = newCreatorsArray;
    }
    
    //copy apiObj, extend with pristine to make sure required fields are present
    //and remove unwriteable fields(?)
    var writeApiObj = J.extend({}, item.pristine, item.apiObj);
    return writeApiObj;
};

Zotero.Item.prototype.createChildNotes = function(notes){
    var item = this;
    var childItems = [];
    var childItemDeferreds = [];
    var initDone = J.proxy(function(templateItem){
        childItems.push(templateItem);
    }, this);
    
    J.each(notes, function(ind, note){
        var childItem = new Zotero.Item();
        var d = childItem.initEmpty('note');
        d.done(J.proxy(function(noteItem){
            noteItem.set('note', note.note);
            noteItem.set('parentItem', item.itemKey);
            childItems.push(noteItem);
        }), this);
        childItemDeferreds.push(d);
    });
    
    J.when.apply(this, childItemDeferreds).then(J.proxy(function(){
        item.owningLibrary.writeItems(childItems);
    }), this);
};

Zotero.Item.prototype.writePatch = function(){
    
};

Zotero.Item.prototype.getChildren = function(library){
    var item = this;
    Z.debug("Zotero.Item.getChildren", 3);
    var deferred = J.Deferred();
    //short circuit if has item has no children
    if(!(item.numChildren)){//} || (this.parentItemKey !== false)){
        deferred.resolve([]);
        return deferred;
    }
    
    var config = {'target':'children', 'libraryType':item.libraryType, 'libraryID':item.libraryID, 'itemKey':item.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var callback = J.proxy(function(data, textStatus, jqxhr){
        Z.debug('getChildren proxied callback', 4);
        var itemfeed = new Zotero.Feed(data, jqxhr);
        var items = library.items;
        var childItems = items.addItemsFromFeed(itemfeed);
        for (var i = childItems.length - 1; i >= 0; i--) {
            childItems[i].associateWithLibrary(library);
        }
        
        deferred.resolve(childItems);
    }, this);
    
    var jqxhr = Zotero.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});//.fail(Zotero.ui.ajaxErrorMessage);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
    //J.publish('getItemChildren', [this, jqxhr]);
};

Zotero.Item.prototype.getItemTypes = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';

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
                Z.debug(data, 4);
                Zotero.Item.prototype.itemTypes = data;
                Zotero.cache.save({locale:locale, target:'itemTypes'}, Zotero.Item.prototype.itemTypes);
            }
    );
};

Zotero.Item.prototype.getItemFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemFields", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';
    
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
                Z.debug("got itemTypes response", 4);
                Zotero.Item.prototype.itemFields = data;
                Zotero.cache.save({locale:locale, target:'itemFields'}, data);
                //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
                J.each(Zotero.Item.prototype.itemFields, function(ind, val){
                    Zotero.localizations.fieldMap[val.field] = val.localized;
                });
            }
    );
};

Zotero.Item.prototype.getItemTemplate = function (itemType, linkMode) {
    Z.debug("Zotero.Item.prototype.getItemTemplate", 3);
    var deferred = new J.Deferred();
    
    if(typeof itemType == 'undefined') itemType = 'document';
    if(itemType == 'attachment' && typeof linkMode == 'undefined'){
        throw "attachment template requested with no linkMode";
    }
    if(typeof linkMode == "undefined"){
        linkMode = '';
    }

    var query = Zotero.ajax.apiQueryString({itemType:itemType, linkMode:linkMode});
    var requestUrl = Zotero.config.baseApiUrl + '/items/new' + query;
    
    var cacheConfig = {itemType:itemType, target:'itemTemplate'};
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if(itemTemplate){
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;// JSON.parse(Zotero.storage.localStorage[url]);
        deferred.resolve(template);
        return deferred;
    }
    
    //callback always executed in this context
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug("got itemTemplate response", 3);
        Z.debug(data, 4);
        Zotero.cache.save(cacheConfig, data);
        //Zotero.storage.localStorage[url] = JSON.stringify(data);
        deferred.resolve(data);
    }, this);
    
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
            {},
            callback
    );
    
    return deferred;
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var item = this;
    
    var config = {'target':'item', 'targetModifier':'file', 'libraryType':item.libraryType, 'libraryID':item.libraryID, 'itemKey':item.itemKey};
    var fileconfig = J.extend({}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);// uploadQueryString;
    
    var headers = {};
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'POST',
            {
                processData: true,
                data:fileinfo,
                headers:headers
            }
        );
    
    Z.debug("returning jqxhr from getUploadAuthorization", 4);
    return jqxhr;
};

Zotero.Item.prototype.registerUpload = function(uploadKey){
    Z.debug("Zotero.Item.registerUpload", 3);
    var item = this;
    var config = {'target':'item', 'targetModifier':'file', 'libraryType':item.libraryType, 'libraryID':item.libraryID, 'itemKey':item.itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var headers = {};
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'POST',
            {
                processData: true,
                data:{upload: uploadKey},
                headers: headers
            });
    return jqxhr;
};

Zotero.Item.prototype.fullUpload = function(file){

};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        itemType = 'document';
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
        Z.debug("creatorTypes of requested itemType available in localStorage", 3);
        Z.debug(Zotero.Item.prototype.creatorTypes, 4);
        deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
                    Z.debug("got creatorTypes response", 4);
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
    return deferred;
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
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
                Z.debug("got itemTypes response", 4);
                Zotero.Item.prototype.creatorFields = data;
                //Zotero.storage.localStorage['creatorFields'] = JSON.stringify(data);
                Zotero.cache.save({target:'creatorFields'}, data);
            }
    );
};

//---Functions to manually add Zotero format data instead of fetching it from the API ---
//To be used first with cached data for offline, could also maybe be used for custom types
Zotero.Item.prototype.addItemTypes = function(itemTypes, locale){
    
};

Zotero.Item.prototype.addItemFields = function(itemType, itemFields){
    
};

Zotero.Item.prototype.addCreatorTypes = function(itemType, creatorTypes){
    
};

Zotero.Item.prototype.addCreatorFields = function(itemType, creatorFields){
    
};

Zotero.Item.prototype.addItemTemplates = function(templates){
    
};


Zotero.Item.prototype.itemTypeImageClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    if(item.itemType == 'attachment'){
        switch(item.linkMode){
            case 'imported_file':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentFile'];
            case 'imported_url':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentSnapshot'];
            case 'linked_file':
                return item.itemTypeImageSrc['attachmentLink'];
            case 'linked_url':
                return item.itemTypeImageSrc['attachmentWeblink'];
            default:
                return item.itemTypeImageSrc['attachment'];
        }
    }
    else {
        return item.itemType;
    }
};

Zotero.Item.prototype.get = function(key){
    var item = this;
    switch(key) {
        case 'title':
            return item.title;
        case 'creatorSummary':
            return item.creatorSummary;
        case 'year':
            return item.year;
    }
    
    if(key in item.apiObj){
        return item.apiObj[key];
    }
    else if(key in item.dataFields){
        return item.dataFields[key];
    }
    else if(item.hasOwnProperty(key)){
        return item[key];
    }
    
    return null;
};

Zotero.Item.prototype.set = function(key, val){
    var item = this;
    if(key in item.apiObj){
        item.apiObj[key] = val;
    }
    switch (key) {
        case "itemKey":
            item.itemKey = val;
            item.apiObj.itemKey = val;
            break;
        case "itemVersion":
            item.itemVersion = val;
            item.apiObj.itemVersion = val;
            break;
        case "title":
            item.title = val;
            break;
        case "itemType":
            item.itemType = val;
            //TODO: translate api object to new item type
            break;
        case "linkMode":
            break;
        case "deleted":
            item.apiObj.deleted = val;
            break;
        case "parentItem":
        case "parentItemKey":
            if( val === '' ){ val = false; }
            item.parentItemKey = val;
            item.apiObj.parentItem = val;
            break;
    }
    
//    item.synced = false;
    return item;
};

Zotero.Item.prototype.setParent = function(parentItemKey){
    var item = this;
    //pull out itemKey string if we were passed an item object
    if(typeof parentItemKey != 'string' && parentItemKey.hasOwnProperty('instance') && parentItemKey.instance == 'Zotero.Item'){
        parentItemKey = parentItemKey.itemKey;
    }
    item.set('parentItem', parentItemKey);
    return item;
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.hasOwnProperty('collectionKey')){
            collectionKey = collectionKey.collectionKey;
        }
    }
    if(J.inArray(collectionKey, item.apiObj.collections) === -1){
        item.apiObj.collections.push(collectionKey);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.hasOwnProperty('collectionKey')){
            collectionKey = collectionKey.collectionKey;
        }
    }
    var index = J.inArray(collectionKey, item.apiObj.collections);
    if(index != -1){
        item.apiObj.collections.splice(index, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(childItem, fileInfo, fileblob, progressCallback){
    /*
     * write child item so that it exists
     * get upload authorization for actual file
     * perform full upload
     */
    var item = this;
    var uploadChildAttachmentD = new J.Deferred();
    
    if(!item.owningLibrary){
        throw "Item must be associated with a library";
    }
    
    //make sure childItem has parent set
    childItem.set('parentItem', item.itemKey);
    childItem.associateWithLibrary(item.owningLibrary);
    var childWriteD = childItem.writeItem();
    childWriteD.done(J.proxy(function(data, textStatus, jqxhr){
        //successful attachmentItemWrite
        item.numChildren++;
        var childUploadD = childItem.uploadFile(fileInfo, fileblob, progressCallback);
        childUploadD.done(J.proxy(function(success){
            uploadChildAttachmentD.resolve(success);
        }, this) ).fail(J.proxy(function(failure){
            uploadChildAttachmentD.reject(failure);
        }, this) );
        
    })).fail(function(jqxhr, textStatus, errorThrown){
        //failure during attachmentItem write
        uploadChildAttachmentD.reject({
            "message":"Failure during attachmentItem write.",
            "code": jqxhr.status,
            "serverMessage": jqxhr.responseText
        });
    });
    
    return uploadChildAttachmentD;
};

Zotero.Item.prototype.uploadFile = function(fileInfo, fileblob, progressCallback){
    var item = this;
    var uploadFileD = new J.Deferred();
    
    var uploadAuthFileData = {
        md5:fileInfo.md5,
        filename: item.get('title'),
        filesize: fileInfo.filesize,
        mtime:fileInfo.mtime,
        contentType:fileInfo.contentType,
        params:1
    };
    if(fileInfo.contentType === ""){
        uploadAuthFileData.contentType = "application/octet-stream";
    }
    var uploadAuth = item.getUploadAuthorization(uploadAuthFileData);
    uploadAuth.done(J.proxy(function(data, textStatus, jqxhr){
        Z.debug("uploadAuth callback", 3);
        var upAuthOb;
        Z.debug(data, 4);
        if(typeof data == "string"){upAuthOb = JSON.parse(data);}
        else{upAuthOb = data;}
        if(upAuthOb.exists == 1){
            uploadFileD.resolve({'message':"File Exists"});
        }
        else{
            //var filedata = J("#attachmentuploadfileinfo").data('fileInfo').reader.result;
            var fullUpload = Zotero.file.uploadFile(upAuthOb, fileblob);
            fullUpload.onreadystatechange = J.proxy(function(e){
                Z.debug("fullupload readyState: " + fullUpload.readyState, 3);
                Z.debug("fullupload status: " + fullUpload.status, 3);
                //if we know that CORS is allowed, check that the request is done and that it was successful
                //otherwise just wait until it's finished and assume success
                if(fullUpload.readyState == 4){
                    //Upload is done, whether successful or not
                    if(fullUpload.status == 201 || Zotero.config.CORSallowed === false){
                        //upload was successful and we know it, or upload is complete and we have no way of
                        //knowing if it was successful because of same origin policy, so we'll assume it was
                        var regUpload = item.registerUpload(upAuthOb.uploadKey);
                        regUpload.done(function(){
                            uploadFileD.resolve({'message': 'Upload Successful'});
                        }).fail(function(jqxhr, textStatus, e){
                            var failure = {'message': 'Failed registering upload.'};
                            if(jqxhr.status == 412){
                                failure.code = 412;
                                failure.serverMessage = jqxhr.responseText;
                            }
                            uploadFileD.reject(failure);
                        });
                    }
                    else {
                        //we should be able to tell if upload was successful, and it was not
                        uploadFileD.reject({
                            "message": "Failure uploading file.",
                            "code": jqxhr.status,
                            "serverMessage": jqxhr.responseText
                        });
                    }
                }
            }, this);
            //pass on progress events to the progress callback if it was set
            fullUpload.upload.onprogress = function(e){
                if(typeof progressCallback == 'function'){
                    progressCallback(e);
                }
            };
        }
    }, this) ).fail(function(jqxhr, textStatus, errorThrown){
        //Failure during upload authorization
        uploadFileD.reject({
            "message":"Failure during upload authorization.",
            "code": jqxhr.status,
            "serverMessage": jqxhr.responseText
        });
    });
    
    return uploadFileD;
};

Zotero.Item.prototype.cslItem = function(){
    var zoteroItem = this;
    
    // don't return URL or accessed information for journal articles if a
    // pages field exists
    var itemType = zoteroItem.get("itemType");//Zotero_ItemTypes::getName($zoteroItem->itemTypeID);
    var cslType = zoteroItem.cslTypeMap.hasOwnProperty(itemType) ? zoteroItem.cslTypeMap[itemType] : false;
    if (!cslType) cslType = "article";
    var ignoreURL = ((zoteroItem.get("accessDate") || zoteroItem.get("url")) &&
            itemType in {"journalArticle":1, "newspaperArticle":1, "magazineArticle":1} &&
            zoteroItem.get("pages") &&
            zoteroItem.citePaperJournalArticleURL);
    
    cslItem = {'type': cslType};
    if(zoteroItem.owningLibrary){
        cslItem['id'] = zoteroItem.owningLibrary.libraryID + "/" + zoteroItem.get("itemKey");
    } else {
        cslItem['id'] = Zotero.utils.getKey();
    }
    
    // get all text variables (there must be a better way)
    // TODO: does citeproc-js permit short forms?
    J.each(zoteroItem.cslFieldMap, function(variable, fields){
        if (variable == "URL" && ignoreURL) return;
        J.each(fields, function(ind, field){
            var value = zoteroItem.get(field);
            if(value){
                //TODO: strip enclosing quotes? necessary when not pulling from DB?
                cslItem[variable] = value;
            }
        });
    });
    
    // separate name variables
    var creators = zoteroItem.get('creators');
    J.each(creators, function(ind, creator){
        var creatorType = creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
        if (!creatorType) return;
        
        var nameObj;
        if(creator.hasOwnProperty("name")){
            nameObj = {'literal': creator['name']};
        }
        else {
            nameObj = {'family': creator['lastName'], 'given': creator['firstName']};
        }
        
        if (cslItem.hasOwnProperty(creatorType)) {
            cslItem[creatorType].push(nameObj);
        }
        else {
            cslItem[creatorType] = [nameObj];
        }
    });
    
    // get date variables
    J.each(zoteroItem.cslDateMap, function(key, val){
        var date = zoteroItem.get(val);
        if (date) {
            cslItem[key] = {"raw": date};
        }
    });
    
    return cslItem;
};
