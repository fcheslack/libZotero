<?php
/***************************************************************/
/* phpZotero - a library for accessing the Zotero.org API

  Software License Agreement (BSD License)

  Copyright (C) 2009-2011, Jeremy Boggs.
  All rights reserved.
  
  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

     * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in the
       documentation and/or other materials provided with the distribution.
     * Neither the name of Jeremy Boggs nor the names of its contributors 
       may be used to endorse or promote products derived from this software 
       without specific prior written permission of Jeremy Boggs.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTORS "AS IS" AND ANY
  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                 */
/***************************************************************/

class phpZotero {    
    
    const ZOTERO_URI = 'https://api.zotero.org/';
    
    protected $_apiKey;
    
    /************************ Constructor ************************/
    
    public function __construct($apiKey) {
       $this->_apiKey = urlencode($apiKey);
    }
    
    /********************** Protected Methods ************************/

    protected function _httpRequest($url) {
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $xml = curl_exec($ch);
            curl_close($ch);
            return $xml;
        }
    }
        
    protected function _zoteroRequest($request, $parameters = array()) {
        $request = self::ZOTERO_URI.$request;
        
        if (count($parameters) > 0) {
            $parameters = $this->_filterParams($parameters);
            $request .= '?';
        }
        
        // add parameters to command
        $pCount = 0;
        
        foreach ($parameters as $key => $value) {
           if ($value != '') {
              if ($pCount > 0) {
                 $request .= '&';
              }
              $request .= "$key=".urlencode($value);
              $pCount++;
           }
        }
        
        if ($xml = $this->_httpRequest($request)) {
            $response = new DOMDocument();
            $response->loadXML($xml);
            return $response;
        }  
        return false;
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
    
    /************************ Public Methods ************************/
    
    public function getResults($request, $parameters = array()) {
        return $this->_zoteroRequest($request, $parameters);
    }    
    
    /**
     * Gets the top-level Zotero items for a given user.
     *
     * @param int The user ID.
     * @param array An optional array of parameters.
     */
    public function getUserItems($userId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/items/top', $parameters);
    }
    
    /**
     * Gets a particular Zotero item by ID.
     *
     * @param int The user ID.
     * @param int The item ID.
     * @param array An optional array of parameters.
     */
    public function getUserItem($userId, $itemId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/items/'.$itemId, $parameters);
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
        return $this->getResults('users/'.$userId.'/items/'.$itemId.'/tags');
    }
    
    /**
     * Gets the children associated with a given Zotero item.
     *
     * @param int The user ID.
     * @param int The item ID.
     * @param array An optional array of parameters.
     */
    public function getUserItemChildren($userId, $itemId, $parameters = array()) { 
        return $this->getResults('users/'.$userId.'item/'.$itemId.'/children', $parameters);
    }
    
    /**
     * Gets all the collections for a user.
     *
     * @param array An optional array of parameters
     * @param int The user ID.
     */
    public function getUserCollections($userId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/collections/top', $parameters);
    }
    
    /**
     * Gets a specific collection for a given user.
     *
     * @param int The user ID.
     * @param int The collection ID
     * @param array An optional array of parameters
     */
    public function getUserCollection($userId, $collectionId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/collections/'.$collectionId, $parameters);
    }
    
    /**
     * Get the items in a specific collection for a given user.
     *
     * @param int The user ID.
     * @param int The collection ID
     * @param array An optional array of parameters
     */
    public function getUserCollectionItems($userId, $collectionId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/collections/'.$collectionId.'/items', $parameters);
    }
    
    /**
     * Gets the tags for a user.
     *
     * @param int The user ID.
     * @param array An optional array of parameters.
     */
    public function getUserTags($userId, $parameters = array()) {
        return $this->getResults('users/'.$userId.'/tags', $parameters);
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
            return $this->getResults('users/'.$userId.'/tags/'.$tag, $parameters);
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
            return $this->getResults('users/'.$userId.'/tags/'.$tag.'/items', $parameters);
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