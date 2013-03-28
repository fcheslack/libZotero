Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.collectionVersion = 0;
    this.synced = false;
    this.pristine = null;
    this.apiObj = {};
    this.children = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateObjectKey = function(objectKey){
    return this.updateCollectionKey(objectKey);
};

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.collectionKey = collectionKey;
    collection.apiObj.collectionKey = collectionKey;
    return collection;
};

Zotero.Collection.prototype.dump = function(){
    Zotero.debug("Zotero.Collection.dump", 4);
    var dump = this.dumpEntry();
    var dataProperties = [
        'collectionVersion',
        'collectionKey',
        'synced',
        'pristine',
        'numItems',
        'numCollections',
        'name',
        'parentCollection',
        'relations',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump){
    Zotero.debug("Zotero.Collection.loaddump", 4);
    this.loadDumpEntry(dump);
    var dataProperties = [
        'collectionVersion',
        'collectionKey',
        'synced',
        'pristine',
        'numItems',
        'numCollections',
        'name',
        'parentCollection',
        'relations',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Collection.prototype.loadObject = function(ob){
    this.collectionKey = ob.collectionKey;
    this.dateAdded = ob.dateAdded;
    this.dateModified = ob.dateUpdated;
    this['links'] = ob['links'];
    this['title'] = ob['title'];
    this['name'] = ob['title'];
    this.parentCollectionKey = ob.parentCollectionKey;
    this.parent = ob.parentCollectionKey;
    this.childKeys = ob.childKeys;
    this.topLevel = true;
    
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    this.parseXmlEntry(cel);
    
    this['name'] = cel.find("title").text();
    this.collectionKey = cel.find("zapi\\:key, key").text();
    this.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text(), 10);
    this.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text(), 10);
    this.dateAdded = this.published;//cel.find("published").text();
    this.dateModified = this.updated;//cel.find("updated").text();
    var linksArray = [];
    //link parsing also done in parseXmlEntry, not sure which version is better, but this necessary for collection nesting right now
    cel.find("link").each(function(index, element){
        var link = J(element);
        linksArray.push({'rel':link.attr('rel'), 'type':link.attr('type'), 'href':link.attr('href')});
    });
    
    this.parent = false;
    this.topLevel = true;
    var collection = this;
    
    this.websiteCollectionLink = Zotero.config.baseWebsiteUrl + '/' + this.libraryUrlIdentifier + '/items/collection/' + this.collectionKey;
    this.hasChildren = (this.numCollections) ? true : false;
    
    //parse the JSON content block
    var contentEl = cel.find('content').first(); //possibly we should test to make sure it is application/json or zotero json
    if(contentEl){
        this.pristine = JSON.parse(cel.find('content').first().text());
        this.apiObj = JSON.parse(cel.find('content').first().text());
        this['name'] = this.apiObj['name'];
        this['parentCollection'] = this.apiObj['parentCollection'];
        if(this['parentCollection']){
            this.topLevel = false;
        }
        this.collectionKey = this.apiObj.collectionKey;
        this.collectionVersion = this.apiObj.collectionVersion;
        this.name = this.apiObj.name;
        this.relations = this.apiObj.relations;
        
        this.synced = true;
    }
};

Zotero.Collection.prototype.nestCollection = function(collectionList) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    if(this.parentCollection !== false){
        var parentKey = this.parentCollection;
        if(typeof(collectionList[parentKey]) !== 'undefined'){
            Z.debug("Pushing " + this.collectionKey + "(" + this.title + ") onto children of parent " + parentKey + "(" + collectionList[parentKey].title + ")", 4);
            var parentOb = collectionList[parentKey];
            parentOb.children.push(this);
            parentOb.hasChildren = true;
            this.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    Z.debug(itemKeys, 3);
    var config = {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'POST',
        {data: requestData,
         processData: false
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Collection.prototype.getMemberItemKeys = function(){
    Z.debug('Zotero.Collection.getMemberItemKeys', 3);
    Z.debug('Current Collection: ' + this.collectionKey, 3);
    Z.debug(this.itemKeys, 3);
    var config = {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'format':'keys'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var deferred = new J.Deferred();
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'GET', {processData: false} );
    
    jqxhr.done(J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('getMemberItemKeys proxied callback', 3);
        var c = this;
        var result = data;
        var keys = J.trim(result).split(/[\s]+/);
        c.itemKeys = keys;
        deferred.resolve(keys);
    }, this) );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var config = {'target':'item', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'itemKey':itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'DELETE',
        {processData: false,
         cache:false
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.removeItem', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.update = function(name, parentKey){
    var collection = this;
    if(!parentKey) parentKey = false;
    var config = {'target':'collection', 'libraryType':collection.libraryType, 'libraryID':collection.libraryID, 'collectionKey':collection.collectionKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.updateCollection', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var apiObj = collection.apiObj;
    apiObj = J.extend(apiObj, {
        name: collection.name,
        collectionKey: collection.collectionKey,
        collectionVersion: collection.collectionVersion,
        parentCollection: collection.parentCollection,
        relations: collection.relations
    });
    return apiObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var config = {'target':'collection', 'libraryType':collection.libraryType, 'libraryID':collection.libraryID, 'collectionKey':collection.collectionKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'DELETE',
        {processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.delete', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.title;
        case 'collectionKey':
        case 'key':
            return collection.collectionKey;
        case 'collectionVersion':
        case 'version':
            return collection.collectionVersion;
        case 'parentCollection':
        case 'parentCollectionKey':
            return collection.parentCollectionKey;
    }
    
    if(key in collection.apiObj){
        return collection.apiObj[key];
    }
    else if(collection.hasOwnProperty(key)){
        return collection[key];
    }
    
    return null;
};

Zotero.Collection.prototype.set = function(key, val){
    var collection = self;
    switch(key){
        case 'title':
        case 'name':
            collection.name = val;
            collection.apiObject['name'] = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.collectionKey = val;
            collection.apiObject['collectionKey'] = val;
            break;
        case 'parentCollection':
        case 'parentCollectionKey':
            collection.parentCollectionKey = val;
            collection.apiObject['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.collectionVersion = val;
            collection.apiObject['collectionVersion'] = val;
            break;
    }
    
    if(array_key_exists(key, collection.apiObject)){
        collection.apiObject[key] = val;
    }
    
    if(collection.hasOwnProperty(key)) {
        collection.key = val;
    }
};
