<?php
/***************************************************************/
/* phpZotero - a library for accessing the Zotero.org API

  Software License Agreement (BSD License)

  Copyright (C) 2009, Jeremy Boggs.
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

// Zotero API base URL
define('PHP_ZOTERO_BASE_URL', 'https://api.zotero.org/');
define('PHP_ZOTERO_OLD_BASE_URL', 'http://www.zotero.org/api/');

class phpZotero {    
    
    protected $username;
    protected $apiKey;
    
    /************************ Constructor ************************/
    
    public function __construct($username, $apiKey) {
       // assign parameters
       $this->username = urlencode($username);
       $this->apiKey = urlencode($apiKey);
       
    }
    
    /********************** Protected Methods ************************/

    protected function httpRequest($url) {
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $xml = curl_exec($ch);
            curl_close($ch);
            return $xml;
        }
    }
        
    protected function zoteroRequest($request, $parameters = array()) {
        $request = PHP_ZOTERO_BASE_URL.$request;
        
        if (count($parameters) > 0) {
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
        
        if ($xml = $this->httpRequest($request)) {
            $response = new DOMDocument();
            $response->loadXML($xml);
            return $response;
        }  
        return false;
    }
    
    protected function getUserId($username = null) {
        if(!$username) {
            $username = $this->username;
        }
        $url = PHP_ZOTERO_OLD_BASE_URL.'users/'.$username;
        
        $xml = $this->httpRequest($url);
    
        if($xml) {
            $response = new DOMDocument();
            $response->loadXML($xml);
            
            $id = $response->getElementsByTagName('id')->item(0)->nodeValue;
            if($id) {
                $id = str_replace('http://zotero.org/users/', '', $id);
                return $id;
            } else {
                return 'No ID found for '.$username;
            }
        } 
    }
    
    /************************ Public Methods ************************/
    
    public function getResults($request, $parameters = array()) {
        
        return $this->zoteroRequest($request, $parameters);
    }    
    
    public function getUserItems($parameters = array(), $userId = null) {
        if(!$userId) {
            $userId = $this->getUserId();
        }
        return $this->getResults('users/'.$userId.'/items/top', $parameters);
    }
    
    public function getUserItem($itemId = null, $parameters = array(), $userId = null) {
        if(!$userId) {
            $userId = $this->getUserId();
        }
        
        if($itemId) {
            return $this->getResults('users/'.$userId.'/items/'.$itemId, $parameters);
        }
    }
    
    public function getUserItemChildren($itemId = null, $parameters = array(), $userId = null) { 
        if(!$userId) {
            $userId = $this->getUserId();
        }
        
        if($itemId) {
            return $this->getResults('users/'.$userId.'item/'.$itemId.'/children', $parameters);
        }
    }
    
    public function getUserCollections($parameters = array(), $userId = null) {
        if(!$userId) {
            $userId = $this->getUserId();
        }
        return $this->zoteroRequest('users/'.$userId.'/collections/top', $parameters);
    }
    
    public function getUserCollection($collectionId = null, $parameters = array(), $userId = null) {
        if(!$userId) {
            $userId = $this->getUserId();
        }
        
        if($collectionId) {
            return $this->getResults('users/'.$userId.'/collections/'.$collectionId, $parameters);
        }
    }
    
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
    
    public function getNextPageStart($dom) {
        return $this->getPageStart($dom, 'next');
    }
    
    public function getLastPageStart($dom) {
        return $this->getPageStart($dom, 'last');
    }
    
    public function getFirstPageStart($dom) {
        return $this->getPageStart($dom, 'first');
    }
    
    public function getTotalResults($dom) {
        $xpath = new DOMXPath($dom);
		$xpath->registerNamespace('zapi', 'http://zotero.org/ns/api');
		$totalResults = $xpath->getElementsByTagName('totalResults')->item(0)->nodeValue;
        
        return $totalResults;
    }
}

?>