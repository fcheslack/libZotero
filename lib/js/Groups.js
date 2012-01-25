Zotero.Groups = function(){
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

Zotero.groups = new Zotero.Groups();
