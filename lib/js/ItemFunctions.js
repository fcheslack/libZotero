//make request for item keys and return jquery ajax promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'items',
        'libraryType':this.libraryType,
        'libraryID':this.libraryID,
        'format':'keys'
    }, config);
    
    return library.ajaxRequest(urlconfig);
};

//get keys of all items marked for deletion
Zotero.Library.prototype.getTrashKeys = function(){
    Z.debug("Zotero.Library.getTrashKeys", 3);
    var library = this;
    var urlconfig = {
        'target': 'items',
        'libraryType': library.libraryType,
        'libraryID': library.libraryID,
        'format': 'keys',
        'collectionKey': 'trash',
    };
    
    return library.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.emptyTrash = function(){
    Z.debug("Zotero.Library.emptyTrash", 3);
    var library = this;
    return library.getTrashKeys()
    .then(function(response){
        Z.debug("got trashedItemKeys");
        var version = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Version: " + version);
        var trashedItemKeys = response.data.split("\n");
        Z.debug(trashedItemKeys);
        return library.items.deleteItems(trashedItemKeys, version);
    });
};

Zotero.Library.prototype.loadItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    return this.fetchItemKeys(config)
    .then(function(response){
        Z.debug('loadItemKeys proxied callback', 3);
        var keys = response.data.split(/[\s]+/);
        library.itemKeys = keys;
    });
};

Zotero.Library.prototype.loadItems = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }
    
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
    
    var urlconfig = J.extend({
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    Z.debug('displayItemsUrl:' + this.items.displayItemsUrl, 4);
    Z.debug('requestUrl:' + requestUrl, 4);
    if((this.items.displayItemsUrl == requestUrl) && !(this.dirty)){
        return Promise.resolve({
            itemsArray:this.items.displayItemsArray,
            feed:this.items.displayItemsFeed,
            library:library
        });
    }
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItems proxied callback', 3);
        //var library = this;
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
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
        Zotero.trigger("loadItemsDone", {library:library});
        Zotero.trigger("itemsChanged", {library:library});
        return {itemsArray:loadedItemsArray, feed:itemfeed, library:library};
    })
};

//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadItemsSimple = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         content: 'json',
                        };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItemsSimple callback', 3);
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
        //itemfeed.requestConfig = newConfig;
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
        Zotero.trigger("itemsChanged", {library:library});
        return {itemsArray:loadedItemsArray, feed:itemfeed, library:library};
    },
    function(response){
        Z.debug("loadItemsSimple Error");
    });
};

Zotero.Library.prototype.processLoadedItems = function(response){
    Z.debug('processLoadedItems', 3);
    var library = this;
    var jFeedOb = J(response.data);
    var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
    var items = library.items;
    //clear out display items
    var loadedItemsArray = items.addItemsFromFeed(itemfeed);
    for (var i = 0; i < loadedItemsArray.length; i++) {
        loadedItemsArray[i].associateWithLibrary(library);
    }
    
    //update sync state
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.items, modifiedVersion);
    
    Zotero.trigger("itemsChanged", {library:library, loadedItems:loadedItemsArray});
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    var library = this;
    if(!config){
        var config = {content:'json'};
    }
    
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
        'content':'json'
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultOb = J(response.data);
        var entry = J(response.data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.libraryType = library.libraryType;
        item.libraryID = library.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        library.items.itemObjects[item.itemKey] = item;
        Zotero.trigger("itemsChanged", {library:library});
        return(item);
    },
    function(response){
        Z.debug("Error loading Item");
    });
};

Zotero.Library.prototype.trashItem = function(itemKey){
    var library = this;
    return library.items.trashItems([library.items.getItem(itemKey)]);
};

Zotero.Library.prototype.untrashItem = function(itemKey){
    Z.debug("Zotero.Library.untrashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Library.deleteItem", 3);
    var library = this;
    return library.items.deleteItem(itemKey);
};

Zotero.Library.prototype.deleteItems = function(itemKeys){
    Z.debug("Zotero.Library.deleteItems", 3);
    var library = this;
    return library.items.deleteItems(itemKeys);
};

Zotero.Library.prototype.addNote = function(itemKey, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var library = this;
    var config = {
        'target':'children',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey
    };
    
    var requestUrl = Zotero.ajax.apiRequestString(config);
    var item = this.items.getItem(itemKey);
    
    return library.ajaxRequest(requestUrl, "POST", {processData: false});
};

Zotero.Library.prototype.fetchGlobalItems = function(config){
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    var urlconfig = J.extend({'target':'items', 'libraryType': ''}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:'json'})
    .then(function(response){
        Z.debug('globalItems callback', 3);
        return(response.data);
    });
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey){
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    
    var defaultConfig = {target:'item'};
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    var urlconfig = J.extend({
        'target':'item',
        'libraryType': '',
        'itemKey': globalKey
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:"json"})
    .then(function(response){
        Z.debug('globalItem callback', 3);
        return(response.data);
    });
};
