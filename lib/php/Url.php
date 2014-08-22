<?php
namespace Zotero;

class Url
{
    /**
     * generate an api url for a request based on array of parameters
     *
     * @param array $params list of parameters that define the request
     * @return string
     */
    public static function apiRequestUrl($params = []) {
        $base = ZOTERO_URI;
        
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        //special case for www based api requests until those methods are mapped for api.zotero
        if($params['target'] == 'user' || $params['target'] == 'cv'){
            $base = ZOTERO_WWW_API_URI;
        }
        
        $url = $base . '/' . $params['libraryType'] . 's/' . $params['libraryID'];
        
        if(!empty($params['collectionKey'])){
            if($params['collectionKey'] == 'trash'){
                $url .= '/items/trash';
                return $url;
            }
            else{
                $url .= '/collections/' . $params['collectionKey'];
            }
        }
        
        switch($params['target']){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if(!empty($params['itemKey'])){
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
            case 'tags':
                $url .= '/tags';
                break;
            case 'children':
                $url .= '/items/' . $params['itemKey'] . '/children';
                break;
            case 'itemTemplate':
                $url = $base . '/items/new';
                break;
            case 'key':
                $url = $base . '/users/' . $params['userID'] . '/keys/' . $params['apiKey'];
                break;
            case 'userGroups':
                $url = $base . '/users/' . $params['userID'] . '/groups';
                break;
            case 'groups':
                $url = $base . '/groups';
                break;
            case 'cv':
                $url .= '/cv';
                break;
            case 'deleted':
                $url .= '/deleted';
                break;
            default:
                return false;
        }
        if(isset($params['targetModifier'])){
            switch($params['targetModifier']){
                case 'top':
                    $url .= '/top';
                    break;
                case 'children':
                    $url .= '/children';
                    break;
                case 'file':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file';
                    break;
                case 'fileview':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file/view';
                    break;
            }
        }
        return $url;
    }
    
    /**
     * generate an api query string for a request based on array of parameters
     *
     * @param array $passedParams list of parameters that define the request
     * @return string
     */
    public static function apiQueryString($passedParams=array()){
        // Tags query formats
        //
        // ?tag=foo
        // ?tag=foo bar // phrase
        // ?tag=-foo // negation
        // ?tag=\-foo // literal hyphen (only for first character)
        // ?tag=foo&tag=bar // AND
        // ?tag=foo&tagType=0
        // ?tag=foo bar || bar&tagType=0
        
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'include',
                                 'q',
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
        ksort($queryParams);
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            if(is_array($value)){
                if($index == 'itemKey'){
                    $queryParamsArray[] = urlencode($index) . '=' . urlencode(implode(',', $value));
                } else {
                    foreach($value as $key=>$val){
                        if(is_string($val) || is_int($val)){
                            $queryParamsArray[] = urlencode($index) . '=' . urlencode($val);
                        }
                    }
                }
            } elseif(is_string($value) || is_int($value)){
                $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
            }
        }
        $queryString .= implode('&', $queryParamsArray);
        return $queryString;
    }
    
    public static function apiRequestString($params = []) {
        return self::apiRequestUrl($params) . self::apiQueryString($params);
    }
    
    /**
     * parse a query string and separate into parameters
     * without using the php way of representing query strings
     *
     * @param string $query
     * @return array
     */
    public static function parseQueryString($query){
        $params = explode('&', $query);
        $aparams = array();
        foreach($params as $val){
            $t = explode('=', $val);
            $aparams[urldecode($t[0])] = urldecode($t[1]);
        }
        return $aparams;
    
    }
}
