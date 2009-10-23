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

// del.icio.us API base URL
define('PHP_ZOTERO_BASE_URL', 'https://api.zotero.org/');
define('PHP_ZOTERO_OLD_BASE_URL', 'http://www.zotero.org/api/');

class phpZotero {    
    
    var $username;
    var $password;
    
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
        $request = PHP_ZOTERO_BASE_URL.$request.'/?content=full';
        
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
              $iCount++;
           }
        }
        
        if ($xml = $this->httpRequest($request)) {
            $response = new DOMDocument();
            $response->loadXML($xml);
            return $response;
        }  
        return false;
    }
    
    /*
     * Gets the user ID for a given username.
     *
     * Uses the old Zotero API base url, until its mapped to the new URL.
     **/
    public function getUserId() {
        $user = $this->username;
        if($user) {
            $url = PHP_ZOTERO_OLD_BASE_URL.'users/'.$user;
            
            $xml = $this->httpRequest($url);
        
            if($xml) {
                $response = new DOMDocument();
                $response->loadXML($xml);
                
                $id = $response->getElementsByTagName('id')->item(0)->nodeValue;
                if($id) {
                    $id = str_replace('http://zotero.org/users/', '', $id);
                    return $id;
                } else {
                    return 'No ID found for '.$user;
                }
            } 
        } else {
            return 'No username give.';
        }
    }
    
    /**
     * Returns the results for a particular URL request
     *
     *
     * @param string $request The URL request
     * @param string $format The format of the results. Options are atom and json
     * @param string $version The version of the Zotero API to use
     * @param string $content The format of the content. Options are none, html, and full
     * @param string $privateurl
     * @param string $sort
     * @param string $limit
     * @param string $start
     * @param string $q
     * @param string $fq
     * @param string $facets
     * @param string $pprint
     * @return void
     **/
    public function getResults($request, $format = '', $version='', $content = '', $privateurl  = '', $sort  = '', $limit  = '', $start  = '', $order  = '', $q  = '', $fq  = '', $facets  = '', $pprint = '') {
        return $this->zoteroRequest($request);
    }
    
    public function getFollowers() {
        
    }
    
    public function getFollowing() {
        
    }
    
    public function getGroups() {
        
    }
    
    public function getUserItems() {
        
    }
    
    public function getItem($id) {
        if($id) {
            return $this->getResults('items/'.$id);
        }
    }
    
    public function getItemAttachments() {
        
    }
    
    public function getUserCollections() {
        
    }

}

?>