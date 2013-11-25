Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
    Z.debug("Zotero.Library constructor", 3);
    var library = this;
    Z.debug(libraryUrlIdentifier, 4);
    library.instance = "Zotero.Library";
    library.libraryVersion = 0;
    library.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    library._apiKey = apiKey || false;
    
    library.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl + '/';
    if(library.libraryType == 'group'){
        library.libraryBaseWebsiteUrl += 'groups/';
    }
    this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
    
    //object holders within this library, whether tied to a specific library or not
    library.items = new Zotero.Items();
    library.items.owningLibrary = library;
    library.itemKeys = [];
    library.collections = new Zotero.Collections();
    library.collections.libraryUrlIdentifier = library.libraryUrlIdentifier;
    library.collections.owningLibrary = library;
    library.tags = new Zotero.Tags();
    library.searches = new Zotero.Searches();
    library.searches.owningLibrary = library;
    library.groups = new Zotero.Groups();
    library.groups.owningLibrary = library;
    library.deleted = new Zotero.Deleted();
    library.deleted.owningLibrary = library;
    
    
    if(!type){
        //return early if library not specified
        return;
    }
    //attributes tying instance to a specific Zotero library
    library.type = type;
    library.libraryType = type;
    library.libraryID = libraryID;
    library.libraryString = Zotero.utils.libraryString(library.libraryType, library.libraryID);
    library.libraryUrlIdentifier = libraryUrlIdentifier;
    
    //initialize preferences object
    library.preferences = new Zotero.Preferences(Zotero.store, library.libraryString);
    
    //object to hold user aliases for displaying real names
    library.usernames = {};
    
    //initialize indexedDB if we're supposed to use it
    if(Zotero.config.useIndexedDB === true){
        var idbLibrary = new Zotero.Idb.Library(library.libraryString);
        idbLibrary.owningLibrary = this;
        library.idbLibrary = idbLibrary;
        var idbInitD = idbLibrary.init();
        idbInitD.done(J.proxy(function(){
            if(Zotero.config.preloadCachedLibrary === true){
                var cacheLoadD = library.loadIndexedDBCache();
                cacheLoadD.done(J.proxy(function(){
                    //TODO: any stuff that needs to execute only after cache is loaded
                    //possibly fire new events to cause display to refresh after load
                    Z.debug("Library.items.itemsVersion: " + library.items.itemsVersion, 3);
                    Z.debug("Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
                    Z.debug("Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);

                    Z.debug("Triggering cachedDataLoaded");
                    Zotero.ui.eventful.trigger('cachedDataLoaded');
                    Zotero.preferences.setPref('log_level', 3);
                }, this));
            }
            else {
                //trigger cachedDataLoaded since we are done with that step
                Zotero.ui.eventful.trigger('cachedDataLoaded');
            }
        }, this));
    }
    
    if(Zotero.config.preloadCachedLibrary === true){
        Zotero.preferences.setPref('log_level', 5);
        if(Zotero.config.useIndexedDB === true){
            //noop
        }
        else {
            /*
            library.loadCachedItems();
            library.loadCachedCollections();
            library.loadCachedTags();
            Z.debug("Library.items.itemsVersion: " + library.items.itemsVersion, 3);
            Z.debug("Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
            Z.debug("Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);
            */
        }
        Zotero.preferences.setPref('log_level', 3);
    }
    
    library.dirty = false;
    
    try{
        library.filestorage = new Zotero.Filestorage();
    }
    catch(e){
        Z.debug(e);
        Z.debug("Error creating filestorage");
        library.filestorage = false;
    }
    
    //set noop data-change callbacks
    library.tagsChanged = function(){};
    library.collectionsChanged = function(){};
    library.itemsChanged = function(){};
};

Zotero.Library.prototype.sortableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            /*'numChildren',*/
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.displayableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            'numChildren',
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

//this does not handle accented characters correctly
Zotero.Library.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLocaleLowerCase() == b.title.toLocaleLowerCase()){
        return 0;
    }
    if(a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.sortLower = function(a, b){
    if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
        return 0;
    }
    if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

//Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Zotero.Library.prototype.ajaxRequest = function(url, type, options){
    var defaultOptions = {
        type: "GET",
        headers:{},
        cache:false,
        error: Zotero.ajax.errorCallback
    };
    var reqOptions = J.extend({}, defaultOptions, options);
    if(type){
        reqOptions.type = type;
    }
    
    if(Zotero.config.apiVersion){
        reqOptions.headers['Zotero-API-Version'] = Zotero.config.apiVersion;
    }
    
    var urlstring;
    if(typeof url === "object"){
        urlstring = Zotero.ajax.apiRequestString(url);
    }
    else if(typeof url === "string"){
        urlstring = url;
    }
    Z.debug("library.ajaxRequest urlstring " + urlstring);
    var reqUrl = Zotero.ajax.proxyWrapper(urlstring, type);
    return J.ajax(reqUrl, reqOptions);
};

Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return this.libraryBaseWebsiteUrl + '/' + pathVarsString;
};

