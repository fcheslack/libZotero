<?php
/**
 * @version $Id$
 * @copyright Jeremy Boggs, 2009-2011
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 * @package phpZotero
 */
 
/**
 * Primary class for using the Zotero API.
 *
 * @package phpZotero
 */
class phpZotero {    
    
    const ZOTERO_URI = 'https://api.zotero.org/';
    
    protected $_apiKey;
    protected $_ch;
    
    /**
     * Constructor for the phpZotero object.
     *
     * @param string The private Zotero API key.
     */
    public function __construct($apiKey) {
       $this->_apiKey = $apiKey;
       if (function_exists('curl_init')) {
           $this->_ch = curl_init();
       } else {
           throw new Exception("You need cURL");
       }
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
     */
    protected function _httpRequest($url) {
        $ch = $this->_ch;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $xml = curl_exec($ch);
        return $xml;
    }

    /**
     * Returns a Zotero API feed response.
     *
     * @param string The request.
     * @param array An array of parameters.
     */
    protected function _zoteroRequest($request, $parameters = array()) {
        $requestUri = $this->_zoteroUri($request, $parameters);
        if ($xml = $this->_httpRequest($requestUri)) {
            $response = new DOMDocument();
            $response->loadXML($xml);
            return $response;
        }  
        return false;
    }
    
    /**
     * Constructs a valid Zotero URI with query string.
     *
     * @param string The request path.
     * @param array An array of parameters
     * @return string A Zotero URI.
     */
    protected function _zoteroUri($request, $parameters = array())
    {
        $uri = self::ZOTERO_URI . $request;
        
        $parameters = $this->_filterParams($parameters);
        
        // If there are parameters, build a query.
        if (count($parameters) > 0) {
            $uri = $uri . '?' . http_build_query($parameters);      
        }
        
        return $uri;
    }
    
    /**
     * Adds the API key to the parameters if one is not already set.
     * 
     * @param array An array of parameters.
     * @return array
     */
    protected function _filterParams($parameters = array())
    {
        if (!isset($parameters['key']) && $this->_apiKey) {
            $parameters['key'] = $this->_apiKey;
        }
        return $parameters;
    }
        
    /**
     * Gets all Zotero items for a user.
     *
     * @param int The user ID.
     * @param array An optional array of parameters.
     */
    public function getUserItems($userId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/items', $parameters);
    }

    /**
     * Gets all top-level Zotero items for a user.
     *
     * @param int The user ID.
     * @param array An optional array of parameters.
     */
    public function getUserItemsTop($userId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/items/top', $parameters);
    }

    /**
     * Gets a particular Zotero item by ID.
     *
     * @param int The user ID.
     * @param int The item ID.
     * @param array An optional array of parameters.
     */
    public function getUserItem($userId, $itemId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/items/'.$itemId, $parameters);
    }
    
    /**
     * Gets the tags associated with a given Zotero item.
     *
     * @param int The user ID.
     * @param int The item ID.
     * @param array An optional array of parameters.
     */
    public function getUserItemTags($userId, $itemId, array $parameters = array())
    {
        return $this->_zoteroRequest('users/'.$userId.'/items/'.$itemId.'/tags');
    }
    
    /**
     * Gets the children associated with a given Zotero item.
     *
     * @param int The user ID.
     * @param int The item ID.
     * @param array An optional array of parameters.
     */
    public function getUserItemChildren($userId, $itemId, $parameters = array()) { 
        return $this->_zoteroRequest('users/'.$userId.'item/'.$itemId.'/children', $parameters);
    }
    
    /**
     * Gets the URI of a user item file.
     *
     * @param int The user ID.
     * @param int The item key.
     * @param array Additional parameters for the request.
     * @return string the file URI.
     */
    public function getUserItemFile($userId, $itemId, $parameters = array())
    {
        $path = "/users/$userId/items/$itemId/file";
        return $this->_zoteroUri($path, $parameters);
    }

    /**
     * Gets all the collections for a user.
     *
     * @param array An optional array of parameters
     * @param int The user ID.
     */
    public function getUserCollections($userId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/collections', $parameters);
    }

    /**
     * Gets all top-level collections for a user.
     *
     * @param array An optional array of parameters
     * @param int The user ID.
     */
    public function getUserCollectionsTop($userId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/collections/top', $parameters);
    }

    /**
     * Gets a specific collection for a given user.
     *
     * @param int The user ID.
     * @param int The collection ID
     * @param array An optional array of parameters
     */
    public function getUserCollection($userId, $collectionId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/collections/'.$collectionId, $parameters);
    }
    
    /**
     * Get the items in a specific collection for a given user.
     *
     * @param int The user ID.
     * @param int The collection ID
     * @param array An optional array of parameters
     */
    public function getUserCollectionItems($userId, $collectionId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/collections/'.$collectionId.'/items', $parameters);
    }
    
    /**
     * Gets the tags for a user.
     *
     * @param int The user ID.
     * @param array An optional array of parameters.
     */
    public function getUserTags($userId, $parameters = array()) {
        return $this->_zoteroRequest('users/'.$userId.'/tags', $parameters);
    }
    
    /**
     * Gets a specific tag for a user.
     *
     * @param int The user ID.
     * @param string The tag.
     * @param array An optional array of parameters.
     */
    public function getUserTag($userId, $tag, $parameters = array()) {
        if($tag = urlencode($tag)) {
            return $this->_zoteroRequest('users/'.$userId.'/tags/'.$tag, $parameters);
        }
    }
    
    /**
     * Gets the items tagged with a given tag.
     *
     * @param int The user ID.
     * @param string The tag.
     * @param array An optional array of parameters.
     */
    public function getUserTagItems($userId, $tag, $parameters = array()) {
        if($tag = urlencode($tag)) {
            return $this->_zoteroRequest('users/'.$userId.'/tags/'.$tag.'/items', $parameters);
        }
    }
    
    /**
     * Gets the start page from the Zotero feed.
     *
     * @param string The DOM output.
     * @param string The rel attribute to find.
     */
    public function getPageStart($dom, $rel) {
        $xpath = new DOMXPath($dom);
		$xpath->registerNamespace('atom', 'http://www.w3.org/2005/Atom');
		
		$nextLink = $xpath->evaluate("//atom:link[@rel = '$rel']/@href");
		$nextLinkUrl = $nextLink->item(0)->nodeValue;
		if ($nextLinkUrl) {
		    $start = substr(strrchr($nextLinkUrl, '='), 1);
		    return $start;
		}
		return false;
    }
    
    /**
     * Gets the URL for the next page.
     *
     * @param string The DOM output.
     */
    public function getNextPageStart($dom) {
        return $this->getPageStart($dom, 'next');
    }
    
    /**
     * Gets the URL for the last page.
     *
     * @param string The DOM output.
     */
    public function getLastPageStart($dom) {
        return $this->getPageStart($dom, 'last');
    }
    
    /**
     * Gets the URL for the first page.
     *
     * @param string The DOM output.
     */
    public function getFirstPageStart($dom) {
        return $this->getPageStart($dom, 'first');
    }
    
    /**
     * Gets the total results for a specific query.
     *
     * @param string The DOM output.
     */
    public function getTotalResults($dom) {
		$totalResults = $dom->getElementsByTagNameNS('http://zotero.org/ns/api', 'totalResults');
		return $totalResults->item(0)->nodeValue;
    }
}