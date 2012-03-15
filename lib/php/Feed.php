<?php

 /**
  * Representation of a Zotero Feed (ATOM)
  * 
  * @package    libZotero
  */
class Zotero_Feed
{
    /**
     * @var string
     */
    public $lastModified;

    /**
     * @var string
     */
    public $title;

    /**
     * @var string
     */
    public $dateUpdated;
    
    /**
     * @var int
     */
    public $totalResults;
    
    /**
     * @var int
     */
    public $apiVersion;
    
    /**
     * @var string
     */
    public $id;
    
    /**
     * @var array
     */
    public $links = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public $entryNodes;
    
    public function __construct($doc)
    {
        if(!($doc instanceof DOMDocument)){
            $domdoc = new DOMDocument();
            $domdoc->loadXml($doc);
            $doc = $domdoc;
        }
        
        foreach($doc->getElementsByTagName("feed") as $feed){
            $this->title        = $feed->getElementsByTagName("title")->item(0)->nodeValue;
            $this->id           = $feed->getElementsByTagName("id")->item(0)->nodeValue;
            $this->dateUpdated  = $feed->getElementsByTagName("updated")->item(0)->nodeValue;
            $this->apiVersion   = $feed->getElementsByTagName("apiVersion")->item(0)->nodeValue;
            $this->totalResults = $feed->getElementsByTagName("totalResults")->item(0)->nodeValue;
            
            // Get all of the link elements
            foreach($feed->childNodes as $childNode){
                if($childNode->nodeName == "link"){
                    $linkNode = $childNode;
                    $this->links[$linkNode->getAttribute('rel')] = array('type'=>$linkNode->getAttribute('type'), 'href'=>$linkNode->getAttribute('href'));
                }
            }
            
            $entryNodes = $doc->getElementsByTagName("entry");
            $this->entryNodes = $entryNodes;
            /*
            //detect zotero entry type with sample entry node and parse entries appropriately
            $firstEntry = $entryNodes->item(0);
            $this->entryType = $this->detectZoteroEntryType($firstEntry);
            foreach($entryNodes as $entryNode){
                switch($this->entryType) {
                    case 'item':       $entry = new Zotero_Item($entryNode); break;
                    case 'collection': $entry = new Zotero_Collection($entryNode); break;
                    case 'group':      $entry = new Zotero_Group($entryNode); break;
                    case 'user':       $entry = new Zotero_User($entryNode); break;
                    case 'tag':        $entry = new Zotero_Tag($entryNode); break;
                    default:           throw new Zend_Exception("Unknown entry type");
                }
                $this->entries[] = $entry;
            }
            */
        }
    }
    
    public function detectZoteroEntryType($entryNode){
        $itemTypeNodes = $entryNode->getElementsByTagName("itemType");
        $numCollectionsNodes = $entryNode->getElementsByTagName("numCollections");
        $numItemsNodes = $entryNode->getElementsByTagName("numItems");
        /*
        $itemType = $xpath->evaluate("//zapi:itemType")->item(0)->nodeValue;
        $collectionKey = $xpath->evaluate("//zapi:collectionKey")->item(0)->nodeValue;
        $numItems = $xpath->evaluate("//zapi:numItems")->item(0)->nodeValue;
        */
        if($itemTypeNodes->length) return 'item';
        if($numCollectionsNodes->length) return 'collection';
        if($numItemsNodes->length && !($collectionKeyNodes->length)) return 'tag';
        //if($userID) return 'user';
        //if($groupID) return 'group';
    }
    
    public function nestEntries(){
        // Look for item and collection entries with rel="up" links and move them under their parent entry
        if($nest && ($entryType == "collections" || $entryType == "items")){
            foreach($this->feed->entries as $key => $entry){
                if(isset($entry->links['up']['application/atom+xml'])){                    
                    // This flag will be set to true if a parent is found
                    $this->foundParent = false;
                    // Search for a parent
                    $this->nestEntry($entry, $this->feed->entries);
                    // If we found a parent to nest under, remove the entry from the top level
                    if($this->foundParent == true){
                        unset($this->feed->entries[$key]);
                    }
                }
            }            
        }
    }
    
    public function dataObject()
    {
        $jsonItem = new stdClass;
        
        $jsonItem->lastModified = $this->lastModified;
        $jsonItem->title = $this->title;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->totalResults = $this->totalResults;
        $jsonItem->id = $this->id;
        
//        foreach($this->links as $link){
//            $jsonItem->links[] = $link;
//        }
        $jsonItem->links = $this->links;
        $jsonItem->entries = array();
        foreach($this->entries as $entry){
            $jsonItem->entries[] = $entry->dataObject();
        }
        
        return $jsonItem;
    }
}
