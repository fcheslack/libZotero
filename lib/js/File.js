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
        fileInfo.md5 = MD5(result);
        fileInfo.filename = file.name;
        fileInfo.filesize = file.size;
        fileInfo.mtime = Date.now();
        fileInfo.contentType = file.type;
        fileInfo.reader = reader;
        callback(fileInfo);
    };
    
    reader.readAsBinaryString(file);
    Z.debug("leaving synchronous part of getFileInfo");
};

Zotero.file.uploadFile = function(uploadInfo, filedata){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo);
    var data = uploadInfo.prefix + filedata + uploadInfo.suffix;
    
    var jqxhr = J.ajax(uploadInfo.url,
            {
                data:data,
                type:'POST',
                processData:false,
                headers:{'Content-Type': uploadInfo.contentType},
                cache:false,
                statusCode: {
                    201: function(){
                        Z.debug("uploadFile got status 201");
                    }
                }
            });
    Z.debug(jqxhr);
    Z.uploadjqxhr2 = jqxhr;
    return jqxhr;
};

