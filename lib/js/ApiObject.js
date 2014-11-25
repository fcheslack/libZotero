Zotero.ApiObject = function(){
    this.instance = "Zotero.ApiObject";
    this.version = 0;
};

//associate Entry with a library so we can update it on the server
Zotero.ApiObject.prototype.associateWithLibrary = function(library){
    var apiObject = this;
    apiObject.owningLibrary = library;
    return apiObject;
};

Zotero.ApiObject.prototype.fieldComparer = function(attr){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[attr], b.apiObj.data[attr]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[attr].toLowerCase() == b.apiObj.data[attr].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[attr].toLowerCase() < b.apiObj.data[attr].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};
