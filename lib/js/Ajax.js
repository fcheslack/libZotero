/*
Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};
*/
/*
Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback", 2);
    Z.debug('textStatus: ' + textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(errorThrown, 2);
    Z.debug(jqxhr, 2);
};
*/
Zotero.ajax.errorCallback = function(response){
    Z.error(response);
    Z.debug("ajax error callback", 2);
    Z.debug('textStatus: ' + response.textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(response.errorThrown, 2);
    Z.debug(response.jqxhr, 2);
};

Zotero.ajax.error = Zotero.ajax.errorCallback;
Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    Z.debug("Zotero.ajax.apiRequestUrl", 4);
    Z.debug(params, 4);
    J.each(params, function(key, val){
        //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
        //if so the new validation below takes care of that instead
        if(typeof val == 'string'){
            val = val.split('#', 1);
            params[key] = val[0];
        }
        
        //validate params based on patterns in Zotero.validate
        if(Zotero.validator.validate(val, key) === false){
            //warn on invalid parameter and drop from params that will be used
            Zotero.warn("API argument failed validation: " + key + " cannot be " + val);
            Zotero.warn(params);
            delete params[key];
        }
    });
    
    if(!params.target) throw new Error("No target defined for api request");
    if(!(params.libraryType == 'user' ||
        params.libraryType == 'group' ||
        params.libraryType === '')) {
        throw new Error("Unexpected libraryType for api request " + JSON.stringify(params));
    }
    if((params.libraryType) && !(params.libraryID)) {
        throw new ("No libraryID defined for api request");
    }
    if((params.target == "publications") && (params.libraryType != 'user')){
        throw new Error("publications is only valid for user libraries");
    }
    
    var base = Zotero.config.baseApiUrl;
    var url;
    
    if(params.libraryType !== ''){
        url = base + '/' + params.libraryType + 's/' + params.libraryID;
        if(params.collectionKey){
            if(params.collectionKey == 'trash'){
                url += '/items/trash';
                return url;
            }
            else if(params.collectionKey.indexOf(',') !== -1){
                
            }
            else if(params.target != 'collections'){
                url += '/collections/' + params.collectionKey;
            }
        }
    }
    else{
        url = base;
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
                url += '/items';
            }
            break;
        case 'collections':
            url += '/collections';
            break;
        case 'childCollections':
            url += '/collections';
        case 'collection':
            break;
        case 'tags':
            url += '/tags';
            break;
        case 'children':
            url += '/items/' + params.itemKey + '/children';
            break;
        case 'key':
            url = base + '/users/' + params.libraryID + '/keys/' + params.apiKey;
            break;
        case 'deleted':
            url += '/deleted';
            break;
        case 'userGroups':
            url = base + '/users/' + params.libraryID + '/groups';
            break;
        case 'settings':
            url += '/settings/' + (params.settingsKey || '');
            break;
        case 'publications':
            url += '/publications/items';
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

Zotero.ajax.apiQueryString = function(passedParams, useConfigKey){
    Z.debug("Zotero.ajax.apiQueryString", 4);
    Z.debug(passedParams, 4);
    if(useConfigKey === null || typeof useConfigKey === 'undefined'){
        useConfigKey = true;
    }
    
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
    if(useConfigKey && Zotero.config.sessionAuth) {
        var sessionKey = Zotero.utils.readCookie(Zotero.config.sessionCookieName);
        passedParams['session'] = sessionKey;
    }
    else if(useConfigKey && Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams, 4);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'include',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'itemKey',
                             'collectionKey',
                             'searchKey',
                             'locale',
                             'tag',
                             'tagType',
                             'key',
                             'style',
                             'linkMode',
                             'linkwrap',
                             'session',
                             'newer',
                             'since'
                             ];
    queryParamOptions.sort();
    //build simple api query parameters object
    var queryParams = {};
    J.each(queryParamOptions, function(i, val){
        if(passedParams.hasOwnProperty(val) && (passedParams[val] !== '')){
            queryParams[val] = passedParams[val];
        }
    });
    
    //take out itemKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'items'){
        if(queryParams.hasOwnProperty('itemKey') && queryParams['itemKey'].indexOf(',') == -1){
            delete queryParams['itemKey'];
        }
    }
    
    //take out collectionKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'collections'){
        if(queryParams.hasOwnProperty('collectionKey') && queryParams['collectionKey'].indexOf(',') === -1){
            delete queryParams['collectionKey'];
        }
    }
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                if(index == "tag" && v[0] == "-"){
                    v = "\\" + v;
                }
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            if(index == "tag" && value[0] == "-"){
                value = "\\" + value;
            }
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.apiRequestString = function(config){
    return Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            method = 'GET';
        }
        return Zotero.config.proxyPath + "?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};

Zotero.ajax.downloadBlob = function(url){
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        var blob;
        
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        
        xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                resolve(xhr.response);
            }
            else {
                reject(xhr.response);
            }
        } );
        // Send XHR
        xhr.send();
    });
};

