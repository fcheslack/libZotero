Zotero.Filestorage = function(){
    Z.debug("Zotero.Filestorage", 3);
    var zfilestorage = this;
    this.filer = new Filer();
    this.fileEntries = {};
    Z.debug("Filer created", 3);
    this.filer.init({'persistent': true, 'size': 1024*1024*128}, J.proxy(function(fs){
        Z.debug("Filesystem created");
        zfilestorage.fs = fs;
        zfilestorage.listOfflineFiles();
    }, this)
    );
    Z.debug("returning Zotero.Filestorage");
};

//return an Object URL if we have the file for itemKey saved offline
//otherwise return false
Zotero.Filestorage.prototype.getSavedFile = function(itemKey){
    Zotero.debug("Zotero.Filestorage.getSavedFile", 3);
    var fstorage = this;
    var filer = fstorage.filer;
    var deferred = new J.Deferred();
    // Pass a path.
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debut("filer.open callback");
        deferred.resolve(file);
    }, this), this.handleError);
    
    return deferred;
};

Zotero.Filestorage.prototype.getSavedFileObjectUrl = function(itemKey){
    Z.debug("Zotero.Filestorage.getSavedFileObjectUrl", 3);
    var fstorage = this;
    var filer = this.filer;
    var objectUrlDeferred = new J.Deferred();
    
    filer.open(fstorage.fileEntries[itemKey], J.proxy(function(file) {
        Z.debug("filer.open callback");
        objectUrlDeferred.resolve(Util.fileToObjectURL(file));
    }, this), this.handleError);
    
    return objectUrlDeferred;
};

//return deferred that resolves with array of itemKeys of files available locally
Zotero.Filestorage.prototype.listOfflineFiles = function(){
    Z.debug("Zotero.Filestorage.listOfflineFiles");
    var fstorage = this;
    var filer = fstorage.filer;
    var fileListDeferred = new J.Deferred();
    
    filer.ls('/', J.proxy(function(entries){
        Z.debug(entries);
        Zotero.offlineFilesEntries = entries;
        var itemKeys = [];
        J.each(entries, function(ind, entry){
            fstorage.fileEntries[entry.name] = entry;
            itemKeys.push(entry.name);
        });
        fileListDeferred.resolve(itemKeys);
    }, this) );
    
    return fileListDeferred;
};

Zotero.Filestorage.prototype.handleError = function(e){
    Zotero.debug("----------------Filestorage Error encountered", 2);
    Zotero.debug(e, 2);
};
