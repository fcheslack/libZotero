<?php
namespace Zotero;
 /**
  * Representation of a Zotero Group
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */
class Group extends ApiObject
{
    public $wwwData = [
        'hasImage' => false,
        'disciplines' => [],
        'enableComments' => false,
    ];
    
    public function __construct($groupArray = null)
    {
        parent::__construct($groupArray);
        //TODO: parse out links from response?
    }
    
    public function __get($key) {
        switch($key){
            case 'adminIDs':
                if(isset($this->apiObj['data']['admins'])){
                    $a = $this->apiObj['data']['admins'];
                    array_push($a, $this->apiObj['data']['owner']);
                    return $a;
                }
                return [$this->apiObj['data']['owner']];
            case 'memberIDs':
                if(isset($this->apiObj['data']['members'])){
                    $a = $this->apiObj['data']['members'];
                    return $a;
                }
                return [];
            case 'groupID':
                if(isset($this->apiObj['id'])){
                    return $this->apiObj['id'];
                }
        }
        
        if(isset($this->apiObj['data']) && array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(isset($this->apiObj['meta']) && array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        
        return null;
    }
    
    public function __set($key, $val) {
        if(array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        elseif(array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        else{
            $this->$key = $val;
        }
        return $this;
    }
    
    public function readXml($xml){
        parent::readXml($xml);
        $doc = new \DOMDocument();
        $doc->loadXml($xml);
        $entryNode = $doc->getElementsByTagName('entry')->item(0);
        
        if(!$entryNode){
            return;
        }
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $this->apiObj['data'] = json_decode($contentNode->nodeValue, true);
        $this->apiObj['id'] = $this->apiObj['data']['id'];
        $this->apiObj['version'] = $this->apiObj['data']['version'];
        /*
        $this->name = $this->apiObject['name'];
        $this->ownerID = $this->apiObject['owner'];
        $this->owner = $this->ownerID;
        $this->groupType = $this->apiObject['type'];
        $this->description = $this->apiObject['description'];
        $this->url = $this->apiObject['url'];
        $this->libraryEditing = $this->apiObject['libraryEditing'];
        $this->libraryReading = $this->apiObject['libraryReading'];
        $this->fileEditing = $this->apiObject['fileEditing'];
        
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
        */
    }
    
    public function setProperty($key, $val)
    {
        $this->$key = $val;
        return $this;
    }
    
    public function role($user) {
        $userID = $this->extractUserID($user);
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
    
    public function isOwner($user){
        $userID = $this->extractUserID($user);
        return $this->role($userID) == 'owner';
    }
    
    public function isAdmin($user){
        $userID = $this->extractUserID($user);
        $role = $this->role($userID);
        if($role == 'admin' || $role == 'owner'){
            return true;
        }
    }
    
    public function isMember($user){
        $userID = $this->extractUserID($user);
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
    
    public function userReadable($user){
        $userID = $this->extractUserID($user);
        if($this->libraryReading == 'all'){
            return true;
        }
        if($this->isMember($userID)){
            return true;
        }
        return false;
    }
    
    public function userWritable($user){
        $userID = $this->extractUserID($user);
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
    
    public function extractUserID($arg){
        if(is_int($arg)){
            return $arg;
        }
        if(is_numeric($arg)){
            return intval($arg);
        }
        if(is_object($arg)){
            if(isset($arg->userID)){
                return $arg->userID;
            }
            if(isset($arg->id)){
                return $arg->id;
            }
        }
    }
    
    public function updateString()
    {
        $doc = new \DOMDocument();
        $el = $doc->appendChild(new \DOMElement('group'));
        $descriptionString = htmlspecialchars($this->description, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);
        $el->appendChild(new \DOMElement('description', $descriptionString));
        $el->appendChild(new \DOMElement('url', $this->url));
        if($this->groupID){
            $el->setAttribute('id', $this->groupID);
        }
        $el->setAttribute('owner', $this->owner);
        $el->setAttribute('type', $this->type);
        $el->setAttribute('name', $this->name);
        $el->setAttribute('libraryEditing', $this->libraryEditing);
        $el->setAttribute('libraryReading', $this->libraryReading);
        $el->setAttribute('fileEditing', $this->fileEditing);
        $el->setAttribute('hasImage', $this->hasImage);
        
        return $doc->saveXML($el);
    }

    public function libraryPropertiesArray() {
        return [
            'type' => $this->type,
            'libraryEditing' => $this->libraryEditing,
            'libraryReading' => $this->libraryReading,
            'fileEditing' => $this->fileEditing
        ];
    }
}
