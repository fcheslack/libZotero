/**
 * A user or group Zotero library. This is generally the top level object
 * through which interactions should happen. It houses containers for
 * Zotero API objects (collections, items, etc) and handles making requests
 * with particular API credentials, as well as storing data locally.
 * @param {string} type                 type of library, 'user' or 'group'
 * @param {int} libraryID            ID of the library
 * @param {string} libraryUrlIdentifier identifier used in urls, could be library id or user/group slug
 * @param {string} apiKey               key to use for API requests
 */
Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
    Z.debug("Zotero.Library constructor", 3);
    Z.debug("Library Constructor: " + type + " " + libraryID + " ", 3);
    var library = this;
    Z.debug(libraryUrlIdentifier, 4);
    library.instance = "Zotero.Library";
    library.libraryVersion = 0;
    library.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    library._apiKey = apiKey || '';
    
    if(Zotero.config.librarySettings){
        library.libraryBaseWebsiteUrl = Zotero.config.librarySettings.libraryPathString;
    }
    else{
        library.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl;
        if(type == 'group'){
            library.libraryBaseWebsiteUrl += 'groups/';
        }
        if(libraryUrlIdentifier){
            this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
        } else {
            Z.warn("no libraryUrlIdentifier specified");
        }
    }
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
        Z.warn("No type specified for library");
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
    
    //initialize indexedDB if we're supposed to use it
    if(Zotero.config.useIndexedDB === true){
        Z.debug("Library Constructor: indexedDB init", 3);
        var idbLibrary = new Zotero.Idb.Library(library.libraryString);
        idbLibrary.owningLibrary = this;
        library.idbLibrary = idbLibrary;
        idbLibrary.init()
        .then(function(){
            Z.debug("Library Constructor: idbInitD Done", 3);
            if(Zotero.config.preloadCachedLibrary === true){
                Z.debug("Library Constructor: preloading cached library", 3);
                var cacheLoadD = library.loadIndexedDBCache();
                cacheLoadD.then(function(){
                    //TODO: any stuff that needs to execute only after cache is loaded
                    //possibly fire new events to cause display to refresh after load
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + library.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);

                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    library.trigger('cachedDataLoaded');
                },
                function(err){
                    Z.error("Error loading cached library");
                    Z.error(err);
                    throw new Error("Error loading cached library");
                });
            }
            else {
                //trigger cachedDataLoaded since we are done with that step
                library.trigger('cachedDataLoaded');
            }
        },
        function(){
            Z.error("Error initialized indexedDB. Promise rejected.");
            throw new Error("Error initialized indexedDB. Promise rejected.");
        });
    }
    
    library.dirty = false;
    
    //set noop data-change callbacks
    library.tagsChanged = function(){};
    library.collectionsChanged = function(){};
    library.itemsChanged = function(){};
};
/**
 * Items columns for which sorting is supported
 * @type {Array}
 */
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
/**
 * Columns that can be displayed in an items table UI
 * @type {Array}
 */
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
/**
 * Items columns that only apply to group libraries
 * @type {Array}
 */
Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

/**
 * Sort function that converts strings to locale lower case before comparing,
 * however this is still not particularly effective at getting correct localized
 * sorting in modern browsers due to browser implementations being poor. What we
 * really want here is to strip diacritics first.
 * @param  {string} a [description]
 * @param  {string} b [description]
 * @return {int}   [description]
 */
Zotero.Library.prototype.comparer = function(){
    if(Intl){
        return new Intl.Collator().compare;
    } else {
        return function(a, b){
            if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
                return 0;
            }
            if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

//Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Zotero.Library.prototype.ajaxRequest = function(url, type, options){
    Z.debug("Library.ajaxRequest", 3);
    if(!type){
        type = 'GET';
    }
    if(!options){
        options = {};
    }
    var requestObject = {
        url: url,
        type: type,
    };
    requestObject = J.extend({}, requestObject, options);
    Z.debug(requestObject);
    return Zotero.net.queueRequest(requestObject);
};

//Take an array of objects that specify Zotero API requests and perform them
//in sequence.
//return deferred that gets resolved when all requests have gone through.
//Update versions after each request, otherwise subsequent writes won't go through.
//or do we depend on specified callbacks to update versions if necessary?
//fail on error?
//request object must specify: url, method, body, headers, success callback, fail callback(?)

/**
 * Take an array of objects that specify Zotero API requests and perform them
 * in sequence. Return a promise that gets resolved when all requests have
 * gone through.
 * @param  {[] Objects} requests Array of objects specifying requests to be made
 * @return {Promise}          Promise that resolves/rejects along with requests
 */
Zotero.Library.prototype.sequentialRequests = function(requests){
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var library = this;
    return Zotero.net.queueRequest(requests);
}

/**
 * Generate a website url based on a dictionary of variables and the configured
 * libraryBaseWebsiteUrl
 * @param  {Object} urlvars Dictionary of key/value variables
 * @return {string}         website url
 */
Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    var library = this;
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return library.libraryBaseWebsiteUrl + '/' + pathVarsString;
};


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

