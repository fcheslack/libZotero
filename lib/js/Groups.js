Zotero.Groups = function(jsonBody){
    this.instance = 'Zotero.Groups';
    this.groupsArray = [];
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey){
    
};

Zotero.Groups.prototype.addGroupsFromJson = function(jsonBody){
    var groups = this;
    var groupsAdded = [];
    J.each(jsonBody, function(index, groupObj){
        Z.debug(groupObj);
        var group = new Zotero.Group(groupObj);
        groups.groupsArray.push(group);
        groupsAdded.push(group);
    });
    return groupsAdded;
};

Zotero.Groups.prototype.fetchUserGroups = function(userID, apikey){
    var groups = this;
    var aparams = {
        'target':'userGroups',
        'libraryType':'user',
        'libraryID': userID,
        'order':'title'
    };
    
    if(apikey){
        aparams['key'] = apikey;
    }
    else if(groups.owningLibrary) {
        aparams['key'] = groups.owningLibrary._apiKey;
    }
    
    return Zotero.ajaxRequest(aparams)
    .then(function(response){
        Z.debug('fetchUserGroups proxied callback', 3);
        fetchedGroups = groups.addGroupsFromJson(response.data);
        response.fetchedGroups = fetchedGroups;
        return response;
    });
};

