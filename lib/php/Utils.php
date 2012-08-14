<?php
/**
 * Utility functions for libZotero
 * 
 * @package libZotero
 */
class Zotero_Lib_Utils
{
    const ZOTERO_URI = 'https://api.zotero.org';
    const ZOTERO_WWW_URI = 'http://www.zotero.org';
    const ZOTERO_WWW_API_URI = 'http://www.zotero.org/api';
    
    public static function wrapLinks($txt, $nofollow=false){
        //extremely ugly wrapping of urls in html
        if($nofollow){
            $repstring = " <a rel='nofollow' href='$1'>$1</a>";
        }
        else{
            $repstring = " <a href='$1'>$1</a>";
        }
        //will break completely on CDATA with unescaped brackets, and probably on alot of malformed html
        return preg_replace('/(http:\/\/[-a-zA-Z0-9._~:\/?#\[\]@!$&\'\(\)*+,;=]+)(?=\.|,|;|\s)(?![^<]*>)/i', $repstring, $txt);
        
        
        //alternative regexes
        /*
        return preg_replace('/(?<!<[^>]*)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        return preg_replace('/<(?[^>]+>)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        
        return preg_replace('/\s(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        */
    }
    
    public static function wrapDOIs($txt){
        
    }
    
    public static function utilRequest($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array() ) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        //disable Expect header
        $httpHeaders[] = 'Expect:';
        
        if(!empty($basicauth)){
            $passString = $basicauth['username'] . ':' . $basicauth['password'];
            /*
            echo $passString;
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
            curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
             */
            $authHeader = 'Basic ' . base64_encode($passString);
            $httpHeaders[] = "Authorization: {$authHeader}";
        }
        else{
            $passString = '';
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        
        //FOLLOW LOCATION HEADERS
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
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
        
        $zresponse = libZotero_Http_Response::fromString($responseBody);
        
        //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
        //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
        //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
        //until a non-redirect is read
        while($zresponse->isRedirect()){
            $redirectedBody = $zresponse->getBody();
            $zresponse = libZotero_Http_Response::fromString($redirectedBody);
        }
        
        curl_close($ch);
        
        return $zresponse;
    }
    
    public static function apiQueryString($passedParams=array()){
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'q',
                                 'fq',
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
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                //check if itemKey belongs in the url or the querystring
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
    
}


