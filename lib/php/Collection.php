<?php
 /**
  * Representation of a Zotero Collection
  *
  * @package    libZotero
  * @see        Zotero_Entry
  */
class Zotero_Collection extends Zotero_Entry
{
    /**
     * @var int
     */
    public $collectionVersion = 0;
    
    /**
     * @var int
     */
    public $collectionKey = null;
    
    public $name = '';
    /**
     * @var int
     */
    public $numCollections = 0;
    
    /**
     * @var int
     */
    public $numItems = 0;
    
    public $topLevel;
    /**
     * @var string
     */
    public $parentCollectionKey = false;
    
    public $childKeys = array();
    
    public function __construct($entryNode, $library=null)
    {
        if(!$entryNode){
            return;
        }
        parent::__construct($entryNode);
        
        $this->name = $this->title; //collection name is the Entry title
        
        //parse zapi tags
        $this->collectionKey = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'key')->item(0)->nodeValue;
        $this->collectionVersion = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'version')->item(0)->nodeValue;
        $this->numCollections = $entryNode->getElementsByTagName('numCollections')->item(0)->nodeValue;
        $this->numItems = $entryNode->getElementsByTagName('numItems')->item(0)->nodeValue;
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        if($contentNode){
            $contentType = $contentNode->getAttribute('type');
            if($contentType == 'application/json'){
                $this->pristine = json_decode($contentNode->nodeValue);
                $this->apiObject = json_decode($contentNode->nodeValue, true);
                $this->parentCollectionKey = $this->apiObject['parentCollection'];
                $this->name = $this->apiObject['name'];
            }
            elseif($contentType == 'xhtml'){
                //$this->parseXhtmlContent($contentNode);
            }
        }
        
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function get($key){
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
        }
        
        if(array_key_exists($key, $this->apiObject)){
            return $this->apiObject[$key];
        }
        
        if(property_exists($this, $key)){
            return $this->$key;
        }
        return null;
    }
    
    public function collectionJson(){
        $newJson = json_decode($this->pristine, true);
        $newJson['name'] = $this->name;
        $newJson['parentCollection'] = $this->parentCollectionKey;
        return json_encode($newJson);
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        $jsonItem->links = $this->links;
        
        $jsonItem->collectionKey = $this->collectionKey;
        $jsonItem->childKeys = $this->childKeys;
        $jsonItem->parentCollectionKey = $this->parentCollectionKey;
        return $jsonItem;
    }
}
