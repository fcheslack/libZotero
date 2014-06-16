<?php
 /**
  * Representation of a Zotero Group
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */
class Zotero_Group extends Zotero_ApiObject
{
    public $wwwData = [
        'hasImage' => false,
        'disciplines' => [],
        'enableComments' => false,
    ];
    /**
     * @var bool
     */
    //public $hasImage;
    
    /**
     * @var array
     */
    //public $disciplines;
    
    /**
     * @var bool
     */
    //public $enableComments;
    
    public function __construct($groupArray = null)
    {
        parent::__construct($groupArray);
        //initially disallow library access
        $this->userReadable = false;
        $this->userEditable = false;
        
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
                    array_push($a, $this->apiObj['data']['owner']);
                    return $a;
                }
                return [$this->apiObj['data']['owner']];
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
        $doc = new DOMDocument();
        $el = $doc->appendChild(new DOMElement('group'));
        $descriptionString = htmlspecialchars($this->description, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);
        $el->appendChild(new DOMElement('description', $descriptionString));
        $el->appendChild(new DOMElement('url', $this->url));
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
}
