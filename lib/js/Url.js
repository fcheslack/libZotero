// Url.js - construct certain urls and links locally that may depend on the
// current website's routing scheme etc. Not necessarily pointing to zotero.org
// - href for a particular item's local representation
// - link with appropriate text, to download file or view framed snapshot
// - href for file download/view, depending on whether config says to download
// directly from the api, or to proxy it
// - displayable string describing the attachment file (attachmentFileDetails)
// - list of urls for supported export formats
// 

//locally construct a url for the item on the current website
Zotero.url.itemHref = function(item){
    var href = '';
    href += Zotero.config.libraryPathString + '/itemKey/' + item.key;
    return href;
};

//construct a download link for an item's enclosure file that takes into
//account size and whether the file is a snapshot
Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    var downloadUrl = item.attachmentDownloadUrl;
    var contentType = item.get('contentType');
    
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(!item.apiObj.links['enclosure']['length'] && item.isSnapshot()){
            //snapshot: redirect to view
            retString += '<a href="' + downloadUrl + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
            var enc = item.apiObj.links['enclosure'];
            var filesize = parseInt(enc['length'], 10);
            var filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype, 3);
            retString += '<a href="' + downloadUrl + '">';
            if(enctype == 'undefined' || enctype === '' || typeof enctype == 'undefined'){
                retString += filesizeString + '</a>';
            }
            else{
                retString += enctype + ', ' + filesizeString + '</a>';
            }
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            //we have a proxy for downloads at baseDownloadUrl so just pass an itemkey to that
            return Zotero.url.wwwDownloadUrl(item);
        }
        else {
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    return false;
};

Zotero.url.apiDownloadUrl = function(item){
    if(item.apiObj.links['enclosure']){
        return item.apiObj.links['enclosure']['href'];
    }
    return false;
};

Zotero.url.wwwDownloadUrl = function(item){
    var urlString = '';
    if(item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            return Zotero.config.baseDownloadUrl + "?itemkey=" + item.get('key');
        }
        else{
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    else {
        return false;
    }
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.apiObj.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
    var enc = item.apiObj.links['enclosure'];
    var filesizeString = '';
    if(enc['length']){
        var filesize = parseInt(enc['length'], 10);
        filesizeString = "" + filesize + " B";
        if(filesize > 1073741824){
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        }
        else if(filesize > 1048576){
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        }
        else if(filesize > 1024){
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        return '(' + enctype + ', ' + filesizeString + ')';
    }
    else {
        return '(' + enctype + ')';
    }
};

Zotero.url.userWebLibrary = function(slug) {
    return [Zotero.config.baseWebsiteUrl, slug, "items"].join("/");
};

Zotero.url.groupWebLibrary = function(group) {
    if(group.type == 'Private'){
        return [Zotero.config.baseWebsiteUrl, "groups", group.get('id'), "items"].join("/");
    }
    else {
        return [Zotero.config.baseWebsiteUrl, "groups", Zotero.utils.slugify(group.get('name')), "items"].join("/");
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls", 3);
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    return exportUrls;
};

Zotero.url.relationUrl = function(libraryType, libraryID, itemKey){
    return "http://zotero.org/" + libraryType + "s/" + libraryID + "/items/" + itemKey;
}