/*
Zotero.Library.prototype.fetchNext = function(feed, config){
    Z.debug('Zotero.Library.fetchNext', 3);
    if(feed.links.hasOwnProperty('next')){
        Z.debug("has next link.", 3);
        var nextLink = feed.links.next;
        var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
        var newConfig = J.extend({}, config);
        newConfig.start = nextLinkConfig.start;
        newConfig.limit = nextLinkConfig.limit;
        var requestUrl = Zotero.ajax.apiRequestString(newConfig);
        var nextPromise = Zotero.ajaxRequest(requestUrl, 'GET');
        return nextPromise;
    }
    else{
        return false;
    }
};
*/



Zotero.Library.prototype.synchronize = function(){
    //get updated group metadata if applicable
    //  (this is an individual library method, so only necessary if this is
    //  a group library and we want to keep info about it)
    //sync library data
    //  get updated collections versions newer than current library version
    //  get updated searches versions newer than current library version
    //  get updated item versions newer than current library version
    //
};

Zotero.Library.prototype.loadUpdatedItems = function(){
    var library = this;
    var d = new J.Deferred();
    //we need modified itemKeys regardless, so load them
    var itemVersionsDeferred = library.updatedVersions("items", library.items.itemsVersion);
    itemVersionsDeferred.done(J.proxy(function(data, textStatus, versionsjqxhr){
        Z.debug("itemVersionsDeferred resolved", 3);
        var updatedVersion = versionsjqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("items Last-Modified-Version: " + updatedVersion, 3);
        Zotero.utils.updateSyncState(library.items, updatedVersion);
        
        var itemVersions = data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val){
            itemKeys.push(key);
        });
        var loadAllItemsDeferred = library.loadItemsFromKeysParallel(itemKeys);
        loadAllItemsDeferred.done(J.proxy(function(){
            Z.debug("loadAllItemsDeferred resolved", 3);
            Zotero.utils.updateSyncedVersion(library.items, 'itemsVersion');
            
            var displayParams = Zotero.nav.getUrlVars();
            Z.debug(displayParams);
            library.buildItemDisplayView(displayParams);
            //save updated items to the cache
            //library.saveCachedItems();
            //save updated items to IDB
            if(Zotero.config.useIndexedDB){
                var saveItemsD = library.idbLibrary.updateItems();
            }
            
            d.resolve();
        }, this ) );
    }, this ) );
};

Zotero.Library.prototype.loadUpdatedCollections = function(){
    Z.debug("Zotero.Library.loadUpdatedCollections", 1);
    var library = this;
    var d = new J.Deferred();
    //we need modified collectionKeys regardless, so load them
    var collectionVersionsDeferred = library.updatedVersions("collections", library.collections.collectionsVersion);
    collectionVersionsDeferred.done(J.proxy(function(data, textStatus, keysjqxhr){
        Z.debug("collectionVersionsDeferred finished", 1);
        var updatedVersion = keysjqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("2 Collections Last-Modified-Version: " + updatedVersion, 1);
        Zotero.utils.updateSyncState(library.collections.syncState, updatedVersion);
        
        var collectionVersions = data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val){
            collectionKeys.push(key);
        });
        if(collectionKeys.length === 0){
            Z.debug("No collectionKeys need updating. resolving");
            d.resolve();
        }
        else {
            var loadAllCollectionsDeferred = library.loadCollectionsFromKeysParallel(collectionKeys);
            loadAllCollectionsDeferred.done(J.proxy(function(data, textStatus, lacd){
                Z.debug("All updated collections loaded", 3);
                Zotero.utils.updateSyncedVersion(library.collections, 'collectionsVersion');
                
                var displayParams = Zotero.nav.getUrlVars();
                //save updated collections to cache
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 1);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 1);
                //library.saveCachedCollections();
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    var saveCollectionsD = library.idbLibrary.updateCollections();
                }
                //TODO: Display collections from here?
                d.resolve();
            }, this ) );
        }
    }, this ) );
    
    collectionVersionsDeferred.fail(J.proxy(function(){
        Z.debug("collectionVersions failed. rejecting deferred.", 1);
        d.reject();
    }, this) );
    
    return d;
};

