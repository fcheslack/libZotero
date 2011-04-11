<?php
/**
 * Zotero WWW
 *
 * LICENSE: This source file is subject to the ECL license that is bundled with this
 * package in the file LICENSE.txt. It is also available through the
 * world-wide-web at this URL: http://www.opensource.org/licenses/ecl1.php
 *
 * @category  Zotero_WWW
 * @package   Zotero_WWW_Library
 * @copyright Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
 * @license   http://www.opensource.org/licenses/ecl1.php    ECL License
 * @version   $Id$
 * @since     0.0
 */
 
/**
 * @see Zend_Rest_Client
 */
require_once 'Zend/Rest/Client.php';

/**
 * @see Zend_Rest_Client_Result
 */
require_once 'Zend/Rest/Client/Result.php';

/**
 * @see Zotero_Service_Zotero_Item
 */
require_once 'Zotero/Service/Zotero/Item.php';

 /**
  * An interface to Zotero API services
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zend_Service_Abstract
  */
class Zotero_Service_Zotero extends Zend_Service_Abstract
{

    /**
     * @var string
     */
    protected $_apiKey = null;

    /**
     * @var string
     */
    protected $_sharedSecret = null;

    /**
     * @var boolean
     */
    protected $_httpAuth = null;
    
    /**
     * @var string
     */
    protected $_baseUri = null;
    
    /**
     * @var Zotero_Service_Zotero_Feed
     */
    public $feed = null;
        
    /**
     * Constructor
     *
     * @return void
     */
    public function __construct($apiKey, $sharedSecret, $httpAuth = false, $baseUri = null)
    {
        // Set key and secret. With HTTP Auth, this will be a username and pass
        $this->_apiKey = $apiKey;
        $this->_sharedSecret = $sharedSecret;
        
        // Set base url. Default to https://api.zotero.org.
        if($baseUri) {
            $this->_baseUri = $baseUri;
        } elseif(Zend_Registry::get('config')->apiBaseUri) {
            $this->_baseUri = Zend_Registry::get('config')->apiBaseUri;
        } else {
            Zend_Registry::get('logger')->warn($e = new Zend_Exception('Zotero Service base uri is undefined'));
            throw $e;
        }
        
        // Setup authentication scheme
        $this->_httpAuth = $httpAuth;
        
        // Setup our HTTP client and add some default headers
        if(Zend_Registry::get('config')->environment == 'dev'){
            $curlVerifyPeer = false;
            $curlVerifyHost = 0;
        }
        else{
            $curlVerifyPeer = true;
            $curlVerifyHost = 2;
        }
        $adapter = new Zend_Http_Client_Adapter_Curl();
        $client = new Zend_Http_Client();
        $client->setAdapter($adapter);
        $adapter->setConfig(array(
            'curloptions' => array(
                CURLOPT_TIMEOUT => 15,
                CURLOPT_SSL_VERIFYPEER => $curlVerifyPeer,
                CURLOPT_SSL_VERIFYHOST => $curlVerifyHost,
            )));
        $this->setHttpClient($client);
        $this->getHttpClient()->setHeaders('Accept-Charset', 'utf-8');
    }

    /**
     * Get api key
     *
     * @return string
     */
    public function getApiKey()
    {
        return $this->_apiKey;
    }

    /**
     * Set api key
     *
     * @param  string $value
     * @return Zotero_Service_Zotero
     */
    public function setApiKey($value)
    {
        $this->_apiKey = $value;
        return $this;
    }

    /**
     * Get shared secret
     *
     * @return string
     */
    public function getSharedSecret()
    {
        return $this->_sharedSecret;
    }

    /**
     * Set shared secret
     *
     * @param  string $value
     * @return Zotero_Service_Zotero
     */
    public function setSharedSecret($value)
    {
        $this->_sharedSecret = $value;
        return $this;
    }
    
    /**
     * Get httpAuth flag
     *
     * @return boolean
     */
    public function getHttpAuth()
    {
        return $this->_httpAuth;
    }

    /**
     * Set httpAuth flag
     *
     * @param  boolean $value
     * @return Zotero_Service_Zotero
     */
    public function setHttpAuth($value)
    {
        $this->_httpAuth = $value;
        return $this;
    }
    
    /**
     * Get base uri
     *
     * @return string
     */
    public function getBaseUri()
    {
        return $this->_baseUri;
    }

