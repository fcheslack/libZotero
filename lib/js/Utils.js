Zotero.utils = {
    randomString:function(len, chars) {
        if (!chars) {
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if (!len) {
            len = 8;
        }
        var randomstring = '';
        for (var i=0; i<len; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    
    getKey: function() {
        var baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero.utils.randomString(8, baseString);
    },
    
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace(/\s/g, "_");
        
        return slug;
    },
    
    prependAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.prependAutocomplete', 3);
        Z.debug("prepend match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.substr(0, plen).toLowerCase() == plower){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    matchAnyAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.matchAnyAutocomplete', 3);
        Z.debug("matchAny match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.toLowerCase().indexOf(plower) != -1){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    libraryString: function(type, libraryID){
        var lstring = '';
        if(type == 'user') lstring = 'u';
        else if(type == 'group') lstring = 'g';
        lstring += libraryID;
        return lstring;
    },
    
    parseLibString: function(libraryString){
        var type;
        var libraryID;
        if(libraryString.charAt(0) == 'u'){
            type = 'user';
        }
        else if(libraryString.charAt(0) == 'g'){
            type = 'group';
        }
        else{
            throw new Error("unexpected type character in libraryString");
        }
        libraryID = parseInt(libraryString.substring(1));
        return {libraryType:type, libraryID: libraryID};
    },
    
    //return true if retrieved more than lifetime minutes ago
    stale: function(retrievedDate, lifetime){
        var now = Date.now(); //current local time
        var elapsed = now.getTime() - retrievedDate.getTime();
        if((elapsed / 60000) > lifetime){
            return true;
        }
        return false;
    },
    
    entityify: function(str){
        var character = {
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;',
            '"' : '&quot;'
        };
        return str.replace(/[<>&"]/g, function(c) {
            return character[c];
        });
    },
    
    parseApiDate: function(datestr, date){
        //var parsems = Date.parse(datestr);
        
        var re = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var matches = re.exec(datestr);
        if(matches === null){
            Z.error("error parsing api date: " + datestr);
            return null;
        }
        else{
            date = new Date(Date.UTC(matches[1], matches[2]-1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        
        return date;
    },
    
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    
    compareObs: function(ob1, ob2, checkVars){
        var loopOn = checkVars;
        var useIndex = false;
        var differences = [];

        if(checkVars === undefined){
            loopOn = ob1;
            useIndex = true;
        }
        
        J.each(loopOn, function(index, Val){
            var compindex = Val;
            if(useIndex) compindex = index;
            
            if(typeof(ob1[index]) == 'object'){
                if (Zotero.utils.compareObs(ob1[compindex], ob2[compindex]).length ) {
                    differences.push(compindex);
                }
                //case 'function':
                //    if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
            }
            else{
                if (ob1[compindex] != ob2[compindex]) {
                    differences.push(compindex);
                }
            }
        });
        return differences;
    },
    
    /**
     * Translate common mimetypes to user friendly versions
     *
     * @param string $mimeType
     * @return string
     */
    translateMimeType: function(mimeType)
    {
        switch (mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return mimeType;
        }
    },

    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    getKeyPermissions: function(userID, key) {
        if(!userID){
            return false;
        }
        
        if(!key){
            return false;
        }
        
        var urlconfig = {'target':'key', 'libraryType':'user', 'libraryID':userID, 'apiKey':key};
        var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
        
        return Zotero.ajaxRequest(requestUrl)
        .then(function(response){
            var keyNode = J(response.data).find('key');
            var keyObject = Zotero.utils.parseKey(keyNode);
            return keyObject;
        });
    },
    
    /**
     * Parse a key response into an array
     *
     * @param keyNode jQuery Dom collection from key response
     * @return array $keyPermissions
     */
    parseKey: function(keyNode){
        var key = [];
        var keyPerms = {"library":"0", "notes":"0", "write":"0", 'groups':{}};
        var accessEls = keyNode.find('access');
        accessEls.each(function(){
            var access = J(this);
            if(access.attr('library')){
                keyPerms['library'] = access.attr('library');
            }
            if(access.attr('notes')){
                keyPerms['notes'] = access.attr('notes');
            }
            if(access.attr('group')){
                var groupPermission = access.attr('write') == '1' ? 'write' : 'read';
                keyPerms['groups'][access.attr('group')] = groupPermission;
            }
            else if(access.attr('write')){
                keyPerms['write'] = access.attr('write');
            }
        });
        return keyPerms;
    }
    
};
