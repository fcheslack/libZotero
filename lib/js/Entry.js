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