    /**
     * Set base uri
     *
     * @param  string $value
     * @return Zotero_Service_Zotero
     */
    public function setBaseUri($value)
    {
        $this->_baseUri = $value;
        return $this;
    }
    
    /**
     * Add authentication credentials to request
     *
     * @param string $endPoint 
     * @param string $httpMethod 
     * @param array $params 
     * @return void
     */
    public function signRequest($endPoint, $httpMethod, $params)
    {   
        if($this->_httpAuth){
            // For http authentication, configure the http client with a username and password.
            $this->getHttpClient()->setAuth($this->_apiKey, $this->_sharedSecret);
        } else {
            //use api key for request instead of oauth. oauth only recommended for handshake to get apikey
            if($this->_apiKey){
                $this->getHttpClient()->setParameterGet(array('key'=>$this->_apiKey));
            }
            // For OAuth authentication, generate an OAuth Authorization header and add it to the request.
            /*
            $consumer = new OAuthConsumer($this->_apiKey, $this->_sharedSecret);
            $request  = OAuthRequest::from_consumer_and_token($consumer, NULL, $httpMethod, $endPoint, $params);
            $request->sign_request(new OAuthSignatureMethod_HMAC_SHA1(), $consumer, NULL);
            $this->getHttpClient()->setHeaders($request->to_header());
            */
        }        
    }
    
    /**
     * Parses an api response and creates a data structure in $this->feed
     *
     * @param array() $responses set of one or more DOMDocuments
     * @param string $entryType Should be one of: "Item", "Collection", "User", "Group", "Tag"
     * @return array An array of zotero item objects
     */
    public function parseResponse($responses, $entryType, $nest = true)
    {
        $items = array();
        
        // Parse the xml in the response and create a new feed object
        $this->feed = new Zotero_Service_Zotero_Feed($responses[0]);
        
        foreach($responses as $doc){
            // Make a new entry object for each entry
            foreach($doc->getElementsByTagName("entry") as $entryNode){
                switch ($entryType) {
                    case 'items':       $entry = new Zotero_Service_Zotero_Item($entryNode); break;
                    case 'collections': $entry = new Zotero_Service_Zotero_Collection($entryNode); break;
                    case 'groups':      $entry = new Zotero_Service_Zotero_Group($entryNode); break;
                    case 'users':       $entry = new Zotero_Service_Zotero_User($entryNode); break;
                    case 'tags':        $entry = new Zotero_Service_Zotero_Tag($entryNode); break;
                    default:            echo $entryType; die; throw new Zend_Exception("Unknown entry type");
                }
                $entry->title       = $entryNode->getElementsByTagName("title")->item(0)->nodeValue;
                $entry->id          = $entryNode->getElementsByTagName("id")->item(0)->nodeValue;
                $entry->dateAdded   = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
                $entry->dateUpdated = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
                
                // Get all of the link elements
                foreach($entryNode->getElementsByTagName("link") as $linkNode){
                    if($linkNode->getAttribute('rel') == "enclosure"){
                        $entry->links[$linkNode->getAttribute('rel')][$linkNode->getAttribute('type')] = array(
                                                    'href'=>$linkNode->getAttribute('href'), 
                                                    'title'=>$linkNode->getAttribute('title'), 
                                                    'length'=>$linkNode->getAttribute('length'));
                    }
                    else{
                        $entry->links[$linkNode->getAttribute('rel')][$linkNode->getAttribute('type')] = $linkNode->getAttribute('href');
                    }
                }
                
                $this->feed->entries[] = $entry;
            }
        }
        
        // Look for item and collection entries with rel="up" links and move them under their parent entry
        if($nest && ($entryType == "collections" || $entryType == "items")){
            foreach($this->feed->entries as $key => $entry){
                if(isset($entry->links['up']['application/atom+xml'])){                    
                    // This flag will be set to true if a parent is found
                    $this->foundParent = false;
                    // Search for a parent
                    $this->nestEntry($entry, $this->feed->entries);
                    // If we found a parent to nest under, remove the entry from the top level
                    if($this->foundParent == true){
                        unset($this->feed->entries[$key]);
                    }
                }
            }            
        }
    }
    
    public function get_param_dupes(&$uri, &$params){
        $query = explode('?', $uri);
        $uri = $query[0];
        $query = isset($query[1]) ? $query[1] : '';
        
        foreach($params as $key=>$val){
            if(is_array($val)){
                foreach($val as $vval){
                    if (! empty($query)) {
                       $query .= '&';
                    }
                    $query .= urlencode($key) . '=' . urlencode($vval);
                }
                unset($params[$key]);
            }
        }
        
        $uri .= '?' . $query;
        return;
    }
    
