Zotero.Group = function () {this.instance = "Zotero.Group";};
Zotero.Group.prototype = new Zotero.Entry();
Zotero.Group.prototype.loadObject = function(ob){
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
};

Zotero.Group.prototype.parseXmlGroup = function (gel) {
    this.parseXmlEntry(gel);
    
    this.numItems = gel.find('zapi\\:numItems, numItems').text();
    
    var groupEl = gel.find('zxfer\\:group, group');
    if(groupEl.length !== 0){
        this.groupID = groupEl.attr("id");
        this.ownerID = groupEl.attr("owner");
        this.groupType = groupEl.attr("type");
        this.groupName = groupEl.attr("name");
        this.libraryEditing = groupEl.attr("libraryEditing");
        this.libraryReading = groupEl.attr("libraryReading");
        this.fileEditing = groupEl.attr("fileEditing");
        this.description = groupEl.find('zxfer\\:description, description').text();
        this.memberIDs = groupEl.find('zxfer\\:members, members').text().split(" ");
        this.adminIDs = groupEl.find('zxfer\\:admins, admins').text().split(" ");
        this.itemIDs = groupEl.find('zxfer\\:items, items').text().split(" ");
        
    }
    
};
