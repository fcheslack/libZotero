<?php
 /**
  * Representation of a Zotero Group
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zotero_Entry
  */
class Zotero_Group extends Zotero_Entry
{
    /**
     * @var array
     */
    public $properties;
    
    /**
     * @var int
     */
    public $id;
    
    /**
     * @var int
     */
    public $groupID;
    
    /**
     * @var int
     */
    public $owner;
    
    /**
     * @var string
     */
    public $type;
    
    /**
     * @var string
     */
    public $name;
    
    /**
     * @var bool
     */
    public $libraryEnabled;
    
    /**
     * @var string
     */
    public $libraryEditing;
    
    /**
     * @var string
     */
    public $libraryReading;
    
    /**
     * @var string
     */
    public $fileEditing;
    
    /**
     * @var bool
     */
    public $hasImage;
    
    /**
     * @var string
     */
    public $description;
    
    /**
     * @var array
     */
    public $disciplines;
    
    /**
     * @var bool
     */
    public $enableComments;
    
    /**
     * @var string
     */
    public $url = '';
    
    /**
     * @var array
     */
    public $adminIDs;
    
    /**
     * @var array
     */
    public $memberIDs;
    
    
    public function __construct($entryNode = null)
    {
        if(!$entryNode){
            return;
        }
        elseif(is_string($entryNode)){
            $xml = $entryNode;
            $doc = new DOMDocument();
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        parent::__construct($entryNode);
        
        if(!$entryNode){
            return;
        }
        
        // Extract the groupID and groupType
        $groupElements = $entryNode->getElementsByTagName("group");
        $groupElement = $groupElements->item(0);
        if(!$groupElement) return;
        
        $groupAttributes = $groupElement->attributes;
        
        foreach($groupAttributes as $attrName => $attrNode){
            $this->properties[$attrName] = urldecode($attrNode->value);
            if($attrName == 'name'){
                $this->$attrName = $attrNode->value;
            }
            else{
                $this->$attrName = urldecode($attrNode->value);
            }
        }
        $this->groupID = $this->properties['id'];
        
        $description = $entryNode->getElementsByTagName("description")->item(0);
        if($description) {
            $this->properties['description'] = urldecode($description->nodeValue);
            $this->description = urldecode($description->nodeValue);
        }
        
        $url = $entryNode->getElementsByTagName("url")->item(0);
        if($url) {
            $this->properties['url'] = $url->nodeValue;
            $this->url = $url->nodeValue;
        }
        
        $this->adminIDs = array();
        $admins = $entryNode->getElementsByTagName("admins")->item(0);
        if($admins){
            $this->adminIDs = $admins === null ? array() : explode(" ", $admins->nodeValue);
        }
        $this->adminIDs[] = $this->owner;
        
        $this->memberIDs = array();
        $members = $entryNode->getElementsByTagName("members")->item(0);
        if($members){
            $this->memberIDs = $members === null ? array() : explode(" ", $members->nodeValue);
        }
        
        //initially disallow library access
        $this->userReadable = false;
        $this->userEditable = false;
    }
    
    public function setProperty($key, $val)
    {
        $this->properties[$key] = $val;
        return $this;
    }
    
    public function updateString()
    {
        $view = new Zend_View();
        $view->setScriptPath('../library/Zotero/Service/Zotero/views');
        $view->group = $this;
        
        return $view->render("group.phtml");
    }
    
    public function dataObject() {
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = $this->title;
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        //Group vars
        $jsonItem->groupID = $this->groupID;
        $jsonItem->owner = $this->owner;
        $jsonItem->memberIDs = $this->memberIDs;
        $jsonItem->adminIDs = $this->adminIDs;
        $jsonItem->type = $this->type;
        $jsonItem->name = $this->name;
        $jsonItem->libraryEnabled = $this->libraryEnabled;
        $jsonItem->libraryEditing = $this->libraryEditing;
        $jsonItem->libraryReading = $this->libraryReading;
        $jsonItem->hasImage = $this->hadImage;
        $jsonItem->description = $this->description;
        $jsonItem->url = $this->url;
        
        return $jsonItem;
    }
}
