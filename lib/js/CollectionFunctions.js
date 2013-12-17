//load a set of collections, following next links until the entire load is complete
Zotero.Library.prototype.loadCollections = function(config){
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    var deferred = new J.Deferred();
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
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, coljqxhr){
        Z.debug('loadCollections proxied callback', 3);
        var modifiedVersion = coljqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("1 Collections Last-Modified-Version: " + modifiedVersion, 3);
        Zotero.utils.updateSyncState(library.collections, modifiedVersion);
        
        var feed = new Zotero.Feed(data, coljqxhr);
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
            var nextDeferred = this.loadCollections(newConfig);
            nextDeferred.done(J.proxy(function(collections){
                deferred.resolve(collections);
                }, this));
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
            deferred.resolve(collections);
        }
    }, this);
    
    if((this.collections.loaded) && (!this.collections.dirty)){
        Z.debug("already have correct collections loaded", 3);
        deferred.resolve();
        return deferred;
    }
    
    if(this.collections.loaded && this.collections.dirty){
        this.collections.collectionsArray = [];
        this.collections.loaded = false;
    }
    
    var jqxhr = this.fetchCollections(urlconfig);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    //Zotero.ajax.activeRequests.push({'deferred':deferred, 'publishes':'loadCollectionsDone'});
    
    
    deferred.done(function(collections){
        J.publish('loadCollectionsDone', [collections]);
    });
    
    return deferred;
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
        limit:'100'
    }, config);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var d = Zotero.ajaxRequest(requestUrl, 'GET');
    
    return d;
};

//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadCollectionsSimple = function(config){
    Z.debug("Zotero.Library.loadCollections", 1);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }
    
    var deferred = new J.Deferred();
    var defaultConfig = {target:'collections',
                         content: 'json',
                         libraryType: library.libraryType,
                         libraryID: library.libraryID
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var urlconfig = J.extend({}, defaultConfig, config);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, xhr){
        Z.debug('loadCollectionsSimple proxied callback', 1);
        var collectionsfeed = new Zotero.Feed(data, xhr);
        collectionsfeed.requestConfig = urlconfig;
        //clear out display items
        var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        deferred.resolve(collectionsAdded);
        //Zotero.trigger("collectionsChanged", {library:library});
    }, this);
    
    var jqxhr = library.ajaxRequest(requestUrl);
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
};

Zotero.Library.prototype.processLoadedCollections = function(data, textStatus, xhr){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    var collectionsfeed = new Zotero.Feed(data, xhr);
    //clear out display items
    var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    Zotero.trigger("loadedCollectionsProcessed", {library:library, collectionsAdded:collectionsAdded});
}

//create+write a collection given a name and optional parentCollectionKey
Zotero.Library.prototype.addCollection = function(name, parentCollection){
    var library = this;
    var config = {'target':'collections', 'libraryType':library.libraryType, 'libraryID':library.libraryID};
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    var collection = new Zotero.Collection();
    collection.associateWithLibrary(library);
    collection.name = name;
    collection.parentCollection = parentCollection;
    
    var requestData = JSON.stringify(collection.writeObject());
    
    var jqxhr = library.ajaxRequest(requestUrl, "POST",
        {data: requestData,
         processData: false
        }
    );
    
    jqxhr.done(J.proxy(function(){
        this.collections.dirty = true;
        Zotero.trigger("collectionsDirty", {library:library});
    }, this));
    jqxhr.fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

