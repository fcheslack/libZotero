<?php
const LIBZOTERO_DEBUG = 0;
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
    
    public function __construct($libraryType = null, $libraryID = null, $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org")
    {
        $this->_apiKey = $apiKey;
        if (extension_loaded('curl')) {
            $this->_ch = curl_init();
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
    }
    
    /**
     * Destructor, closes cURL.
     */
    public function __destruct() {
        curl_close($this->_ch);
    }
    
    public function _request($url, $method="GET", $body=NULL, $headers=array()) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $httpHeaders = array();
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        $ch = $this->_ch;
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
        $this->lastResponse = $zresponse;
        return $zresponse;
    }
    
    public function getLastResponse(){
        return $this->_lastResponse;
    }
    
    public function getLastFeed(){
        return $this->_lastFeed;
    }
    
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring .= $libraryID;
        return $lstring;
    }
    
    /*
     * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
     */
    public function apiRequestUrl($params = array(), $base = Zotero_Library::ZOTERO_URI) {
        //var_dump($params);
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        $url = $base . '/' . $this->libraryType . 's/' . $this->libraryID;
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
    
    // Tags query formats
    //
    // ?tag=foo
    // ?tag=foo bar // phrase
    // ?tag=-foo // negation
    // ?tag=\-foo // literal hyphen (only for first character)
    // ?tag=foo&tag=bar // AND
    // ?tag=foo&tagType=0
    // ?tag=foo bar || bar&tagType=0
    public function apiQueryString($passedParams=array()){
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
    
    public function parseQueryString($query){
        $params = explode('&', $query);
        $aparams = array();
        foreach($params as $val){
            $t = explode('=', $val);
            $aparams[urldecode($t[0])] = urldecode($t[1]);
        }
        return $aparams;
    }
    
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
            $entries = $doc->getElementsByTagName("entry");
            foreach($entries as $entry){
                $collection = new Zotero_Collection($entry);
                $this->collections->addCollection($collection);
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
        
        $this->collections->loaded = true;
    }
    
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
        $entries = $doc->getElementsByTagName("entry");
        foreach($entries as $entry){
            $collection = new Zotero_Collection($entry);
            $this->collections->addCollection($collection);
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
    }
    
    public function loadItemsTop($params=array()){
        $params['targetModifier'] = 'top';
        return $this->loadItems($params);
    }
    
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
        $entries = $doc->getElementsByTagName("entry");
        foreach($entries as $entry){
            $item = new Zotero_Item($entry);
            $this->items->addItem($item);
            $fetchedItems[] = $item;
        }
        return $fetchedItems;
    }
    
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
        $entries = $doc->getElementsByTagName("entry");
        foreach($entries as $entry){
            $item = new Zotero_Item($entry);
            $this->items->addItem($item);
            $fetchedItems[] = $item;
        }
        $this->_lastFeed = $feed;
        return $fetchedItems;
    }
    
    public function loadItem($itemKey){
        $aparams = array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        
        $response = $this->_request($reqUrl);
        if($response->isError()){
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
    
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
    }
    
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
    
    public function createItem($item){
        $createItemJson = json_encode(array('items'=>array($item->newItemObject())));;
        //libZoteroDebug( $createItemJson );die;
        $aparams = array('target'=>'items');
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'POST', $createItemJson);
        return $response;
    }
    
    public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$item->etag));
        return $response;
    }
    
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
    
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
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
    
    public function removeItemFromCollection($collection, $item){
        $aparams = array('target'=>'items', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    public function writeUpdatedCollection($collection){
        $json = $collection->collectionJson();
        
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $json, array('If-Match'=>$collection->etag));
        return $response;
    }
    
    /*public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$item->etag));
        return $response;
    }*/
    
    public function trashItem($item){
        $item->set('deleted', 1);
        $this->writeUpdatedItem($item);
        /*
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'DELETE', null, array('If-Match'=>$item->etag));
        return $response;
        */
    }
    
    public function fetchItemChildren($item){
        $aparams = array('target'=>'children', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'GET');
        return $response;
    }
    
    public function getItemTypes(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypes';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemTypes");
        }
        $itemTypes = json_decode($response->getBody(), true);
        return $itemTypes;
    }
    
    public function getItemFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemFields");
        }
        $itemFields = json_decode($response->getBody(), true);
        return $itemFields;
    }
    
    public function getCreatorTypes($itemType){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'itemTypeCreatorTypes?itemType=' . $itemType;
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorTypes");
        }
        $creatorTypes = json_decode($response->getBody(), true);
        return $creatorTypes;
    }
    
    public function getCreatorFields(){
        $reqUrl = Zotero_Library::ZOTERO_URI . 'creatorFields';
        $response = $this->_request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorFields");
        }
        $creatorFields = json_decode($response->getBody(), true);
        return $creatorFields;
    }
    
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
    
    public function getAccessibleGroups($userID=''){
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
    
}

?>