Zotero.Collection = function(collectionObj){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.key = '';
    this.version = 0;
    this.synced = false;
    this.pristineData = null;
    this.apiObj = {
        'key': '',
        'version': 0,
        'library':{},
        'links':{},
        'meta':{},
        'data':{
            'key': '',
            'version': 0,
            'name': '',
            'parentCollection': false,
            'relations':{}
        },
    };
    this.children = [];
    this.topLevel = true;
    if(collectionObj){
        this.parseJsonCollection(collectionObj);
    }
};

Zotero.Collection.prototype = new Zotero.ApiObject();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateObjectKey = function(collectionKey){
    this.updateCollectionKey(collectionKey);
};

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.key = collectionKey;
    collection.apiObj.key = collectionKey;
    collection.apiObj.data.key = collectionKey;
    return collection;
};

Zotero.Collection.prototype.parseJsonCollection = function(apiObj) {
    Z.debug("parseJsonCollection", 4);
    var collection = this;
    collection.key = apiObj.key;
    collection.version = apiObj.version;
    collection.apiObj = J.extend({}, apiObj);
    collection.pristineData = J.extend({}, apiObj.data);

    collection.parentCollection = false;
    collection.topLevel = true;
    collection.synced = true;
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;
    
    if(collection.apiObj.data['parentCollection']){
        collection.topLevel = false;
    } else {
        collection.topLevel = true;
    }
    
    if(Zotero.config.libraryPathString){
        collection.websiteCollectionLink = Zotero.config.libraryPathString + 
        '/collectionKey/' + collection.apiObj.key;
    }
    else {
        collection.websiteCollectionLink = '';
    }
    collection.hasChildren = (collection.apiObj.meta.numCollections) ? true : false;
    
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    var parentCollectionKey = collection.get('parentCollection');
    if(parentCollectionKey !== false){
        if(collectionsObject.hasOwnProperty(parentCollectionKey)) {
            var parentOb = collectionsObject[parentCollectionKey];
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
    var config = {
        'target':'items',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    return Zotero.ajaxRequest(config, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    );
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var writeObj = J.extend({}, collection.pristineData, collection.apiObj.data);
    return writeObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        'target':'collection',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         headers:{
            'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    ).then(function(){
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.key);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.apiObj.data.name;
        case 'collectionKey':
        case 'key':
            return collection.apiObj.key || collection.key;
        case 'collectionVersion':
        case 'version':
            return collection.apiObj.version;
        case 'parentCollection':
            return collection.apiObj.data.parentCollection;
    }
    
    if(key in collection.apiObj.data){
        return collection.apiObj.data[key];
    }
    else if(collection.apiObj.meta.hasOwnProperty(key)){
        return collection.apiObj.meta[key];
    }
    else if(collection.hasOwnProperty(key)){
        return collection[key];
    }
    
    return null;
};

Zotero.Collection.prototype.set = function(key, val){
    var collection = this;
    if(key in collection.apiObj.data){
        collection.apiObj.data[key] = val;
    }
    switch(key){
        case 'title':
        case 'name':
            collection.apiObj.data['name'] = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.key = val;
            collection.apiObj.key = val;
            collection.apiObj.data.key = val;
            break;
        case 'parentCollection':
            collection.apiObj.data['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.version = val;
            collection.apiObj.version = val;
            collection.apiObj.data.version = val;
            break;
    }
    
    if(collection.hasOwnProperty(key)) {
        collection[key] = val;
    }
};
