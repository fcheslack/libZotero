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
    
    /**
     * @var array
     */
    public $author = array();
    
    /**
     * @var int
     */
    public $version = 0;
    
    public $contentArray = array();
    
    /**
     * @var array
     */
    public $entries = array();
    
    public function __construct($entryNode)
    {
      if(!($entryNode instanceof DOMNode)){
          if(is_string($entryNode)){
            $doc = new DOMDocument();
            $doc->loadXml($entryNode);
            $entryNodes = $doc->getElementsByTagName("entry");
            if($entryNodes->length){
              $entryNode = $entryNodes->item(0);
            }
            else {
              return null;
            }
          }
      }
      $parseFields = array('title', 'id', 'dateAdded', 'dateUpdated', 'author');
      $this->title       = $entryNode->getElementsByTagName("title")->item(0)->nodeValue;
      $this->id          = $entryNode->getElementsByTagName("id")->item(0)->nodeValue;
      $this->dateAdded   = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
      $this->dateUpdated = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
      
      //try to parse author node if it's there
      try{
          $author = array();
          $authorNode = $entryNode->getElementsByTagName('author')->item(0);
          $author['name'] = $authorNode->getElementsByTagName('name')->item(0)->nodeValue;
          $author['uri'] = $authorNode->getElementsByTagName('uri')->item(0)->nodeValue;
          
          $this->author = $author;
      }
      catch(Exception $e){
          
      }
    
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
      if($contentNode) return $contentNode->getAttribute('type') || $contentNode->getAttributeNS('http://zotero.org/ns/api', 'type');
      else return false;
    }
    
    public function associateWithLibrary($library){
        $this->libraryType = $library->libraryType;
        $this->libraryID = $library->libraryID;
        $this->owningLibrary = $library;
    }
}