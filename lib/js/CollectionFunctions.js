Zotero.Library.prototype.processLoadedCollections = function(response){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    
    //clear out display items
    Z.debug("adding collections to library.collections");
    var collectionsAdded = library.collections.addCollectionsFromJson(response.data);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    //update sync state
    library.collections.updateSyncState(response.lastModifiedVersion);
    
    Zotero.trigger("loadedCollectionsProcessed", {library:library, collectionsAdded:collectionsAdded});
}

//create+write a collection given a name and optional parentCollectionKey
Zotero.Library.prototype.addCollection = function(name, parentCollection){
    Z.debug("Zotero.Library.addCollection", 3);
    var library = this;
    
    var collection = new Zotero.Collection();
    collection.associateWithLibrary(library);
    collection.set('name', name);
    collection.set('parentCollection', parentCollection);
    
    return library.collections.writeCollections([collection]);
};

