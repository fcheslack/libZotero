Zotero.file = {};

Zotero.file.getFileInfo = function(file, callback){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        throw "FileReader not supported";
    }
    
    var fileInfo = {};
    var reader = new FileReader();
    reader.onload = function(e){
        Z.debug('Zotero.file.getFileInfo onloadFunc');
        var result = e.target.result;
        Zotero.debug(result);
        var spark = new SparkMD5();
        //fileInfo.md5 = MD5(result);
        spark.appendBinary(result);
        fileInfo.md5 = spark.end();
        Z.debug("md5:" + fileInfo.md5, 4);
        fileInfo.filename = file.name;
        fileInfo.filesize = file.size;
        fileInfo.mtime = Date.now();
        fileInfo.contentType = file.type;
        fileInfo.reader = reader;
        callback(fileInfo);
    };
    
    reader.readAsBinaryString(file);
};

Zotero.file.uploadFile = function(uploadInfo, file){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    formData.append('file', file);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    xhr.send(formData);
    return xhr;
    //While s3 does not allow CORS this XHR will not have the normal status
    //information, but will still fire readyStateChanges so you can tell
    //when the upload has finished (even if you can't tell if it was successful
    //from JS)
};

