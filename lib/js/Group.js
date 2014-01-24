Zotero.Group = function (entryEl) {
    var group = this;
    group.instance = "Zotero.Group";
    if(typeof entryEl != 'undefined'){
        this.parseXmlGroup(entryEl);
    }
};

Zotero.Group.prototype = new Zotero.Entry();

Zotero.Group.prototype.loadObject = function(ob){
    var group = this;
    group.title = ob.title;
    group.author = ob.author;
    group.tagID = ob.tagID;
    group.published = ob.published;
    group.updated = ob.updated;
    group.links = ob.links;
    group.numItems = ob.numItems;
    group.items = ob.items;
    group.tagType = ob.tagType;
    group.modified = ob.modified;
    group.added = ob.added;
    group.key = ob.key;
};

Zotero.Group.prototype.parseXmlGroup = function (gel) {
    var group = this;
    group.parseXmlEntry(gel);
    
    group.numItems = gel.find('zapi\\:numItems, numItems').text();
    
    //parse content block
    var contentEl = gel.children("content");
    //check for multi-content response
    var subcontents = gel.find("zapi\\:subcontent, subcontent");
    if(subcontents.size() > 0){
        for(var i = 0; i < subcontents.size(); i++){
            var sc = J(subcontents.get(i));
            group.parseContentBlock(sc);
        }
    }
    else{
        group.parseContentBlock(contentEl);
    }
    
    group.groupID = gel.find('zapi\\:groupID, groupID').text();
    group.numItems = gel.find('zapi\\:numItems, numItems').text();
    /*
    var groupEl = gel.find('zxfer\\:group, group');
    if(groupEl.length !== 0){
        group.groupID = groupEl.attr("id");
        group.ownerID = groupEl.attr("owner");
        group.groupType = groupEl.attr("type");
        group.groupName = groupEl.attr("name");
        group.libraryEditing = groupEl.attr("libraryEditing");
        group.libraryReading = groupEl.attr("libraryReading");
        group.fileEditing = groupEl.attr("fileEditing");
        group.description = groupEl.find('zxfer\\:description, description').text();
        group.memberIDs = groupEl.find('zxfer\\:members, members').text().split(" ");
        group.adminIDs = groupEl.find('zxfer\\:admins, admins').text().split(" ");
        group.itemIDs = groupEl.find('zxfer\\:items, items').text().split(" ");
    }
    */
};

Zotero.Group.prototype.parseContentBlock = function(contentEl){
    var group = this;
    var contentType = contentEl.attr('type');
    var contentText = contentEl.text();
    //group.groupContentBlocks[contentType] = contentText;
    
    switch(contentType){
        case 'json':
        case 'application/json':
            group.parseJsonGroupContent(contentEl);
            break;
    }
};

Zotero.Group.prototype.parseJsonGroupContent = function(cel){
    var group = this;
    group.apiObj = JSON.parse(cel.text());
    group.pristine = JSON.parse(cel.text());
    
    group.etag = cel.attr('etag');
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch(key) {
        case 'title':
            return group.title;
    }
    
    if(key in group.apiObj){
        return group.apiObj[key];
    }
    else if(group.hasOwnProperty(key)){
        return group[key];
    }
    
    return null;
};

Zotero.Group.prototype.isWritable = function(userID){
    var group = this;
    switch(true){
        case group.apiObj.owner == userID:
            return true;
        case (group.apiObj.admins && (group.apiObj.admins.indexOf(userID) != -1) ):
            return true;
        case ((group.apiObj.libraryEditing == 'members') &&
              (group.apiObj.members) &&
              (group.apiObj.members.indexOf(userID) != -1)):
            return true;
        default:
            return false;
    }
}

Zotero.Group.prototype.typeMap = {
    'Private': 'Private',
    'PublicOpen': 'Public, Open Membership',
    'PublicClosed': 'Public, Closed Membership'
};

Zotero.Group.prototype.accessMap = {
    'all'     : {'members' : 'Anyone can view, only members can edit',
                       'admins'  : 'Anyone can view, only admins can edit'},
    'members' : {'members' : 'Only members can view and edit',
                       'admins'  : 'Only members can view, only admins can edit'},
    'admins'  : {'members' : 'Only admins can view, only members can edit',
                       'admins'  : 'Only admins can view and edit'}
};