    /**
     * Fetches an array of items belonging to a given user
     *
     * @param string $uri The resource location, e.g. "/users/123/items"
     * @param array $params 
     * @return array
     */
    public function get($uri, $params = array(), $nest = true, $ifModifiedSince = null, $raw = false, $objectType = '')
    {
        set_time_limit(20);
        $starttime = microtime(true);
        $ouri = $uri;
        if(!$raw){
            $this->get_param_dupes($uri, $params);
            $endPoint = $this->_baseUri . $uri;
        }
        else{
            $endPoint = $uri;
        }
        Zend_Registry::get('firelog')->log('GET ' . print_r($endPoint, true), Zend_Log::INFO);
        Zend_Registry::get('firelog')->log('params ' . print_r($params, true), Zend_Log::INFO);
        
        //set up any required headers
        $headers = array();
        if($ifModifiedSince){
            $headers['If-Modified-Since'] = $ifModifiedSince;
        }
        else{
            $headers['If-Modified-Since'] = '';
        }
        
        $apiLimit = 100;
        //if more than apiLimit results requested, batch requests in sets of apiLimit each
        if(!isset($params['limit'])){
            $limitArg = PHP_INT_MAX;
            $params['limit'] = $apiLimit;
        }
        elseif($params['limit'] > $apiLimit){
            $limitArg        = $params['limit'];
            $params['limit'] = $apiLimit;
        }
        else {
            $limitArg = $params['limit'];
        }
        
        // make api requests keeping track of how many results we have and need
        $startArg        = isset($params['start']) ? $params['start'] : 0;
        $resultsReceived = 0;
        
        $requestLimit = 5;
        $requestsMade = 0;
        do{
            // Make the request
            $this->getHttpClient()->resetParameters();
            try{
            $this->signRequest($endPoint, "GET", $params);
            $response = $this->getHttpClient()
                             ->setUri($endPoint)
                             ->setParameterGet($params)
                             ->setHeaders($headers)
                             ->request("GET");
            }
            catch(Zend_Http_Client_Exception $e){
                Zotero_Utils::zoteroLog($e, Zend_Log::WARN);
                Zotero_Utils::zoteroLog("ApiReqTimeout: $endPoint", Zend_Log::WARN);
                return false;
            }
            catch(Exception $e){
                Zotero_Utils::zoteroLog($e, Zend_Log::WARN);
                Zotero_Utils::zoteroLog("Non-httpClientException with Api request: $endPoint", Zend_Log::WARN);
                return false;
            }
            if((!($response instanceof Zend_Http_Response)) || 
                  $response->isError() || 
                  ($response->getStatus() == 304) || 
                  ($response->getStatus() == 302))
            {
                //Zend_Registry::get('firelog')->log('Request took: ' . (microtime(true) - $starttime), Zend_Log::INFO);
                //Zend_Registry::get('firelog')->log("not modified?:**" . $response->getBody() . '**' . $response->getStatus() , Zend_Log::INFO);
                return $response;
            }
            elseif($response->getBody() == ''){
                return false;
            }
            //Zend_Registry::get('firelog')->log('modified' . $response->getStatus() , Zend_Log::INFO);
            
            //Zend_Registry::get('firelog')->log(print_r($response->getBody(), true), Zend_Log::INFO);
            //parse enough to know how many responses we have and how many more there are
            if($raw){
                return $response;
            }
            $doc = new DOMDocument();
            try{
                $loaded = $doc->loadXML($response->getBody());
                if($loaded === false){
                    throw new Exception("unexpected response body could not be read by DOMDocument XML " . $response->getBody());
                }
                $responses[] = $doc;
            }
            catch(Exception $e){
                Zotero_Utils::zoteroLog($e, Zend_Log::WARN);
                Zotero_Utils::zoteroLog("Non-httpClientException with Api request: $endPoint", Zend_Log::WARN);
                return false;
            }
            $curLastModifiedString = $response->getHeader('Last-Modified');
            $curLastModifiedDate = date_create($curLastModifiedString);
            if(empty($lastModifiedDate) || $lastModifiedDate < $curLastModifiedDate) {
                $lastModifiedDate = $curLastModifiedDate;
                $lastModifiedString = $curLastModifiedString;
            }
            //Zend_Registry::get('firelog')->log('lastModified:' . $lastModifiedString , Zend_Log::INFO);
            
            // break if response was a single entry and has no totalResults
            if($doc->getElementsByTagName("feed")->length < 1) break;
            
            $totalResults    = $doc->getElementsByTagName("totalResults")->item(0)->nodeValue;
            if($totalResults > 500 && $limitArg > 500){ return false;}
            $resultsReceived += $doc->getElementsByTagName("entry")->length;
            $params['start'] = $startArg + $resultsReceived;
            
            //check if we're near the end of our requests
            if($totalResults <= $params['start']) break;
            if($limitArg - $resultsReceived < $apiLimit) $params['limit'] = $limitArg - $resultsReceived;
            $requestsMade++;
        }while( ($requestsMade < $requestLimit) && 
            ($resultsReceived < (int)$limitArg) && 
            ($resultsReceived < (int)$totalResults));
        
        
        // Extract the type of object we're expecting (item, collection, tag, user, or group)
        //echo "objectType: $objectType";
        if($objectType == ''){
            preg_match('#/(items|collections|groups|tags|users)([/0-9]+)*(/top|/children)*$#', $ouri, $matches);
            $objectType = $matches[1];
        }
        $this->parseResponse($responses, $objectType, $nest);
        
        $this->feed->lastModified = $lastModifiedString;
        
        //Zend_Registry::get('firelog')->log('Request took: ' . (microtime(true) - $starttime), Zend_Log::INFO);
        return $this->feed;
    }
    