/**
 * Make and process API requests to update the local library items based on the
 * versions we have locally. When the promise is resolved, we should have up to
 * date items in this library's items container, as well as saved to indexedDB
 * if configured to use it.
 * @return {Promise} Promise
 */
Zotero.Library.prototype.loadUpdatedItems = function(){
    Z.debug("Zotero.Library.loadUpdatedItems", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the itemsVersion, which is likely
    //derived from the most recent version of any individual item we have.
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.items.itemsVersion;
    return Promise.resolve(library.updatedVersions("items", syncFromVersion))
    .then(function(response){
        Z.debug("itemVersions resolved", 3);
        Z.debug("items Last-Modified-Version: " + response.lastModifiedVersion, 3);
        library.items.updateSyncState(response.lastModifiedVersion);
        
        var itemVersions = response.data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val){
            var item = library.items.getItem(key);
            if((!item) || (item.apiObj.key != val)){
                itemKeys.push(key);
            }
        });
        return library.loadItemsFromKeys(itemKeys);
    }).then(function(responses){
        Z.debug("loadItemsFromKeys resolved", 3);
        library.items.updateSyncedVersion();
        
        //TODO: library needs its own state
        var displayParams = Zotero.state.getUrlVars();
        library.buildItemDisplayView(displayParams);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            var saveItemsD = library.idbLibrary.updateItems(library.items.objectArray);
        }
    });
};

Zotero.Library.prototype.loadUpdatedCollections = function(){
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the collectionsVersion, which is likely
    //derived from the most recent version of any individual collection we have.
    Z.debug('library.collections.collectionsVersion:' + library.collections.collectionsVersion);
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.collections.collectionsVersion;
    //we need modified collectionKeys regardless, so load them
    return library.updatedVersions("collections", syncFromVersion)
    .then(function(response){
        Z.debug("collectionVersions finished", 3);
        Z.debug("Collections Last-Modified-Version: " + response.lastModifiedVersion, 3);
        //start the syncState version tracking. This should be the earliest version throughout
        library.collections.updateSyncState(response.lastModifiedVersion);
        
        var collectionVersions = response.data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val){
            var c = library.collections.getCollection(key);
            if((!c) || (c.apiObj.version != val)){
                collectionKeys.push(key);
            }
        });
        if(collectionKeys.length === 0){
            Z.debug("No collectionKeys need updating. resolving", 3);
            return response;
        }
        else {
            Z.debug("fetching collections by key", 3);
            return library.loadCollectionsFromKeys(collectionKeys)
            .then(function(){
                var collections = library.collections;
                collections.initSecondaryData();
                
                Z.debug("All updated collections loaded", 3);
                library.collections.updateSyncedVersion();
                //TODO: library needs its own state
                var displayParams = Zotero.state.getUrlVars();
                //save updated collections to cache
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
                //library.saveCachedCollections();
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    return library.idbLibrary.updateCollections(collections.collectionsArray);
                }
            });
        }
    })
    .then(function(){
        Z.debug("done getting collection data. requesting deleted data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
        Z.debug("got deleted collections data: removing local copies", 3);
        Z.debug(library.deleted);
        if(library.deleted.deletedData.collections && library.deleted.deletedData.collections.length > 0 ){
            library.collections.removeLocalCollections(library.deleted.deletedData.collections);
        }
    });
};

