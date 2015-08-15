<?php
define('LIBZOTERO_DEBUG', 0);
define('ZOTERO_API_VERSION', 2);
function libZoteroDebug($m){
    if(LIBZOTERO_DEBUG){
        echo $m;
    }
    return;
}

/**
 * Interface to API and storage of a Zotero user or group library
 * 
 * @package libZotero
 */
class Zotero_Library
{
    const ZOTERO_URI = 'https://api.zotero.org';
    const ZOTERO_WWW_URI = 'http://www.zotero.org';
    const ZOTERO_WWW_API_URI = 'http://www.zotero.org/api';
    public $_apiKey = '';
    protected $_ch = null;
    protected $_followRedirects = true;
    public $libraryType = null;
    public $libraryID = null;
    public $libraryString = null;
    public $libraryUrlIdentifier = null;
    public $libraryBaseWebsiteUrl = null;
    public $items = null;
    public $collections = null;
    public $dirty = null;
    public $useLibraryAsContainer = true;
    public $libraryVersion = 0;
    protected $_lastResponse = null;
    protected $_lastFeed = null;
    protected $_cacheResponses = false;
    protected $_cachettl = 0;
    protected $_cachePrefix = 'libZotero';
    
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
    public function __construct($libraryType = null, $libraryID = null, $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org", $cachettl=0)
    {
        $this->_apiKey = $apiKey;
        if (!extension_loaded('curl')) {
            throw new Exception("You need cURL");
        }
        //check if APC is loaded
        if (!extension_loaded('apc') && !ini_get('apc.enabled')) {
            throw new Exception("PHP extension APC is not loaded/or enabled in php.ini");
        }
        //check if DOMDocument object is loaded
        if (!extension_loaded('xml')) {
            throw new Exception("PHP extension XML is not loaded");
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
        $this->items->owningLibrary = $this;
        $this->collections = new Zotero_Collections();
        $this->collections->owningLibrary = $this;
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
     * Set _followRedirect, controlling whether curl automatically follows location header redirects
     * @param bool $follow automatically follow location header redirect
     */
    public function setFollow($follow){
        $this->_followRedirects = $follow;
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
    public function _request($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array()) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        //disable Expect header
        $httpHeaders[] = 'Expect:';
        
        if(!empty($basicauth)){
            $passString = $basicauth['username'] . ':' . $basicauth['password'];
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
            curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        if($this->_followRedirects){
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        }
        
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
            $zresponse = libZotero_Http_Response::fromString($responseBody);
            
            //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
            //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
            //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
            //until a non-redirect is read
            if($this->_followRedirects){
                while($zresponse->isRedirect()){
                    $redirectedBody = $zresponse->getBody();
                    $zresponse = libZotero_Http_Response::fromString($redirectedBody);
                }
            }
            
            $saveCached = array(
                'responseBody'=>$responseBody,
                'responseInfo'=>$responseInfo,
            );
            if($this->_cacheResponses && !($zresponse->isError()) ){
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
     * get the last status code from last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastStatus(){
        return $this->_lastResponse->getStatus();
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
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        //special case for www based api requests until those methods are mapped for api.zotero
        if($params['target'] == 'user' || $params['target'] == 'cv'){
            $base = Zotero_Library::ZOTERO_WWW_API_URI;
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
            if($params['collectionKey'] == 'trash'){
                $url .= '/items/trash';
                return $url;
            }
            else{
                $url .= '/collections/' . $params['collectionKey'];
            }
        }
        
        switch($params['target']){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if(!empty($params['itemKey'])){
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
            case 'groups':
                $url = $base . '/groups';
                break;
            case 'cv':
                $url .= '/cv';
                break;
            case 'deleted':
                $url .= '/deleted';
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
                case 'fileview':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file/view';
                    break;
            }
        }
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
                                 'format',
                                 'linkMode',
                                 'linkwrap'
                                 );
        //build simple api query parameters object
        if((!isset($passedParams['key'])) && $this->_apiKey){
            $passedParams['key'] = $this->_apiKey;
        }
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                //check if itemKey belongs in the url or the querystring
                if($val == 'itemKey' && isset($passedParams['target']) && ($passedParams['target'] != 'items') ) continue;
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        $queryString = '?';
        ksort($queryParams);
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
        return $queryString;
    }
    
    public function apiRequestString($params = array(), $base = Zotero_Library::ZOTERO_URI) {
        return $this->apiRequestUrl($params) . $this->apiQueryString($params);
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
    public function fetchAllCollections($params = array()){
        return $this->collections->fetchAllCollections($params);
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        return $this->collections->fetchCollections($params);
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Zotero_Collection
     */
    public function fetchCollection($collectionKey){
        return $this->collections->fetchCollection($collectionKey);
    }
    
    /**
     * Make a single request loading top level items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemsTop($params=array()){
        $params['targetModifier'] = 'top';
        return $this->fetchItems($params);
    }
    
    /**
     * Make a single request loading item keys
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemKeys($params=array()){
        $fetchedKeys = array();
        $aparams = array_merge(array('target'=>'items', 'format'=>'keys'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching item keys");
        }
        $body = $response->getRawBody();
        $fetchedKeys = explode("\n", trim($body) );
        
        return $fetchedKeys;
    }
    
    /**
     * Make a single request loading items in the trash
     *
     * @param array $params list of parameters additionally filtering the request
     * @return array of fetched items
     */
    public function fetchTrashedItems($params=array()){
        $fetchedItems = array();
        $aparams = array_merge(array('content'=>'json'), array('key'=>$this->_apiKey), $params, array('collectionKey'=>'trash'));
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug( "\n");
        libZoteroDebug( $reqUrl . "\n" );
        //die;
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
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
    public function fetchItems($params = array()){
        $fetchedItems = array();
        $aparams = array_merge(array('target'=>'items', 'content'=>'json'), array('key'=>$this->_apiKey), $params);
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug( $reqUrl . "\n" );
        
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
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
    public function fetchItemsAfter($itemKey, $params = array()){
        $fetchedItems = array();
        $itemKeys = $this->fetchItemKeys($params);
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
            $fetchedSet = $this->fetchItems($params);
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
    public function fetchItem($itemKey, $params=array()){
        $aparams = array_merge(array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey), $params);
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null) return false;
        $item = new Zotero_Item($entry, $this);
        $this->items->addItem($item);
        return $item;
    }
    
    /**
     * Load a single item bib by itemKey
     *
     * @param string $itemKey
     * @return Zotero_Item
     */
    public function fetchItemBib($itemKey, $style){
        //TODO:parse correctly and return just bib
        $aparams = array('target'=>'item', 'content'=>'bib', 'itemKey'=>$itemKey);
        if($style){
            $aparams['style'] = $style;
        }
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null) return false;
        $item = new Zotero_Item($entry, $this);
        $this->items->addItem($item);
        return $item;
    }

    /**
     * construct the url for file download of the item if it exists
     *
     * @param string $itemKey
     * @return string
     */
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestString($aparams);
    }
    
    /**
     * Write a modified item back to the api
     *
     * @param Zotero_Item $item the modified item to be written back
     * @return Zotero_Response
     */
    public function writeUpdatedItem($item){
        if($item->owningLibrary == null) {
            $item->associateWithLibrary($this);
        }
        return $this->items->writeItem($item);
    }
    
    public function uploadNewAttachedFile($item, $fileContents, $fileinfo=array()){
        //get upload authorization
        $aparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestString($aparams);
        $postData = "md5={$fileinfo['md5']}&filename={$fileinfo['filename']}&filesize={$fileinfo['filesize']}&mtime={$fileinfo['mtime']}";
        //$postData = $fileinfo;
        libZoteroDebug("uploadNewAttachedFile postData: $postData");
        $headers = array('If-None-Match'=>'*');
        $response = $this->_request($reqUrl, 'POST', $postData, $headers);
        
        if($response->getStatus() == 200){
            libZoteroDebug("200 response from upload authorization ");
            $body = $response->getRawBody();
            $resObject = json_decode($body, true);
            if(!empty($resObject['exists'])){
                libZoteroDebug("File already exists ");
                return true;//api already has a copy, short-circuit with positive result
            }
            else{
                libZoteroDebug("uploading filecontents padded as specified ");
                //upload file padded with information we just got
                $uploadPostData = $resObject['prefix'] . $fileContents . $resObject['suffix'];
                libZoteroDebug($uploadPostData);
                $uploadHeaders = array('Content-Type'=>$resObject['contentType']);
                $uploadResponse = $this->_request($resObject['url'], 'POST', $uploadPostData, $uploadHeaders);
                if($uploadResponse->getStatus() == 201){
                    libZoteroDebug("got upload response 201 ");
                    //register upload
                    $ruparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->itemKey);
                    $registerReqUrl = $this->apiRequestUrl($ruparams) . $this->apiQueryString($ruparams);
                    //$registerUploadData = array('upload'=>$resObject['uploadKey']);
                    $registerUploadData = "upload=" . $resObject['uploadKey'];
                    libZoteroDebug("<br />Register Upload Data <br /><br />");
                    
                    $regUpResponse = $this->_request($registerReqUrl, 'POST', $registerUploadData, array('If-None-Match'=>'*'));
                    if($regUpResponse->getStatus() == 204){
                        libZoteroDebug("successfully registered upload ");
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
        }
        else{
            libZoteroDebug("non-200 response from upload authorization ");
            return false;
        }
    }
    
    public function createAttachmentItem($parentItem, $attachmentInfo){
        //get attachment template
        $templateItem = $this->getTemplateItem('attachment', 'imported_file');
        $templateItem->parentKey = $parentItem->itemKey;
        
        //create child item
        return $this->createItem($templateItem);
    }
    
    /**
     * Make API request to create a new item
     *
     * @param Zotero_Item $item the newly created Zotero_Item to be added to the server
     * @return Zotero_Response
     */
    public function createItem($item){
        $this->items->writeItems(array($item));
    }
    
    /**
     * Get a template for a new item of a certain type
     *
     * @param string $itemType type of item the template is for
     * @return Zotero_Item
     */
    public function getTemplateItem($itemType, $linkMode=null){
        $newItem = new Zotero_Item(null, $this);
        $aparams = array('target'=>'itemTemplate', 'itemType'=>$itemType);
        if($linkMode){
            $aparams['linkMode'] = $linkMode;
        }
        
        $reqUrl = $this->apiRequestString($aparams);
        libZoteroDebug($reqUrl);
        $response = $this->_request($reqUrl);
        if($response->isError()){
            throw new Exception("API error retrieving item template - {$response->getStatus()} : {$response->getRawBody()}");
        }
        libZoteroDebug($response->getRawBody());
        $itemTemplate = json_decode($response->getRawBody(), true);
        $newItem->initItemFromTemplate($itemTemplate);
        return $newItem;
    }
    
    /**
     * Add child notes to a parent item
     *
     * @param Zotero_Item $parentItem the item the notes are to be children of
     * @param Zotero_Item|array $noteItem the note item or items
     * @return array of Zotero_Item
     */
    public function addNotes($parentItem, $noteItem){
        $aparams = array('target'=>'items');
        $reqUrl = $this->apiRequestString($aparams);
        $noteWriteItems = array();
        if(!is_array($noteItem)){
            if(get_class($noteItem) == "Zotero_Item"){
                $noteWriteItems[] = $noteItem;
            }
            else {
                throw new Exception("Unexpected note item type");
            }
        }
        else{
            foreach($noteItem as $nitem){
                $noteWriteItems[] = $nitem;
            }
        }
        
        //set parentItem for all notes
        $parentItemKey = $parentItem->get("itemKey");
        foreach($noteWriteItems as $nitem){
            $nitem->set("parentItem", $parentItemKey);
        }
        return $this->items->writeItems($noteWriteItems);
    }
    
    /**
     * Create a new collection in this library
     *
     * @param string $name the name of the new item
     * @param Zotero_Item $parent the optional parent collection for the new collection
     * @return Zotero_Response
     */
    public function createCollection($name, $parent = false){
        $collection = new Zotero_Collection(null, $this);
        $collection->set('name', $name);
        $collection->set('parentCollectionKey', $parent);
        return $this->collections->writeCollection($collection);
    }
    
    /**
     * Delete a collection from the library
     *
     * @param Zotero_Collection $collection collection object to be deleted
     * @return Zotero_Response
     */
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$collection->get('collectionVersion')));
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
        foreach($items as $item){
            $item->addToCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove items from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param array $items
     * @return array $removedItemKeys list of itemKeys successfully removed
     */
    public function removeItemsFromCollection($collection, $items){
        foreach($items as $item){
            $item->removeFromCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove a single item from a collection
     *
     * @param Zotero_Collection $collection to add items to
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function removeItemFromCollection($collection, $item){
        $item->removeFromCollection($collection);
        return $this->items->writeItems(array($item));
    }
    
    /**
     * Write a modified collection object back to the api
     *
     * @param Zotero_Collection $collection to modify
     * @return Zotero_Response
     */
    public function writeUpdatedCollection($collection){
        return $this->collections->writeUpdatedCollection($collection);
    }
    
    /**
     * Permanently delete an item from the API
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function deleteItem($item){
        $this->items->deleteItem($item);
    }
    
    public function deleteItems($items, $version=null){
        $this->items->deleteItems($items, $version);
    }
    
    /**
     * Put an item in the trash
     *
     * @param Zotero_Item $item
     * @return Zotero_Response
     */
    public function trashItem($item){
        return $item->trashItem();
    }
    
    /**
     * Fetch any child items of a particular item
     *
     * @param Zotero_Item $item
     * @return array $fetchedItems
     */
    public function fetchItemChildren($item){
        if(is_string($item)){
            $itemKey = $item;
        }
        else {
            $itemKey = $item->itemKey;
        }
        $aparams = array('target'=>'children', 'itemKey'=>$itemKey, 'content'=>'json');
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
        
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
        $reqUrl = $this->apiRequestString($aparams);
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
    public function fetchTags($params = array()){
        $aparams = array_merge(array('target'=>'tags', 'content'=>'json', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getMessage() . "\n" );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
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
        return Zotero_Lib_Utils::parseKey($keyNode);
    }
    
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function fetchGroups($userID=''){
        if($userID == ''){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'userGroups', 'userID'=>$userID, 'content'=>'json', 'order'=>'title');
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            libZoteroDebug( $response->getStatus() );
            libZoteroDebug( $response->getBody() );
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
        $groups = array();
        foreach($entries as $entry){
            $group = new Zotero_Group($entry);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get recently created public groups
     *
     * @return array $groups
     */
    public function fetchRecentGroups(){
        return array();
        $aparams = array('target'=>'groups', 'limit'=>'10', 'content'=>'json', 'order'=>'dateAdded', 'sort'=>'desc', 'fq'=>'-GroupType:Private');
        $reqUrl = $this->apiRequestString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $entries = Zotero_Lib_Utils::getEntryNodes($response->getRawBody());
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
        $aparams = array('target'=>'cv', 'libraryType'=>'user', 'libraryID'=>$userID, 'linkwrap'=>'1');
        $reqUrl = $this->apiRequestString($aparams);
        
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new DOMDocument();
        $doc->loadXml($response->getBody());
        $sectionNodes = $doc->getElementsByTagNameNS('*', 'cvsection');
        $sections = array();
        foreach($sectionNodes as $sectionNode){
            $sectionTitle = $sectionNode->getAttribute('title');
            $c = $doc->saveHTML($sectionNode);// $sectionNode->nodeValue;
            $sections[] = array('title'=> $sectionTitle, 'content'=>$c);
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