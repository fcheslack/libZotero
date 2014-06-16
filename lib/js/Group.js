Zotero.Group = function (groupObj) {
    var group = this;
    group.instance = "Zotero.Group";
    if(groupObj){
        this.parseJsonGroup(groupObj);
    }
};

Zotero.Group.prototype = new Zotero.ApiObject();

Zotero.Group.prototype.parseJsonGroup = function(groupObj) {
    var group = this;
    group.apiObj = groupObj;
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch(key) {
        case 'title':
        case 'name':
            return group.apiObj.data.name;
    }
    
    if(key in group.apiObj){
        return group.apiObj[key];
    }
    if(key in group.apiObj.data){
        return group.apiObj.data[key];
    }
    if(key in group.apiObj.meta){
        return group.apiObj.meta[key];
    }
    if(group.hasOwnProperty(key)){
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

