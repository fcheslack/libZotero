var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    url: {},
    utils: {},
    localizations: {},
    
    config: {librarySettings: {},
             baseApiUrl: 'https://apidev.zotero.org',
             //baseApiUrl: 'https://staging.zotero.net/api',
             baseWebsiteUrl: 'http://zotero.test',
             baseFeedUrl: 'https://apidev.zotero.org',
             proxy: true,
             apiKey: '',
             ajax: 1,
             locale: 'en-US',
             },
    
    debug: function(debugstring, level){
        if(typeof console == 'undefined'){
            return;
        }
        if(typeof(level) !== "number"){
            level = 1;
        }
        if(Zotero.prefs.debug_log && (level <= Zotero.prefs.debug_level)){
            console.log(debugstring);
        }
    },
    
    feeds: {},
    
    cacheFeeds: {},
    
    prefs: {
        debug_level: 3, //lower level is higher priority
        debug_log: true,
        debug_mock: false,
    },
    
    state: {},
    
    libraries: {},
    
    validator: {
        patterns: {
            'itemKey': /^[A-Z0-9]{8,}$/,
            'collectionKey': /^[A-Z0-9]{8,}$/,
            //'tag': /^[^#]*$/,
            'libraryID': /^[0-9]+$/,
            'libraryType': /^(user|group)$/,
            'target': /^(items?|collections?|tags|children)$/,
            'targetModifier': /^(top|file|file\/view)$/,
            
            //get params
            'sort': /^(asc|desc)$/,
            'start': /^[0-9]*$/,
            'limit': /^[0-9]*$/,
            'order': /^\S*$/,
            'content': /^(json|html|csljson|bib|none)$/,
            'q': /^\S*$/,
            'fq': /^\S*$/,
            'itemType': /^\S*$/,
            'locale': /^\S*$/,
            'tag': /^\S*$/,
            'tagType': /^(0|1)$/,
            'key': /^\S*/,
            'format': /^(atom|bib|keys)$/,
            'style': /^\S*$/,
        },
        
        validate: function(arg, type){
            Z.debug("Zotero.validate");
            if(arg == ''){
                return null;
            }
            Z.debug(arg + " " + type);
            var patterns = this.patterns;
            
            if(patterns.hasOwnProperty(type)){
                return patterns[type].test(arg);
            }
            else{
                return null;
            }
        },
    },
    
    enableLogging: function(){
        Zotero.prefs.debug_log = true;
    },
    
    disableLogging: function(){
        Zotero.prefs.debug_log = false;
    },
    
    init: function(){
        var store;
        if(typeof sessionStorage == 'undefined'){
            store = {};//Zotero.storage.localStorage = {};
        }
        else{
            store = sessionStorage;
        }
        Zotero.cache = new Zotero.Cache(store);
        
        //get localized item constants if not stored in localstorage
        var locale = 'en-US';
        if(Zotero.config.locale){
            locale = Zotero.config.locale;
        }
        
        J.ajaxSettings.traditional = true;
        
    }
};

Zotero.Cache = function(store){
    this.store = store;
    var registry = this.store['_registry'];
    if(typeof registry == 'null' || typeof registry == 'undefined'){
        registry = {};
        this.store['_registry'] = JSON.stringify(registry);
    }
};

//build a consistent string from an object to use as a cache key
//put object key/value pairs into array, sort array, and concatenate
//array with '/'
Zotero.Cache.prototype.objectCacheString = function(params){
    var paramVarsArray = [];
    J.each(params, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                paramVarsArray.push(index + '/' + encodeURIComponent(v) );
            });
        }
        else{
            paramVarsArray.push(index + '/' + encodeURIComponent(value) );
        }
    });
    paramVarsArray.sort();
    Z.debug(paramVarsArray, 4);
    var objectCacheString = paramVarsArray.join('/');
    return objectCacheString;
};

//should use setItem and getItem if I extend that to the case where no Storage object is available in the browser
Zotero.Cache.prototype.save = function(params, object, cachetags){
    //cachetags for expiring entries
    if(!J.isArray(cachetags)){
        var cachetags = [];
    }
    //get registry object from storage
    var registry = JSON.parse(this.store['_registry']);
    if(!registry){
        registry = {};
    }
    var objectCacheString = this.objectCacheString(params);
    //save object in storage
    this.store[objectCacheString] = JSON.stringify(object);
    //make registry entry for object
    var registryEntry = {'id':objectCacheString, saved:Date.now(), cachetags:cachetags};
    registry[objectCacheString] = registryEntry;
    //save registry back to storage
    this.store['_registry'] = JSON.stringify(registry);
};

Zotero.Cache.prototype.load = function(params){
    Z.debug("Zotero.Cache.load", 3);
    var objectCacheString = this.objectCacheString(params);
    Z.debug(objectCacheString, 4);
    try{
        var s = this.store[objectCacheString];
        if(!s){
            Z.debug("No value found in cache store - " + objectCacheString, 3);
            return null;
        }
        else{
            return JSON.parse(s);
        }
    }
    catch(e){
        Z.debug('Error parsing retrieved cache data', 1);
        Z.debug(objectCacheString, 2);
        Z.debug(this.store[objectCacheString], 2);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(tag){
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var registry = JSON.parse(this.store['_registry']);
    var store = this.store;
    J.each(registry, function(index, value){
        if(J.inArray(tag, value.cachetags) != (-1) ){
            Z.debug('tag ' + tag + ' found for item ' + value['id'] + ' : expiring', 4);
            delete store[value['id']];
            delete registry[value['id']];
        }
    });
};

Zotero.Cache.prototype.clear = function(){
    if(typeof(this.store.clear) == 'function'){
        this.store.clear();
    }
    else{
        this.store = {};
    }
};

//make a request to the Zotero api and get back a deferred
Zotero.apiRequest = function(url, method, body, headers){
    Z.debug("Zotero.apiRequest", 3);
    if(typeof method == 'undefined'){
        var method = 'GET';
    }
    if(typeof headers == 'undefined'){
        var headers = {};
    }
    
    var settings = {type: method,
                    headers:headers,
                    cache:false,
                    error: Zotero.ajax.errorCallback
                    };
    if(typeof body != 'undefined') {
        settings['data'] = body;
    }
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(url, method), settings);
    return jqxhr;
};

Zotero.error = function(e){
    Z.debug("Zotero Error");
    Z.debug(e);
};

Zotero.saveLibrary = function(library){
    var dump = {};
    dump.libraryType = library.libraryType;
    dump.libraryID = library.libraryID;
    dump.libraryUrlIdentifier = library.libraryUrlIdentifier;
    dump.itemKeys = library.itemKeys;
    
    dump.collections = library.collections.dump();
    dump.items = library.items.dump();
    dump.tags = library.tags.dump();
    Zotero.cache.save({libraryString:library.libraryString}, dump);
};

Zotero.loadLibrary = function(params){
    Z.debug("Zotero.loadLibrary");
    Z.debug(params);
    var dump = Zotero.cache.load(params);
    if(dump == null){
        Z.debug("no library found in cache");
        return false;
    }
    
    var library = new Zotero.Library(dump.libraryType, dump.libraryID, dump.libraryUrlIdentifier);
    library.itemKeys = dump.itemKeys;
    
    library.collections.loadDump(dump.collections);
    library.items.loadDump(dump.items);
    library.tags.loadDump(dump.tags);
    
    return library;
};

var Z = Zotero;


Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};

Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback");
    Z.debug('textStatus: ' + textStatus);
    Z.debug('errorThrown: ');
    Z.debug(errorThrown);
    Z.debug(jqxhr);
};

Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    //Z.debug("Zotero.ajax.apiRequestUrl", 3);
    //Z.debug(params, 3);
    J.each(params, function(key, val){
        //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
        //if so the new validation below takes care of that instead
        if(typeof val == 'string'){
            val = val.split('#', 1);
            params[key] = val[0];
        }
        
        //validate params based on patterns in Zotero.validate
        if(Zotero.validator.validate(val, key) === false){
            throw "API argument failed validation: " + key + " cannot be " + val;
        }
    });
    
    if(!params.target) throw "No target defined for api request";
    if(!(params.libraryType == 'user' || params.libraryType == 'group')) throw "Unexpected libraryType for api request" + params.libraryType;
    if(!(params.libraryID)) throw "No libraryID defined for api request";
    
    var base = Zotero.config.baseApiUrl;
    var url;
    url = base + '/' + params.libraryType + 's/' + params.libraryID;
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            url += '/items/trash';
            return url;
        }
        else{
            url += '/collections/' + params.collectionKey;
        }
    }
    
    switch(params.target){
        case 'items':
            url += '/items';
            break;
        case 'item':
            if(params.itemKey){
                url += '/items/' + params.itemKey;
            }
            else{
                url += '/items'
            }
            break;
        case 'collections':
            url += '/collections';
            break;
        case 'collection':
            break;
        case 'tags':
            url += '/tags';
            break;
        case 'children':
            url += '/items/' + params.itemKey + '/children';
            break;
        default:
            return false;
    }
    switch(params.targetModifier){
        case 'top':
            url += '/top';
            break;
        case 'file':
            url += '/file';
            break;
        case 'viewsnapshot':
            url += '/file/view';
            break;
    }
    //Z.debug("returning apiRequestUrl: " + url, 3);
    return url;
};

