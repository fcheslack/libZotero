Zotero.file = {};

Zotero.file.getFileInfo = function(file){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        return Promise.reject(new Error("FileReader not supported"));
    }
    
    return new Promise(function(resolve, reject){
        var fileInfo = {};
        var reader = new FileReader();
        reader.onload = function(e){
            Z.debug('Zotero.file.getFileInfo onloadFunc', 3);
            var result = e.target.result;
            Zotero.debug(result, 3);
            fileInfo.md5 = SparkMD5.ArrayBuffer.hash(result);
            fileInfo.filename = file.name;
            fileInfo.filesize = file.size;
            fileInfo.mtime = Date.now();
            fileInfo.contentType = file.type;
            //fileInfo.reader = reader;
            fileInfo.filedata = result;
            resolve(fileInfo);
        };
        
        reader.readAsArrayBuffer(file);
    });
};

Zotero.file.uploadFile = function(uploadInfo, fileInfo){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    var blobData = new Blob([fileInfo.filedata], {type : fileInfo.contentType});
    formData.append('file', blobData);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    return new Promise(function(resolve, reject){
        xhr.onload = function(evt){
            Z.debug('uploadFile onload event', 3);
            if(this.status == 201){
                Z.debug("successful upload - 201", 3);
                resolve();
            }
            else {
                Z.debug('uploadFile failed - ' + xhr.status, 3);
                reject({
                    "message": "Failure uploading file.",
                    "code": xhr.status,
                    "serverMessage": xhr.responseText
                });
            }
        };
        
        xhr.onprogress = function(evt){
            Z.debug('progress event');
            Z.debug(evt);
        };
        xhr.send(formData);
    });
    
    //If CORS is not enabled on s3 this XHR will not have the normal status
    //information, but will still fire readyStateChanges so you can tell
    //when the upload has finished (even if you can't tell if it was successful
    //from JS)
};

