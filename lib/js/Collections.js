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
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Collections";
    dump.collectionsVersion = this.collectionsVersion;
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
    collections.collectionsVersion = dump.collectionsVersion;
    collections.dirty = dump.dirty;
    collections.loaded = dump.loaded;
    
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection();
        collection.loadDump(dump.collectionsArray[i]);
        collections.addCollection(collection);
    }
    
    //populate the secondary data structures
    collections.initSecondaryData();
    return collections;
};

//build up secondary data necessary to rendering and easy operations but that
//depend on all collections already being present
Zotero.Collections.prototype.initSecondaryData = function(){
    Z.debug("Zotero.Collections.initSecondaryData", 3);
    var collections = this;
    
    //rebuild collectionsArray
    collections.collectionsArray = [];
    J.each(collections.collectionObjects, function(ind, collection){
        collections.collectionsArray.push(collection);
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    collections.nestCollections();
    collections.assignDepths(0, collections.collectionsArray);
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    Zotero.debug("Zotero.Collections.addCollection", 4);
    Zotero.debug(collection.collectionKey, 4);
    this.collectionsArray.push(collection);
    this.collectionObjects[collection.collectionKey] = collection;
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
    if(a.get('title').toLowerCase() == b.get('title').toLowerCase()){
        return 0;
    }
    if(a.get('title').toLowerCase() < b.get('title').toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var collections = this;
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                insertchildren(2, collection.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var collections = this;
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.children);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.getCollection = function(key){
    if(this.collectionObjects.hasOwnProperty(key)){
        return this.collectionObjects[key];
    }
    else{
        return false;
    }
};

Zotero.Collections.prototype.remoteDeleteCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollection(collectionKey);
};

Zotero.Collections.prototype.removeLocalCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollections([collectionKey]);
};

Zotero.Collections.prototype.removeLocalCollections = function(collectionKeys){
    var collections = this;
    //delete Collection from collectionObjects
    for(var i = 0; i < collectionKeys.length; i++){
        delete collections.collectionObjects[collectionKeys[i]];
    }
    
    //rebuild collectionsArray
    collections.initSecondaryData();
};

//reprocess all collections to add references to children inside their parents
Zotero.Collections.prototype.nestCollections = function(){
    var collections = this;
    //clear out all child references so we don't duplicate
    J.each(collections.collectionsArray, function(ind, collection){
        collection.children = [];
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    J.each(collections.collectionsArray, function(ind, collection){
        collection.nestCollection(collections.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(collectionsArray){
    Z.debug('Zotero.Collections.writeCollections', 3);
    var collections = this;
    var library = collections.owningLibrary;
    var returnCollections = [];
    var writeCollections = [];
    var i;
    
    var config = {
        'target':'collections',
        'libraryType':collections.owningLibrary.libraryType,
        'libraryID':collections.owningLibrary.libraryID,
        'content':'json'
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var writeChunks = [];
    var writeChunkCounter = 0;
    var rawChunkObjects = [];
    var chunkSize = 50;
    
    var collection;
    for(i = 0; i < collectionsArray.length; i++){
        collection = collectionsArray[i];
        var collectionKey = collection.get('collectionKey');
        if(!collectionKey) {
            var newCollectionKey = Zotero.utils.getKey();
            collection.set("collectionKey", newCollectionKey);
            collection.set("collectionVersion", 0);
        }
        
    }
    for(i = 0; i < collectionsArray.length; i = i + chunkSize){
        writeChunks.push(collectionsArray.slice(i, i+chunkSize));
    }
    
    for(i = 0; i < writeChunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < writeChunks[i].length; j++){
            rawChunkObjects[i].push(writeChunks[i][j].writeApiObj());
            Z.debug("Collection Write API Object: ");
            Z.debug(writeChunks[i][j].writeApiObj());
        }
    }
    
    //update collections with server response if successful
    var writeCollectionsSuccessCallback = function(response){
        Z.debug("writeCollections successCallback", 3);
        Z.debug(response, 3);
        Zotero.utils.updateObjectsFromWriteResponse(this.writeChunk, response.jqxhr);
        //save updated collections to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateCollections(this.writeChunk);
        }
        
        returnCollections = returnCollections.concat(this.writeChunk);
    };
    
    Z.debug("collections.collectionsVersion: " + collections.collectionsVersion, 3);
    Z.debug("collections.libraryVersion: " + collections.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            //returnCollections: returnCollections,
            library: library,
        };
        
        requestData = JSON.stringify({collections: rawChunkObjects[i]});
        requestObjects.push({
            url: requestUrl,
            options: {
                type: 'POST',
                data: requestData,
                processData: false,
                headers:{
                    //'If-Unmodified-Since-Version': collections.collectionsVersion,
                    'Content-Type': 'application/json'
                },
                success: J.proxy(writeCollectionsSuccessCallback, successContext),
            },
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(sequentialPromises){
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        Z.debug(returnCollections);
        Z.debug("adding returnCollections to library.collections");
        J.each(returnCollections, function(ind, collection){
            collections.addCollection(collection);
        });
        collections.initSecondaryData();
        return returnCollections;
    })
    .catch(function(err){
        Z.debug(err);
    });
};