Zotero.ajax.apiQueryString = function(passedParams){
    Z.debug("Zotero.ajax.apiQueryString");
    Z.debug(passedParams);
    J.each(passedParams, function(key, val){
        if(typeof val == 'string'){
            val = val.split('#', 1);
            passedParams[key] = val[0];
        }
    });
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'creatorSummary'){
        passedParams['order'] = 'creator';
    }
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'year'){
        passedParams['order'] = 'date';
    }
    if(Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'locale',
                             'tag',
                             'tagType',
                             'key'
                             ];
    //build simple api query parameters object
    var queryParams = {};
    J.each(queryParamOptions, function(i, val){
        if(passedParams.hasOwnProperty(val) && (passedParams[val] !== '')){
            queryParams[val] = passedParams[val];
        }
    });
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            var method = 'GET';
        }
        return "proxyRequest.php?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};
Zotero.Feed = function(data){
    Z.debug('Zotero.Feed', 3);
    if(typeof data == 'undefined'){
        this.title = '';
        this.id = '';
        this.totalResults = 0;
        this.apiVersion = '';
        this.links = {};
        this.lastPageStart = null;
        this.lastPage = null;
        this.currentPage = null;
        this.updated = null;
    }
    else{
        this.parseXmlFeed(data);
    }
};

Zotero.Feed.prototype.parseXmlFeed = function(data){
    var fel = J(data).find("feed");
    this.title = fel.children('title').first().text();
    this.id = fel.children('id').first().text();
    this.totalResults = fel.find('zapi\\:totalResults').first().text();
    this.apiVersion = fel.find('zapi\\:apiVersion').first().text();
    if(this.totalResults === ''){
        this.totalResults = fel.find('totalResults').first().text();
        this.apiVersion = fel.find('apiVersion').first().text();
    }
    var links = {};
    var lasthref = ''
    fel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href")
        };
        if(J(this).attr('rel') == 'last'){
            lasthref = J(this).attr('href');
        }
    });
    
    var selfhref = links['self'].href;
    this.lastPageStart = J.deparam.querystring(lasthref).start || 0;
    var limit = J.deparam.querystring(lasthref).limit || 50;
    var start = J.deparam.querystring(selfhref).start || 0;
    this.lastPage = (parseInt(this.lastPageStart) / limit) + 1;
    this.currentPage = (parseInt(start) / limit) + 1;
    
    this.links = links;
    
    this.updated = new Date();
    this.updated.setTime(Date.parse(fel.children("updated").first().text()));
    this.entries = fel.find('entry');
    return this;
};
Zotero.Library = function(type, libraryID, libraryUrlIdentifier){
    Z.debug("Zotero.Library constructor", 3);
    Z.debug(libraryUrlIdentifier, 4);
    this.instance = "Zotero.Library";
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
                                            'addedBy',
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
                                            'addedBy',
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.groupOnlyColumns = ['addedBy',
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
        if(value == '') return;
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
        var config = {};
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
        };
        
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
        return deferred.promise();
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
    
    /*
    deferred.done(function(collections){
        J.publish('loadCollectionsDone', [collections]);
    });
    */
    return deferred.promise();
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
        var config = {};
    }
    var urlconfig = J.extend(true, {'target':'collections', 'libraryType':this.type, 'libraryID':this.libraryID, 'content':'json', limit:'100'}, config);
    var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig);
    
    var d = Zotero.apiRequest(requestUrl, 'GET');
    
    //var deferred = new J.Deferred();
    
    //d.done()
    return d;
};

//make request for item keys and return promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        var config = {};
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
        var config = {};
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
    newConfig.start = parseInt(newConfig.limit) * (parseInt(newConfig.itemPage) - 1);
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
        loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        };
        
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
        return deferred.promise();
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
    /*
    deferred.done(function(itemsArray, feed, library){
        J.publish('loadItemsDone', [itemsArray, feed, library]);
    });
    */
    return deferred.promise();
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
        var item = new Zotero.Item();// Object.create(Zotero.item);
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
    
    /*
    deferred.done(function(item){
        J.publish('loadItemDone', [item]);
    });
    */
    return deferred.promise();
};

