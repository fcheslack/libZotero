<?php
namespace Zotero;
 /**
  * Representation of a Zotero Collection
  *
  * @package    libZotero
  * @see        Zotero_Entry
  */
class Collection extends ApiObject
{
    public $topLevel;
    public $pristine = array();
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
    }
    
    public function set($key, $val){
        return $this->$key = $val;
    
    public function collectionJson(){
        return json_encode($this->writeApiObject());
    }
    
    public function writeApiObject() {
        $updateItem = array_merge($this->pristine, $this->apiObj);
        return $updateItem;
    }
}
