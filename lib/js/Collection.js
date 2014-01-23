Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.collectionVersion = 0;
    this.synced = false;
    this.pristine = null;
    this.apiObj = {
        'name': '',
        'collectionKey': '',
        'parentCollection': false,
        'collectionVersion': 0,
        'relations': {}
    };
    this.children = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.collectionKey = collectionKey;
    collection.apiObj.collectionKey = collectionKey;
    return collection;
};

Zotero.Collection.prototype.dump = function(){
    Zotero.debug("Zotero.Collection.dump", 4);
    var collection = this;
    var dump = collection.dumpEntry();
    var dumpProperties = [
        'apiObj',
        'pristine',
        'collectionKey',
        'collectionVersion',
        'synced',
        'numItems',
        'numCollections',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys',
    ];

    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = collection[dumpProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump){
    Zotero.debug("Zotero.Collection.loaddump", 4);
    var collection = this;
    collection.loadDumpEntry(dump);
    var dumpProperties = [
        'apiObj',
        'pristine',
        'collectionKey',
        'collectionVersion',
        'synced',
        'numItems',
        'numCollections',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys',
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        collection[dumpProperties[i]] = dump[dumpProperties[i]];
    }

    collection.initSecondaryData();
    return collection;
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    var collection = this;
    collection.parseXmlEntry(cel);
    
    collection.name = cel.find("title").text();
    collection.collectionKey = cel.find("zapi\\:key, key").text();
    collection.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text(), 10);
    collection.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text(), 10);
    collection.dateAdded = collection.published;//cel.find("published").text();
    collection.dateModified = collection.updated;//cel.find("updated").text();
    
    collection.parentCollection = false;
    collection.topLevel = true;
    
    //parse the JSON content block
    //possibly we should test to make sure it is application/json or zotero json
    var contentEl = cel.find('content').first();
    if(contentEl){
        collection.pristine = JSON.parse(cel.find('content').first().text());
        collection.apiObj = JSON.parse(cel.find('content').first().text());
        
        collection.synced = true;
    }
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;

    collection['name'] = collection.apiObj['name'];
    collection['parentCollection'] = collection.apiObj['parentCollection'];
    if(collection['parentCollection']){
        collection.topLevel = false;
    }
    collection.collectionKey = collection.apiObj.collectionKey;
    collection.collectionVersion = collection.apiObj.collectionVersion;
    collection.relations = collection.apiObj.relations;
    
    if(Zotero.config.libraryPathString){
        collection.websiteCollectionLink = Zotero.config.libraryPathString + 
        '/collectionKey/' + collection.collectionKey;
    }
    else {
        collection.websiteCollectionLink = '';
    }
    collection.hasChildren = (collection.numCollections) ? true : false;
    
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    if(collection.parentCollection !== false){
        var parentKey = collection.get('parentCollection');
        if(typeof(collectionsObject[parentKey]) !== 'undefined'){
            var parentOb = collectionsObject[parentKey];
            parentOb.children.push(collection);
            parentOb.hasChildren = true;
            collection.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    var collection = this;
    Z.debug(itemKeys, 3);
    var config = {
        'target':'items',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'content':'json'
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    return Zotero.ajaxRequest(requestUrl, 'POST',
        {data: requestData,
         processData: false
        }
    );
};

Zotero.Collection.prototype.getMemberItemKeys = function(){
    Z.debug('Zotero.Collection.getMemberItemKeys', 3);
    var collection = this;
    var config = {
        'target':'items',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'format':'keys'
    };
    
    return Zotero.ajaxRequest(config, 'GET', {processData: false} )
    .then(function(response){
        Z.debug('getMemberItemKeys proxied callback', 3);
        var result = response.data;
        var keys = J.trim(result).split(/[\s]+/);
        collection.itemKeys = keys;
        return keys;
    });
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var collection = this;
    var config = {
        'target':'item',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'itemKey':itemKey
    };
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         cache:false
        }
    );
};

Zotero.Collection.prototype.update = function(name, parentKey){
    var collection = this;
    if(!parentKey) parentKey = false;
    var config = {
        'target':'collection',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey
    };
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    return Zotero.ajaxRequest(config, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    );
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var writeObj = J.extend({}, collection.pristine, collection.apiObj);
    return writeObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        'target':'collection',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey
    };
    
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         headers:{
            'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    ).then(function(){
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.collectionKey);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.apiObj.name || collection.title;
        case 'collectionKey':
        case 'key':
            return collection.apiObj.collectionKey || collection.collectionKey;
        case 'collectionVersion':
        case 'version':
            return collection.collectionVersion;
        case 'parentCollection':
            return collection.apiObj.parentCollection;
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
    var collection = this;
    if(key in collection.apiObj){
        
    }
    switch(key){
        case 'title':
        case 'name':
            collection.name = val;
            collection.apiObj['name'] = val;
            collection.title = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.collectionKey = val;
            collection.apiObj['collectionKey'] = val;
            break;
        case 'parentCollection':
            collection.parentCollection = val;
            collection.apiObj['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.collectionVersion = val;
            collection.apiObj['collectionVersion'] = val;
            break;
    }
    
    if(collection.hasOwnProperty(key)) {
        collection[key] = val;
    }
};
