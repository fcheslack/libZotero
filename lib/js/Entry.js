Zotero.Entry = function(){
    this.instance = "Zotero.Entry";
    this.version = 0;
};

Zotero.Entry.prototype.dumpEntry = function(){
    var entry = this;
    var dump = {};
    var dataProperties = [
        'version',
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = entry[dataProperties[i]];
    }
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump){
    var dataProperties = [
        'version',
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel){
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    var entry = this;
    entry.version = eel.children("zapi\\:version").text();
    entry.title = eel.children("title").text();
    
    entry.author = {};
    entry.author["name"] = eel.children("author").children("name").text();
    entry.author["uri"] = eel.children("author").children("uri").text();
    
    entry.id = eel.children('id').first().text();
    
    entry.published = eel.children("published").text();
    entry.dateAdded = entry.published;
    
    entry.updated = eel.children("updated").text();
    entry.dateModified = entry.updated;
    
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
    entry.links = links;
};

//associate Entry with a library so we can update it on the server
Zotero.Entry.prototype.associateWithLibrary = function(library){
    var entry = this;
    entry.libraryUrlIdentifier = library.libraryUrlIdentifier;
    entry.libraryType = library.libraryType;
    entry.libraryID = library.libraryID;
    entry.owningLibrary = library;
    return entry;
};
