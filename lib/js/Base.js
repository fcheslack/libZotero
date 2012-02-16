var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    url: {},
    utils: {},
    localizations: {},
    
    config: {librarySettings: {},
             baseApiUrl: 'https://api.zotero.org',
             baseWebsiteUrl: 'http://zotero.org',
             baseFeedUrl: 'https://api.zotero.org',
             proxy: true,
             apiKey: '',
             ajax: 1,
             locale: 'en-US',
             cacheStoreType: 'localStorage',
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
        if(Zotero.config.cacheStoreType == 'localStorage' && typeof localStorage != 'undefined'){
            store = localStorage;
        }
        else if(Zotero.config.cacheStoreType == 'sessionStorage' && typeof sessionStorage != 'undefined'){
            store = sessionStorage;
        }
        else{
            store = {};
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


