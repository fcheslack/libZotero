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
