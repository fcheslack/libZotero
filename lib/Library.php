<?php
define('LIBZOTERO_DEBUG', 0);
function libZoteroDebug($m){
    if(LIBZOTERO_DEBUG){
        echo $m;
    }
    return;
}

class Zotero_Library
{
    const ZOTERO_URI = 'https://api.zotero.org';
    protected $_apiKey = '';
    protected $_ch = null;
    public $libraryType = null;
    public $libraryID = null;
    public $libraryString = null;
    public $libraryUrlIdentifier = null;
    public $libraryBaseWebsiteUrl = null;
    public $items = null;
    public $collections = null;
    public $dirty = null;
    public $useLibraryAsContainer = true;
    protected $_lastResponse = null;
    protected $_lastFeed = null;
    protected $_cacheResponses = false;
    protected $_cachettl = 0;
    
    /**
     * Constructor for Zotero_Library
     *
     * @param string $libraryType user|group
     * @param string $libraryID id for zotero library, unique when combined with libraryType
     * @param string $libraryUrlIdentifier library identifier used in urls, either ID or slug
     * @param string $apiKey zotero api key
     * @param string $baseWebsiteUrl base url to use when generating links to the website version of items
     * @param string $cachettl cache time to live in seconds, cache disabled if 0
     * @return Zotero_Library
     */
    public function __construct($libraryType = null, $libraryID = 'me', $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org", $cachettl=0)
    {
        $this->_apiKey = $apiKey;
        if (extension_loaded('curl')) {
            //$this->_ch = curl_init();
        } else {
            throw new Exception("You need cURL");
        }
        
        $this->libraryType = $libraryType;
        $this->libraryID = $libraryID;
        $this->libraryString = $this->libraryString($this->libraryType, $this->libraryID);
        $this->libraryUrlIdentifier = $libraryUrlIdentifier;
        
        $this->libraryBaseWebsiteUrl = $baseWebsiteUrl . '/';
        if($this->libraryType == 'group'){
            $this->libraryBaseWebsiteUrl .= 'groups/';
        }
        $this->libraryBaseWebsiteUrl .= $this->libraryUrlIdentifier . '/items';
        
        $this->items = new Zotero_Items();
        $this->collections = new Zotero_Collections();
        $this->collections->libraryUrlIdentifier = $this->libraryUrlIdentifier;
        
        $this->dirty = false;
        if($cachettl > 0){
            $this->_cachettl = $cachettl;
            $this->_cacheResponses = true;
        }
    }
    
    /**
     * Destructor, closes cURL.
     */
    public function __destruct() {
        //curl_close($this->_ch);
    }
    
    /**
     * set the cache time to live after initialization
     *
     * @param int $cachettl cache time to live in seconds, 0 disables
     * @return null
     */
    public function setCacheTtl($cachettl){
        if($cachettl == 0){
            $this->_cacheResponses = false;
            $this->_cachettl = 0;
        }
        else{
            $this->_cacheResponses = true;
            $this->_cachettl = $cachettl;
        }
    }
    
    /**
     * Make http request to zotero api
     *
     * @param string $url target api url
     * @param string $method http method GET|POST|PUT|DELETE
     * @param string $body request body if write
     * @param array $headers headers to set on request
     * @return HTTP_Response
     */
    public function _request($url, $method="GET", $body=NULL, $headers=array()) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        $umethod = strtoupper($method);
        switch($umethod){
            case "GET":
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                break;
            case "POST":
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "PUT":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "DELETE":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                break;
        }
        
        $gotCached = false;
        if($this->_cacheResponses && $umethod == 'GET'){
            $cachedResponse = apc_fetch($url, $success);
            if($success){
                $responseBody = $cachedResponse['responseBody'];
                $responseInfo = $cachedResponse['responseInfo'];
                $zresponse = libZotero_Http_Response::fromString($responseBody);
                $gotCached = true;
            }
        }
        
        if(!$gotCached){
            $responseBody = curl_exec($ch);
            $responseInfo = curl_getinfo($ch);
            //libZoteroDebug( "{$method} url:" . $url . "\n");
            //libZoteroDebug( "%%%%%" . $responseBody . "%%%%%\n\n");
            $zresponse = libZotero_Http_Response::fromString($responseBody);
            
            //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
            //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
            //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
            //until a non-redirect is read
            while($zresponse->isRedirect()){
                $redirectedBody = $zresponse->getBody();
                $zresponse = libZotero_Http_Response::fromString($redirectedBody);
            }
            
            $saveCached = array(
                'responseBody'=>$responseBody,
                'responseInfo'=>$responseInfo,
            );
            if($this->_cacheResponses){
                apc_store($url, $saveCached, $this->_cachettl);
            }
        }
        $this->_lastResponse = $zresponse;
        return $zresponse;
    }
    