Zotero.Library.prototype.fetchTags = function(config){
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {target:'tags',
                         order:'title',
                         sort:'asc',
                         limit: 100,
                         content: 'json',
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
        var config = {};
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
    
    return deferred.promise();
};

Zotero.Library.prototype.getCachedTags = function(){
    var tagsCacheParams = {libraryType:this.libraryType, libraryID:this.libraryID, target:'alltags'};
    var cachedTags = Zotero.cache.load(tagsCacheParams);
    return cachedTags;
};

Zotero.Library.prototype.loadAllTags = function(config, checkCached){
    Z.debug("Zotero.Library.loadAllTags", 3);
    if(typeof checkCached == 'undefined'){
        var checkCached = false;
    }
    if(!config){
        var config = {};
    }
    
    var deferred = new J.Deferred();
    
    var defaultConfig = {target:'tags',
                         content: 'json',
                         order:'title',
                         sort:'asc',
                         limit: 100,
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
        return deferred.promise();
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
        /*
        J.publish('tags_page_loaded', [tags]);
        */
        if(tags.hasNextLink){
            Z.debug("still has next link.", 3);
            tags.tagsArray.sort(library.sortByTitleCompare);
            var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
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
    
    return deferred.promise();
};

Zotero.Library.prototype.parseFeedObject = function (data) {
    Z.debug("Zotero.Library.parseFeedObject", 3);
    if(typeof(data) == 'string'){
        var feed = JSON.parse(data);
    }
    else if(typeof(data) == 'object') {
        var feed = data;
    }
    else{
        return false;
    }
    
    var t = new Date();
    t.setTime(Date.parse(feed.updated))
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

Zotero.Library.prototype.addNote = function(item, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var config = {'target':'children', 'libraryType':this.type, 'libraryID':this.libraryID, 'itemKey':item.itemKey};
    
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
Zotero.Entry = function(){
    this.instance = "Zotero.Entry";
};

Zotero.Entry.prototype.dumpEntry = function(){
    var dump = {};
    var dataProperties = [
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links',
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    };
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump){
    var dataProperties = [
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links',
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    };
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel){
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    Z.debug(eel);
    this.title = eel.children("title").text();
    
    this.author = {};
    this.author["name"] = eel.children("author").children("name").text();
    this.author["uri"] = eel.children("author").children("uri").text();
    
    this.id = eel.children('id').first().text();
    
    this.published = eel.children("published").text();
    this.dateAdded = this.published;
    
    this.updated = eel.children("updated").text();
    this.dateModified = this.updated;
    
    var links = {};
    eel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href"),
            length: J(this).attr('length')
        };
    });
    this.links = links;
};

//associate Entry with a library so we can update it on the server
Zotero.Entry.prototype.associateWithLibrary = function(library){
    this.libraryUrlIdentifier = library.libraryUrlIdentifier;
    this.libraryType = library.libraryType;
    this.libraryID = library.libraryID;
    this.owningLibrary = library;
    return this;
};
Zotero.Collections = function(feed){
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    
    if(typeof feed == 'undefined'){
        return;
    }
    else{
        this.addCollectionsFromFeed(feed);
    }
};

Zotero.Collections.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Collections";
    dump.collectionsArray = [];
    for (var i = 0; i < this.collectionsArray.length; i++) {
        dump.collectionsArray.push(this.collectionsArray[i].dump());
    };
    
    dump.dirty = this.dirty;
    dump.loaded = this.loaded;
    return dump;
};

Zotero.Collections.prototype.loadDump = function(dump){
    var collections = this;
    this.dirty = dump.dirty;
    this.loaded = dump.loaded;
    
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection();
        collection.loadDump(dump.collectionsArray[i]);
        this.addCollection(collection);
    };
    
    //populate the secondary data structures
    this.collectionsArray.sort(this.sortByTitleCompare);
    //Nest collections as entries of parent collections
    J.each(this.collectionsArray, function(index, obj) {
        if(obj.instance === "Zotero.Collection"){
            if(obj.nestCollection(collections)){
                Z.debug(obj.key + ":" + obj.title + " nested in parent.", 4);
            }
        }
    });
    this.assignDepths(0, this.collectionsArray);
    
    return this;
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    this.collectionsArray.push(collection);
    this[collection.key] = collection;
    return this;
};

