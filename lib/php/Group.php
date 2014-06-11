<?php
 /**
  * Representation of a Zotero Group
  * 
  * @package libZotero
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
    public $ownerID;
    
    /**
     * @var string
     */
    public $type;
    
    /**
     * @var string
     */
    public $name;
    
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
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $contentType = parent::getContentType($entryNode);
        if($contentType == 'application/json'){
            $this->apiObject = json_decode($contentNode->nodeValue, true);
            //$this->etag = $contentNode->getAttribute('etag');
            $this->name = $this->apiObject['name'];
            $this->ownerID = $this->apiObject['owner'];
            $this->owner = $this->ownerID;
            $this->groupType = $this->apiObject['type'];
            $this->description = $this->apiObject['description'];
            $this->url = $this->apiObject['url'];
            $this->libraryEditing = $this->apiObject['libraryEditing'];
            $this->libraryReading = $this->apiObject['libraryReading'];
            $this->fileEditing = $this->apiObject['fileEditing'];
        }
        
        if(!empty($this->apiObject['admins'])){
            $this->adminIDs = $this->apiObject['admins'];
        }
        else {
            $this->adminIDs = array();
        }
        
        if($this->ownerID){
            $this->adminIDs[] = $this->ownerID;
        }
        
        if(!empty($this->apiObject['members'])){
            $this->memberIDs = $this->apiObject['members'];
        }
        else{
            $this->memberIDs = array();
        }
        
        $this->numItems = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'numItems')->item(0)->nodeValue;
        
        $contentNodes = $entryNode->getElementsByTagName("content");
        if($contentNodes->length > 0){
            $cNode = $contentNodes->item(0);
            if($cNode->getAttribute('type') == 'application/json'){
                $jsonObject = json_decode($cNode->nodeValue, true);
                //parse out relevant values from the json and put them on our object
                $this->name = $jsonObject['name'];
                $this->ownerID = $jsonObject['owner'];
                $this->owner = $this->ownerID;
                $this->type = $jsonObject['type'];
                $this->groupType = $this->type;
                $this->description = $jsonObject['description'];
                $this->url = $jsonObject['url'];
                $this->hasImage = isset($jsonObject['hasImage']) ? $jsonObject['hasImage'] : 0;
                $this->libraryEditing = $jsonObject['libraryEditing'];
                $this->memberIDs = isset($jsonObject['members']) ? $jsonObject['members'] : array();
                $this->members = $this->memberIDs;
                $this->adminIDs = isset($jsonObject['admins']) ? $jsonObject['admins'] : array();
                $this->adminIDs[] = $jsonObject['owner'];
                $this->admins = $this->adminIDs;
            }
            elseif($cNode->getAttribute('type') == 'application/xml'){
                $groupElements = $entryNode->getElementsByTagName("group");
                $groupElement = $groupElements->item(0);
                if(!$groupElement) return;
                
                $groupAttributes = $groupElement->attributes;
                $this->properties = array();
                
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
                    $this->properties['description'] = $description->nodeValue;
                    $this->description = $description->nodeValue;
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
                    $this->memberIDs = ($members === null ? array() : explode(" ", $members->nodeValue));
                }
                
                //initially disallow library access
                $this->userReadable = false;
                $this->userEditable = false;
            }
        }
        
        //get groupID from zapi:groupID if available
        if($entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'groupID')->length > 0){
            $this->groupID = $entryNode->getElementsByTagNameNS('http://zotero.org/ns/api', 'groupID')->item(0)->nodeValue;
            $this->id = $this->groupID;
        }
        else{
            //get link nodes and extract groupID
            $linkNodes = $entryNode->getElementsByTagName("link");
            if($linkNodes->length > 0){
                for($i = 0; $i < $linkNodes->length; $i++){
                    $linkNode = $linkNodes->item($i);
                    if($linkNode->getAttribute('rel') == 'self'){
                        $selfHref = $linkNode->getAttribute('href');
                        $matches = array();
                        preg_match('/^https:\/\/.{3,6}\.zotero\.org\/groups\/([0-9]+)$/', $selfHref, $matches);
                        if(isset($matches[1])){
                            $this->groupID = intval($matches[1]);
                            $this->id = $this->groupID;
                        }
                    }
                }
            }
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
        $doc = new DOMDocument();
        $el = $doc->appendChild(new DOMElement('group'));
        $descriptionString = htmlspecialchars($this->description, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);
        $el->appendChild(new DOMElement('description', $descriptionString));
        $el->appendChild(new DOMElement('url', $this->url));
        if($this->groupID){
            $el->setAttribute('id', $this->groupID);
        }
        $el->setAttribute('owner', $this->ownerID);
        $el->setAttribute('type', $this->type);
        $el->setAttribute('name', $this->name);
        $el->setAttribute('libraryEditing', $this->libraryEditing);
        $el->setAttribute('libraryReading', $this->libraryReading);
        $el->setAttribute('fileEditing', $this->fileEditing);
        $el->setAttribute('hasImage', $this->hasImage);
        
        return $doc->saveXML($el);
    }
    
    public function propertiesArray()
    {
        $properties = array();
        $properties['owner'] = $this->owner;
        $properties['type'] = $this->type;
        $properties['name'] = $this->name;
        $properties['libraryEditing'] = $this->libraryEditing;
        $properties['libraryReading'] = $this->libraryReading;
        $properties['fileEditing'] = $this->fileEditing;
        $properties['hasImage'] = $this->hasImage;
        $properties['disciplines'] = $this->disciplines;
        $properties['enableComments'] = $this->enableComments;
        $properties['description'] = $this->description;
        
        return $properties;
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
        $jsonItem->libraryEditing = $this->libraryEditing;
        $jsonItem->libraryReading = $this->libraryReading;
        $jsonItem->hasImage = $this->hadImage;
        $jsonItem->description = $this->description;
        $jsonItem->url = $this->url;
        
        return $jsonItem;
    }
    
    public function role($userID) {
        if($userID == $this->owner){
            return 'owner';
        }
        if(in_array($userID, $this->adminIDs)){
            return 'admin';
        }
        if(in_array($userID, $this->memberIDs)){
            return 'member';
        }
        return false;
    }
    
    public function isOwner($userID){
        return $this->role($userID) == 'owner';
    }
    
    public function isAdmin($userID){
        $role = $this->role($userID);
        if($role == 'admin' || $role == 'owner'){
            return true;
        }
    }
    
    public function isMember($userID){
        $role = $this->role($userID);
        if($role === false){
            return false;
        }
        return true;
    }
    
    public function userIDs(){
        //test
        return array_merge($this->adminIDs, $this->memberIDs);
    }
    
    public function groupIdentifier(){
        if($this->type == 'Private'){
            return $this->groupID;
        }
        $name = $this->name;
        $slug = trim($name);
        $slug = strtolower($slug);
        $slug = preg_replace("/[^a-z0-9 ._-]/", "", $slug);
        $slug = str_replace(" ", "_", $slug);
        return $slug;
    }
    
    public function userReadable($userID){
        if($this->libraryReading == 'all'){
            return true;
        }
        if($this->isMember($userID)){
            return true;
        }
        return false;
    }
    
    public function userWritable($userID){
        if($this->libraryEditing == 'members'){
            if($this->isMember($userID)){
                return true;
            }
            return false;
        }
        if($this->libraryEditing == 'admins'){
            if($this->isAdmin($userID)){
                return true;
            }
            return false;
        }
    }
}