    public function proxyHttpRequest($url, $method='GET', $body=null, $headers=array()) {
        $endPoint = $url;
        try{
            $response = $this->_request($url, $method, $body, $headers);
            if($response->getStatus() == 303){
                //this might not account for GET parameters in the first url depending on the server
                $newLocation = $response->getHeader("Location");
                $reresponse = $this->_request($newLocation, $method, $body, $headers);
                return $reresponse;
            }
        }
        catch(Exception $e){
            $r = new libZotero_Http_Response(500, array(), $e->getMessage());
            return $r;
        }
        
        return $response;
    }
    
    
    public function _cacheSave(){
        
    }
    
    public function _cacheLoad(){
        
    }
    
    
    /**
     * get the last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastResponse(){
        return $this->_lastResponse;
    }
    
    /**
     * Get the last Zotero_Feed parsed
     *
     * @return Zotero_Feed
     */
    public function getLastFeed(){
        return $this->_lastFeed;
    }
    
    /**
     * Construct a string that uniquely identifies a library
     * This is not related to the server GUIDs
     *
     * @return string
     */
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring .= $libraryID;
        return $lstring;
    }
    
    /**
     * generate an api url for a request based on array of parameters
     *
     * @param array $params list of parameters that define the request
     * @param string $base the base api url
     * @return string
     */
    public function apiRequestUrl($params = array(), $base = Zotero_Library::ZOTERO_URI) {
        //var_dump($params);
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        //special case for www based api requests until those methods are mapped for api.zotero
        if($params['target'] == 'user' || $params['target'] == 'cv'){
            $base = 'https://www.zotero.org/api';
        }
        
        //allow overriding of libraryType and ID in params if they are passed
        //otherwise use the settings for this instance of library
        if(!empty($params['libraryType']) && !empty($params['libraryID'])){
            $url = $base . '/' . $params['libraryType'] . 's/' . $params['libraryID'];
        }
        else{
            $url = $base . '/' . $this->libraryType . 's/' . $this->libraryID;
        }
        
        if(!empty($params['collectionKey'])){
            $url .= '/collections/' . $params['collectionKey'];
        }
        
        switch($params['target']){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if($params['itemKey']){
                    $url .= '/items/' . $params['itemKey'];
                }
                else{
                    $url .= '/items';
                }
                break;
            case 'collections':
                $url .= '/collections';
                break;
            case 'collection':
                break;
            case 'tags':
                $url .= '/tags';
                break;
            case 'children':
                $url .= '/items/' . $params['itemKey'] . '/children';
                break;
            case 'itemTemplate':
                $url = $base . '/items/new';
                break;
            case 'key':
                $url = $base . '/users/' . $params['userID'] . '/keys/' . $params['apiKey'];
                break;
            case 'userGroups':
                $url = $base . '/users/' . $params['userID'] . '/groups';
                break;
            case 'trash':
                $url .= '/items/trash';
                break;
            case 'cv':
                $url .= '/cv';
                break;
            default:
                return false;
        }
        if(isset($params['targetModifier'])){
            switch($params['targetModifier']){
                case 'top':
                    $url .= '/top';
                    break;
                case 'children':
                    $url .= '/children';
                    break;
                case 'file':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file';
                    break;
            }
        }
        //print "apiRequestUrl: " . $url . "\n";
        return $url;
    }
    
    /**
     * generate an api query string for a request based on array of parameters
     *
     * @param array $passedParams list of parameters that define the request
     * @return string
     */
    public function apiQueryString($passedParams=array()){
        // Tags query formats
        //
        // ?tag=foo
        // ?tag=foo bar // phrase
        // ?tag=-foo // negation
        // ?tag=\-foo // literal hyphen (only for first character)
        // ?tag=foo&tag=bar // AND
        // ?tag=foo&tagType=0
        // ?tag=foo bar || bar&tagType=0
        
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'itemType',
                                 'locale',
                                 'key',
                                 'itemKey',
                                 'tag',
                                 'tagType',
                                 'style',
                                 'format'
                                 );
        //build simple api query parameters object
        if((!isset($passedParams['key'])) && $this->_apiKey){
            $passedParams['key'] = $this->_apiKey;
        }
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                if($val == 'itemKey' && isset($passedParams['target']) && ($passedParams['target'] != 'items') ) continue;
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        $queryString = '?';
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            if(is_array($value)){
                foreach($value as $key=>$val){
                    if(is_string($val) || is_int($val)){
                        $queryParamsArray[] = urlEncode($index) . '=' . urlencode($val);
                    }
                }
            }
            elseif(is_string($value) || is_int($value)){
                $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
            }
        }
        $queryString .= implode('&', $queryParamsArray);
        //print "apiQueryString: " . $queryString . "\n";
        return $queryString;
    }
    
    /**
     * parse a query string and separate into parameters
     * without using the php way of representing query strings
     *
     * @param string $query
     * @return array
     */
    public function parseQueryString($query){
        $params = explode('&', $query);
        $aparams = array();
        foreach($params as $val){
            $t = explode('=', $val);
            $aparams[urldecode($t[0])] = urldecode($t[1]);
        }
        return $aparams;
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function loadAllCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        do{
            $response = $this->_request($reqUrl);
            if($response->isError()){
                throw new Exception("Error fetching collections");
            }
            $body = $response->getRawBody();
            $doc = new DOMDocument();
            $doc->loadXml($body);
            $feed = new Zotero_Feed($doc);
            $this->collections->addCollectionsFromFeed($feed);
            
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        $this->collections->loaded = true;
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function loadCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching collections");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $addedCollections = $this->collections->addCollectionsFromFeed($feed);
        
        if(isset($feed->links['next'])){
            $nextUrl = $feed->links['next']['href'];
            $parsedNextUrl = parse_url($nextUrl);
            $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
            $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
        }
        else{
            $reqUrl = false;
        }
        return $addedCollections;
    }
    
    /**
     * Make a single request loading top level items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function loadItemsTop($params=array()){
        $params['targetModifier'] = 'top';
        return $this->loadItems($params);
    }
    
    /**
     * Make a single request loading item keys
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function loadItemKeys($params=array()){
        $fetchedKeys = array();
        $aparams = array_merge(array('target'=>'items', 'format'=>'keys'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug( "\n" );
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching item keys");
        }
        $body = $response->getRawBody();
        $fetchedKeys = explode("\n", $body);
        
        return $fetchedKeys;
    }
    
    /**
     * Make a single request loading items in the trash
     *
     * @param array $params list of parameters additionally filtering the request
     * @return array of fetched items
     */
    public function loadTrashedItems($params=array()){
        $fetchedItems = array();
        $aparams = array_merge(array('target'=>'trash', 'content'=>'json'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug( "\n");
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        
        return $fetchedItems;
    }
    
    /**
     * Make a single request loading a list of items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function loadItems($params = array()){
        $fetchedItems = array();
        $aparams = array_merge(array('target'=>'items', 'content'=>'json'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        libZoteroDebug( "\n" );
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        
        return $fetchedItems;
    }
    
    /**
     * Make a single request loading a list of items
     *
     * @param string $itemKey key of item to stop retrieval at
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function loadItemsAfter($itemKey, $params = array()){
        $fetchedItems = array();
        $itemKeys = $this->loadItemKeys($params);
        if($itemKey != ''){
            $index = array_search($itemKey, $itemKeys);
            if($index == false){
                return array();
            }
        }
        
        $offset = 0;
        while($offset < $index){
            if($index - $offset > 50){
                $uindex = $offset + 50;
            }
            else{
                $uindex = $index;
            }
            $itemKeysToFetch = array_slice($itemKeys, 0, $uindex);
            $offset == $uindex;
            $params['itemKey'] = implode(',', $itemKeysToFetch);
            $fetchedSet = $this->loadItems($params);
            $fetchedItems = array_merge($fetchedItems, $fetchedSet);
        }
        
        return $fetchedItems;
    }
    
    
    /**
     * Load a single item by itemKey
     *
     * @param string $itemKey
     * @return Zotero_Item
     */
    public function loadItem($itemKey){
        $aparams = array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            var_dump($response);
            throw new Exception("Error fetching items");
        }
        
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $entries = $doc->getElementsByTagName("entry");
        if(!$entries->length){
            throw new Exception("no item with specified key found");
        }
        else{
            $entry = $entries->item(0);
            $item = new Zotero_Item($entry);
            $this->items->addItem($item);
            return $item;
        }
    }
    
    /**
     * construct the url for file download of the item if it exists
     *
     * @param string $itemKey
     * @return string
     */
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
    }
    
    /**
     * Write a modified item back to the api
     *
     * @param Zotero_Item $item the modified item to be written back
     * @return Zotero_Response
     */
    public function writeUpdatedItem($item){
        if(is_string($item)){
            $itemKey = $item;
            $item = $this->items->getItem($itemKey);
        }
        $updateItemJson = json_encode($item->updateItemObject());
        $etag = $item->etag;
        
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $updateItemJson, array('If-Match'=>$etag));
        return $response;
    }
    
    /**
     * Make API request to create a new item
     *
     * @param Zotero_Item $item the newly created Zotero_Item to be added to the server
     * @return Zotero_Response
     */
    public function createItem($item){
        $createItemJson = json_encode(array('items'=>array($item->newItemObject())));;
        //libZoteroDebug( $createItemJson );die;
        $aparams = array('target'=>'items');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $createItemJson);
        return $response;
    }
    
    /**
     * Get a template for a new item of a certain type
     *
     * @param string $itemType type of item the template is for
     * @return Zotero_Item
     */
    public function getTemplateItem($itemType){
        $newItem = new Zotero_Item();
        $aparams = array('target'=>'itemTemplate', 'itemType'=>$itemType);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error with api");
        }
        $itemTemplate = json_decode($response->getRawBody(), true);
        $newItem->apiObject = $itemTemplate;
        return $newItem;
    }
    
    /**
     * Add child notes to a parent item
     *
     * @param Zotero_Item $parentItem the item the notes are to be children of
     * @param Zotero_Item|array $noteItem the note item or items
     * @return Zotero_Response
     */
    public function addNotes($parentItem, $noteItem){
        $aparams = array('target'=>'children', 'itemKey'=>$parentItem->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        if(!is_array($noteItem)){
            $noteJson = json_encode(array('items'=>array($noteItem->newItemObject())));
        }
        else{
            $notesArray = array();
            foreach($noteItem as $nitem){
                $notesArray[] = $nitem->newItemObject();
            }
            $noteJson = json_encode(array('items'=>$notesArray));
        }
        
        $response = $this->_request($reqUrl, 'POST', $noteJson);
        return $response;
    }
    
    /**
     * Create a new collection in this library
     *
     * @param string $name the name of the new item
     * @param Zotero_Item $parent the optional parent collection for the new collection
     * @return Zotero_Response
     */
    public function createCollection($name, $parent = false){
        $collection = new Zotero_Collection();
        $collection->name = $name;
        $collection->parentCollectionKey = $parent;
        $json = $collection->collectionJson();
        
        $aparams = array('target'=>'collections');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $json);
        return $response;
    }
    
    /**
     * Delete a collection from the library
     *
     * @param Zotero_Collection $collection collection object to be deleted
     * @return Zotero_Response
     */
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Add Items to a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return Zotero_Response
     */
    public function addItemsToCollection($collection, $items){
        $aparams = array('target'=>'items', 'collectionKey'=>$collection->collectionKey);
        $itemKeysString = '';
        foreach($items as $item){
            $itemKeysString .= $item->itemKey;
        }
        $itemKeysString = trim($itemKeysString);
        
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $itemKeysString);
        return $response;
    }
    
    /**
     * Remove items from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return array $removedItemKeys list of itemKeys successfully removed
     */
    public function removeItemsFromCollection($collection, $items){
        $removedItemKeys = array();
        foreach($items as $item){
            $response = $this->removeItemFromCollection($collection, $item);
            if(!$response->isError()){
                $removedItemKeys[] = $item->itemKey;
            }
        }
        return $removedItemKeys;
    }
    
    /**
     * Remove a single item from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function removeItemFromCollection($collection, $item){
        $aparams = array('target'=>'items', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Write a modified collection object back to the api
     *
     * @param Zotero_Collection $collection to modify
     * @return Zotero_Response
     */
    public function writeUpdatedCollection($collection){
        $json = $collection->collectionJson();
        
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $json, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /**
     * Permanently delete an item from the API
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$item->etag));
        return $response;
    }
    
    /**
     * Put an item in the trash
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function trashItem($item){
        $item->set('deleted', 1);
        $this->writeUpdatedItem($item);
    }
    
    /**
     * Fetch any child items of a particular item
     *
     * @param Zotero_Item $item
     * @return array $fetchedItems
     */
    public function fetchItemChildren($item){
        $aparams = array('target'=>'children', 'itemKey'=>$item->itemKey, 'content'=>'json');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        $body = $response->getRawBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $feed = new Zotero_Feed($doc);
        $this->_lastFeed = $feed;
        $fetchedItems = $this->items->addItemsFromFeed($feed);
        return $fetchedItems;
    }
    
    /**
     * Get the list of itemTypes the API knows about
     *
     * @return array $itemTypes
     */
    public function getItemTypes(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypes';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemTypes");
        }
        $itemTypes = json_decode($response->getBody(), true);
        return $itemTypes;
    }
    
    /**
     * Get the list of item Fields the API knows about
     *
     * @return array $itemFields
     */
    public function getItemFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemFields");
        }
        $itemFields = json_decode($response->getBody(), true);
        return $itemFields;
    }
    
    /**
     * Get the creatorTypes associated with an itemType
     *
     * @param string $itemType
     * @return array $creatorTypes
     */
    public function getCreatorTypes($itemType){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypeCreatorTypes?itemType=' . $itemType;
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorTypes");
        }
        $creatorTypes = json_decode($response->getBody(), true);
        return $creatorTypes;
    }
    
    /**
     * Get the creator Fields the API knows about
     *
     * @return array $creatorFields
     */
    public function getCreatorFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'creatorFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorFields");
        }
        $creatorFields = json_decode($response->getBody(), true);
        return $creatorFields;
    }
    
    /**
     * Fetch all the tags defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchAllTags($params){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        do{
            $response = $this->_request($reqUrl, 'GET');
            if($response->isError()){
                return false;
            }
            $doc = new DOMDocument();
            $doc->loadXml($response->getBody());
            $feed = new Zotero_Feed($doc);
            $entries = $doc->getElementsByTagName('entry');
            $tags = array();
            foreach($entries as $entry){
                $tag = new Zotero_Tag($entry);
                $tags[] = $tag;
            }
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->apiQueryString(array_merge(array('key'=>$this->_apiKey), $this->parseQueryString($parsedNextUrl['query']) ) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        return $tags;
    }
    
    /**
     * Make a single request for Zotero tags in this library defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchTags($params){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getMessage() . "\n" );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $feed = new Zotero_Feed($doc);
        $entries = $doc->getElementsByTagName('entry');
        $tags = array();
        foreach($entries as $entry){
            $tag = new Zotero_Tag($entry);
            $tags[] = $tag;
        }
        
        return $tags;
    }
    
    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    public function getKeyPermissions($userID=null, $key=false) {
        if($userID === null){
            $userID = $this->libraryID;
        }
        if($key == false){
            if($this->_apiKey == '') {
                false;
            }
            $key = $this->_apiKey;
        }
        
        $reqUrl = $this->apiRequestUrl(array('target'=>'key', 'apiKey'=>$key, 'userID'=>$userID));
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        $body = $response->getBody();
        $doc = new DOMDocument();
        $doc->loadXml($body);
        $keyNode = $doc->getElementsByTagName('key')->item(0);
        $keyPerms = $this->parseKey($keyNode);
        return $keyPerms;
    }
    
    /**
     * Parse a key response into an array
     *
     * @param $keyNode DOMNode from key response
     * @return array $keyPermissions
     */
    public function parseKey($keyNode){
        $key = array();
        $keyPerms = array("library"=>"0", "notes"=>"0", "write"=>"0", 'groups'=>array());
        
        $accessEls = $keyNode->getElementsByTagName('access');
        foreach($accessEls as $access){
            if($libraryAccess = $access->getAttribute("library")){
                $keyPerms['library'] = $libraryAccess;
            }
            if($notesAccess = $access->getAttribute("notes")){
                $keyPerms['notes'] = $notesAccess;
            }
            if($groupAccess = $access->getAttribute("group")){
                $groupPermission = $access->getAttribute("write") == '1' ? 'write' : 'read';
                $keyPerms['groups'][$groupAccess] = $groupPermission;
            }
            elseif($writeAccess = $access->getAttribute("write")) {
                $keyPerms['write'] = $writeAccess;
            }
            
        }
        return $keyPerms;
    }
    
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function getGroups($userID=''){
        if($userID == ''){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'userGroups', 'userID'=>$userID, 'content'=>'json');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $entries = $doc->getElementsByTagName('entry');
        $groups = array();
        foreach($entries as $entry){
            $group = new Zotero_Group($entry);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get CV for a user
     *
     * @param string $userID
     * @return array $groups
     */
    public function getCV($userID=''){
        if($userID == '' && $this->libraryType == 'user'){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'cv', 'libraryType'=>'user', 'libraryID'=>$userID);
        $reqUrl = $this->apiRequestUrl($aparams);// . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            var_dump($response);
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $sectionNodes = $doc->getElementsByTagNameNS('*', 'cvsection');
        $sections = array();
        foreach($sectionNodes as $sectionNode){
            $c = $sectionNode->nodeValue;
            $sections[] = $c;
        }
        return $sections;
    }
    
    //these functions aren't really necessary for php since serializing
    //or apc caching works fine, with only the possible loss of a curl
    //handle that will be re-initialized
    public function saveLibrary(){
        $serialized = serialize($this);
        return $serialized;
    }
    
    public static function loadLibrary($dump){
        return unserialize($dump);
    }
}

?>