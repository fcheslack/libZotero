Zotero.Items = function(jsonBody){
    this.instance = "Zotero.Items";
    //represent items as array for ordering purposes
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.itemObjects = {};
    this.objectMap = this.itemObjects;
    this.objectArray = [];
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    
    if(jsonBody){
        this.addItemsFromJson(jsonBody)
    }
};

Zotero.Items.prototype = new Zotero.Container();

Zotero.Items.prototype.getItem = function(key){
    return this.getObject(key);
};

Zotero.Items.prototype.getItems = function(keys){
    return this.getObjects(keys);
};

Zotero.Items.prototype.addItem = function(item){
    this.addObject(item);
    return this;
};

Zotero.Items.prototype.addItemsFromJson = function(jsonBody){
    Z.debug("addItemsFromJson", 3);
    var items = this;
    var parsedItemJson = jsonBody;
    var itemsAdded = [];
    J.each(parsedItemJson, function(index, itemObj) {
        var item = new Zotero.Item(itemObj);
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

//Remove item from local set if it has been marked as deleted by the server
Zotero.Items.prototype.removeLocalItem = function(key){
    return this.removeObject(key);
    /*
    var items = this;
    if(items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true){
        delete items.itemObjects[key];
        return true;
    }
    return false;
    */
};

Zotero.Items.prototype.removeLocalItems = function(keys){
    return this.removeObjects(keys);
};

Zotero.Items.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Items.deleteItem", 3);
    var items = this;
    var item;
    
    if(!itemKey) return false;
    itemKey = items.extractKey(itemKey);
    item = items.getItem(itemKey);
    
    var urlconfig = {
        'target':'item',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var requestConfig = {
        url: Zotero.ajax.apiRequestString(config),
        type: 'DELETE',
        headers:{"If-Unmodified-Since-Version":item.get('version')},
    }
    
    return Zotero.net.ajaxRequest(requestConfig);
};

Zotero.Items.prototype.deleteItems = function(deleteItems, version){
    //TODO: split into multiple requests if necessary
    Z.debug("Zotero.Items.deleteItems", 3);
    var items = this;
    var deleteKeys = [];
    var i;
    if((!version) && (items.itemsVersion !== 0)){
        version = items.itemsVersion;
    }
    
    //make sure we're working with item keys, not items
    var key;
    for(i = 0; i < deleteItems.length; i++){
        if(!deleteItems[i]) continue;
        key = items.extractKey(deleteItems[i]);
        if(key){
            deleteKeys.push(key)
        }
    }
    
    //split keys into chunks of 50 per request
    var deleteChunks = items.chunkObjectsArray(deleteKeys);
    /*
    var successCallback = function(response){
        var deleteProgress = index / deleteChunks.length;
        Zotero.trigger("deleteProgress", {'progress': deleteProgress});
        return response;
    };
    */
    var requestObjects = [];
    for(var i = 0; i < deleteChunks.length; i++){
        var deleteKeysString = deleteChunks[i].join(',');
        var urlconfig = {'target':'items',
                      'libraryType':items.owningLibrary.libraryType,
                      'libraryID':items.owningLibrary.libraryID,
                      'itemKey': deleteKeysString};
        //headers['If-Unmodified-Since-Version'] = version;
        
        var requestConfig = {
            url: urlconfig,
            type: 'DELETE',
        }
        requestObjects.push(requestConfig);
    }
    
    return Zotero.net.queueRequest(requestObjects);
};

Zotero.Items.prototype.trashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 1);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.untrashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 0);
    }
    return items.writeItems(itemsArray);
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

//take an array of items and extract children into their own items
//for writing
Zotero.Items.prototype.atomizeItems = function(itemsArray){
    //process the array of items, pulling out child notes/attachments to write
    //separately with correct parentItem set and assign generated itemKeys to
    //new items
    var writeItems = [];
    var item;
    for(var i = 0; i < itemsArray.length; i++){
        item = itemsArray[i];
        //generate an itemKey if the item does not already have one
        var itemKey = item.get('key');
        if(itemKey === "" || itemKey === null) {
            var newItemKey = Zotero.utils.getKey();
            item.set("key", newItemKey);
            item.set("version", 0);
        }
        //items that already have item key always in first pass, as are their children
        writeItems.push(item);
        if(item.hasOwnProperty('notes') && item.notes.length > 0){
            for(var j = 0; j < item.notes.length; j++){
                item.notes[j].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.notes);
        }
        if(item.hasOwnProperty('attachments') && item.attachments.length > 0){
            for(var k = 0; k < item.attachments.length; k++){
                item.attachments[k].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.attachments);
        }
    }
    return writeItems;
};

//accept an array of 'Zotero.Item's
Zotero.Items.prototype.writeItems = function(itemsArray){
    var items = this;
    var library = items.owningLibrary;
    var i;
    var writeItems = items.atomizeItems(itemsArray);
    
    var config = {
        'target':'items',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    var writeChunks = items.chunkObjectsArray(writeItems);
    var rawChunkObjects = items.rawChunks(writeChunks);
    
    //update item with server response if successful
    var writeItemsSuccessCallback = function(response){
        Z.debug("writeItem successCallback", 3);
        items.updateObjectsFromWriteResponse(this.writeChunk, response);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateItems(this.writeChunk);
        }
        
        Zotero.trigger("itemsChanged", {library:this.library});
        response.returnItems = this.writeChunk;
        return response;
    };
    
    Z.debug("items.itemsVersion: " + items.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + items.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            library: library,
        };
        
        requestData = JSON.stringify(rawChunkObjects[i]);
        requestObjects.push({
            url: requestUrl,
            type: 'POST',
            data: requestData,
            processData: false,
            success: J.proxy(writeItemsSuccessCallback, successContext),
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(responses){
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return responses;
    });
};

/*
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
    return Zotero.ajaxRequest(writeUrl, 'POST', {data:writeData})
    .then(function(response){
        if(response.jqxhr.status !== 200){
            //request atomically failed, nothing went through
        }
        else {
            //request went through and was processed
            //must check response body to know if writes failed for any reason
            var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
            if(typeof response.data !== 'object'){
                //unexpected response from server
            }
            var failedIndices = {};
            if(response.data.hasOwnProperty('success')){
                //add itemkeys to any successful creations
                J.each(response.data.success, function(key, val){
                    var index = parseInt(key, 10);
                    var objectKey = val;
                    var item = items.newUnsyncedItems[index];
                    
                    item.updateItemKey(objectKey);
                    item.version = updatedVersion;
                    item.synced = true;
                    items.addItem(item);
                });
            }
            if(response.data.hasOwnProperty('unchanged') ){
                J.each(response.data.unchanged, function(key, val){
                    
                });
            }
            if(response.data.hasOwnProperty('failed') ){
                J.each(response.data.failed, function(key, val){
                    failedIndices[key] = true;
                    Z.error("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message, 1);
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
    });
};
*/