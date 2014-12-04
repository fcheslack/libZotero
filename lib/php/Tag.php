<?php
namespace Zotero;
 /**
  * Representation of a Zotero Tag
  * 
  * @package libZotero
  */
class Tag extends ApiObject
{
    public function __construct($tagArray)
    {
        if(!$tagArray){
            return;
        }
        elseif(is_string($tagArray)){
            $tagArray = json_decode($tagArray);
        }
        
        parent::__construct($tagArray);
    }
    
    public function __get($key) {
        switch($key){
            case "tag":
            case "name":
            case "title":
                return $this->apiObj['tag'];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        if(array_key_exists($key, $this->apiObj)) {
            return $this->apiObj[$key];
        }
        return null;
    }
    
    public function __set($key, $val) {
        if(array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        return $this;
    }

    public function get($key) {
        return $this->$key;
    }
}
