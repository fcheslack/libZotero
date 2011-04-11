<?php
 /**
  * Representation of a Zotero Tag
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zotero_Entry
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
    public $properties = array();

    public function __construct($entryNode)
    {
        parent::__construct($entryNode);
        
        if($entryNode === null){
            return;
        }
        
        // Extract the groupID and groupType
        $tagElements = $entryNode->getElementsByTagName("tag");
        $tagElement = $tagElements->item(0);
        if(!$tagElement) return;
        
        $tagAttributes = $tagElement->attributes;
        
        foreach($tagAttributes as $attrName => $attrNode){
            $this->properties[$attrName] = urldecode($attrNode->value);
            $this->$attrName = urldecode($attrNode->value);
        }
        
        $numItems = $entryNode->getElementsByTagName("numItems")->item(0);
        if($numItems) {
            $this->properties['numItems'] = (int)$numItems->nodeValue;
            $this->numItems = (int)$numItems->nodeValue;
        }
        
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