Zotero.Library.prototype.loadUpdatedTags = function(){
    Z.debug("Zotero.Library.loadUpdatedTags", 1);
    var library = this;
    Z.debug("tagsVersion: " + library.tags.tagsVersion, 3);
    loadAllTagsJqxhr = library.loadAllTags({newer:library.tags.tagsVersion}, false);
    
    var callback = J.proxy(function(){
        if(library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0 ){
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        
        //library.saveCachedTags();
        //save updated collections to IDB
        if(Zotero.config.useIndexedDB){
            Z.debug("saving updated tags to IDB");
            var saveTagsD = library.idbLibrary.updateTags();
        }
        
    }, this);
    
    var deletedJqxhr = library.getDeleted(library.libraryVersion);
    //deletedJqxhr.done(callback);
    
    return J.when(loadAllTagsJqxhr, deletedJqxhr).then(callback);
};

Zotero.Library.prototype.getDeleted = function(version) {
    var library = this;
    var callback = J.proxy(function(data, status, jqxhr){
        library.deleted.deletedData = data;
        var responseModifiedVersion = jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Deleted Last-Modified-Version:" + responseModifiedVersion, 3);
        library.deleted.deletedVersion = responseModifiedVersion;
        library.deleted.newerVersion = version;
    }, this);
    
    var urlconf = {target:'deleted',
                   libraryType:library.libraryType,
                   libraryID:library.libraryID,
                   newer:version
               };
    jqxhr = library.ajaxRequest(urlconf, 'GET', {success: callback});
    
    return jqxhr;
};

Zotero.Library.prototype.processDeletions = function(deletions){
    var library = this;
    //process deleted collections
    J.each(deletions.collections, function(ind, val){
        var localCollection = library.collections.getCollection(val);
        if(localCollection !== false){
            //still have object locally
            if(localCollection.synced === true){
                //our collection is not modified, so delete it as the server thinks we should
                library.collections.deleteCollection(val);
            }
            else {
                //TODO: conflict resolution
            }
        }
    });
    
    //process deleted items
    J.each(deletions.items, function(ind, val){
        var localItem = library.items.getItem(val);
        if(localItem !== false){
            //still have object locally
            if(localItem.synced === true){
                //our collection is not modified, so delete it as the server thinks we should
                library.items.deleteItem(val);
            }
        }
    });
    
};

//Get a full bibliography from the API for web based citating
Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var library = this;
    var itemKeyString = itemKeys.join(',');
    var deferred = new J.Deferred();
    var urlconfig = {
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKeyString,
        'format':'bib',
        'linkwrap':'1'
    };
    if(itemKeys.length == 1){
        urlconfig.target = 'item';
    }
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var bib = data;
        deferred.resolve(data);
    }, this);
    
    var jqxhr = library.ajaxRequest(requestUrl);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

//load bib for a single item from the API
Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var library = this;
    var deferred = new J.Deferred();
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
        'content':'bib'
    };
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.parseXmlItem(entry);
        var bibContent = item.bibContent;
        deferred.resolve(bibContent);
    }, this);
    
    var jqxhr = library.ajaxRequest(requestUrl);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

//load library settings from Zotero API and return a deferred that gets resolved with
//the Zotero.Preferences object for this library
Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var library = this;
    var deferred = new J.Deferred();
    var urlconfig = {
        'target':'settings',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    };
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultObject;
        if(typeof data == 'string'){
            resultObject = JSON.parse(data);
        }
        else {
            resultObject = data;
        }
        
        library.preferences.setPrefs(resultObject);
        deferred.resolve(library.preferences);
    }, this);
    
    var jqxhr = library.ajaxRequest(requestUrl);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        Zotero.ui.eventful.trigger('settingsLoaded');
    });
    
    return deferred;
};



Zotero.Library.prototype.fetchUserNames = function(userIDs){
    Z.debug("Zotero.Library.fetchUserNames", 3);
    var library = this;
    var reqUrl = Zotero.config.baseZoteroWebsiteUrl + '/api/useraliases?userID=' + userIDs.join(',');
    var jqxhr = J.getJSON(reqUrl, J.proxy(function(data, textStatus, jqXHR){
        Z.debug("fetchNames returned");
        Z.debug(JSON.stringify(data));
        Z.debug("userNames:");
        Z.debug(this.usernames);
        J.each(data, function(userID, aliases){
            Z.debug("userID: " + userID + " alias:");
            Z.debug(aliases);
            library.usernames[userID] = aliases;
        });
    }, this) );
    
    return jqxhr;
};

