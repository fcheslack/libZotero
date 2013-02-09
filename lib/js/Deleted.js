Zotero.Deleted = function(data){
    this.instance = "Zotero.Deleted";
    if(typeof data === 'string'){
        this.deletedData = JSON.parse(data);
    }
    else {
        this.deletedData = data;
    }
    this.deletedVersion = 0;
    this.newerVersion = 0;
};
