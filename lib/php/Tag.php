<?php
namespace Zotero;
 /**
  * Representation of a Zotero Tag
  * 
  * @package libZotero
  */
class Tag extends ApiObject
{
    public $numItems = 0;
    
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
        if(array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
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
        /*
        switch($key){
            case "tag":
            case "name":
            case "title":
                return $this->name;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            return $this->apiObject[$key];
        }
        
        if(property_exists($this, $key)){
            return $this->$key;
        }
        return null;
        */
    }
}