    public function getHttpResponse($uri, $params = array(), $excludeBaseUri = false)
    {
        if($excludeBaseUri){
            $endPoint = $uri;
        }
        else{
            $endPoint = $this->_baseUri . $uri;
        }
        $this->getHttpClient()->setConfig(array('maxredirects'=>0));
        $headers = array();
        // Make the request
        $this->signRequest($endPoint, "GET", $params);
        $this->getHttpClient()->resetParameters();
        $response = $this->getHttpClient()
                         ->setUri($endPoint)
                         ->setParameterGet($params)
                         ->setHeaders($headers)
                         ->request("GET");
        
        //$this->getHttpClient()->setConfig(array('maxredirects'=>5));
        return $response;
    }

    public function proxyHttpRequest($uri, $params = array(), $headers = array(), $method = 'GET', $rawdata = false)
    {
        $endPoint = $uri;
        //$this->getHttpClient()->resetParameters();
        
        $this->getHttpClient()->setConfig(array('maxredirects'=>1));
        // Make the request
        $this->signRequest($endPoint, $method, $params);
        $client = $this->getHttpClient()
                         ->setUri($endPoint)
                         ->setParameterGet($params)
                         ->setHeaders($headers);
        
        //Zotero_Utils::zoteroLog("proxyHttpRequest params:" . print_r($params, true) . " method: $method apiKey: {$this->_apiKey} httpAuth : {$this->_httpAuth}", Zend_Log::WARN);
        
        if($rawdata){
            $client->setRawData($rawdata);
        }
        try{
            $response = $client->request($method);
            if($response->getStatus() == 303){
                $newLocation = $response->getHeader("Location");
                $redirectResponse = $client = $this->getHttpClient()
                             ->setUri($newLocation)
                             ->request('GET');
                return $redirectResponse;
            }
        }
        catch(Exception $e){
            $r = new Zend_Http_Response(500, array(), $e->getMessage());
            return $r;
        }
        //Zend_Registry::get('firelog')->log('GET ' . print_r($endPoint, true), Zend_Log::INFO);
        //Zend_Registry::get('firelog')->log('params ' . print_r($params, true), Zend_Log::INFO);
        //Zend_Registry::get('firelog')->log('key ' . $this->_apiKey, Zend_Log::INFO);
        //echo $client->getLastRequest();die;
        return $response;
    }
    
    /**
     * Nests an entry into it's parent entry
     *
     * Recursive depth-first search for the parent of a given entry. When the parent is found, 
     * the entry is added to the entries array of the parent object. The flag $this->foundParent
     * is set to true if a parent to nest under is found
     *
     * @param Zotero_Service_Zotero_Entry $entry And entry looking for its parent
     * @param array $entrySet An array of entry objects to search 
     * @return void
     */
    public function nestEntry(&$entry, $entrySet)
    {
        foreach($entrySet as $possibleParent){
            if(count($possibleParent->entries) > 0){
                $this->nestEntry($entry, $possibleParent->entries);
            }
            if($possibleParent->links['self']['application/atom+xml'] == $entry->links['up']['application/atom+xml']){
                $possibleParent->entries[] = $entry;
                $this->foundParent = true;
            }
        }
    }
    
