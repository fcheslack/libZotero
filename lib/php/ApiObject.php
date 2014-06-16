<?php

 /**
  * Zotero API Object
  * 
  * @package libZotero
  */
class Zotero_ApiObject
{
    public $key;
    public $version;
    public $apiObj = [];
    
    public function __construct($jsonArray) {
        if(is_string($jsonArray)){
            $jsonArray = json_decode($jsonArray, true);
        }
        
        $this->apiObj = $jsonArray;
        if(isset($this->apiObj['data'])){
            $this->pristineData = $this->apiObj['data'];
        }
    }
    
    public function associateWithLibrary($library){
        $this->libraryType = $library->libraryType;
        $this->libraryID = $library->libraryID;
        $this->owningLibrary = $library;
    }
    
    //return the key as a string when passed an argument that 
    //could be either a string key or an object with a key property
    public static function extractKey($object){
        if(is_string($object)){
            return $object;
        }
        if(isset($object['key'])){
            return $object['key'];
        }
        if(!empty($object->key)){
            return $object->key;
        }
    }

}