<?php

 /**
  * Representation of a Zotero Item
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zend_Service_Abstract
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
      if($contentNode) return $contentNode->getAttribute('type');
      else return false;
    }
    
}