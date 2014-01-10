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
        
        // may need references to some window.IDB* objects:
        //window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        //window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
        // Now we can open our database
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 3);
        request.onerror = function(e){
            Zotero.debug("ERROR OPENING INDEXED DB", 1);
            reject();
        };
        
        var upgradeCallback = function(event){
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion);
            var db = event.target.result;
            idbLibrary.db = db;
            
            if(oldVersion < 2){
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
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                
                // Create object stores to hold items, collections, and tags.
                // IDB keys are just the zotero object keys
                var itemStore = db.createObjectStore("items", { keyPath: "itemKey" });
                var collectionStore = db.createObjectStore("collections", { keyPath: "collectionKey" });
                var tagStore = db.createObjectStore("tags", { keyPath: "title" });
                
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                
                // Create index to search/sort items by each attribute
                J.each(Zotero.Item.prototype.fieldMap, function(key, val){
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "apiObj." + key, { unique: false });
                });
                
                //itemKey index was created above with all other item fields
                //itemStore.createIndex("itemKey", "itemKey", { unique: false });
                
                //create multiEntry indices on item collectionKeys and tags
                itemStore.createIndex("collectionKeys", "apiObj.collections", {unique: false, multiEntry:true});
                //index on extra tagstrings array since tags are objects and we can't index them directly
                itemStore.createIndex("itemTagStrings", "tagstrings", {unique: false, multiEntry:true});
                //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
                //example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
                
                //itemStore.createIndex("itemType", "itemType", { unique: false });
                itemStore.createIndex("parentItemKey", "parentItemKey", { unique: false });
                itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                collectionStore.createIndex("name", "name", { unique: false });
                collectionStore.createIndex("title", "title", { unique: false });
                collectionStore.createIndex("collectionKey", "collectionKey", { unique: false });
                collectionStore.createIndex("parentCollectionKey", "parentCollectionKey", { unique: false });
                collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                tagStore.createIndex("name", "name", { unique: false });
                tagStore.createIndex("title", "title", { unique: false });
                tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
            }
            if(oldVersion < 3){
                var itemStore = db.createObjectStore("files");
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
            Z.debug("Error deleting indexedDB");
            reject();
        }
        deleteRequest.onsuccess = function(){
            Z.debug("Successfully deleted indexedDB");
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
            Z.debug("Store cleared");
            resolve();
        };
        req.onerror = function (evt) {
            Z.debug("clearObjectStore:", evt.target.errorCode);
            reject();
        };
    });
};

/**
* Add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.addItems = function(items){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Added Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.add(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

/**
* Update/add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.updateItems = function(items){
    Z.debug("Zotero.Idb.Library.updateItems");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!items){
            var library = idbLibrary.owningLibrary;
            var itemKeys = Object.keys(library.items.itemObjects);
            items = [];
            var item;
            for(var ik in itemKeys){
                item = library.items.getItem(itemKeys[ik]);
                if(item){
                    items.push(item);
                }
            }
        }
        
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Added/Updated Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.put(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

/**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/
Zotero.Idb.Library.prototype.removeItems = function(items){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Remove Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Removed Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.delete(items[i].itemKey);
            request.onsuccess = reqSuccess;
        }
    });
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
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var items = [];
        var objectStore = idbLibrary.db.transaction(['items'], "readonly").objectStore('items');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            }
            else {
                Z.debug("resolving idb getAllItems with " + items.length + " items");
                resolve(items);
            }
        };
    });
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
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
                //Z.debug(cursor.key);
                //Z.debug(cursor.primaryKey);
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                Z.debug("resolving getOrderedItemKeys");
                Z.debug(itemKeys);
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
    Z.debug("Zotero.Idb.filterItems", 3);
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
                //Z.debug(cursor.key);
                //Z.debug(cursor.primaryKey);
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

Zotero.Idb.Library.prototype.addCollections = function(collections){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Added Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.add(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateCollections = function(collections){
    Z.debug("Zotero.Idb.Library.updateCollections");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!collections){
            collections = idbLibrary.owningLibrary.collections.collectionsArray;
        }
        
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Updated Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.put(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Removed Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.delete(collections[i].collectionKey);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllCollections = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var collections = [];
        var objectStore = idbLibrary.db.transaction('collections').objectStore('collections');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                collections.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(collections);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addTags = function(tags){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["tags"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Tags transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Tags transaction failed.", 1);
            reject();
        };
        
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event){
            Zotero.debug("Added Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.add(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateTags = function(tags){
    Z.debug("Zotero.Idb.Library.updateTags");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!tags){
            tags = idbLibrary.owningLibrary.tags.tagsArray;
        }
        
        var transaction = idbLibrary.db.transaction(["tags"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Tags transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Tags transaction failed.", 1);
            reject();
        };
        
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event){
            Zotero.debug("Updated Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.put(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllTags = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var tags = [];
        var objectStore = idbLibrary.db.transaction(["tags"], "readonly").objectStore('tags');
        var index = objectStore.index("title");
        
        index.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                tags.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(tags);
            }
        };
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, file){
    Z.debug("Zotero.Idb.Library.setFile");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("set file transaction failed.", 1);
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Set File" + event.target.result, 4);
        };
        var request = fileStore.put(file, key);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.getFile");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = J.proxy(function(event){
            resolve(event.target.result);
        }, this);
        idbLibrary.db.transaction("items").objectStore(["files"], "readonly").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.deleteFile");
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("delete file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("delete file transaction failed.", 1);
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
