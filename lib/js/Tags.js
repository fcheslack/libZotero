Zotero.Tags = function(jsonBody){
    this.instance = "Zotero.Tags";
    //represent collections as array for ordering purposes
    this.tagsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
    this.loaded = false;
    if(jsonBody){
        this.addTagsFromJson(jsonBody);
    }
};

Zotero.Tags.prototype = new Zotero.Container();

Zotero.Tags.prototype.addTag = function(tag){
    var tags = this;
    tags.tagObjects[tag.apiObj.tag] = tag;
    tags.tagsArray.push(tag);
    if(tags.owningLibrary){
        tag.associateWithLibrary(tags.owningLibrary);
    }
};

Zotero.Tags.prototype.getTag = function(tagname){
    var tags = this;
    if(tags.tagObjects.hasOwnProperty(tagname)){
        return this.tagObjects[tagname];
    }
    return null;
};

Zotero.Tags.prototype.removeTag = function(tagname){
    var tags = this;
    delete tags.tagObjects[tagname];
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.removeTags = function(tagnames){
    var tags = this;
    J.each(tagnames, function(i, tagname){
        delete tags.tagObjects[tagname];
    });
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray){
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, tag){
        plainList.push(tag.apiObj.tag);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function(){
    Z.debug("Zotero.Tags.clear", 3);
    this.tagsVersion = 0;
    this.syncState.earliestVersion = null;
    this.syncState.latestVersion = null;
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
    tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.comparer());
    tags.plainList = plainList;
};

Zotero.Tags.prototype.updateTagsVersion = function(tagsVersion) {
    var tags = this;
    J.each(tags.tagObjects, function(key, tag) {
        tag.set('version', tagsVersion);
    });
};

Zotero.Tags.prototype.rebuildTagsArray = function() {
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, tag) {
        tags.tagsArray.push(tag);
    });
};

Zotero.Tags.prototype.addTagsFromJson = function(jsonBody){
    Z.debug('Zotero.Tags.addTagsFromJson', 3);
    var tags = this;
    var tagsAdded = [];
    J.each(jsonBody, function(index, tagObj){
        var tag = new Zotero.Tag(tagObj);
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
