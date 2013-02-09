Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.collectionVersion = 0;
    this.synced = false;
    this.pristine = null;
    this.children = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

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
        'etag',
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
        'etag',
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
        var j = JSON.parse(cel.find('content').first().text());
        this['name'] = j['name'];
        this['parentCollection'] = j['parentCollection'];
        if(this['parentCollection']){
            this.topLevel = false;
        }
        this.collectionKey = j.collectionKey;
        this.collectionVersion = j.collectionVersion;
        this.name = j.name;
        this.relations = j.relations;
        
        this.etag = cel.find("content").attr('zapi:etag');
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
    if(!parentKey) parentKey = false;
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({'name':name, 'parentCollection':parentKey});
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.updateCollection', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = Zotero.ajaxRequest(requestUrl, 'DELETE',
        {processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.delete', [this.key, itemKey, jqxhr]);
};
