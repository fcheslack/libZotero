Zotero.Tags = function(feed){
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
    if(typeof feed != 'undefined'){
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function(){
    var dump = {};
    dump.tagsVersion = this.tagsVersion;
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    }
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump){
    this.tagsVersion = dump.tagsVersion;
    this.displayTagsUrl = dump.displayTagsUrl;
    for (var i = 0; i < dump.tagsArray.length; i++) {
        var tag = new Zotero.Tag();
        tag.loadDump(dump.tagsArray[i]);
        this.addTag(tag);
    }
    
    this.updateSecondaryData();
    return this;
};

Zotero.Tags.prototype.addTag = function(tag){
    this.tagObjects[tag.title] = tag;
    this.tagsArray.push(tag);
    if(this.owningLibrary){
        tag.associateWithLibrary(this.owningLibrary);
    }
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
    J.each(tagsArray, function(index, element){
        plainList.push(element.title);
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
    tags.tagsArray.sort(Zotero.Library.prototype.sortByTitleCompare);
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.sortLower);
    tags.plainList = plainList;
};

Zotero.Tags.prototype.addTagsFromFeed = function(feed){
    Z.debug('Zotero.Tags.addTagsFromFeed', 3);
    var tags = this;
    var tagsAdded = [];
    feed.entries.each(function(index, entry){
        var tag = new Zotero.Tag(J(entry));
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