/*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */

//sync pull:
//upload changed data
// get updatedVersions for collections
// get updatedVersions for searches
// get upatedVersions for items
// (sanity check versions we have for individual objects?)
// loadCollectionsFromKeysParallel
// loadSearchesFromKeysParallel
// loadItemsFromKeysParallel
// process updated objects:
//      ...
// getDeletedData
// process deleted
// checkConcurrentUpdates (compare Last-Modified-Version from collections?newer request to one from /deleted request)

Zotero.Library.prototype.pullUpdated = function(){
    Z.debug("Zotero.Library.pullUpdated", 3);
    var library = this;
    Z.debug("libraryVersion:" + library.libraryVersion, 4);
    Z.debug("collectionsVersion:" + library.collections.collectionsVersion, 4);
    //Z.debug("searchesVersion:" + library.searches.searchesVersion, 4);
    Z.debug("itemsVersion:" + library.items.itemsVersion, 4);
    
    var updatedCollectionVersionsD = library.updatedVersions('collections', library.collections.collectionsVersion);
    //var updatedSearchesVersionsD = library.updatedVersions('searches', library.searches.searchesVersion);
    var updatedItemsVersionsD = library.updatedVersions('items', library.items.itemsVersion);
    
    //pull all the collections we need to update
    updatedCollectionVersionsD.done(J.proxy(function(data, textStatus, XMLHttpRequest){
        var collectionVersions;
        if(typeof data == "string"){
            collectionVersions = JSON.parse(data);
        }
        else {
            collectionVersions = data;
        }
        
        var collectionKeys = Object.keys(collectionVersions);
        Z.debug("updatedCollectionKeys:", 4);
        Z.debug(collectionKeys, 4);
        var updatedCollectionsD = library.loadCollectionsFromKeysParallel(collectionKeys);
    }, this) );
    
    //pull all the items we need to update
    updatedItemVersionsD.done(J.proxy(function(data, textStatus, XMLHttpRequest){
        var itemVersions;
        if(typeof data == "string"){
            itemVersions = JSON.parse(data);
        }
        else {
            itemVersions = data;
        }
        
        var itemKeys = Object.keys(itemVersions);
        Z.debug("updatedItemKeys:", 4);
        Z.debug(itemKeys, 4);
        var updatedItemsD = library.loadItemsFromKeysParallel(itemKeys);
    }, this) );
    
    
};

Zotero.Library.prototype.updatedVersions = function(target, version){
    var library = this;
    if(typeof target === "undefined"){
        target = "items";
    }
    if(typeof version === "undefined" || (version === null) ){
        version = library.libraryVersion;
    }
    var urlconf = {
        target: target,
        format: 'versions',
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        newer: version
    };
    jqxhr = library.ajaxRequest(urlconf);
    return jqxhr;
};

Zotero.Library.prototype.fetchItemKeysModified = function(){
    return this.fetchItemKeys({'order': 'dateModified'});
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeysParallel = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeysParallel", 3);
    var library = this;
    var d = library.loadFromKeysParallel(keys, "items");
    d.done(function(){J.publish('loadItemsFromKeysParallelDone');});
    return d;
};

//keys is an array of collectionKeys from this library that we need to download
Zotero.Library.prototype.loadCollectionsFromKeysParallel = function(keys){
    Zotero.debug("Zotero.Library.loadCollectionsFromKeysParallel", 1);
    var library = this;
    var d = library.loadFromKeysParallel(keys, "collections");
    return d;
};

//keys is an array of searchKeys from this library that we need to download
Zotero.Library.prototype.loadSeachesFromKeysParallel = function(keys){
    Zotero.debug("Zotero.Library.loadSearchesFromKeysParallel", 3);
    var library = this;
    var d = library.loadFromKeysParallel(keys, "searches");
    return d;
};

Zotero.Library.prototype.loadFromKeysParallel = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeysParallel", 1);
    if(!objectType) objectType = 'items';
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var deferred = new J.Deferred();
    var xhrs = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        var xhr;
        switch (objectType) {
            case "items":
                xhr = library.loadItemsSimple({
                    'target':'items',
                    'targetModifier':null,
                    'itemKey':keystring,
                    'limit':50
                } );
                break;
            case "collections":
                xhr = library.loadCollectionsSimple({
                    'target':'collections',
                    'targetModifier':null,
                    'collectionKey':keystring,
                    'limit':50
                } );
                break;
            case "searches":
                xhr = library.loadSearchesSimple({
                    'target':'searches',
                    'searchKey':keystring,
                    'limit':50
                });
                break;
        }
        xhrs.push(xhr );
    });
    
    J.when.apply(this, xhrs).then(J.proxy(function(){
        Z.debug("All parallel requests returned - resolving deferred", 1);
        deferred.resolve(true);
    }, this) );
    
    return deferred;
};

