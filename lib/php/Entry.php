<?php

 /**
  * Zotero API Feed entry (ATOM)
  * 
  * @package libZotero
  */
class Zotero_Entry
{
    /**
     * @var string
     */
    public $title;
    
    /**
     * @var string
     */
    public $dateAdded;

    /**
     * @var string
     */
    public $dateUpdated;
    
    /**
     * @var string
     */
    public $id;
    
    /**
     * @var array
     */
    public $links = array();
    
    public $contentArray = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public function __construct($entryNode)
    {
      $parseFields = array('title', 'id', 'dateAdded', 'dateUpdated', 'author');
      $this->title       = $entryNode->getElementsByTagName("title")->item(0)->nodeValue;
      $this->id          = $entryNode->getElementsByTagName("id")->item(0)->nodeValue;
      $this->dateAdded   = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
      $this->dateUpdated = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
      
      // Get all of the link elements
      foreach($entryNode->getElementsByTagName("link") as $linkNode){
          if($linkNode->getAttribute('rel') == "enclosure"){
              $this->links['enclosure'][$linkNode->getAttribute('type')] = array(
                                          'href'=>$linkNode->getAttribute('href'), 
                                          'title'=>$linkNode->getAttribute('title'), 
                                          'length'=>$linkNode->getAttribute('length'));
          }
          else{
              $this->links[$linkNode->getAttribute('rel')][$linkNode->getAttribute('type')] = array(
                                          'href'=>$linkNode->getAttribute('href')
                                          );
          }
      }
      
    }
    
    public function getContentType($entryNode){
      $contentNode = $entryNode->getElementsByTagName('content')->item(0);
      if($contentNode) return $contentNode->getAttribute('type') || $contentNode->getAttribute('zapi:type');
      else return false;
    }
    
}