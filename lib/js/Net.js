/*
 * Make concurrent and sequential network requests, respecting backoff/retry-after
 * headers, and keeping concurrent requests below a certain limit.
 * 
 * Push onto the queue individual or arrays of requestConfig objects
 * If there is room for requests and we are not currently backing off:
 *   start a sequential series, or individual request
 * When any request or set of requests finishes, we preprocess the response,
 * looking for backoff/retry-after to obey, and putting sequential responses
 * into an array. We then trigger the next waiting request.
 * 
 */

Zotero.Net = function(){
    this.deferredQueue = [];
    this.numRunning = 0;
    this.numConcurrent = 1;
    this.backingOff = false;
};

Zotero.Net.prototype.queueDeferred = function(){
    var net = this;
    var d = new J.Deferred();
    net.deferredQueue.push(d);
    return Promise.resolve(d);
};

Zotero.Net.prototype.queueRequest = function(requestObject){
    Z.debug("Zotero.Net.queueRequest", 3);
    var net = this;
    var resultPromise;
    
    if(J.isArray(requestObject)){
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running sequential after queued deferred resolved", 4);
            return net.runSequential(requestObject);
        }).then(function(response){
            Z.debug("runSequential done", 3);
            net.queuedRequestDone();
            return response;
        });
    }
    else {
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running concurrent after queued deferred resolved", 4);
            return net.runConcurrent(requestObject);
        }).then(function(response){
            Z.debug("done with queuedRequest");
            net.queuedRequestDone();
            return response;
        });
    }
    
    net.runNext();
    return resultPromise.catch(function(error){
        Z.error("Error before leaving Zotero.Net");
        Z.error(error);
    });
};

Zotero.Net.prototype.runConcurrent = function(requestObject){
    Z.debug("Zotero.Net.runConcurrent", 3);
    return this.ajaxRequest(requestObject).then(function(response){
        Z.debug("done with runConcurrent request");
        return response;
    });
};

//run the set of requests serially
//chaining each request onto the .then of the previous one, after
//adding the previous response to a responses array that will be
//returned via promise to the caller when all requests are complete
Zotero.Net.prototype.runSequential = function(requestObjects){
    Z.debug("Zotero.Net.runSequential", 3);
    var net = this;
    var responses = [];
    var seqPromise = Promise.resolve();
    
    for(var i = 0; i < requestObjects.length; i++){
        var requestObject = requestObjects[i];
        seqPromise = seqPromise.then(function(){
            var p = net.ajaxRequest(requestObject)
            .then(function(response){
                Z.debug('pushing sequential response into result array');
                responses.push(response);
            });
            return p;
        });
    };
    
    return seqPromise.then(function(){
        Z.debug("done with sequential aggregator promise - returning responses");
        return responses;
    });
};

//when one concurrent call, or a sequential series finishes, subtract it from the running
//count and run the next if there is something waiting to be run
Zotero.Net.prototype.individualRequestDone = function(response){
    Z.debug("Zotero.Net.individualRequestDone", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we need to back off before making more requests
    var wait = net.checkDelay(response);
    if(wait > 0){
        waitms = wait * 1000;
        net.backingOff = true;
        var waitExpiration = Date.now() + waitms;
        if(waitExpiration > net.waitingExpires){
            net.waitingExpires = waitExpiration;
        }
        window.setTimeout(net.runNext, waitms);
    }
    
    return response;
};

Zotero.Net.prototype.queuedRequestDone = function(response){
    Z.debug('queuedRequestDone', 3);
    var net = this;
    net.numRunning--;
    net.runNext();
    return response;
};

Zotero.Net.prototype.runNext = function(){
    Z.debug("Zotero.Net.runNext", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we're backing off and need to remain backing off,
    //or if we should now continue
    if(net.backingOff && (net.waitingExpires > (nowms - 100)) ){
        Z.debug("currently backing off", 3);
        var waitms = net.waitingExpires - nowms;
        window.setTimeout(net.runNext, waitms);
        return;
    }
    else if(net.backingOff && (net.waitingExpires <= (nowms - 100))){
        net.backingOff = false;
    }
    
    //continue making requests up to the concurrent limit
    Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. "
        + net.deferredQueue.length + " queued.", 3);
    while((net.deferredQueue.length > 0) && (net.numRunning < net.numConcurrent)){
        net.numRunning++;
        var nextD = net.deferredQueue.shift();
        nextD.resolve();
        Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. "
            + net.deferredQueue.length + " queued.", 3);
    }
};

Zotero.Net.prototype.checkDelay = function(response){
    Z.debug('Zotero.Net.checkDelay');
    Z.debug(response);
    var net = this;
    var wait = 0;
    if(J.isArray(response)){
        for(var i = 0; i < response.length; i++){
            iwait = net.checkDelay(response[i]);
            if(iwait > wait){
                wait = iwait;
            }
        }
    }
    else {
        if(response.status == 429){
            wait = response.retryAfter;
        }
        else if(response.backoff){
            wait = response.backoff;
        }
    }
    return wait;
};

Zotero.Net.prototype.ajaxRequest = function(requestConfig){
    Z.debug("Zotero.Net.ajaxRequest", 3);
    var net = this;
    var defaultConfig = {
        type:'GET',
        headers:{
            'Zotero-API-Version': Zotero.config.apiVersion,
            'Content-Type': 'application/json',
        },
        success: function(response){
            return response;
        },
        error: function(response){
            Z.error("ajaxRequest rejected:" + response.jqxhr.statusCode() + " - " + response.jqxhr.responseText);
            return response;
        },
        //cache:false
    };
    var headers = J.extend({}, defaultConfig.headers, requestConfig.headers);
    var config = J.extend({}, defaultConfig, requestConfig);
    config.headers = headers;
    if(typeof config.url == 'object'){
        config.url = Zotero.ajax.apiRequestString(config.url);
    }
    config.url = Zotero.ajax.proxyWrapper(config.url, config.type);
    
    if(!config.url){
        throw "No url specified in Zotero.Net.ajaxRequest";
    }
    //rename success/error callbacks so J.ajax does not actually use them
    //and we can use them as es6 promise result functions with expected
    //single value arguments
    config.zsuccess = config.success;
    config.zerror = config.error;
    delete config.success;
    delete config.error;
    
    ajaxpromise = new Promise(function(resolve, reject){
        J.ajax(config)
        .then(function(data, textStatus, jqxhr){
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
            resolve(r);
        }, function(jqxhr, textStatus, errorThrown){
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown,
                isError: true,
            });
            reject(r);
        });
    })
    .then(J.proxy(net.individualRequestDone, net))
    .then(function(response){
        //now that we're done handling, reject
        if(response.isError){
            Z.error("re-throwing ApiResponse that was a rejection");
            throw response;
        }
        return response;
    })
    .then(config.zsuccess, config.zerror);
    
    //Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.net = new Zotero.Net();
