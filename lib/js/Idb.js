Zotero.Idb = {};

//Initialize an indexedDB for the specified library user or group + id
//returns a promise that is resolved with a Zotero.Idb.Library instance when successful
//and rejected onerror
Zotero.Idb.Library = function(libraryString){
    Z.debug("Zotero.Idb.Library", 3);
    Z.debug("Initializing Zotero IDB", 3);
    this.libraryString = libraryString;
    this.owningLibrary = null;
    this.initialized = false;
};

Zotero.Idb.Library.prototype.init = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        //Don't bother with the prefixed names because they should all be irrelevant by now
        //window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        var indexedDB = window.indexedDB;
        idbLibrary.indexedDB = indexedDB;
        
        // Now we can open our database
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 4);
        request.onerror = function(e){
            Zotero.error("ERROR OPENING INDEXED DB");
            reject();
        };
        
        var upgradeCallback = function(event){
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion, 3);
            var db = event.target.result;
            idbLibrary.db = db;
            
            if(oldVersion < 4){
                //delete old versions of object stores
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if(db.objectStoreNames["items"]){
                    db.deleteObjectStore("items");
                }
                if(db.objectStoreNames["tags"]){
                    db.deleteObjectStore("tags");
                }
                if(db.objectStoreNames["collections"]){
                    db.deleteObjectStore("collections");
                }
                if(db.objectStoreNames["files"]){
                    db.deleteObjectStore("files");
                }
                if(db.objectStoreNames["versions"]){
                    db.deleteObjectStore("versions");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                
                // Create object stores to hold items, collections, and tags.
                // IDB keys are just the zotero object keys
                var itemStore = db.createObjectStore("items", { keyPath: "key" });
                var collectionStore = db.createObjectStore("collections", { keyPath: "key" });
                var tagStore = db.createObjectStore("tags", { keyPath: "tag" });
                var fileStore = db.createObjectStore("files");
                var versionStore = db.createObjectStore("versions");
                
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                
                // Create index to search/sort items by each attribute
                J.each(Zotero.Item.prototype.fieldMap, function(key, val){
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "data." + key, { unique: false });
                });
                
                //itemKey index was created above with all other item fields
                //itemStore.createIndex("itemKey", "itemKey", { unique: false });
                
                //create multiEntry indices on item collectionKeys and tags
                itemStore.createIndex("collectionKeys", "data.collections", {unique: false, multiEntry:true});
                //index on extra tagstrings array since tags are objects and we can't index them directly
                itemStore.createIndex("itemTagStrings", "_supplement.tagstrings", {unique: false, multiEntry:true});
                //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
                //example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
                
                //itemStore.createIndex("itemType", "itemType", { unique: false });
                itemStore.createIndex("parentItemKey", "data.parentItem", { unique: false });
                itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
                itemStore.createIndex("deleted", "data.deleted", { unique: false });
                
                collectionStore.createIndex("name", "data.name", { unique: false });
                collectionStore.createIndex("key", "key", { unique: false });
                collectionStore.createIndex("parentCollection", "data.parentCollection", { unique: false });
                //collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                tagStore.createIndex("tag", "tag", { unique: false });
                //tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
            }
        };
        
        request.onupgradeneeded = upgradeCallback;
        
        request.onsuccess = function(){
            Z.debug("IDB success", 3);
            idbLibrary.db = request.result;
            idbLibrary.initialized = true;
            resolve(idbLibrary);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function(){
    var idbLibrary = this;
    idbLibrary.db.close();
    return new Promise(function(resolve, reject){
        var deleteRequest = idbLibrary.indexedDB.deleteDatabase("Zotero_" + idbLibrary.libraryString);
        deleteRequest.onerror = function(){
            Z.error("Error deleting indexedDB");
            reject();
        }
        deleteRequest.onsuccess = function(){
            Z.debug("Successfully deleted indexedDB", 2);
            resolve();
        }
    });
};

/**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"
*/
Zotero.Idb.Library.prototype.getObjectStore = function (store_name, mode) {
    var idbLibrary = this;
    var tx = idbLibrary.db.transaction(store_name, mode);
    return tx.objectStore(store_name);
};

Zotero.Idb.Library.prototype.clearObjectStore = function (store_name) {
    var idbLibrary = this;
    var store = getObjectStore(store_name, 'readwrite');
    return new Promise(function(resolve, reject){
        var req = store.clear();
        req.onsuccess = function(evt) {
            Z.debug("Store cleared", 3);
            resolve();
        };
        req.onerror = function (evt) {
            Z.error("clearObjectStore:", evt.target.errorCode);
            reject();
        };
    });
};

/**
* Add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.addItems = function(items){
    return this.addObjects(items, 'item');
};

/**
* Update/add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.updateItems = function(items){
    return this.updateObjects(items, 'item');
};

/**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/
Zotero.Idb.Library.prototype.removeItems = function(items){
    return this.removeObjects(items, 'item');
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getItem = function(itemKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("items").objectStore(["items"], "readonly").get(itemKey).onsuccess = success;
    });
};

/**
* Get all the items in this indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.getAllItems = function(){
    return this.getAllObjects('item');
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    Z.debug("" + field + " " + order, 3);
    return new Promise(function(resolve, reject){
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        if(order == "desc"){
            cursorDirection = "prev";
        }
        
        var cursorRequest = index.openKeyCursor(null, cursorDirection);
        var itemKeys = [];
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

//filter the items in indexedDB by value in field
Zotero.Idb.Library.prototype.filterItems = function(field, value){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.filterItems " + field + " - " + value, 3);
    return new Promise(function(resolve, reject){
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        /*if(order == "desc"){
            cursorDirection = "prev";
        }*/
        
        var range = IDBKeyRange.only(value);
        var cursorRequest = index.openKeyCursor(range, cursorDirection);
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

Zotero.Idb.Library.prototype.inferType = function(object){
    if(!object){
        return false;
    }
    if(!object.instance){
        return false;
    }
    switch(object.instance){
        case 'Zotero.Item':
            return 'item';
        case 'Zotero.Collection':
            return 'collection';
        case 'Zotero.Tag':
            return 'tag';
        default:
            return false;
    }
};

Zotero.Idb.Library.prototype.getTransactionAndStore = function(type, access){
    var idbLibrary = this;
    var transaction;
    var objectStore;
    switch(type){
        case 'item':
            transaction = idbLibrary.db.transaction(['items'], access);
            objectStore = transaction.objectStore('items');
            break;
        case 'collection':
            transaction = idbLibrary.db.transaction(['collections'], access);
            objectStore = transaction.objectStore('collections');
            break;
        case 'tag':
            transaction = idbLibrary.db.transaction(['tags'], access);
            objectStore = transaction.objectStore('tags');
            break;
        default:
            return Promise.reject();
    }
    return [transaction, objectStore];
};

Zotero.Idb.Library.prototype.addObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.addObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Add Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Add Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Added Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.add(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.updateObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Update Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Update Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Updated Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.put(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeObjects = function(objects, type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Remove Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Removed Object " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = objectStore.delete(objects[i].key);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllObjects = function(type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    return new Promise(function(resolve, reject){
        var objects = [];
        var objectStore = idbLibrary.db.transaction(type + 's').objectStore(type + 's');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                objects.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(objects);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addCollections = function(collections){
    return this.addObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.updateCollections = function(collections){
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    return this.updateObjects(collections, 'collection');
};

/**
* Get collection from indexedDB that has given collectionKey
* @param {string} collectionKey
*/
Zotero.Idb.Library.prototype.getCollection = function(collectionKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("collections").objectStore(["collections"], "readonly").get(collectionKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections){
    Z.debug("Zotero.Idb.Library.removeCollections", 3);
    return this.removeObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.getAllCollections = function(){
    Z.debug('Zotero.Idb.Library.getAllCollections', 3);
    return this.getAllObjects('collection');
};

Zotero.Idb.Library.prototype.addTags = function(tags){
    return this.addObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.updateTags = function(tags){
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    return this.updateObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.getAllTags = function(){
    Z.debug('getAllTags', 3);
    return this.getAllObjects('tag');
};

Zotero.Idb.Library.prototype.setVersion = function(type, version){
    Z.debug("Zotero.Idb.Library.setVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["versions"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set version transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set version transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("versions");
        var reqSuccess = function(event){
            Zotero.debug("Set Version" + event.target.result, 3);
        };
        var request = fileStore.put(version, type);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get version data from indexedDB
* @param {string} type
*/
Zotero.Idb.Library.prototype.getVersion = function(type){
    Z.debug("Zotero.Idb.Library.getVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            Z.debug("done getting version");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["versions"], "readonly").objectStore("versions").get(type).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, fileData){
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set file transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Set File" + event.target.result, 3);
        };
        var request = fileStore.put(fileData, itemKey);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.getFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            Z.debug("done getting file");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["files"], "readonly").objectStore("files").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("delete file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("delete file transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Deleted File" + event.target.result, 4);
        };
        var request = fileStore.delete(key);
        request.onsuccess = reqSuccess;
    });
};


//intersect two arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersect = function(ar1, ar2){
    var idbLibrary = this;
    var result = [];
    for(var i = 0; i < ar1.length; i++){
        if(ar2.indexOf(ar1[i]) !== -1){
            result.push(ar1[i]);
        }
    }
    return result;
};

//intersect an array of arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersectAll = function(arrs) {
    var idbLibrary = this;
    var result = arrs[0];
    for(var i = 0; i < arrs.length - 1; i++){
        result = idbLibrary.intersect(result, arrs[i+1]);
    }
    return result;
};