Zotero.Collections.prototype.addCollectionsFromFeed = function(feed){
    var collections = this;
    var collectionsAdded = [];
    feed.entries.each(function(index, entry){
        var collection = new Zotero.Collection(J(entry) );
        collections.addCollection(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                Z.debug(collection.entries);
                insertchildren(2, collection.entries);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.entries);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.loadDataObjects = function(collectionsArray){
    Z.debug("Zotero.Collections.loadDataObjects", 3);
    var library = this.owningLibrary;
    var collections = this;
    
    J.each(collectionsArray, function(index, dataObject){
        var collectionKey = dataObject['collectionKey'];
        var collection = new Zotero.Collection();
        collection.loadObject(dataObject);
        
        collection.libraryUrlIdentifier = collections.libraryUrlIdentifier;
        collection.libraryType = library.type;
        collection.libraryID = library.libraryID;
        collection.owningLibrary = library;
        library.collections[collection.collectionKey] = collection;
        library.collections.collectionsArray.push(collection);
    });
    
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
    
    return collections;
};

Zotero.Collections.prototype.getCollection = function(key){
    if(this.hasOwnProperty(key)){
        return this[key];
    }
    else{
        return false;
    }
};
Zotero.Items = function(feed){
    //represent items as array for ordering purposes
    this.displayItemsArray = [];
    this.displayItemsUrl = '';
    this.itemObjects = {};
    
    if(typeof feed != 'undefined'){
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Items";
    dump.itemsArray = [];
    J.each(this.itemObjects, function(key, val){
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump){
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item();
        item.loadDump(dump.itemsArray[i]);
        this.addItem(item);
    };
    //TODO: load secondary data structures
    
    return this;
};

Zotero.Items.prototype.getItem = function(key){
    Z.debug("Zotero.Items.getItem", 3);
    if(this.itemObjects.hasOwnProperty(key)){
        return this.itemObjects[key];
    }
    return false;
};

Zotero.Items.prototype.loadDataObjects = function(itemsArray){
    //Z.debug("Zotero.Items.loadDataObjects", 3);
    var loadedItems = [];
    var libraryItems = this;
    J.each(itemsArray, function(index, dataObject){
        var itemKey = dataObject['itemKey'];
        var item = new Zotero.Item();
        item.loadObject(dataObject);
        //Z.debug('item objected loaded');
        //Z.debug(item);
        libraryItems.itemObjects[itemKey] = item;
        //Z.debug('item added to items.itemObjects');
        loadedItems.push(item);
    });
    return loadedItems;
};

Zotero.Items.prototype.addItem = function(item){
    this.itemObjects[item.itemKey] = item;
    return this;
};

Zotero.Items.prototype.addItemsFromFeed = function(feed){
    var items = this;
    var itemsAdded = [];
    feed.entries.each(function(index, entry){
        var item = new Zotero.Item(J(entry) );
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};
Zotero.Tags = function(feed){
    //represent collections as array for ordering purposes
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
    if(typeof feed != 'undefined'){
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function(){
    var dump = {};
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    };
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump){
    this.displayTagsUrl = dump.displayTagsUrl;
    for (var i = 0; i < dump.tagsArray.length; i++) {
        var tag = new Zotero.Tag();
        tag.loadDump(dump.tagsArray[i]);
        this.addTag(tag);
    };
    
    this.updateSecondaryData();
    return this;
};

Zotero.Tags.prototype.addTag = function(tag){
    this.tagObjects[tag.title] = tag;
    this.tagsArray.push(tag);
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray){
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, element){
        plainList.push(element.title);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function(){
    Z.debug("Zotero.Tags.clear", 3);
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
};

Zotero.Tags.prototype.updateSecondaryData = function(){
    Z.debug("Zotero.Tags.updateSecondaryData", 3);
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, val){
        tags.tagsArray.push(val);
    });
    tags.tagsArray.sort(Zotero.Library.prototype.sortByTitleCompare);
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.sortLower);
    tags.plainList = plainList;
};

Zotero.Tags.prototype.addTagsFromFeed = function(feed){
    Z.debug('Zotero.Tags.addTagsFromFeed', 3);
    Z.debug(this);
    var tags = this;
    var tagsAdded = [];
    feed.entries.each(function(index, entry){
        var tag = new Zotero.Tag(J(entry));
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'collectionKey',
        'key',
        'numItems',
        'numCollections',
        'name',
        'parent',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'etag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    };
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'collectionKey',
        'key',
        'numItems',
        'numCollections',
        'name',
        'parent',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'etag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    };
    return this;
};

Zotero.Collection.prototype.loadObject = function(ob){
    this.collectionKey = ob.collectionKey;
    this.dateAdded = ob.dateAdded;
    this.dateModified = ob.dateUpdated;
    this.key = this.collectionKey;
    this['links'] = ob['links'];
    this['title'] = ob['title'];
    this['name'] = ob['title'];
    this.parentCollectionKey = ob.parentCollectionKey;
    this.parent = ob.parentCollectionKey;
    this.childKeys = ob.childKeys;
    this.topLevel = true;
    
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    this.parseXmlEntry(cel);
    
    this.collectionKey = cel.find("zapi\\:key, key").text();
    this.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text());
    this.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text());
    this.key = this.collectionKey;
    this['name'] = cel.find("title").text();
    this.dateAdded = this.published;//cel.find("published").text();
    this.dateModified = this.updated;//cel.find("updated").text();
    var linksArray = [];
    //link parsing also done in parseXmlEntry, not sure which version is better, but this necessary for collection nesting right now
    cel.find("link").each(function(index, element){
        var link = J(element);
        linksArray.push({'rel':link.attr('rel'), 'type':link.attr('type'), 'href':link.attr('href')});
    });
    
    this.parent = null;
    this.topLevel = true;
    var collection = this;
    
    this.websiteCollectionLink = Zotero.config.baseWebsiteUrl + '/' + this.libraryUrlIdentifier + '/items/collection/' + this.collectionKey;
    this.hasChildren = (this.numCollections) ? true : false;
    
    //parse the JSON content block
    var contentEl = cel.find('content'); //possibly we should test to make sure it is application/json or zotero json
    
    var j = JSON.parse(cel.find('content').first().text());
    this['name'] = j['name'];
    this['parent'] = j['parent'];
    if(this['parent']){
        this.topLevel = false;
    }
    this.etag = contentEl.attr('zapi:etag');
};

Zotero.Collection.prototype.parseJsonXmlCollection = function(cel){
    this.parseXmlCollection(cel);
    var j = JSON.parse(cel.find("content").text());
    this['name'] = j['name'];
    this.parent = j.parent;
    if(this.parent){
        this.topLevel = false;
    }
    this.etag = cel.find("content").attr('zapi:etag');
};

Zotero.Collection.prototype.nestCollection = function(collectionList) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    if(this.parent !== null){
        var parentKey = this.parent;
        if(typeof(collectionList[parentKey]) !== 'undefined'){
            Z.debug("Pushing " + this.key + "(" + this.title + ") onto entries of parent " + parentKey + "(" + collectionList[parentKey].title + ")", 4);
            var parentOb = collectionList[parentKey];
            if(typeof(parentOb.entries) === 'undefined'){
                parentOb.entries = [this];
            }
            else {
                parentOb.entries.push(this);
            }
            parentOb.hasChildren = true;
            this.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    Z.debug(itemKeys, 3);
    var config = {'target':'items', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'), 
        {data: requestData,
         type: "POST",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.addItems', [this.key, itemKeys, jqxhr]);
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var config = {'target':'item', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.collectionKey, 'itemKey':itemKey};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'), 
        {type: "DELETE",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.removeItem', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.update = function(name, parentKey){
    if(!parentKey) var parentKey = false;
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.key};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = JSON.stringify({'name':name, 'parent':parentKey})
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'PUT'), 
        {data: requestData,
         type: "PUT",
         processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.updateCollection', [this.key, itemKey, jqxhr]);
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var config = {'target':'collection', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'collectionKey':this.key};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'DELETE'), 
        {type: "DELETE",
         processData: false,
         headers:{
             'If-Match': this.etag
         },
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return jqxhr;
    //J.publish('Collection.delete', [this.key, itemKey, jqxhr]);
};
Zotero.Item = function(entryEl){
    this.instance = "Zotero.Item";
    this.apiObj = {};
    this.dataFields = {};
    if(typeof entryEl != 'undefined'){
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry();

Zotero.Item.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    };
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'itemKey',
        'itemType',
        'creatorSummary',
        'year',
        'numChildren',
        'numTags',
        'parentKey',
        'etag',
        'contentRows',
        'apiObj',
        'mimeType',
        'translatedMimeType',
        'linkMode',
        'attachmentDownloadLink'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    };
    //TODO: load secondary data structures
    
    return this;
};

Zotero.Item.prototype.loadObject = function(ob) {
    Z.debug('Zotero.Item.loadObject');
    if(typeof(ob) === 'string'){
        ob = JSON.parse(ob);
    }
    this.title = ob.title;
    this.itemKey = ob.itemKey;
    this.itemType = ob.itemType;
    this.creatorSummary = ob.creatorSummary;
    this.numChildren = ob.numChildren;
    this.numTags = ob.numTags;
    this.creators = ob.creators;
    this.createdByUserID = ob.createdByUserID;
    this.lastModifiedByUserID = ob.lastModifiedByUserID;
    this.note = ob.note;
    this.linkMode = ob.linkMode;
    this.mimeType = ob.mimeType;
    this.links = ob.links;
    this.apiObj = ob.apiObject;
    this.dateAdded = ob.dateAdded;
    this.published = this.dateAdded;
    this.dateModified = ob.dateModified;
    this.updated = this.dateModified;
};

Zotero.Item.prototype.parseXmlItem = function (iel) {
    this.parseXmlEntry(iel);
    
    //parse entry metadata
    this.itemKey = iel.find("zapi\\:key, key").text();
    this.itemType = iel.find("zapi\\:itemType, itemType").text();
    this.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    this.year = iel.find("zapi\\:year, year").text();
    this.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text());
    this.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text());
    
    if(isNaN(this.numChildren)){
        this.numChildren = 0;
    }
    
    this.parentKey = false;
    //set parent if can find up link in entry
    if(this.links['up']){
        var parentLink = this.links['up']['href'];
        var re = new RegExp("items\/([A-Z0-9]{8})");
        this.parentKey = re.exec(parentLink)[1];
    }
    
    //parse content block
    var contentEl = iel.children("content");
    if(contentEl.attr('type') == 'application/json' || contentEl.attr('zapi:type') == 'json'){
        this.parseJsonItemContent(contentEl);
    }
    else if(contentEl.attr('type') == 'xhtml'){
        this.parseXmlItemContent(contentEl);
    }
    
};

Zotero.Item.prototype.parseXmlItemContent = function (cel) {
    var contentRows = [];
    var dataFields = {};
    cel.find("div > table").children("tr").each(function(){
        contentRows.push({
            field : J(this).attr("class"),
            fieldMapped : J(this).children("th").text(),
            fieldValue : J(this).children("td").text()
        });
    });
    this.contentRows = contentRows;
    J.each(contentRows, function(index, value){
        dataFields[value.field] = value.fieldValue;
    });
    this.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function (cel) {
    Z.debug("Zotero.Item.parseJsonItemContent", 3);
    this.etag = cel.attr('zapi:etag');
    var dataFields = JSON.parse(cel.text());
    var contentRows = [];
    var item = this;
    J.each(dataFields, function(index, value){
        //Z.debug("dataField " + index + " : ");
        //Z.debug(value);
        if(index == 'tags'){
            item.tags = value;
        }
        else if(index == 'creators'){
            item.creators = value;
        }
        else{
            contentRows.push({
                field: index,
                fieldMapped: item.fieldMap[index],
                fieldValue: value
            });
            item.dataFields[index] = value;
        }
    });
    this.contentRows = contentRows;
    this.apiObj = dataFields;
    
    if(this.dataFields['itemType'] == 'attachment'){
        this.mimeType = this.dataFields['mimeType'];
        this.translatedMimeType = Zotero.utils.translateMimeType(this.mimeType);
    }
    if(this.dataFields.hasOwnProperty('linkMode')){
        this.linkMode = this.dataFields['linkMode'];
    }
    
    this.attachmentDownloadLink = Zotero.url.attachmentDownloadLink(this);
};

Zotero.Item.prototype.initEmpty = function(itemType){
    Z.debug("Zotero.Item.initEmpty - itemType:" + itemType, 3);
    this.etag = '';
    var item = this;
    var deferred = new J.Deferred();
    var d = this.getItemTemplate(itemType);
    
    var callback = J.proxy(function(template){
        Z.debug("Zotero.Item.initEmpty callback", 3);
        this.itemType = template.itemType;
        this.itemKey = '';
        var dataFields = template;
        var contentRows = [];
        J.each(dataFields, function(index, value){
            if(index == 'tags'){
                item.tags = value;
            }
            else if(index == 'creators'){
                item.creators = value;
            }
            else{
                contentRows.push({
                    field: index,
                    fieldMapped: item.fieldMap[index],
                    fieldValue: value
                });
            }
        });
        this.contentRows = contentRows;
        this.apiObj = dataFields;
        deferred.resolve(item);
    }, this);
    
    d.done(callback);
    
    return deferred.promise();
};

Zotero.Item.prototype.writeItem = function(){
    Z.debug("Zotero.Item.writeItem", 3);
    var target = 'item';
    var item = this;
    var newItem = true;
    if(this.parentItemKey){
        target = 'children';
    }
    
    if(this.itemKey){
        newItem = false;
    }
    
    var config = {'target':target, 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    if(!newItem){
        var childrenConfig = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
        var newChildrenRequestUrl = Zotero.ajax.apiRequestUrl(childrenConfig) + Zotero.ajax.apiQueryString(childrenConfig);
    }
    Z.debug(this.apiObj);
    
    //add empty creators if we don't have any so we don't get an error
    if(!this.apiObj.hasOwnProperty('creators')){
        this.apiObj.creators = [];
    }
    
    //remove any creators that have no names
    var newCreatorsArray = this.apiObj.creators.filter(function(c){
        if(c.name || c.firstName || c.lastName){
            return true;
        }
        return false;
    });
    this.apiObj.creators = newCreatorsArray;
    
    //update item with server response if successful
    var successCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem successCallback", 3);
        var entryEl = J(data).find("entry");
        this.parseXmlItem(entryEl);
    }, this);
    
    var childSuccessCallback = J.proxy(function(data, successcode, jqXhr){
        Z.debug("writeItem childSuccessCallback");
        if(item.numChildren){
            item.numChildren++;
        }
        else {
            item.numChildren = 1;
            J.publish("hasFirstChild", [item.itemKey]);
        }
    }, this);
    
    //copy apiObj and remove unwriteable fields
    var writeApiObj = J.extend({}, this.apiObj);
    delete writeApiObj['linkMode'];
    delete writeApiObj['mimeType'];
    delete writeApiObj['charset'];
    
    var requests = [];
    
    if(!newItem){
        Z.debug("have itemKey, making PUT writeItem request", 3);
        
        //take notes out of apiObj and make them separate children requests
        var notes = this.apiObj.notes;
        delete this.apiObj.notes;
        delete writeApiObj.notes;
        
        //make request to update item
        var requestData = JSON.stringify(writeApiObj);
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'PUT'), 
            {data: requestData,
             type: "PUT",
             processData: false,
             headers:{'If-Match': this.etag},
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
        
        //make requests to add new children if we have any
        if(J.isArray(notes) && notes.length){
            Z.debug("have child notes for existing item - making separate requests to create children", 3);
            var noteItemsObj = {items:notes};
            Z.debug("new child notes on existing item", 3);
            Z.debug(noteItemsObj, 3);
            var requestData = JSON.stringify(noteItemsObj);
            var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(newChildrenRequestUrl, 'POST'), 
                {data: requestData,
                 type: "POST",
                 processData: false,
                 success: childSuccessCallback,
                 cache:false,
                 error: Zotero.ajax.errorCallback
                }
            );
            requests.push(jqxhr);
        }
    }
    else{
        Z.debug("have no itemKey, making POST writeItem request", 3);
        var requestData = JSON.stringify({items:[writeApiObj]});
        var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'POST'), 
            {data: requestData,
             type: "POST",
             processData: false,
             success: successCallback,
             cache:false,
             error: Zotero.ajax.errorCallback
            }
        );
        requests.push(jqxhr);
    }
    
    J.each(requests, function(){
        Zotero.ajax.activeRequests.push(this);
    });
    
    return J.when.apply(J, requests);
//    J.publish("itemWriteRequest", [this, jqxhr]);
};

Zotero.Item.prototype.getChildren = function(library){
    Z.debug("Zotero.Item.getChildren", 3);
    Z.debug(library);
    var deferred = J.Deferred();
    //short circuit if has item has no children
    if(!(this.numChildren) || (this.parentKey != false)){
        deferred.resolve([]);
        return deferred;
    }
    
    var config = {'target':'children', 'libraryType':this.libraryType, 'libraryID':this.libraryID, 'itemKey':this.itemKey, 'content':'json'};
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var callback = J.proxy(function(data, textStatus, jqxhr){
        Z.debug('getChildren proxied callback');
        Z.debug(library);
        var itemfeed = new Zotero.Feed(data);
        var items = library.items;
        var childItems = items.addItemsFromFeed(feed);
        for (var i = childItems.length - 1; i >= 0; i--) {
            childItems[i].associateWithLibrary(library);
        };
        
        deferred.resolve(childItems);
    }, this);
    
    var jqxhr = J.ajax(Zotero.ajax.proxyWrapper(requestUrl, 'GET'), 
        {type: "GET",
         processData: false,
         headers:{},
         cache:false,
         error: Zotero.ajax.errorCallback
        }
    );
    jqxhr.done(callback);
    jqxhr.fail(function(){deferred.reject.apply(null, arguments);});//.fail(Zotero.ui.ajaxErrorMessage);
    
    Zotero.ajax.activeRequests.push(jqxhr);
    
    return deferred.promise();
//    J.publish('getItemChildren', [this, jqxhr]);
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    
};

Zotero.Item.prototype.getItemTypes = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if(!locale){
        var locale = 'en-US';
    }
    var itemTypes = Zotero.cache.load({locale:locale, target:'itemTypes'});
    if(itemTypes){
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = itemTypes;//JSON.parse(Zotero.storage.localStorage['itemTypes']);
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var url = Zotero.config.baseApiUrl + '/itemTypes' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(url, 'GET'), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 3);
                Z.debug(data, 3);
                Zotero.Item.prototype.itemTypes = data;
                Zotero.cache.save({locale:locale, target:'itemTypes'}, Zotero.Item.prototype.itemTypes);
            }
    );
};

