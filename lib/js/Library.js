Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
    Z.debug("Zotero.Library constructor", 3);
    Z.debug(libraryUrlIdentifier, 4);
    this.instance = "Zotero.Library";
    this._apiKey = apiKey || false;
    this.type = type;
    this.libraryType = type;
    this.libraryID = libraryID;
    this.libraryString = Zotero.utils.libraryString(this.type, this.libraryID);
    this.libraryUrlIdentifier = libraryUrlIdentifier;
    
    this.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl + '/';
    if(this.libraryType == 'group'){
        this.libraryBaseWebsiteUrl += 'groups/';
    }
    this.libraryBaseWebsiteUrl += this.libraryUrlIdentifier + '/items';
    
    this.items = new Zotero.Items();
    this.items.owningLibrary = this;
    this.itemKeys = [];
    this.collections = new Zotero.Collections();
    this.collections.libraryUrlIdentifier = this.libraryUrlIdentifier;
    this.collections.owningLibrary = this;
    
    this.tags = new Zotero.Tags();
    
    this.cachedTags = this.getCachedTags();
    
    this.dirty = false;
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

Zotero.Library.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.sortLower = function(a, b){
    if(a.toLowerCase() == b.toLowerCase()){
        return 0;
    }
    if(a.toLowerCase() < b.toLowerCase()){
        return -1;
    }
    return 1;
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

Zotero.Library.prototype.loadCollections = function(config){
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    var deferred = new J.Deferred();
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID, 'content':'json', limit:'100'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadCollections proxied callback', 3);
        var library = this;
        var feed = new Zotero.Feed(data);
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
                    if(obj.nestCollection(collections)){
                        Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
                    }
                }
            });
            collections.assignDepths(0, collections.collectionsArray);
            
            Z.debug("resolving loadCollections deferred", 3);
            collections.dirty = false;
            collections.loaded = true;
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

Zotero.Library.prototype.fetchNext = function(feed, config){
    Z.debug('Zotero.Library.fetchNext', 3);
    if(feed.links.hasOwnProperty('next')){
        Z.debug("has next link.", 3);
        var nextLink = feed.links.next;
        var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
        var newConfig = J.extend({}, config);
        newConfig.start = nextLinkConfig.start;
        newConfig.limit = nextLinkConfig.limit;
        var requestUrl = Zotero.ajax.apiRequestUrl(newConfig) + Zotero.ajax.apiQueryString(newConfig);
        var nextPromise = Zotero.apiRequest(requestUrl, 'GET');
        return nextPromise;
    }
    else{
        return false;
    }
};

Zotero.Library.prototype.fetchCollections = function(config){
    Z.debug("Zotero.Library.fetchCollections", 3);
    var library = this;
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID, 'content':'json', limit:'100'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var d = Zotero.apiRequest(requestUrl, 'GET');
    
    //var deferred = new J.Deferred();
    
    //d.done()
    return d;
};

//make request for item keys and return jquery ajax promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    var urlconfig = J.extend(true, {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'format':'keys'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    return jqxhr;
};

