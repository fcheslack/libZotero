<?php
require_once "Feed.php";
require_once "Collections.php";
require_once "Items.php";
require_once "Response.php";
require_once "Item.php";

class Zotero_Library
{
    const ZOTERO_URI = 'https://api.zotero.org/';
    protected $_apiKey;
    protected $_ch;
    public $libraryType;
    public $libraryID;
    public $libraryString;
    public $libraryUrlIdentifier;
    public $libraryBaseWebsiteUrl;
    public $items;
    public $collections;
    
    public $dirty;
    
    
    public function __construct($libraryType, $libraryID, $libraryUrlIdentifier, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org")
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
    
    /**
     * Returns a URL with cURL.
     *
     * @param string The URL.
     * @param string The POST body. If no POST body, then performs a GET.
     */
    protected function _httpRequest($url, $postBody=NULL) {
        $ch = $this->_ch;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); //added for running locally on MAMP
        curl_setopt($ch, CURLOPT_POST, 0);
        if (!is_null($postBody)) {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postBody);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        }
        $xml = curl_exec($ch);
        return $xml;
    }
    
    public function _request($url, $method="GET", $body=NULL, $headers=array()) {
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
        $zresponse = Zend_Http_Response::fromString($responseBody);
        return $zresponse;
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
    public function apiRequestUrl($params, $base = Zotero_Library::ZOTERO_URI) {
        var_dump($params);
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        $url = $base . '/' . $this->libraryType . 's/' . $this->libraryID;
        if(isset($params['collectionKey'])){
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
                /*
                if($params->collectionKey){
                    url += '/collections/' + $params->collectionKey;
                }
                else{
                    url += '/collections';
                }
                */
            case 'tags':
                $url .= '/tags';
                break;
            case 'children':
                $url .= '/items/' . $params['itemKey'] . '/children';
                break;
            case 'itemTemplate':
                $url = $base . '/items/new';
                break;
            default:
                return false;
        }
        if(isset($params['targetModifier'])){
            switch($params['targetModifier']){
                case 'top':
                    $url .= '/top';
                    break;
            }
        }
        print "apiRequestUrl: " . $url . "\n";
        return $url;
    }

    public function apiQueryString($passedParams){
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'fq',
                                 'itemType',
                                 'locale',
                                 'key'
                                 );
        //build simple api query parameters object
        if((!isset($passedParams['key'])) && $this->_apiKey){
            $passedParams['key'] = $this->_apiKey;
        }
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        //deal with tags specially
        if(isset($passedParams['tag'])){
            if(is_string($passedParams['tag'])){
                $queryParams['tag'] = $passedParams['tag'];
            }
            else{
                //TODO: implement complex tag queries
            }
        }
        
        $queryString = '?';
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
        }
        $queryString .= implode('&', $queryParamsArray);
        print "apiQueryString: " . $queryString . "\n";
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
    
    public function loadAllCollections($params){
        $aparams = array_merge($params, array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey));
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        echo "\n\n";
        do{
            echo "\n\n" . $reqUrl . "\n";
            $reqUrl .= '&key=' . $this->_apiKey;
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
                $parsedNextUrl['query'] = $this->apiQueryString(array_merge($this->parseQueryString($parsedNextUrl['query']), array('key'=>$this->_apiKey) ) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
                $reqUrl = false;
            }
        } while($reqUrl);
        
        $this->collections->loaded = true;
    }
    
    public function loadCollections($params){
        $aparams = array_merge($params, array('target'=>'collections', 'content'=>'json', 'limit'=>100), array('key'=>$this->_apiKey));
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
            $parsedNextUrl['query'] = $this->apiQueryString(array_merge($this->parseQueryString($parsedNextUrl['query']), array('key'=>$this->_apiKey) ) );
            $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
        }
        else{
            $reqUrl = false;
        }
    }
    
    public function loadItems($params){
        $aparams = array_merge($params, array('target'=>'items', 'content'=>'json', 'limit'=>5), array('key'=>$this->_apiKey));
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        echo "\n";
        echo $reqUrl . "\n";
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
        }
    }
    
    public function loadItem($itemKey){
        $aparams = array('target'=>'item', 'content'=>'json', 'itemKey'=>$itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        echo "\n";
        echo $reqUrl . "\n";
        
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
    
    public function updateItem($itemKey){
        $item = $this->items->getItem($itemKey);
        $updateItemJson = $item->updateItemJson();
        $etag = $item->etag;
        
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey);
        $reqUrl = $this->apiRequestUrl($aparams) . $this->apiQueryString($aparams);
        $response = $this->_request($reqUrl, 'PUT', $updateItemJson, array('If-Match'=>$etag));
        return $response;
    }
    
    public function createItem($item){
        $createItemJson = $item->newItemJson();
        
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
}

?>