Zotero.Item.prototype.getItemFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemFields");
    if(!locale){
        var locale = 'en-US';
    }
    
    var itemFields = Zotero.cache.load({locale:locale, target:'itemFields'});
    if(itemFields){
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = itemFields;//JSON.parse(Zotero.storage.localStorage['itemFields']);
        J.each(Zotero.Item.prototype.itemFields, function(ind, val){
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var requestUrl = Zotero.config.baseApiUrl + '/itemFields' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response");
                Zotero.Item.prototype.itemFields = data;
                Zotero.cache.save({locale:locale, target:'itemFields'}, data);
                //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
                J.each(Zotero.Item.prototype.itemFields, function(ind, val){
                    Zotero.localizations.fieldMap[val.field] = val.localized;
                });
            }
    );
};

Zotero.Item.prototype.getItemTemplate = function (itemType) {
    Z.debug("Zotero.Item.prototype.getItemTemplate");
    var deferred = new J.Deferred();
    
    if(typeof itemType == 'undefined') itemType = 'document';
    var query = Zotero.ajax.apiQueryString({itemType:itemType});
    var requestUrl = Zotero.config.baseApiUrl + '/items/new' + query;
    
    var cacheConfig = {itemType:itemType, target:'itemTemplate'};
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if(itemTemplate){
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;// JSON.parse(Zotero.storage.localStorage[url]);
        deferred.resolve(template);
        return deferred.promise();
    }
    
    //callback always executed in this context
    var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
        Z.debug("got itemTemplate response", 3);
        Z.debug(data);
        Zotero.cache.save(cacheConfig, data);
        //Zotero.storage.localStorage[url] = JSON.stringify(data);
        deferred.resolve(data);
    }, this);
    
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            callback
    );
    
    return deferred.promise();
};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        var itemType = 'document';
    }
    
    var deferred = new J.Deferred();
    
    //parse stored creatorTypes object if it exists
    //creatorTypes maps itemType to the possible creatorTypes
    var creatorTypes = Zotero.cache.load({target:'creatorTypes'});
    if(creatorTypes){
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = creatorTypes;//JSON.parse(Zotero.storage.localStorage['creatorTypes']);
    }
    
    if(Zotero.Item.prototype.creatorTypes[itemType]){
        Z.debug("creatorTypes of requested itemType available in localStorage");
        Z.debug(Zotero.Item.prototype.creatorTypes);
        deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes");
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        var callback = J.proxy(function(data, textStatus, XMLHttpRequest){
                    Z.debug("got creatorTypes response");
                    Zotero.Item.prototype.creatorTypes[itemType] = data;
                    //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Zotero.Item.prototype.creatorTypes);
                    Zotero.cache.save({target:'creatorTypes'}, Zotero.Item.prototype.creatorTypes);
                    deferred.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
                }, this);
        
        J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
                {},
                callback
        );
    }
    return deferred.promise();
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields");
    var creatorFields = Zotero.cache.load({target:'creatorFields'});
    if(creatorFields){
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;// JSON.parse(Zotero.storage.localStorage['creatorFields']);
        return;
    }
    
    //if(typeof itemType == 'undefined') itemType = 'document';
    var requestUrl = Zotero.config.baseApiUrl + '/creatorFields';
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl), 
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response");
                Zotero.Item.prototype.creatorFields = data;
                //Zotero.storage.localStorage['creatorFields'] = JSON.stringify(data);
                Zotero.cache.save({target:'creatorFields'}, data);
            }
    );
};

