<?php
 /**
  * Representation of a Zotero Tag
  * 
  * @package libZotero
  */
class Zotero_Tag extends Zotero_Entry
{
    /**
     * @var int
     */
/*    public $tagID;
    
    public $libraryID;
    
    public $key;
    
    public $name;
    
    public $dateAdded;
    
    public $dateModified;
    
    public $type;
*/    
    public $numItems = 0;
    
    public function __construct($entryNode)
    {
        if(!$entryNode){
            libZoteroDebug( "no entryNode in tag constructor\n" );
            return;
        }
        elseif(is_string($entryNode)){
            libZoteroDebug( "entryNode is string in tag constructor\n" );
            $xml = $entryNode;
            $doc = new DOMDocument();
            libZoteroDebug( $xml );
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        parent::__construct($entryNode);
        
        $this->name = $this->title;
        
        if(!$entryNode){
            libZoteroDebug( "second no entryNode in tag constructor\n" );
            return;
        }
        
        $numItems = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', "numItems")->item(0);
        if($numItems) {
            $this->numItems = (int)$numItems->nodeValue;
        }
        
        $tagElements = $entryNode->getElementsByTagName("tag");
        $tagElement = $tagElements->item(0);
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        if($contentNode){
            $contentType = $contentNode->getAttribute('type');
            if($contentType == 'application/json'){
                $this->pristine = json_decode($contentNode->nodeValue, true);
                $this->apiObject = json_decode($contentNode->nodeValue, true);
            }
            elseif($contentType == 'xhtml'){
                //$this->parseXhtmlContent($contentNode);
            }
        }
    }
    
    public function get($key) {
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
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        $jsonItem->properties = $this->properties;
        
        return $jsonItem;
    }
}
