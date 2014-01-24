Zotero.Tag = function (entry) {
    this.instance = "Zotero.Tag";
    this.color = null;
    if(typeof entry != 'undefined'){
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry();

Zotero.Tag.prototype.dump = function(){
    var tag = this;
    var dump = tag.dumpEntry();
    var dumpProperties = [
        'numItems',
        'urlencodedtag',
        'tagVersion',
        'tagType',
        'tag',
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = tag[dumpProperties[i]];
    }
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump){
    var tag = this;
    tag.loadDumpEntry(dump);
    var dumpProperties = [
        'numItems',
        'urlencodedtag',
        'tagVersion',
        'tagType',
        'tag',
    ];
    
    for (var i = 0; i < dumpProperties.length; i++) {
        tag[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    
    tag.initSecondaryData();
    return tag;
};

Zotero.Tag.prototype.initSecondaryData = function(){
    
};

Zotero.Tag.prototype.loadObject = function(ob){
    var tag = this;
    tag.title = ob.title;
    tag.author = ob.author;
    tag.tagID = ob.tagID;
    tag.published = ob.published;
    tag.updated = ob.updated;
    tag.links = ob.links;
    tag.numItems = ob.numItems;
    tag.items = ob.items;
    tag.tagType = ob.tagType;
    tag.modified = ob.modified;
    tag.added = ob.added;
    tag.key = ob.key;
    tag.tag = ob.tag;
};

Zotero.Tag.prototype.parseXmlTag = function (tel) {
    var tag = this;
    //Z.debug("Zotero.Tag.parseXmlTag", 3);
    //Z.debug(tel);
    tag.parseXmlEntry(tel);
    
    tag.numItems = tel.find('zapi\\:numItems, numItems').text();
    tag.urlencodedtag = encodeURIComponent(this.title);
    var contentEl = tel.find('content').first();
    tag.parseContentBlock(contentEl);
    //Z.debug("Done with Zotero.Tag.parseXmlTag");
};

Zotero.Tag.prototype.parseContentBlock = function(contentEl) {
    var tag = this;
    var contentType = contentEl.attr('type');
    var contentText = contentEl.text();
    
    switch(contentType){
        case 'application/json':
            tag.parseJsonContent(contentEl);
            break;
    }
};

Zotero.Tag.prototype.parseJsonContent = function(cel) {
    var tag = this;
    if(typeof cel === "string"){
        tag.apiObj = JSON.parse(cel);
        tag.pristine = JSON.parse(cel);
    }
    else {
        tag.apiObj = JSON.parse(cel.text());
        tag.pristine = JSON.parse(cel.text());
    }
    
    tag.tagType = tag.apiObj['type'];
    
    tag.initSecondaryData();
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
                deparamed.tag.splice(selectedIndex, 1);
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