Zotero.Item.prototype.fieldMap = {
    "itemType"            : "Type",
    "title"               : "Title",
    "dateAdded"           : "Date Added",
    "dateModified"        : "Date Modified",
    "source"              : "Source",
    "notes"               : "Notes",
    "tags"                : "Tags",
    "attachments"         : "Attachments",
    "related"             : "Related",
    "url"                 : "URL",
    "rights"              : "Rights",
    "series"              : "Series",
    "volume"              : "Volume",
    "issue"               : "Issue",
    "edition"             : "Edition",
    "place"               : "Place",
    "publisher"           : "Publisher",
    "pages"               : "Pages",
    "ISBN"                : "ISBN",
    "publicationTitle"    : "Publication",
    "ISSN"                : "ISSN",
    "date"                : "Date",
    "year"                : "Year",
    "section"             : "Section",
    "callNumber"          : "Call Number",
    "archive"             : "Archive",
    "archiveLocation"     : "Loc. in Archive",
    "libraryCatalog"      : "Library Catalog",
    "distributor"         : "Distributor",
    "extra"               : "Extra",
    "journalAbbreviation" : "Journal Abbr",
    "DOI"                 : "DOI",
    "accessDate"          : "Accessed",
    "seriesTitle"         : "Series Title",
    "seriesText"          : "Series Text",
    "seriesNumber"        : "Series Number",
    "institution"         : "Institution",
    "reportType"          : "Report Type",
    "code"                : "Code",
    "session"             : "Session",
    "legislativeBody"     : "Legislative Body",
    "history"             : "History",
    "reporter"            : "Reporter",
    "court"               : "Court",
    "numberOfVolumes"     : "# of Volumes",
    "committee"           : "Committee",
    "assignee"            : "Assignee",
    "patentNumber"        : "Patent Number",
    "priorityNumbers"     : "Priority Numbers",
    "issueDate"           : "Issue Date",
    "references"          : "References",
    "legalStatus"         : "Legal Status",
    "codeNumber"          : "Code Number",
    "artworkMedium"       : "Medium",
    "number"              : "Number",
    "artworkSize"         : "Artwork Size",
    "repository"          : "Repository",
    "videoRecordingType"  : "Recording Type",
    "interviewMedium"     : "Medium",
    "letterType"          : "Type",
    "manuscriptType"      : "Type",
    "mapType"             : "Type",
    "scale"               : "Scale",
    "thesisType"          : "Type",
    "websiteType"         : "Website Type",
    "audioRecordingType"  : "Recording Type",
    "label"               : "Label",
    "presentationType"    : "Type",
    "meetingName"         : "Meeting Name",
    "studio"              : "Studio",
    "runningTime"         : "Running Time",
    "network"             : "Network",
    "postType"            : "Post Type",
    "audioFileType"       : "File Type",
    "version"             : "Version",
    "system"              : "System",
    "company"             : "Company",
    "conferenceName"      : "Conference Name",
    "encyclopediaTitle"   : "Encyclopedia Title",
    "dictionaryTitle"     : "Dictionary Title",
    "language"            : "Language",
    "programmingLanguage" : "Language",
    "university"          : "University",
    "abstractNote"        : "Abstract",
    "websiteTitle"        : "Website Title",
    "reportNumber"        : "Report Number",
    "billNumber"          : "Bill Number",
    "codeVolume"          : "Code Volume",
    "codePages"           : "Code Pages",
    "dateDecided"         : "Date Decided",
    "reporterVolume"      : "Reporter Volume",
    "firstPage"           : "First Page",
    "documentNumber"      : "Document Number",
    "dateEnacted"         : "Date Enacted",
    "publicLawNumber"     : "Public Law Number",
    "country"             : "Country",
    "applicationNumber"   : "Application Number",
    "forumTitle"          : "Forum/Listserv Title",
    "episodeNumber"       : "Episode Number",
    "blogTitle"           : "Blog Title",
    "caseName"            : "Case Name",
    "nameOfAct"           : "Name of Act",
    "subject"             : "Subject",
    "proceedingsTitle"    : "Proceedings Title",
    "bookTitle"           : "Book Title",
    "shortTitle"          : "Short Title",
    "docketNumber"        : "Docket Number",
    "numPages"            : "# of Pages",
    "note"                : "Note",
    "numChildren"         : "# of Children",
    "addedBy"             : "Added By",
    "creator"             : "Creator"
};

