Zotero.Groups = function(feed){
    this.instance = 'Zotero.Groups';
    this.groupsArray = [];
};

Zotero.Groups.prototype.sortByTitleCompare = function(a, b){
    Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey){
    
};

Zotero.Groups.prototype.addGroupsFromFeed = function(groupsFeed){
    var groups = this;
    var groupsAdded = [];
    groupsFeed.entries.each(function(index, entry){
        var group = new Zotero.Group(J(entry) );
        groups.groupsArray.push(group);
        groupsAdded.push(group);
    });
    return groupsAdded;
};

Zotero.Groups.prototype.fetchUserGroups = function(userID, apikey){
    var groups = this;
    var deferred = new J.Deferred();
    
    var aparams = {
        'target':'userGroups',
        'libraryType':'user',
        'libraryID': userID,
        'content':'json',
        'order':'title'
    };
    
    if(apikey){
        aparams['key'] = apikey;
    }
    else {
        aparams['key'] = groups.owningLibrary._apiKey;
    }
    
    var requestUrl = Zotero.ajax.apiRequestUrl(aparams) + Zotero.ajax.apiQueryString(aparams);
    
    var callback = J.proxy(function(data, textStatus, xhr){
        Z.debug('fetchUserGroups proxied callback', 3);
        var groupsfeed = new Zotero.Feed(data, xhr);
        fetchedGroups = groups.addGroupsFromFeed(groupsfeed);
        deferred.resolve(fetchedGroups);
    }, this);
    
    jqxhr = Zotero.ajaxRequest(requestUrl, 'GET');
    jqxhr.then(callback);
    
    return deferred;
};

