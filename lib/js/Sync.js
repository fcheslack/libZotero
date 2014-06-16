//sync pull:
//upload changed data
// get updatedVersions for collections
// get updatedVersions for searches
// get upatedVersions for items
// (sanity check versions we have for individual objects?)
// loadCollectionsFromKeys
// loadSearchesFromKeys
// loadItemsFromKeys
// process updated objects:
//      ...
// getDeletedData
// process deleted
// checkConcurrentUpdates (compare Last-Modified-Version from collections?newer request to one from /deleted request)
Zotero.Library.prototype.syncLibrary = function(full){
    var library = this;
    //TODO: upload dirty collections
    //TODO: upload dirty items
    
    //pull down updated collections
    var syncPromise = library.loadUpdatedCollections()
    .then(function(){
        return library.loadUpdatedItems();
    })
    
};
