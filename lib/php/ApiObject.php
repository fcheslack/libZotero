<?php
namespace Zotero;

 /**
  * Zotero API Object
  * 
  * @package libZotero
  */
class ApiObject
{
    public $key;
    public $version;
    public $apiObj = [];
    
    public function __construct($jsonArray) {
        if(is_string($jsonArray)){
            $jsonArray = json_decode($jsonArray, true);
        }
        
        if(!isset($jsonArray)){
            $jsonArray = [
                'key' => '',
                'version' => 0,
                'links' => [],
                'meta' => [],
                'data' => [],
            ];
        }
        
        $this->apiObj = $jsonArray;
        if(isset($this->apiObj['data'])){
            $this->pristine = $this->apiObj['data'];
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
    
    public function readXml($xml){
        $doc = new \DOMDocument();
        $doc->loadXml($xml);
        $entryNode = $doc->getElementsByTagName('entry')->item(0);
        $this->apiObj['meta']['created'] = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
        $this->apiObj['meta']['lastModified'] = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
    }
}