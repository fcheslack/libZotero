Zotero.Items = function(feed){
    //represent items as array for ordering purposes
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayItemsArray = [];
    this.displayItemsUrl = '';
    this.itemObjects = {};
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    
    if(typeof feed != 'undefined'){
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function(){
    Z.debug("Zotero.Items.dump", 3);
    var items = this;
    var dump = {};
    dump.instance = "Zotero.Items.dump";
    dump.itemsVersion = this.itemsVersion;
    dump.itemsArray = [];
    J.each(items.itemObjects, function(key, val){
        Z.debug("dumping item " + key + " : " + val.itemKey, 3);
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump){
    Z.debug("-------------------------------Zotero.Items.loadDump", 3);
    this.itemsVersion = dump.itemsVersion;
    var items = this;
    var itemKeys = [];
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item();
        item.loadDump(dump.itemsArray[i]);
        items.addItem(item);
        itemKeys.push(item.itemKey);
    }
    
    if(items.owningLibrary){
        items.owningLibrary.itemKeys = itemKeys;
    }
    
    //add child itemKeys to parent items to make getChildren work locally
    Z.debug("Adding childItemKeys to items loaded from dump");
    var parentItem;
    J.each(items.itemObjects, function(ind, item){
        if(item.parentKey){
            parentItem = items.getItem(item.parentKey);
            if(parentItem !== false){
                parentItem.childItemKeys.push(item.itemKey);
            }
        }
    });
    //TODO: load secondary data structures
    //nothing to do here yet? display items array is separate - populated with itemKey request
    
    return this;
};

Zotero.Items.prototype.getItem = function(key){
    //Z.debug("Zotero.Items.getItem", 3);
    if(this.itemObjects.hasOwnProperty(key)){
        return this.itemObjects[key];
    }
    return false;
};

Zotero.Items.prototype.getItems = function(keys){
    var items = this;
    var gotItems = [];
    for(var i = 0; i < keys.length; i++){
        gotItems.push(items.getItem(keys[i]));
    }
    return gotItems;
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
    if(this.owningLibrary){
        item.associateWithLibrary(this.owningLibrary);
    }
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

//return array of itemKeys that we don't have a copy of
Zotero.Items.prototype.keysNotInItems = function(keys){
    var notPresent = [];
    J.each(keys, function(ind, val){
        if(!this.itemObjects.hasOwnProperty(val)){
            notPresent.push(val);
        }
    });
    return notPresent;
};

Zotero.Items.prototype.remoteDeleteItem = function(key){
    var items = this;
    if(items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true){
        delete items.itemObjects[key];
        return true;
    }
    return false;
};

Zotero.Items.prototype.findItems = function(config){
    var items = this;
    var matchingItems = [];
    J.each(items.itemObjects, function(i, item){
        if(config.collectionKey && (J.inArray(config.collectionKey, item.apiObj.collections === -1) )){
            return;
        }
        matchingItems.push(items.itemObjects[i]);
    });
    return matchingItems;
};

Zotero.Items.prototype.writeNewUnsyncedItems = function(){
    var items = this;
    var library = items.owningLibrary;
    var urlConfig = {target:'items', libraryType:library.libraryType, libraryID:library.libraryID};
    var writeUrl = Zotero.ajax.apiRequestUrl(urlConfig) + Zotero.ajax.apiQueryString(urlConfig);
    var writeData = {};
    writeData.items = [];
    for(var i = 0; i < items.newUnsyncedItems.length; i++){
        writeData.items.push(items.newUnsyncedItems[i].apiObj);
    }
    
    //make request to api to write items
    var jqxhr = Zotero.ajaxRequest(writeUrl, 'POST', {data:writeData});
    //process success or failure responses for each item
    var processResponses = J.proxy(function(data, statusCode, jqxhr){
        if(jqxhr.status !== 200){
            //request atomically failed, nothing went through
        }
        else {
            //request went through and was processed
            //must check response body to know if writes failed for any reason
            var updatedVersion = jqxhr.getResponseHeader("Last-Modified-Version");
            if(typeof data !== 'object'){
                //unexpected response from server
            }
            var failedIndices = {};
            if(data.hasOwnProperty('success')){
                //add itemkeys to any successful creations
                J.each(data.success, function(key, val){
                    var index = parseInt(key, 10);
                    var objectKey = val;
                    var item = items.newUnsyncedItems[index];
                    
                    item.updateItemKey(objectKey);
                    item.itemVersion = updatedVersion;
                    item.synced = true;
                    items.addItem(item);
                });
            }
            if(data.hasOwnProperty('unchanged') ){
                J.each(data.unchanged, function(key, val){
                    
                });
            }
            if(data.hasOwnProperty('failed') ){
                J.each(data.failed, function(key, val){
                    failedIndices[key] = true;
                    Z.debug("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message);
                });
            }
            
            //remove all but failed writes from newUnsyncedItems
            var newnewUnsyncedItems = [];
            J.each(items.newUnsyncedItems, function(i, v){
                if(failedIndices.hasOwnProperty(i)){
                    newnewUnsyncedItems.push(v);
                }
            });
            items.newUnsyncedItems = newnewUnsyncedItems;
        }
    }, this);
    jqxhr.done(processResponses);
    return jqxhr;
};
