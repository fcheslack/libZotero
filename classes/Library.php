<?php
require_once "Collections.php";
require_once "Items.php";
require_once "Response.php";

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
    
    public function _request($url, $method="GET", $body=NULL) {
        $ch = $this->_ch;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
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
        var_dump($zresponse);die;
        return array("responseBody"=>$responseBody, "responseInfo"=>$responseInfo);
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
    public static function apiRequestUrl($params, $base = "https://api.zotero.org"){
        if(!$params->target) throw "No target defined for api request";
        if(!($params->libraryType == 'user' || $params->libraryType == 'group')) throw new Exception("Unexpected libraryType for api request");
        if(!($params->libraryID)) throw "No libraryID defined for api request";
        
        $base = $baseApiUrl;
        $url;
        $url = $base . '/' . $params->libraryType . 's/' . $params->libraryID;
        if($params->collectionKey){
            $url .= '/collections/' . $params->collectionKey;
        }
        
        switch($params->target){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if($params->itemKey){
                    $url .= '/items/' . $params->itemKey;
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
                $url .= '/items/' . $params->itemKey . '/children';
                break;
            default:
                return false;
        }
        switch($params->targetModifier){
            case 'top':
                $url .= '/top';
                break;
        }
        return $url;
    }

    public static function apiQueryString($passedParams){
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'fq',
                                 'itemType',
                                 'locale'
                                 );
        //build simple api query parameters object
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
            $queryParamsArray[] = urlencode(index) . '=' . urlencode(value);
        }
        $queryString .= implode('&', $queryParamsArray);
        return $queryString;
    }
    
    

}

?>