    public function post($uri, $postdata)
    {
        //Zend_Registry::get('firelog')->log("POST", Zend_Log::INFO);
        //Zend_Registry::get('firelog')->log(print_r($uri, true), Zend_Log::INFO);
        //Zend_Registry::get('firelog')->log(print_r($postdata, true), Zend_Log::INFO);
        $this->getHttpClient()->resetParameters();
        
        $endPoint = $this->_baseUri . $uri;
        
        $this->signRequest($endPoint, "POST", array());
        
        $response = $this->getHttpClient()
                         ->setUri($endPoint)
                         ->setRawData($postdata)
                         ->request("POST");
        //if($response->getStatus() != 201) throw new Zend_Exception("Error creating group");
        
        //parse enough to know how many responses we have and how many more there are
        $doc = new DOMDocument();
        if(@$doc->loadXML($response->getBody())){
            $responses[] = $doc;
            
            // Extract the type of object we're expecting (item, collection, tag, user, or group)
            preg_match('#/(items|collections|groups|tags|users)([/0-9]+)*(/top|/children)*$#', $uri, $matches);
            $objectType = $matches[1];
            
            $this->parseResponse($responses, $objectType);
            
            return $this->feed;
        }
        else {
            return $response;
        }
    }
    
    public function delete($uri)
    {
        //Zend_Registry::get('firelog')->log("DELETE", Zend_Log::INFO);
        //Zend_Registry::get('firelog')->log(microtime() . print_r($uri, true), Zend_Log::INFO);
        $this->getHttpClient()->resetParameters();
        
        $endPoint = $this->_baseUri . $uri;
        
        $this->signRequest($endPoint, "DELETE", array());
        
        $response = $this->getHttpClient()->setUri($endPoint)->request("DELETE");
        
        if($response->getStatus() == 204) return true;
        else{
            return $response;
        }
    }
    
    public function put($uri, $putdata, $ifUnmodSince = null, $etag = null)
    {
        Zend_Registry::get('firelog')->log('PUT ' . print_r($uri, true), Zend_Log::INFO);
        Zend_Registry::get('firelog')->log(print_r($putdata, true), Zend_Log::INFO);
        Zend_Registry::get('firelog')->log("etag: " . $etag, Zend_Log::INFO);
        
        $this->getHttpClient()->resetParameters();
        
        $endPoint = $this->_baseUri . $uri;
        $params = array();
        
        //set necessary headers
        $headers = array();
        if($ifUnmodSince){
            $headers['If-Unmodified-Since'] = $ifUnmodSince;
        }
        if($etag){
            $headers['If-Match'] = $etag;
            $params['skipetag'] = 1;
        }
        
        $this->getHttpClient()
             ->setUri($endPoint)
             ->setParameterGet($params)
             ->setRawData($putdata)
             ->setHeaders($headers);
        $this->signRequest($endPoint, "PUT", array());
        
        $response = $this->getHttpClient()->request("PUT");
        
        $doc = new DOMDocument();
        if(@$doc->loadXML($response->getBody())){
            $responses[] = $doc;
            
            // Extract the type of object we're expecting (item, collection, tag, user, or group)
            preg_match('#/(items|collections|groups|tags|users)(/[0-9A-Z]+)*(/top|/children)*$#', $uri, $matches);
            $objectType = $matches[1];
            
            $this->parseResponse($responses, $objectType);
            
            return $this->feed;
        }
        else {
            return $response;
        }
    }
    
    public function httpToControllerResponse($httpResponse, $controllerResponse){
        $httpHeaders = $httpResponse->getHeaders();
        foreach($httpHeaders as $key=>$val){
            $controllerResponse->setHeader($key, $val);
        }
        //$controllerResponse->setHeader('Content-Type', $httpResponse->getHeader('Content-Type'));
        //if($httpResponse->getHeader('Location')){
        //    $controllerResponse->setHeader('Location', $httpResponse->getHeader('Location'));
        //}
        //$controllerResponse->setHeader('Content-Type', 'application/atom+xml');
        $controllerResponse->setHttpResponseCode($httpResponse->getStatus());
        $controllerResponse->appendBody($httpResponse->getRawBody());
        return $controllerResponse;
    }
}