Zotero.Library.prototype.loadUpdatedTags = function(){
    Z.debug("Zotero.Library.loadUpdatedTags", 3);
    var library = this;
    Z.debug("tagsVersion: " + library.tags.tagsVersion, 3);
    return Promise.resolve(library.loadAllTags({since:library.tags.tagsVersion}))
    .then(function(){
        Z.debug("done getting tags, request deleted tags data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
        Z.debug("got deleted tags data")
        if(library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0 ){
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        //save updated tags to IDB
        if(Zotero.config.useIndexedDB){
            Z.debug("saving updated tags to IDB", 3);
            var saveTagsD = library.idbLibrary.updateTags(library.tags.tagsArray);
        }
    });
};

Zotero.Library.prototype.getDeleted = function(version) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var library = this;
    var urlconf = {target:'deleted',
                   libraryType:library.libraryType,
                   libraryID:library.libraryID,
                   since:version
               };
    
    //if there is already a request working, create a new promise to resolve
    //when the actual request finishes
    if(library.deleted.pending){
        Z.debug("getDeleted resolving with previously pending promise");
        return Promise.resolve(library.deleted.pendingPromise);
    }
    
    //don't fetch again if version we'd be requesting is between
    //deleted.newer and delete.deleted versions, just use that one
    Z.debug("version:" + version);
    Z.debug('sinceVersion:' + library.deleted.sinceVersion);
    Z.debug('untilVersion:' + library.deleted.untilVersion);
    
    if(library.deleted.untilVersion &&
        version >= library.deleted.sinceVersion /*&&
        version < library.deleted.untilVersion*/){
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(library.deleted.deletedData);
    }
    
    library.deleted.pending = true;
    library.deleted.pendingPromise = library.ajaxRequest(urlconf)
    .then(function(response){
        Z.debug("got deleted response");
        library.deleted.deletedData = response.data;
        Z.debug("Deleted Last-Modified-Version:" + response.lastModifiedVersion, 3);
        library.deleted.untilVersion = response.lastModifiedVersion;
        library.deleted.sinceVersion = version;
    }).then(function(response){
        Z.debug("cleaning up deleted pending");
        library.deleted.pending = false;
        library.deleted.pendingPromise = false;
    });
    
    return library.deleted.pendingPromise;
};

Zotero.Library.prototype.processDeletions = function(deletions){
    var library = this;
    //process deleted collections
    library.collections.processDeletions(deletions.collections);
    //process deleted items
    library.items.processDeletions(deletions.items);
};

//Get a full bibliography from the API for web based citating
Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var library = this;
    var itemKeyString = itemKeys.join(',');
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
    
    var loadBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        return response.data;
    });
    
    return loadBibPromise;
};

//load bib for a single item from the API
Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var library = this;
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
    var itemBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        var item = new Zotero.Item(response.data);
        var bibContent = item.apiObj.bib;
        return bibContent;
    });
    
    return itemBibPromise;
};

//load library settings from Zotero API and return a promise that gets resolved with
//the Zotero.Preferences object for this library
Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var library = this;
    var urlconfig = {
        'target':'settings',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultObject;
        if(typeof response.data == 'string'){
            resultObject = JSON.parse(response.data);
        }
        else {
            resultObject = response.data;
        }
        //save the full settings object so we have it available if we need to write,
        //even if it has settings we don't use or know about
        library.preferences.setPref('settings', resultObject);
        
        //pull out the settings we know we care about so we can query them directly
        if(resultObject.tagColors){
            var tagColors = resultObject.tagColors.value;
            library.preferences.setPref('tagColors', tagColors);
            /*
            for(var i = 0; i < tagColors.length; i++){
                var t = library.tags.getTag(tagColors[i].name);
                if(t){
                    t.color = tagColors[i].color;
                }
            }
            */
        }
        
        library.trigger('settingsLoaded');
        return library.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(tags) {
    var library = this;
    var tagColorsSettings = library.preferences.getPref("tagColors");
    if(!tagColorsSettings) return [];
    
    var tagColorsMap = {};
    for(var i = 0; i < tagColorsSettings.length; i++){
        tagColorsMap[tagColorsSettings[i].name.toLowerCase()] = tagColorsSettings[i].color;
    }
    var resultTags = [];
    
    for(var i = 0; i < tags.length; i++){
        if(tagColorsMap.hasOwnProperty(tags[i]) ) {
            resultTags.push(tagColorsMap[tags[i]]);
        }
    }
    return resultTags;
},

/**
 * Duplicate existing Items from this library and save to foreignLibrary
 * with relationships indicating the ties. At time of writing, Zotero client
 * saves the relationship with either the destination group of two group
 * libraries or the personal library.
 * @param  {Zotero.Item[]} items
 * @param  {Zotero.Library} foreignLibrary
 * @return {Promise.Zotero.Item[]} - newly created items
 */
Zotero.Library.prototype.sendToLibrary = function(items, foreignLibrary){
    var foreignItems = [];
    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var transferData = item.emptyJsonItem();
        transferData.data = J.extend({}, items[i].apiObj.data);
        //clear data that shouldn't be transferred:itemKey, collections
        transferData.data.key = '';
        transferData.data.version = 0;
        transferData.data.collections = [];
        delete transferData.data.dateModified;
        delete transferData.data.dateAdded;
        
        var newForeignItem = new Zotero.Item(transferData);
        
        newForeignItem.pristine = J.extend({}, newForeignItem.apiObj);
        newForeignItem.initSecondaryData();
        
        //set relationship to tie to old item
        if(!newForeignItem.apiObj.data.relations){
            newForeignItem.apiObj.data.relations = {};
        }
        newForeignItem.apiObj.data.relations['owl:sameAs'] = Zotero.url.relationUrl(item.owningLibrary.libraryType, item.owningLibrary.libraryID, item.key);
        foreignItems.push(newForeignItem);
    }
    return foreignLibrary.items.writeItems(foreignItems);
};

