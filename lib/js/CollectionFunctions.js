//load a set of collections, following next links until the entire load is complete
/*
Zotero.Library.prototype.loadCollections = function(config){
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'collections',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'content':'json',
        limit:'100'
    }, config);
    
    if((library.collections.loaded) && (!library.collections.dirty)){
        Z.debug("already have correct collections loaded", 3);
        return Promise.resolve(library.collections);
    }
    
    if(library.collections.loaded && library.collections.dirty){
        library.collections.collectionsArray = [];
        library.collections.loaded = false;
    }
    
    return library.fetchCollections(urlconfig)
    .then(function(response){
        Z.debug('loadCollections proxied callback', 3);
        var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("1 Collections Last-Modified-Version: " + modifiedVersion, 3);
        Zotero.utils.updateSyncState(library.collections, modifiedVersion);
        
        var feed = new Zotero.Feed(response.data, response.jqxhr);
        feed.requestConfig = urlconfig;
        var collections = library.collections;
        var collectionsAdded = collections.addCollectionsFromFeed(feed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        
        Z.debug("done parsing collections feed.", 3);
        if(feed.links.hasOwnProperty('next')){
            Z.debug("has next link.", 3);
            var nextLink = feed.links.next;
            var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
            var newConfig = J.extend({}, config);
            newConfig.start = nextLinkConfig.start;
            newConfig.limit = nextLinkConfig.limit;
            var nextPromise = this.loadCollections(newConfig);
            nextPromise.then(function(collections){
                resolve(collections);
            });
        }
        else{
            Z.debug("no next in collections link", 3);
            collections.collectionsArray.sort(collections.sortByTitleCompare);
            //Nest collections as entries of parent collections
            J.each(collections.collectionsArray, function(index, obj) {
                if(obj.instance === "Zotero.Collection"){
                    if(obj.nestCollection(collections.collectionObjects)){
                        //Z.debug(obj.collectionKey + ":" + obj.title + " nested in parent.", 3);
                    }
                }
            });
            collections.assignDepths(0, collections.collectionsArray);
            
            Z.debug("resolving loadCollections deferred", 3);
            Zotero.utils.updateSyncedVersion(library.collections, 'collectionsVersion');
            Z.debug("New collectionsVersion: " + collections.syncState.earliestVersion, 3);
            collections.dirty = false;
            collections.loaded = true;
            //save collections to cache before resolving
            Z.debug("collections all loaded - saving to cache before resolving deferred", 3);
            Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
            //library.saveCachedCollections();
            Zotero.trigger("collectionsChanged", {library:library});
            resolve(collections);
        }
    });
};

//fetch a set of collections with a single request
Zotero.Library.prototype.fetchCollections = function(config){
    Z.debug("Zotero.Library.fetchCollections", 3);
    var library = this;
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'collections',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'content':'json',
        'limit':'100'
    }, config);
    
    return Zotero.ajaxRequest(urlconfig, 'GET');
};
*/
//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadCollectionsSimple = function(config){
    Z.debug("Zotero.Library.loadCollectionsSimple", 1);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'collections',
                         content: 'json',
                         libraryType: library.libraryType,
                         libraryID: library.libraryID
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var urlconfig = J.extend({}, defaultConfig, config);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        Z.debug('loadCollectionsSimple proxied callback', 1);
        var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
        collectionsfeed.requestConfig = urlconfig;
        //clear out display items
        var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        return collectionsAdded;
    });
};

Zotero.Library.prototype.processLoadedCollections = function(response){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
    //clear out display items
    var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    //update sync state
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.collections, modifiedVersion);
    
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

