<?php
namespace Zotero;

const ZOTERO_URI = 'https://api.zotero.org';
const ZOTERO_WWW_URI = 'https://www.zotero.org';
const LIBZOTERO_DEBUG = 1;
const ZOTERO_API_VERSION = 3;

 /**
  * Handle making requests for Zotero API
  *
  * @package    Zotero
  */
class Net
{
    protected $ch = null;
    public $followRedirects;
    public $userAgent = 'LibZotero-php';
    public $cacheResponses = true;
    public $cachettl = 300;
    public $cache;
    
    public function __construct()
    {
        if (extension_loaded('curl')) {
            $this->ch = curl_init();
        } else {
            throw new Exception("You need cURL");
        }
        
        $this->cache = new ApcCache();
    }
    
    /**
     * Destructor, closes cURL.
     */
    public function __destruct() {
        curl_close($this->ch);
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
    public function request($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array()) {
        if (is_array($url)){
            $url = Url::apiRequestString($url);
        }
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        if(!isset($headers['User-Agent'])){
            $headers['User-Agent'] = 'LibZotero-php';
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
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        if($this->followRedirects){
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
        if($this->cacheResponses && $umethod == 'GET'){
            $cachedResponse = $this->cache->fetch($url, $success);
            if($success){
                $responseBody = $cachedResponse['responseBody'];
                $responseInfo = $cachedResponse['responseInfo'];
                $zresponse = HttpResponse::fromString($responseBody);
                $gotCached = true;
            }
        }
        
        if(!$gotCached){
            $responseBody = curl_exec($ch);
            $responseInfo = curl_getinfo($ch);
            $zresponse = HttpResponse::fromString($responseBody);
            //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
            //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
            //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
            //until a non-redirect is read
            if($this->followRedirects){
                while($zresponse->isRedirect()){
                    $redirectedBody = $zresponse->getBody();
                    $zresponse = HttpResponse::fromString($redirectedBody);
                }
            }
            
            $saveCached = array(
                'responseBody'=>$responseBody,
                'responseInfo'=>$responseInfo,
            );
            if($this->cacheResponses && !($zresponse->isError()) ){
                $this->cache->store($url, $saveCached, $this->cachettl);
            }
        }
        $this->_lastResponse = $zresponse;
        return $zresponse;
    }
    
    public function proxyHttpRequest($url, $method='GET', $body=null, $headers=array()) {
        $endPoint = $url;
        try{
            $response = $this->request($url, $method, $body, $headers);
            if($response->getStatus() == 303){
                //this might not account for GET parameters in the first url depending on the server
                $newLocation = $response->getHeader("Location");
                $reresponse = $this->request($newLocation, $method, $body, $headers);
                return $reresponse;
            }
        }
        catch(\Exception $e){
            $r = new HttpResponse(500, array(), $e->getMessage());
            return $r;
        }
        
        return $response;
    }
    
    /**
     * Set _followRedirect, controlling whether curl automatically follows location header redirects
     * @param bool $follow automatically follow location header redirect
     */
    public function setFollow($follow){
        $this->followRedirects = $follow;
    }
    
    /**
     * set the cache time to live after initialization
     *
     * @param int $cachettl cache time to live in seconds, 0 disables
     * @return null
     */
    public function setCacheTtl($cachettl){
        if($cachettl == 0){
            $this->cacheResponses = false;
            $this->cachettl = 0;
        }
        else{
            $this->cacheResponses = true;
            $this->cachettl = $cachettl;
        }
    }
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function fetchGroups($userID='', $apiKey='', $sessionAuth=false){
        $aparams = array('target'=>'userGroups', 'userID'=>$userID, 'order'=>'title');
        if($apiKey != ''){
            if($sessionAuth){
                $aparams['session'] = $apiKey;
            } else {
                $aparams['key'] = $apiKey;
            }
        }
        $reqUrl = Url::apiRequestString($aparams);
        
        $response = $this->request($reqUrl, 'GET');
        $respArray = $response->parseResponseBody();
        $groups = array();
        foreach($respArray as $groupArray){
            $group = new Group($groupArray);
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
        $aparams = array('target'=>'groups', 'limit'=>'10', 'order'=>'dateAdded', 'sort'=>'desc', 'fq'=>'-GroupType:Private');
        $reqUrl = Url::apiRequestString($aparams);
        $response = $this->request($reqUrl, 'GET');
        $respArray = $response->parseResponseBody();
        $groups = array();
        foreach($respArray as $groupArray){
            $group = new Group($groupArray);
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
        $reqUrl = Url::apiRequestString($aparams);
        
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new \DOMDocument();
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
    
    /**
     * Get the list of itemTypes the API knows about
     *
     * @return array $itemTypes
     */
    public function getItemTypes(){
        $reqUrl = ZOTERO_URI . 'itemTypes';
        $response = $this->request($reqUrl, 'GET');
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
        $reqUrl = ZOTERO_URI . 'itemFields';
        $response = $this->request($reqUrl, 'GET');
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
        $reqUrl = ZOTERO_URI . 'itemTypeCreatorTypes?itemType=' . $itemType;
        $response = $this->request($reqUrl, 'GET');
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
        $reqUrl = ZOTERO_URI . 'creatorFields';
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorFields");
        }
        $creatorFields = json_decode($response->getBody(), true);
        return $creatorFields;
    }
    
    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    public function getKeyPermissions($userID, $key) {
        $aparams = ['target'=>'key', 'apiKey'=>$key, 'userID'=>$userID];
        $response = $this->request($aparams, 'GET');
        $keyArray = $response->parseResponseBody();
        return $keyArray;
    }
    
    public function _cacheSave(){
        
    }
    
    public function _cacheLoad(){
        
    }

    public function getLastResponse() {
        return $this->_lastResponse;
    }

}

?>