/*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */

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

Zotero.Library.prototype.updatedVersions = function(target, version){
    Z.debug("Library.updatedVersions", 3);
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
        since: version
    };
    return library.ajaxRequest(urlconf);
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "items");
};

//keys is an array of collectionKeys from this library that we need to download
Zotero.Library.prototype.loadCollectionsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "collections");
};

//keys is an array of searchKeys from this library that we need to download
Zotero.Library.prototype.loadSeachesFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "searches");
};

Zotero.Library.prototype.loadFromKeys = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeys", 3);
    if(!objectType) objectType = 'items';
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var requestObjects = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        switch (objectType) {
            case "items":
                requestObjects.push({
                    url: {
                        'target':'items',
                        'targetModifier':null,
                        'itemKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedItems, library),
                });
                break;
            case "collections":
                requestObjects.push({
                    url: {
                        'target':'collections',
                        'targetModifier':null,
                        'collectionKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedCollections, library),
                });
                break;
            case "searches":
                requestObjects.push({
                    url: {
                        'target':'searches',
                        'targetModifier':null,
                        'searchKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    //success: J.proxy(library.processLoadedSearches, library)
                });
                break;
        }
    });
    
    var promises = [];
    for(var i = 0; i < requestObjects.length; i++){
        promises.push(Zotero.net.queueRequest(requestObjects[i]));
    }
    return Promise.all(promises);
    /*
    return Zotero.net.queueRequest(requestObjects);
    */
};

//publishes: displayedItemsUpdated
//assume we have up to date information about items in indexeddb.
//build a list of indexedDB filter requests to then intersect to get final result
Zotero.Library.prototype.buildItemDisplayView = function(params) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params, 4);
    //start with list of all items if we don't have collectionKey
    //otherwise get the list of items in that collection
    var library = this;
    //short-circuit if we don't have an initialized IDB yet
    if(!library.idbLibrary.db){
        return Promise.resolve([]);
    }
    
    var itemKeys;
    var filterPromises = [];
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            filterPromises.push(library.idbLibrary.filterItems('deleted', 1));
        }
        else{
            filterPromises.push(library.idbLibrary.filterItems('collectionKeys', params.collectionKey));
        }
    }
    else {
        filterPromises.push(library.idbLibrary.getOrderedItemKeys('title'));
    }
    
    //filter by selected tags
    var selectedTags = params.tag || [];
    if(typeof selectedTags == 'string') selectedTags = [selectedTags];
    for(var i = 0; i < selectedTags.length; i++){
        Z.debug('adding selected tag filter', 3)
        filterPromises.push(library.idbLibrary.filterItems('itemTagStrings', selectedTags[i]));
    }
    
    //TODO: filter by search term. 
    //(need full text array or to decide what we're actually searching on to implement this locally)
    
    //when all the filters have been applied, combine and sort
    return Promise.all(filterPromises)
    .then(function(results){
        for(var i = 0; i < results.length; i++){
            Z.debug("result from filterPromise: " + results[i].length, 3);
            Z.debug(results[i], 3);
        }
        var finalItemKeys = library.idbLibrary.intersectAll(results);
        itemsArray = library.items.getItems(finalItemKeys);
        
        Z.debug("All filters applied - Down to " + itemsArray.length + ' items displayed', 3);
        
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        var displayItemsArray = [];
        for(var i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].apiObj.data.parentItem){
                continue;
            }
            
            if(params.collectionKey != 'trash' && itemsArray[i].apiObj.deleted){
                continue;
            }
            
            displayItemsArray.push(itemsArray[i]);
        }
        
        //sort displayedItemsArray by given or configured column
        var orderCol = params['order'] || 'title';
        var sort = params['sort'] || 'asc';
        Z.debug("Sorting by " + orderCol + " - " + sort, 3);
        
        var comparer = Zotero.Library.prototype.comparer();
        
        displayItemsArray.sort(function(a, b){
            var aval = a.get(orderCol);
            var bval = b.get(orderCol);
            
            return comparer(aval, bval);
        });
        
        if(sort == 'desc'){
            Z.debug("sort is desc - reversing array", 4);
            displayItemsArray.reverse();
        }
        
        //publish event signalling we're done
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        library.trigger("displayedItemsUpdated");
        return displayItemsArray;
    });
};

Zotero.Library.prototype.trigger = function(eventType, data){
    var library = this;
    Zotero.trigger(eventType, data, library.libraryString);
}

Zotero.Library.prototype.listen = function(events, handler, data){
    var library = this;
    var filter = library.libraryString;
    Zotero.listen(events, handler, data, filter);
}
