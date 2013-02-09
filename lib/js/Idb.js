Zotero.Idb = function(){
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    this.indexedDB = indexedDB;
    // Now we can open our database
    var request = indexedDB.open("Zotero");
    request.onerror = function(e){
        Zotero.debug("ERROR OPENING INDEXED DB", 1);
    };
    request.onupgradeneeded = function(event){
        var db = event.target.result;
        Zotero.Idb.db = db;
        // Create an objectStore to hold information about our customers. We're
        // going to use "ssn" as our key path because it's guaranteed to be
        // unique.
        var itemStore = db.createObjectStore("items", { keyPath: "itemKey" });
        var collectionStore = db.createObjectStore("collections", { keyPath: "itemKey" });
        var tagStore = db.createObjectStore("tags", { keyPath: "itemKey" });
        
        // Create an index to search customers by name. We may have duplicates
        // so we can't use a unique index.
        itemStore.createIndex("itemKey", "itemKey", { unique: false });
        itemStore.createIndex("itemType", "itemType", { unique: false });
        itemStore.createIndex("parentKey", "parentKey", { unique: false });
        itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
        
        collectionStore.createIndex("name", "name", { unique: false });
        collectionStore.createIndex("title", "title", { unique: false });
        collectionStore.createIndex("collectionKey", "collectionKey", { unique: false });
        collectionStore.createIndex("parentCollectionKey", "parentCollectionKey", { unique: false });
        collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
        
        tagStore.createIndex("name", "name", { unique: false });
        tagStore.createIndex("title", "title", { unique: false });
        tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
        
        //Zotero.Idb.itemStore = itemStore;
        //Zotero.Idb.collectionStore = collectionStore;
        //Zotero.Idb.tagStore = tagStore;
        
        /*
        // Store values in the newly created objectStore.
        for (var i in customerData) {
            objectStore.add(customerData[i]);
        }
         */
    };
};

Zotero.Idb.addItems = function(items){
    var transaction = Zotero.Idb.db.transaction(["items"], IDBTransaction.READ_WRITE);
    
    transaction.oncomplete = function(event){
        Zotero.debug("Add Items transaction completed.", 3);
    };
    
    transaction.onerror = function(event){
        Zotero.debug("Add Items transaction failed.", 1);
        
    };
    
    var itemStore = transaction.objectStore("items");
    var reqSuccess = function(event){
        Zotero.debug("Added Item " + event.target.result, 4);
    };
    for (var i in items) {
        var request = itemStore.add(items[i]);
        request.onsuccess = reqSuccess;
    }
};

Zotero.Idb.getItem = function(itemKey, callback){
    Zotero.Idb.db.transaction("items").objectStore("items").get(itemKey).onsuccess = function(event) {
        callback(null, event.target.result);
    };
};

Zotero.Idb.getAllItems = function(callback){
    var items = [];
    var objectStore = Zotero.Idb.db.transaction('items').objectStore('items');
    
    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            items.push(cursor.value);
            cursor.continue();
        }
        else {
            callback(null, items);
        }
    };
};



