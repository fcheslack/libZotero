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

