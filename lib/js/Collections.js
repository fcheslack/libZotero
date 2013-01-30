Zotero.Collections = function(feed){
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    this.collectionObjects = {};
    
    if(typeof feed == 'undefined'){
        return;
    }
    else{
        this.addCollectionsFromFeed(feed);
    }
};

Zotero.Collections.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Collections";
    dump.collectionsArray = [];
    for (var i = 0; i < this.collectionsArray.length; i++) {
        dump.collectionsArray.push(this.collectionsArray[i].dump());
    }
    
    dump.dirty = this.dirty;
    dump.loaded = this.loaded;
    return dump;
};

Zotero.Collections.prototype.loadDump = function(dump){
    var collections = this;
    this.dirty = dump.dirty;
    this.loaded = dump.loaded;
    
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection();
        collection.loadDump(dump.collectionsArray[i]);
        this.addCollection(collection);
    }
    
    //populate the secondary data structures
    this.collectionsArray.sort(this.sortByTitleCompare);
    //Nest collections as entries of parent collections
    J.each(this.collectionsArray, function(index, obj) {
        if(obj.instance === "Zotero.Collection"){
            if(obj.nestCollection(collections)){
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    this.assignDepths(0, this.collectionsArray);
    
    return this;
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    this.collectionsArray.push(collection);
    this.collectionObjects[collection.key] = collection;
    if(this.owningLibrary){
        collection.associateWithLibrary(this.owningLibrary);
    }
    
    return this;
};

Zotero.Collections.prototype.addCollectionsFromFeed = function(feed){
    var collections = this;
    var collectionsAdded = [];
    feed.entries.each(function(index, entry){
        var collection = new Zotero.Collection(J(entry) );
        collections.addCollection(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        Z.debug("index:" + index + " collectionKey:" + collection.collectionKey);
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                Z.debug(collection.entries);
                insertchildren(2, collection.entries);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.entries);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.loadDataObjects = function(collectionsArray){
    Z.debug("Zotero.Collections.loadDataObjects", 3);
    var library = this.owningLibrary;
    var collections = this;
    
    J.each(collectionsArray, function(index, dataObject){
        var collectionKey = dataObject['collectionKey'];
        var collection = new Zotero.Collection();
        collection.loadObject(dataObject);
        
        collection.libraryUrlIdentifier = collections.libraryUrlIdentifier;
        collection.libraryType = library.type;
        collection.libraryID = library.libraryID;
        collection.owningLibrary = library;
        collections.collectionObjects[collection.collectionKey] = collection;
        collections.collectionsArray.push(collection);
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    //Nest collections as entries of parent collections
    J.each(collections.collectionsArray, function(index, obj) {
        if(obj.instance === "Zotero.Collection"){
            if(obj.nestCollection(collections)){
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    collections.assignDepths(0, collections.collectionsArray);
    
    return collections;
};

Zotero.Collections.prototype.getCollection = function(key){
    if(this.collectionObjects.hasOwnProperty(key)){
        return this.collectionObjects[key];
    }
    else{
        return false;
    }
};

Zotero.Collections.prototype.remoteDeleteCollection = function(key){
    var collections = this;
    if(collections.collectionObjects.hasOwnProperty(key) && collections.collectionObjects[key].synced === true){
        delete collections.collectionObjects[key];
        return true;
    }
    return false;
};