//TODO: remove this function. no longer necessary since collection membership is carried with items
//download the itemkey lists for every collection
Zotero.Library.prototype.loadCollectionMembership = function(collections){
    Z.debug("Zotero.Library.loadCollectionMembership", 3);
    var library = this;
    var deferred = new J.Deferred();
    var neededCollections = [];
    for(var i = 0; i < collections.length; i++){
        if(collections.collectionObjects[i].itemKeys === false){
            neededCollections.push(collections.collectionObjects[i]);
        }
    }
    
    var loadNextCollectionMembers = function(){
        var col = neededCollections.shift();
        if(typeof col == 'undefined'){
            //we're out of collections
            deferred.resolve();
            return;
        }
        else{
            var d = col.getMemberItemKeys();
            d.done(J.proxy(function(){
                loadNextCollectionMembers();
            }, this));
        }
    };
    
    loadNextCollectionMembers();
    
    return deferred;
};

//publishes: displayedItemsUpdated
Zotero.Library.prototype.buildItemDisplayView = function(params){
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params);
    //start with list of all items if we don't have collectionKey
    //otherwise get the list of items in that collection
    var library = this;
    var itemKeys;
    if(params.collectionKey){
        var collection = library.collections.getCollection(params.collectionKey);
        if(collection === false){
            Z.error("specified collectionKey - " + params.collectionKey + " - not found in current library.");
            return false;
        }
        if(collection.itemKeys === false){
            //haven't retrieved itemKeys for that collection, do so then re-run buildItemDisplayView
            var d = collection.getMemberItemKeys();
            d.done(J.proxy(library.buildItemDisplayView, this));
            return false;
        }
        else{
            itemKeys = collection.itemKeys;
        }
    }
    else{
        itemKeys = library.itemKeys;
    }
    //add top level items to displayedItemsArray
    library.items.displayItemsArray = [];
    var item;
    J.each(itemKeys, function(ind, val){
        item = library.items.getItem(val);
        if(item && (!item.parentItemKey)) {
            library.items.displayItemsArray.push(item);
        }
    });
    Z.debug("Starting with " + library.items.displayItemsArray.length + ' items displayed');
    //filter displayedItemsArray by selected tags
    var selectedTags = params.tag || [];
    if(typeof selectedTags == 'string') selectedTags = [selectedTags];
    //Z.debug("Selected Tags:");
    //Z.debug(selectedTags);
    //TODO: make this not perform horribly on large libraries
    var tagFilteredArray = J.grep(library.items.displayItemsArray, J.proxy(function(item, index){
        var itemTags = item.apiObj.tags;
        //Z.debug(itemTags);
        var found = false;
        for(var i = 0; i < selectedTags.length; i++){
            found = false;
            for(var j = 0; j < itemTags.length; j++){
                if(itemTags[j].tag == selectedTags[i]){
                    found = true;
                }
            }
            if(found === false) return false;
        }
        return true;
    }, this));
    
    library.items.displayItemsArray = tagFilteredArray;
    Z.debug("Filtered by tags");
    Z.debug("Down to " + library.items.displayItemsArray.length + ' items displayed');
    //filter displayedItemsArray by search term
    //(need full text array or to decide what we're actually searching on to implement this locally)
    //
    //sort displayedItemsArray by given or configured column
    Z.debug("Sorting by title");
    var orderCol = params['order'] || 'title';
    var sort = params['sort'] || 'asc';
    
    library.items.displayItemsArray.sort(J.proxy(function(a, b){
        var aval = a.get(orderCol);
        var bval = b.get(orderCol);
        //if(typeof aval == 'undefined') aval = '';
        //if(typeof bval == 'undefined') bval = '';
        
        //Z.debug("comparing '" + aval + "' to '" + bval +"'");
        if(typeof aval == 'string'){
            return aval.localeCompare(bval);
        }
        else {
            return (aval - bval);
        }
    }, this));
    
    if(sort == 'desc'){
        library.items.displayItemsArray.reverse();
    }
    //
    //publish event signalling we're done
    Z.debug("triggering publishing displayedItemsUpdated", 3);
    Zotero.trigger("displayedItemsUpdated", {library:library});
};