Zotero.Library.prototype.loadItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    var jqxhr = this.fetchItemKeys(config);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItemKeys proxied callback', 3);
        var library = this;
        var result = data;
        
        var keys = result.split(/[\s]+/);
        library.itemKeys = keys;
    }, this);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.loadItems = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }

    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json',
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    Z.debug("newConfig");Z.debug(newConfig);
    var urlconfig = J.extend({'target':'items', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadItems proxied callback', 3);
        var library = this;
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
        itemfeed.requestConfig = newConfig;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        deferred.resolve({itemsArray:loadedItemsArray, feed:itemfeed, library:library});
    }, this);
    
    Z.debug('displayItemsUrl:' + this.items.displayItemsUrl, 4);
    Z.debug('requestUrl:' + requestUrl, 4);
    if((this.items.displayItemsUrl == requestUrl) && !(this.dirty)){
        deferred.resolve({itemsArray:this.items.displayItemsArray, feed:this.items.displayItemsFeed, library:library});
        return deferred;
    }
    else{
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
            {type: "GET",
             headers:{},
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        jqxhr.done(callback);
        jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
        Zotero.ajax.activeRequests.push(jqxhr);
    }
    
    deferred.done(function(itemsArray, feed, library){
        Z.debug("loadItemsDone about to publish");
        J.publish('loadItemsDone', [itemsArray, feed, library]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    if(!config){
        var config = {content:'json'};
    }
    
    var deferred = new J.Deferred();
    var urlconfig = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.libraryType = this.type;
        item.libraryID = this.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        this.items.itemObjects[item.itemKey] = item;
        deferred.resolve(item);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    
    deferred.done(function(item){
        J.publish('loadItemDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var itemKeyString = itemKeys.join(',');
    var deferred = new J.Deferred();
    var urlconfig = {'target':'items', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKeyString, 'format':'bib'};
    if(itemKeys.length == 1){
        urlconfig.target = 'item';
    }
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var bib = data;
        deferred.resolve(data);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItem", 3);

    var deferred = new J.Deferred();
    var urlconfig = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey, 'content':'bib'};
    if(style){
        urlconfig['style'] = style;
    }

    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        var resultOb = J(data);
        var entry = J(data).find("entry").eq(0);
        var item = new Zotero.Item();
        //item.libraryType = this.type;
        //item.libraryID = this.libraryID;
        item.parseXmlItem(entry);
        //item.owningLibrary = library;
        //this.items.itemObjects[item.itemKey] = item;
        var bibContent = item.bibContent;
        deferred.resolve(bibContent);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);}).fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    deferred.done(function(item){
        J.publish('loadItemBibDone', [item]);
    });
    
    return deferred;
};

Zotero.Library.prototype.fetchTags = function(config){
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {target:'tags',
                         order:'title',
                         sort:'asc',
                         limit: 100,
                         content: 'json'
                     };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'),
        {type: "GET",
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    return jqxhr;
};

Zotero.Library.prototype.loadTags = function(config){
    Z.debug("Zotero.Library.loadTags", 3);
    Z.debug("passed in config:", 4);
    Z.debug(config, 4);
    var library = this;
    
    var deferred = new J.Deferred();
    
    if(typeof config == 'undefined'){
        config = {};
    }
    
    if(config.showAllTags && config.collectionKey){
        delete config.collectionKey;
    }
    
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug('loadTags proxied callback', 3);
        //var library = this;
        var tagsfeed = new Zotero.Feed(data);
        tagsfeed.requestConfig = config;
        var tags = library.tags;
        var addedTags = tags.addTagsFromFeed(tagsfeed);
        
        if(tagsfeed.links.hasOwnProperty('next')){
            library.tags.hasNextLink = true;
            library.tags.nextLink = tagsfeed.links['next'];
        }
        else{
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        Z.debug("resolving loadTags deferred", 3);
        
        deferred.resolve(library.tags);
    }, this);
    
    library.tags.displayTagsArray = [];
    var jqxhr = this.fetchTags(config);
    
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred;
};

Zotero.Library.prototype.getCachedTags = function(){
    var tagsCacheParams = {libraryType:this.libraryType, libraryID:this.libraryID, target:'alltags'};
    var cachedTags = Zotero.cache.load(tagsCacheParams);
    return cachedTags;
};

Zotero.Library.prototype.loadAllTags = function(config, checkCached){
    Z.debug("Zotero.Library.loadAllTags", 3);
    if(typeof checkCached == 'undefined'){
        checkCached = false;
    }
    if(!config){
        config = {};
    }
    
    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'tags',
                         content: 'json',
                         order:'title',
                         sort:'asc',
                         limit: 100
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    
    var urlconfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    var library = this;
    var tags = library.tags;
    
    //check if already loaded tags are okay to use
    var loadedConfig = J.extend({'target':'tags', 'libraryType':this.type, 'libraryID':this.libraryID}, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl; //Zotero.ajax.apiRequestUrl(loadedConfig) + Zotero.ajax.apiQueryString(loadedConfig);
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug('loadedConfigRequestUrl: ' + loadedConfigRequestUrl, 4);
    if(tags.loaded && (loadedConfigRequestUrl == requestUrl) ){
        //tags already has the same information we're looking for
        Z.debug("tags already loaded - publishing and resolving deferred", 3);
        deferred.resolve(tags);
        return deferred;
    }
    else{
        Z.debug("tags not loaded", 3);
        //clear library before reloading all the tags
        tags.clear();
        Z.debug("in loadAllTags: tags:", 3);
        Z.debug(tags, 4);
    }
    
    var continueLoadingCallback = J.proxy(function(tags){
        Z.debug("loadAllTags continueLoadingCallback", 3);
        var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
        plainList.sort(Zotero.Library.prototype.sortLower);
        tags.plainList = plainList;
        
        Z.debug("done parsing one tags feed - checking for more.", 3);
        
        J.publish('tags_page_loaded', [tags]);
        
        if(tags.hasNextLink){
            Z.debug("still has next link.", 3);
            tags.tagsArray.sort(library.sortByTitleCompare);
            plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.sortLower);
            tags.plainList = plainList;
            
            var nextLink = tags.nextLink;
            var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
            var newConfig = J.extend({}, config);
            newConfig.start = nextLinkConfig.start;
            newConfig.limit = nextLinkConfig.limit;
            var nextDeferred = library.loadTags(newConfig);
            Zotero.ajax.activeRequests.push(nextDeferred);
            nextDeferred.done(continueLoadingCallback);
        }
        else{
            Z.debug("no next in tags link", 3);
            tags.tagsArray.sort(library.sortByTitleCompare);
            plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.sortLower);
            tags.plainList = plainList;
            Z.debug("resolving loadTags deferred", 3);
            library.tagsLoaded = true;
            library.tags.loaded = true;
            tags.loadedConfig = config;
            tags.loadedRequestUrl = requestUrl;
            
            deferred.resolve(tags);
        }
    }, this);
    
    //test to see if we have alltags in cache - TODO:expire or force-reload faster than session storage
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
    var alltagsObjects = Zotero.cache.load(cacheConfig);
    if(alltagsObjects !== null){
        library.tags.tagObjects = alltagsObjects;
        J.each(alltagsObjects, function(key, val){
            library.tags.tagsArray.push(val);
        });
        tags.tagsArray.sort(library.sortByTitleCompare);
        var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
        plainList.sort(Zotero.Library.prototype.sortLower);
        tags.plainList = plainList;
        Z.debug("resolving loadTags deferred", 3);
        library.tagsLoaded = true;
        library.tags.loaded = true;
        tags.loadedConfig = config;
        tags.loadedRequestUrl = requestUrl;
        
        deferred.resolve(tags);
    }
    else{
        var lDeferred = library.loadTags(urlconfig);
        Zotero.ajax.activeRequests.push(lDeferred);
        lDeferred.done(continueLoadingCallback);
    }
    
    deferred.done(J.proxy(function(){
        var library = this;
        var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
        Zotero.cache.save(cacheConfig, tags.tagObjects);
    }, this));
    
    return deferred;
};

Zotero.Library.prototype.parseFeedObject = function (data) {
    Z.debug("Zotero.Library.parseFeedObject", 3);
    var feed;
    if(typeof(data) == 'string'){
        feed = JSON.parse(data);
    }
    else if(typeof(data) == 'object') {
        feed = data;
    }
    else{
        return false;
    }
    
    var t = new Date();
    t.setTime(Date.parse(feed.updated));
    feed.updated = t;
    
    return feed;
};

Zotero.Library.prototype.addCollection = function(name, parent){
    var config = {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({name:name, parent:parent});
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
        {data: requestData,
         type: "POST",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    jqxhr.done(J.proxy(function(){
        this.collections.dirty = true;
    }, this));
    jqxhr.fail(Zotero.error);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.trashItem = function(itemKey){
    Z.debug("Zotero.Library.trashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 1;
    return item.writeItem();
};

Zotero.Library.prototype.untrashItem = function(itemKey){
    Z.debug("Zotero.Library.untrashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Library.trashItem", 3);
    if(!itemKey) return false;
    
    var config = {'target':'item', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    
    var etag = item.etag;
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'),
        {type: "DELETE",
         processData: false,
         headers:{"If-Match":etag},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};

Zotero.Library.prototype.addNote = function(itemKey, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var config = {'target':'children', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':itemKey};
    
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var item = this.items.getItem(itemKey);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'),
        {type: "POST",
         processData: false,
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
};
