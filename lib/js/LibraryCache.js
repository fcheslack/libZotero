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
        var latestItemVersion = 0;
        for(var i = 0; i < itemsArray.length; i++){
            var item = new Zotero.Item(itemsArray[i]);
            library.items.addItem(item);
            if(item.version > latestItemVersion){
                latestItemVersion = item.version;
            }
        }
        library.items.itemsVersion = latestItemVersion;
        
        //TODO: add itemsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    
    collectionsPromise.then(function(collectionsArray){
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        //create collectionsDump from array of collection objects
        var latestCollectionVersion = 0;
        for(var i = 0; i < collectionsArray.length; i++){
            var collection = new Zotero.Collection(collectionsArray[i]);
            library.collections.addCollection(collection);
            if(collection.version > latestCollectionVersion){
                latestCollectionVersion = collection.version;
            }
        }
        library.collections.collectionsVersion = latestCollectionVersion;
        
        //TODO: add collectionsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.collections.initSecondaryData();
        library.collections.loaded = true;
    });
    
    tagsPromise.then(function(tagsArray){
        Z.debug("loadIndexedDBCache tagsD done", 3);
        Z.debug(tagsArray);
        //create tagsDump from array of tag objects
        var latestVersion = 0;
        var tagsVersion = 0;
        for(var i = 0; i < tagsArray.length; i++){
            var tag = new Zotero.Tag(tagsArray[i]);
            library.tags.addTag(tag);
            if(tagsArray[i].version > latestVersion){
                latestVersion = tagsArray[i].version;
            }
        }
        tagsVersion = latestVersion;
        library.tags.tagsVersion = tagsVersion;

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