Zotero.Container = function(){
    
};

Zotero.Container.prototype.initSecondaryData = function(){
    
};

Zotero.Container.prototype.addObject = function(object){
    Zotero.debug("Zotero.Container.add", 4);
    var container = this;
    container.objectArray.push(object);
    container.objectMap[object.key] = object;
    if(container.owningLibrary){
        object.associateWithLibrary(container.owningLibrary);
    }
    
    return container;
};

Zotero.Container.prototype.fieldComparer = function(field){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[field], b.apiObj.data[field]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[field].toLowerCase() == b.apiObj.data[field].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[field].toLowerCase() < b.apiObj.data[field].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
}

Zotero.Container.prototype.getObject = function(key){
    var container = this;
    if(container.objectMap.hasOwnProperty(key)){
        return container.objectMap[key];
    }
    else{
        return false;
    }
};

Zotero.Container.prototype.getObjects = function(keys){
    var container = this;
    var objects = [];
    var object;
    for(var i = 0; i < keys.length; i++){
        object = container.getObject(keys[i]);
        if(object){
            objects.push(object);
        }
    }
    return objects;
};

Zotero.Container.prototype.removeObject = function(key){
    if(container.objectMap.hasOwnProperty(key)){
        delete container.objectmap[key];
        container.initSecondaryData();
    }
};

Zotero.Container.prototype.removeObjects = function(keys){
    var container = this;
    //delete Objects from objectMap;
    for(var i = 0; i < keys.length; i++){
        delete container.objectMap[keys[i]];
    }
    
    //rebuild array
    container.initSecondaryData();
};

Zotero.Container.prototype.writeObjects = function(objects){
    //TODO:implement
};

//generate keys for objects about to be written if they are new
Zotero.Container.prototype.assignKeys = function(objectsArray){
    var object;
    for(i = 0; i < objectsArray.length; i++){
        object = objectsArray[i];
        var key = object.get('key');
        if(!key) {
            var newObjectKey = Zotero.utils.getKey();
            object.set("key", newObjectKey);
            object.set("version", 0);
        }
    }
    return objectsArray;
};

//split an array of objects into chunks to write over multiple api requests
Zotero.Container.prototype.chunkObjectsArray = function(objectsArray){
    var chunkSize = 50;
    var writeChunks = [];
    
    for(i = 0; i < objectsArray.length; i = i + chunkSize){
        writeChunks.push(objectsArray.slice(i, i+chunkSize));
    }
    
    return writeChunks;
};

Zotero.Container.prototype.rawChunks = function(chunks){
    var rawChunkObjects = [];
    
    for(i = 0; i < chunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < chunks[i].length; j++){
            rawChunkObjects[i].push(chunks[i][j].writeApiObj());
        }
    }
    return rawChunkObjects;
};

/**
 * Update syncState property on container to keep track of updates that occur during sync process.
 * Set earliestVersion to MIN(earliestVersion, version).
 * Set latestVersion to MAX(latestVersion, version).
 * This should be called with the modifiedVersion header for each response tied to this container
 * during a sync process.
 * @param  {Zotero.Container} container
 * @param  {int} version
 * @return {null}
 */
Zotero.Container.prototype.updateSyncState = function(version) {
    var container = this;
    Z.debug("updateSyncState: " + version, 3);
    if(!container.hasOwnProperty('syncState')){
        Z.debug("no syncState property");
        throw new Error("Attempt to update sync state of object with no syncState property");
    }
    if(container.syncState.earliestVersion === null){
        container.syncState.earliestVersion = version;
    }
    if(container.syncState.latestVersion === null){
        container.syncState.latestVersion = version;
    }
    if(version < container.syncState.earliestVersion){
        container.syncState.earliestVersion = version;
    }
    if(version > container.syncState.latestVersion){
        container.syncState.latestVersion = version;
    }
    Z.debug("done updating sync state", 3);
};

Zotero.Container.prototype.updateSyncedVersion = function(versionField) {
    var container = this;
    if(container.syncState.earliestVersion !== null &&
        (container.syncState.earliestVersion == container.syncState.latestVersion) ){
        container.version = container.syncState.latestVersion;
        container.synced = true;
    }
    else if(container.syncState.earliestVersion !== null) {
        container.version = container.syncState.earliestVersion;
    }
};

Zotero.Container.prototype.processDeletions = function(deletedKeys) {
    var container = this;
    for(var i = 0; i < deletedKeys.length; i++){
        var localObject = container.get(deletedKeys[i]);
        if(localObject !== false){
            //still have object locally
            if(localObject.synced === true){
                //our object is not modified, so delete it as the server thinks we should
                container.removeObjects([deletedKeys[i]]);
            }
            else {
                //TODO: conflict resolution
            }
        }
    }
};

//update items appropriately based on response to multi-write request
//for success:
//  update objectKey if item doesn't have one yet (newly created item)
//  update itemVersion to response's Last-Modified-Version header
//  mark as synced
//for unchanged:
//  don't need to do anything? itemVersion should remain the same?
//  mark as synced if not already?
//for failed:
//  add the failure to the object under writeFailure
//  don't mark as synced
//  calling code should check for writeFailure after the written objects
//  are returned
Zotero.Container.prototype.updateObjectsFromWriteResponse = function(objectsArray, response){
    Z.debug("Zotero.utils.updateObjectsFromWriteResponse", 3);
    Z.debug(response);
    Z.debug("statusCode: " + response.status, 3);
    var data = response.data;
    if(response.status == 200){
        Z.debug("newLastModifiedVersion: " + response.lastModifiedVersion, 3);
        //make sure writes were actually successful and
        //update the itemKey for the parent
        if(data.hasOwnProperty('success')){
            //update each successfully written item, possibly with new itemKeys
            J.each(data.success, function(ind, key){
                var i = parseInt(ind, 10);
                var object = objectsArray[i];
                //throw error if objectKey mismatch
                if(object.key !== "" && object.key !== key){
                    throw new Error("object key mismatch in multi-write response");
                }
                if(object.key === ''){
                    object.updateObjectKey(key);
                }
                object.set('version', response.lastModifiedVersion);
                object.synced = true;
                object.writeFailure = false;
            });
        }
        if(data.hasOwnProperty('failed')){
            Z.debug("updating objects with failed writes", 3);
            J.each(data.failed, function(ind, failure){
                Z.debug("failed write " + ind + " - " + failure, 3);
                var i = parseInt(ind, 10);
                var object = objectsArray[i];
                object.writeFailure = failure;
            });
        }
    }
    else if(responsexhr.status == 204){
        //single item put response, this probably should never go to this function
        objectsArray[0].synced = true;
    }
};

//return the key as a string when passed an argument that 
//could be either a string key or an object with a key property
Zotero.Container.prototype.extractKey = function(object){
    if(typeof object == 'string'){
        return object;
    }
    return object.get('key');
};