Zotero.localizations.fieldMap = Zotero.Item.prototype.fieldMap;

Zotero.Item.prototype.typeMap = {
    "note"                : "Note",
    "attachment"          : "Attachment",
    "book"                : "Book",
    "bookSection"         : "Book Section",
    "journalArticle"      : "Journal Article",
    "magazineArticle"     : "Magazine Article",
    "newspaperArticle"    : "Newspaper Article",
    "thesis"              : "Thesis",
    "letter"              : "Letter",
    "manuscript"          : "Manuscript",
    "interview"           : "Interview",
    "film"                : "Film",
    "artwork"             : "Artwork",
    "webpage"             : "Web Page",
    "report"              : "Report",
    "bill"                : "Bill",
    "case"                : "Case",
    "hearing"             : "Hearing",
    "patent"              : "Patent",
    "statute"             : "Statute",
    "email"               : "E-mail",
    "map"                 : "Map",
    "blogPost"            : "Blog Post",
    "instantMessage"      : "Instant Message",
    "forumPost"           : "Forum Post",
    "audioRecording"      : "Audio Recording",
    "presentation"        : "Presentation",
    "videoRecording"      : "Video Recording",
    "tvBroadcast"         : "TV Broadcast",
    "radioBroadcast"      : "Radio Broadcast",
    "podcast"             : "Podcast",
    "computerProgram"     : "Computer Program",
    "conferencePaper"     : "Conference Paper",
    "document"            : "Document",
    "encyclopediaArticle" : "Encyclopedia Article",
    "dictionaryEntry"     : "Dictionary Entry"
};

Zotero.localizations.typeMap = Zotero.Item.prototype.typeMap;

Zotero.Item.prototype.creatorMap = {
    "author"         : "Author",
    "contributor"    : "Contributor",
    "editor"         : "Editor",
    "translator"     : "Translator",
    "seriesEditor"   : "Series Editor",
    "interviewee"    : "Interview With",
    "interviewer"    : "Interviewer",
    "director"       : "Director",
    "scriptwriter"   : "Scriptwriter",
    "producer"       : "Producer",
    "castMember"     : "Cast Member",
    "sponsor"        : "Sponsor",
    "counsel"        : "Counsel",
    "inventor"       : "Inventor",
    "attorneyAgent"  : "Attorney/Agent",
    "recipient"      : "Recipient",
    "performer"      : "Performer",
    "composer"       : "Composer",
    "wordsBy"        : "Words By",
    "cartographer"   : "Cartographer",
    "programmer"     : "Programmer",
    "reviewedAuthor" : "Reviewed Author",
    "artist"         : "Artist",
    "commenter"      : "Commenter",
    "presenter"      : "Presenter",
    "guest"          : "Guest",
    "podcaster"      : "Podcaster"
};

Zotero.localizations.creatorMap = Zotero.Item.prototype.creatorMap;

Zotero.Item.prototype.itemTypeImageSrc = {
    "note"                : "note",
    "attachment"          : "attachment-pdf",
    "attachmentPdf"       : "attachment-pdf",
    "attachmentWeblink"   : "attachment-web-link",
    "attachmentSnapshot"  : "attachment-snapshot",
    "attachmentFile"      : "attachment-file",
    "attachmentLink"      : "attachment-link",
    "book"                : "book",
    "bookSection"         : "book_open",
    "journalArticle"      : "page_white_text",
    "magazineArticle"     : "layout",
    "newspaperArticle"    : "newspaper",
    "thesis"              : "report",
    "letter"              : "email_open",
    "manuscript"          : "script",
    "interview"           : "comments",
    "film"                : "film",
    "artwork"             : "picture",
    "webpage"             : "page",
    "report"              : "report",
    "bill"                : "page_white",
    "case"                : "page_white",
    "hearing"             : "page_white",
    "patent"              : "page_white",
    "statute"             : "page_white",
    "email"               : "email",
    "map"                 : "map",
    "blogPost"            : "layout",
    "instantMessage"      : "page_white",
    "forumPost"           : "page",
    "audioRecording"      : "ipod",
    "presentation"        : "page_white",
    "videoRecording"      : "film",
    "tvBroadcast"         : "television",
    "radioBroadcast"      : "transmit",
    "podcast"             : "ipod_cast",
    "computerProgram"     : "page_white_code",
    "conferencePaper"     : "treeitem-conferencePaper",
    "document"            : "page_white",
    "encyclopediaArticle" : "page_white",
    "dictionaryEntry"     : "page_white"
};

