<?php
 /**
  * Representation of a Zotero Collection
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zotero_Entry
  */

class Zotero_Collection extends Zotero_Entry
{
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
    
    public function __construct($entryNode)
    {
        if(!$entryNode){
            return;
        }
        parent::__construct($entryNode);
        // Extract the collectionKey
        $this->collectionKey = $entryNode->getElementsByTagNameNS('*', 'key')->item(0)->nodeValue;
        $this->numCollections = $entryNode->getElementsByTagName('numCollections')->item(0)->nodeValue;
        $this->numItems = $entryNode->getElementsByTagName('numItems')->item(0)->nodeValue;
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $contentType = parent::getContentType($entryNode);
        if($contentType == 'application/json'){
            $this->contentArray = json_decode($contentNode->nodeValue, true);
            $this->etag = $contentNode->getAttribute('etag');
            $this->parentCollectionKey = $this->contentArray['parent'];
            $this->name = $this->contentArray['name'];
        }
        elseif($contentType == 'xhtml'){
            //$this->parseXhtmlContent($contentNode);
        }
        
    }
    
    public function collectionJson(){
        return json_encode(array('name'=>$collection->name, 'parent'=>$collection->parentCollectionKey));
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        $jsonItem->collectionKey = $this->collectionKey;
        foreach($this->entries as $entry){
            $jsonItem->entries[] = $entry->dataObject();
        }
        
        return $jsonItem;
    }
}
