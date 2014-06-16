<?php
 /**
  * Representation of a Zotero Collection
  *
  * @package    libZotero
  * @see        Zotero_Entry
  */
class Zotero_Collection extends Zotero_ApiObject
{
    public $topLevel;
    public $apiObject = array();
    public $pristineData = array();
    public $childKeys = array();
    
    public function __construct($collectionArray, $library=null)
    {
        if(!$collectionArray){
            return;
        }
        parent::__construct($collectionArray);
        
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function __get($key) {
        if(array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        
        switch($key){
            case 'title':
                return $this->name;
            case 'key':
            case 'collectionKey':
                return $this->apiObj['key'];
            case 'version':
            case 'collectionVersion':
                return $this->apiObj['version'];
            case 'parentCollection':
            case 'parentCollectionKey':
                return $this->apiObj['data']['parentCollection'];
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
    
    public function get($key){
        return $this->$key;
        /*
        switch($key){
            case 'title':
            case 'name':
                return $this->name;
            case 'collectionKey':
            case 'key':
                return $this->collectionKey;
            case 'parentCollection':
            case 'parentCollectionKey':
                return $this->parentCollectionKey;
            case 'collectionVersion':
            case 'version':
                return $this->collectionVersion;
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
    
    public function set($key, $val){
        return $this->$key = $val;
        /*
        switch($key){
            case 'title':
            case 'name':
                $this->name = $val;
                $this->apiObject['name'] = $val;
                break;
            case 'collectionKey':
            case 'key':
                $this->collectionKey = $val;
                $this->apiObject['collectionKey'] = $val;
                break;
            case 'parentCollection':
            case 'parentCollectionKey':
                $this->parentCollectionKey = $val;
                $this->apiObject['parentCollection'] = $val;
                break;
            case 'collectionVersion':
            case 'version':
                $this->collectionVersion = $val;
                $this->apiObject['collectionVersion'] = $val;
                break;
        }
        
        if(array_key_exists($key, $this->apiObject)){
            $this->apiObject[$key] = $val;
        }
        
        if(property_exists($this, $key)){
            $this->$key = $val;
        }
        */
    }
    
    public function collectionJson(){
        return json_encode($this->writeApiObject());
    }
    
    public function writeApiObject() {
        $updateItem = array_merge($this->pristine, $this->apiObject);
        return $updateItem;
    }
}
