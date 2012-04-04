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
        console.log("md5:");
        console.log(fileInfo.md5);
        fileInfo.filename = file.name;
        fileInfo.filesize = file.size;
        fileInfo.mtime = Date.now();
        fileInfo.contentType = file.type;
        fileInfo.reader = reader;
        callback(fileInfo);
    };
    
    reader.readAsBinaryString(file);
    console.log('using binary string');
    Z.debug("leaving synchronous part of getFileInfo");
};

Zotero.file.uploadFile = function(uploadInfo, filedata){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo);
    /*
    var data = uploadInfo.prefix + filedata + uploadInfo.suffix;
    
    var jqxhr = J.ajax(uploadInfo.url,
            {
                data:data,
                type:'POST',
                processData:false,
                crossDomain:true,
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
    //return jqxhr;
    */
    var data = uploadInfo.prefix + filedata + uploadInfo.suffix;
    /*
    var bufferLength = uploadInfo.prefix.length + uploadInfo.suffix.length + filedata.byteLength;
    
    window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
    var bb = new BlobBuilder();
    bb.append(uploadInfo.prefix);
    bb.append(filedata);
    bb.append(uploadInfo.suffix);
    var blob = bb.getBlob();
    */
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', uploadInfo.url, true);
    console.log("contentType: " + uploadInfo.contentType);
    xhr.setRequestHeader('Content-Type', uploadInfo.contentType);
    
    xhr.onload = function(e) {
        console.log("file upload onload event");
    };
    
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            console.log((e.loaded / e.total) * 100 );
            //progressBar.value = (e.loaded / e.total) * 100;
            //progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
        }
    };
    //var uInt8Array = new Uint8Array([1, 2, 3]);
    
    xhr.send(data);
    return xhr;
};