Zotero.Item.prototype.itemTypeImageClass = function(){
    var item = this;
    if(item.itemType == 'attachment'){
        switch(item.linkMode){
            case 0:
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentFile'];
            case 1:
                if(item.translatedMimeType == 'pdf'){
                    return this.itemTypeImageSrc['attachmentPdf'];
                }
                return this.itemTypeImageSrc['attachmentSnapshot'];
            case 2:
                return this.itemTypeImageSrc['attachmentLink'];
            case 3:
                return this.itemTypeImageSrc['attachmentWeblink'];
        }
    }
    else {
        return item.itemType;
    }
};
Zotero.Tag = function (entry) {
    this.instance = "Zotero.Tag";
    if(typeof entry != 'undefined'){
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry();

Zotero.Tag.prototype.dump = function(){
    var dump = this.dumpEntry();
    var dataProperties = [
        'numItems',
        'urlencodedtag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = this[dataProperties[i]];
    };
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump){
    this.loadDumpEntry(dump);
    var dataProperties = [
        'numItems',
        'urlencodedtag'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    };
    return this;
};

Zotero.Tag.prototype.loadObject = function(ob){
    this.title = ob.title;
    this.author = ob.author;
    this.tagID = ob.tagID;
    this.published = ob.published;
    this.updated = ob.updated;
    this.links = ob.links;
    this.numItems = ob.numItems;
    this.items = ob.items;
    this.tagType = ob.tagType;
    this.modified = ob.modified;
    this.added = ob.added;
    this.key = ob.key;
    this.tag = ob.tag;
};

Zotero.Tag.prototype.parseXmlTag = function (tel) {
    Z.debug("Zotero.Tag.parseXmlTag", 3);
    Z.debug(tel);
    this.parseXmlEntry(tel);
    
    this.numItems = tel.find('zapi\\:numItems, numItems').text();
    this.urlencodedtag = encodeURIComponent(this.title);
    Z.debug("Done with Zotero.Tag.parseXmlTag");
};

Zotero.Tag.prototype.getLinkParams = function () {
    var selectedTags = Zotero.ajax.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        selectedTags = [selectedTags];
    }
    
    var deparamed = Zotero.ajax.getUrlVars();
    var tagSelected = false;
    var selectedIndex = J.inArray(this.title, selectedTags);
    if(selectedIndex != (-1) ){
        tagSelected = true;
    }
    if(deparamed.hasOwnProperty('tag')){
        if(J.isArray(deparamed.tag)){
            if(!tagSelected) deparamed.tag.push(this.title);
            else{
                deparamed.tag.splice(selectedIndex, 1)
            }
        }
        else{
            if(!tagSelected) deparamed.tag = [deparamed.tag, this.title];
            else deparamed.tag = [];
        }
    }
    else{
        deparamed.tag = this.title;
    }
    
    this.linktagsparams = deparamed;
    return deparamed;
};
Zotero.Group = function () {this.instance = "Zotero.Group";};
Zotero.Group.prototype = new Zotero.Entry();
Zotero.Group.prototype.loadObject = function(ob){
    this.title = ob.title;
    this.author = ob.author;
    this.tagID = ob.tagID;
    this.published = ob.published;
    this.updated = ob.updated;
    this.links = ob.links;
    this.numItems = ob.numItems;
    this.items = ob.items;
    this.tagType = ob.tagType;
    this.modified = ob.modified;
    this.added = ob.added;
    this.key = ob.key;
};

Zotero.Group.prototype.parseXmlGroup = function (gel) {
    this.parseXmlEntry(gel);
    
    this.numItems = gel.find('zapi\\:numItems, numItems').text();
    
    var groupEl = gel.find('zxfer\\:group, group');
    if(groupEl.length !== 0){
        this.groupID = groupEl.attr("id");
        this.ownerID = groupEl.attr("owner");
        this.groupType = groupEl.attr("type");
        this.groupName = groupEl.attr("name");
        this.libraryEnabled = groupEl.attr("libraryEnabled");
        this.libraryEditing = groupEl.attr("libraryEditing");
        this.libraryReading = groupEl.attr("libraryReading");
        this.fileEditing = groupEl.attr("fileEditing");
        this.description = groupEl.find('zxfer\\:description, description').text();
        this.memberIDs = groupEl.find('zxfer\\:members, members').text().split(" ");
        this.adminIDs = groupEl.find('zxfer\\:admins, admins').text().split(" ");
        this.itemIDs = groupEl.find('zxfer\\:items, items').text().split(" ");
        
    }
    
};
Zotero.User = function () {this.instance = "Zotero.User";};
Zotero.User.prototype = new Zotero.Entry();
Zotero.User.prototype.loadObject = function(ob){
    this.title = ob.title;
    this.author = ob.author;
    this.tagID = ob.tagID;
    this.published = ob.published;
    this.updated = ob.updated;
    this.links = ob.links;
    this.numItems = ob.numItems;
    this.items = ob.items;
    this.tagType = ob.tagType;
    this.modified = ob.modified;
    this.added = ob.added;
    this.key = ob.key;
};

Zotero.User.prototype.parseXmlUser = function (tel) {
    this.parseXmlEntry(tel);
    
    var tagEl = tel.find('content>tag');
    if(tagEl.length !== 0){
        this.tagKey = tagEl.attr('key');// find("zapi\\:itemID").text();
        this.libraryID = tagEl.attr("libraryID");
        this.tagName = tagEl.attr("name");
        this.dateAdded = tagEl.attr('dateAdded');
        this.dateModified = tagEl.attr('dateModified');
    }
    
};
Zotero.utils = {
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace( " ", "_", "g");
        
        return slug;
    },
    
    prependAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.prependAutocomplete', 3);
        Z.debug("prepend match: " + pre);
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre == ''){
            var satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        var satisfy = J.map(source, function(n){
            if(n.substr(0, plen).toLowerCase() == plower){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    matchAnyAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.matchAnyAutocomplete', 3);
        Z.debug("matchAny match: " + pre);
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre == ''){
            var satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        var satisfy = J.map(source, function(n){
            if(n.toLowerCase().indexOf(plower) != -1){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    setUserPref: function(name, value){
        Z.debug('Zotero.utils.updateUserPrefs', 3);
        var postob = {'varname': name,
                      'varvalue': value
                     };
        var jqxhr = J.get("/user/setuserpref", postob);
        
        jqxhr.done(J.proxy(function(){
            Z.debug('userpref set:' + name + " : " + value, 3);
        }), this);
        return jqxhr;
    },
    
    libraryString: function(type, libraryID){
        var lstring = '';
        if(type == 'user') lstring = 'u';
        else if(type == 'group') lstring = 'g';
        lstring += libraryID;
        return lstring;
    },
    
    //return true if retrieved more than lifetime minutes ago
    stale: function(retrievedDate, lifetime){
        var now = Date.now(); //current local time
        var elapsed = now.getTime() - retrievedDate.getTime();
        if((elapsed / 60000) > lifetime){
            return true;
        }
        return false;
    },
    
    entityify: function(str){
        var character = {
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;',
            '"' : '&quot;'
        };
        return str.replace(/[<>&"]/g, function(c) {
            return character[c];
        });
    },
    
    parseApiDate: function(datestr, date){
        //var parsems = Date.parse(datestr);
        if(!date){
            var date;
        }
        
        var re = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var matches = re.exec(datestr);
        if(matches === null){
            Z.debug("error parsing api date: " + datestr, 1);
            return null;
        }
        else{
            date = new Date(Date.UTC(matches[1], matches[2]-1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        
        return date;
    },
    
    compareObs: function(ob1, ob2, checkVars){
        var loopOn = checkVars;
        var useIndex = false;
        var differences = [];

        if(checkVars === undefined){
            loopOn = ob1;
            useIndex = true;
        }
        
        J.each(loopOn, function(index, Val){
            var compindex = Val;
            if(useIndex) compindex = index;
            
            switch(typeof(ob1[index])){
                case 'object':
                    if (Zotero.utils.compareObs(ob1[compindex], ob2[compindex]).length ) { 
                        differences.push(compindex);
                    }
                    break;
                //case 'function':
                //    if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
                default:
                    if (ob1[compindex] != ob2[compindex]) {
                        differences.push(compindex);
                    }
            }
        });
        return differences;
    },

    /**
     * Translate common mimetypes to user friendly versions
     *
     * @param string $mimeType
     * @return string
     */
    translateMimeType: function(mimeType)
    {
        switch (mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return mimeType;
        }
    }
};
Zotero.url.itemHref = function(item){
    var href = '';
    /*
    J.each(item.links, function(index, link){
        if(link.rel === "alternate"){
            if(link.href){
                href = link.href;
            }
        }
    });
    return href;
    */
    var library = item.owningLibrary;
    href += library.libraryBaseWebsiteUrl + '/itemKey/' + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    if(item.links['enclosure']){
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += ' (<a href="' + item.links['enclosure']['href'] + '?key=' + Zotero.config.apiKey + '">View Snapshot</a>)';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
            var enc = item.links['enclosure'];
            var filesize = parseInt(enc['length']);
            var filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype);
            retString += ' (<a href="' + item.links['enclosure']['href'] + '?key=' + Zotero.config.apiKey + '">';
            retString += enctype + ', ' + filesizeString + '</a>)';
            return retString;
        }
    }
    return retString;
};

Zotero.url.snapshotViewLink = function(item){
    return Zotero.ajax.apiRequestUrl({
        'target':'item',
        'targetModifier':'viewsnapshot',
        'libraryType': item.owningLibrary.libraryType,
        'libraryID': item.owningLibrary.libraryID,
        'itemKey': item.itemKey
    });
};
