//load objects from indexedDB
Zotero.Library.prototype.loadIndexedDBCache = function(){
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    
    var library = this;
    
    var itemsPromise = library.idbLibrary.getAllItems();
    var collectionsPromise = library.idbLibrary.getAllCollections();
    var tagsPromise = library.idbLibrary.getAllTags();
    
    itemsPromise.then(function(itemsArray){
        Z.debug("loadIndexedDBCache itemsD done", 3);
        //create itemsDump from array of item objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Items.dump";
        dump.itemsVersion = 0;
        dump.itemsArray = itemsArray;
        for(var i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].itemVersion > latestVersion){
                latestVersion = itemsArray[i].itemVersion;
            }
        }
        dump.itemsVersion = latestVersion;
        library.items.loadDump(dump);
        //TODO: add itemsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    
    collectionsPromise.then(function(collectionsArray){
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        //create collectionsDump from array of collection objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.collectionsVersion = 0;
        dump.collectionsArray = collectionsArray;
        for(var i = 0; i < collectionsArray.length; i++){
            if(collectionsArray[i].collectionVersion > latestVersion){
                latestVersion = collectionsArray[i].collectionVersion;
            }
        }
        dump.collectionsVersion = latestVersion;
        library.collections.loadDump(dump);

        //TODO: add collectionsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.collections.loaded = true;
    });
    
    tagsPromise.then(function(tagsArray){
        //create tagsDump from array of tag objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.tagsVersion = 0;
        dump.tagsArray = tagsArray;
        for(var i = 0; i < tagsArray.length; i++){
            if(tagsArray[i].tagVersion > latestVersion){
                latestVersion = tagsArray[i].tagVersion;
            }
        }
        dump.tagsVersion = latestVersion;
        library.tags.loadDump(dump);

        //TODO: add tagsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.tags.loaded = true;
    });
    
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([itemsPromise, collectionsPromise, tagsPromise]);
};

Zotero.Library.prototype.saveIndexedDB = function(){
    var library = this;
    
    var saveItemsPromise = library.idbLibrary.updateItems(library.items.itemsArray);
    var saveCollectionsPromise = library.idbLibrary.updateCollections(library.collections.collectionsArray);
    var saveTagsPromise = library.idbLibrary.updateTags(library.tags.tagsArray);
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([saveItemsPromise, saveCollectionsPromise, saveTagsPromise])
};

//load items we currently have saved in the cache back into this library instance
Zotero.Library.prototype.loadCachedItems = function(){
    Zotero.debug("Zotero.Library.loadCachedItems", 3);
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    var itemsDump = Zotero.cache.load(cacheConfig);
    if(itemsDump !== null){
        Zotero.debug("Items dump present in cache - loading items", 3);
        library.items.loadDump(itemsDump);
        library.items.loaded = true;
        return true;
    }
    else{
        return false;
    }
};

//save items we currently have stored in the library into the cache
Zotero.Library.prototype.saveCachedItems = function(){
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    Zotero.cache.save(cacheConfig, library.items.dump());
    return;
};

//load collections we previously stored in the cache back into this library instance
Zotero.Library.prototype.loadCachedCollections = function(){
    Z.debug("Zotero.Library.loadCachedCollections", 3);
    //test to see if we have collections in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    var collectionsDump = Zotero.cache.load(cacheConfig);
    if(collectionsDump !== null){
        Z.debug("Collections dump present in cache - loading collections", 4);
        library.collections.loadDump(collectionsDump);
        library.collections.loaded = true;
        return true;
    }
    else{
        return false;
    }
};

//save collections we currently have stored in the library into the cache
Zotero.Library.prototype.saveCachedCollections = function(){
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    Zotero.cache.save(cacheConfig, library.collections.dump());
    return;
};

Zotero.Library.prototype.loadCachedTags = function(){
    //test to see if we have tagss in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:this.libraryType, libraryID:this.libraryID, target:'alltags'};
    var tagsDump = Zotero.cache.load(cacheConfig);
    if(tagsDump !== null){
        Z.debug("Tags dump present in cache - loading", 3);
        library.tags.loadDump(tagsDump);
        library.tags.loaded = true;
        Zotero.trigger("tagsChanged", {library:library});
        return true;
    }
    else{
        return false;
    }
};

Zotero.Library.prototype.saveCachedTags = function(){
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
    Zotero.cache.save(cacheConfig, library.tags.dump());
    return;
};
