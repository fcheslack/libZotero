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
    
    public static function randomString($len=0, $chars=null) {
        if ($chars === null) {
            $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if ($len==0) {
            $len = 8;
        }
        $randomstring = '';
        for ($i = 0; $i < $len; $i++) {
            $rnum = rand(0, strlen($chars) - 1);
            $randomstring .= $chars[$rnum];
        }
        return $randomstring;
    }
    
    public static function getKey() {
        $baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero_Lib_Utils::randomString(8, $baseString);
    }
    
    //update items appropriately based on response to multi-write request
    //for success:
    //  update objectKey if item doesn't have one yet (newly created item)
    //  update itemVersion to response's Last-Modified-Version header
    //  mark as synced
    //for unchanged:
    //  don't need to do anything? itemVersion should remain the same?
    //  mark as synced if not already?
    //for failed:
    //  do something. flag as error? display some message to user?
    public static function updateObjectsFromWriteResponse($objectsArray, $response){
        $data = json_decode($response->getRawBody(), true);
        if($response->getStatus() == 200){
            $newLastModifiedVersion = $response->getHeader("Last-Modified-Version");
            if(isset($data['success'])){
                foreach($data['success'] as $ind=>$key){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    
                    $objectKey = $object->get('key');
                    if($objectKey != '' && $objectKey != $key){
                        throw new Exception("Item key mismatch in multi-write request");
                    }
                    if($objectKey == ''){
                        $object->set('key', $key);
                    }
                    $object->set('version', $newLastModifiedVersion);
                    $object->synced = true;
                    $object->writeFailure = false;
                }
            }
            if(isset($data['failed'])){
                foreach($data['failed'] as $ind=>$val){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    $object->writeFailure = $val;
                }
            }
        }
        elseif($response->getStatus() == 204){
            $objectsArray[0]->synced = true;
        }
    }
    
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring += $libraryID;
        return $lstring;
    }
    
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
        $matches = array();
        $doi = preg_match("(10\.[^\s\/]+\/[^\s]+)", $txt, $matches);
        $m1 = htmlspecialchars($matches[0]);
        $safetxt = htmlspecialchars($txt);
        return "<a href=\"http://dx.doi.org/{$matches[0]}\" rel=\"nofollow\">{$safetxt}</a>";
    }
    
    public static function utilRequest($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array() ) {
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array(
            'useragent' => 'libZotero php'
        );
        
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        
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
    
    public static function translateMimeType($mimeType)
    {
        switch ($mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return $mimeType;
        }
    }
}


