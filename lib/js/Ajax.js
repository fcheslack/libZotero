Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};

Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback");
    Z.debug('textStatus: ' + textStatus);
    Z.debug('errorThrown: ');
    Z.debug(errorThrown);
    Z.debug(jqxhr);
};

Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    //Z.debug("Zotero.ajax.apiRequestUrl", 3);
    //Z.debug(params, 3);
    J.each(params, function(key, val){
        //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
        //if so the new validation below takes care of that instead
        if(typeof val == 'string'){
            val = val.split('#', 1);
            params[key] = val[0];
        }
        
        //validate params based on patterns in Zotero.validate
        if(Zotero.validator.validate(val, key) === false){
            throw "API argument failed validation: " + key + " cannot be " + val;
        }
    });
    
    if(!params.target) throw "No target defined for api request";
    if(!(params.libraryType == 'user' || params.libraryType == 'group')) throw "Unexpected libraryType for api request" + params.libraryType;
    if(!(params.libraryID)) throw "No libraryID defined for api request";
    
    var base = Zotero.config.baseApiUrl;
    var url;
    url = base + '/' + params.libraryType + 's/' + params.libraryID;
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            url += '/items/trash';
            return url;
        }
        else{
            url += '/collections/' + params.collectionKey;
        }
    }
    
    switch(params.target){
        case 'items':
            url += '/items';
            break;
        case 'item':
            if(params.itemKey){
                url += '/items/' + params.itemKey;
            }
            else{
                url += '/items'
            }
            break;
        case 'collections':
            url += '/collections';
            break;
        case 'collection':
            break;
        case 'tags':
            url += '/tags';
            break;
        case 'children':
            url += '/items/' + params.itemKey + '/children';
            break;
        default:
            return false;
    }
    switch(params.targetModifier){
        case 'top':
            url += '/top';
            break;
        case 'file':
            url += '/file';
            break;
        case 'viewsnapshot':
            url += '/file/view';
            break;
    }
    //Z.debug("returning apiRequestUrl: " + url, 3);
    return url;
};

Zotero.ajax.apiQueryString = function(passedParams){
    Z.debug("Zotero.ajax.apiQueryString");
    Z.debug(passedParams);
    J.each(passedParams, function(key, val){
        if(typeof val == 'string'){
            val = val.split('#', 1);
            passedParams[key] = val[0];
        }
    });
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'creatorSummary'){
        passedParams['order'] = 'creator';
    }
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'year'){
        passedParams['order'] = 'date';
    }
    if(Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'locale',
                             'tag',
                             'tagType',
                             'key'
                             ];
    //build simple api query parameters object
    var queryParams = {};
    J.each(queryParamOptions, function(i, val){
        if(passedParams.hasOwnProperty(val) && (passedParams[val] !== '')){
            queryParams[val] = passedParams[val];
        }
    });
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            var method = 'GET';
        }
        return "proxyRequest.php?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};
