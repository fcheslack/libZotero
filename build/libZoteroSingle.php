<?php

namespace Zotero;

/**
 * Zotero specific exception class with no added functionality
 * 
 * @package libZotero
 */
class Exception extends \Exception
{
    
}

namespace Zotero;
/**
 * APC backed cache implementing interface required for Library caching
 * 
 * @package libZotero
 */
class ApcCache
{
    public $prefix = 'LibZotero';
    
    public function __construct(){
        if(!extension_loaded('apc')){
            if(!extension_loaded('apcu')){
                throw new \Zotero\Exception('APC not loaded');
            }
        }
    }
    
    public function add($key, $val, $ttl=0){
        return apc_add($key, $val, $ttl);
    }
    
    public function store($key, $val, $ttl=0){
        return apc_store($key, $val, $ttl);
    }
    
    public function delete($key){
        return apc_delete($key);
    }
    
    public function fetch($key, &$success){
        return apc_fetch($key, $success);
    }
    
    public function exists($keys){
        return apc_exists($keys);
    }
}


namespace Zotero;

 /**
  * Zotero API Object
  * 
  * @package libZotero
  */
class ApiObject
{
    public $apiObj = [];
    
    public function __construct($jsonArray) {
        if(is_string($jsonArray)){
            $jsonArray = json_decode($jsonArray, true);
        }
        
        if(!isset($jsonArray)){
            $jsonArray = [
                'key' => '',
                'version' => 0,
                'links' => [],
                'meta' => [],
                'data' => [],
            ];
        }
        
        $this->apiObj = $jsonArray;
        if(isset($this->apiObj['data'])){
            $this->pristine = $this->apiObj['data'];
        }
    }
    
    /**
     * Get a list of keys defined on the data property of this object
     * @return array<string> array keys
     */
    public function getDataKeys(){
        if(isset($this->apiObj['data'])){
            return array_keys($this->apiObj['data']);
        } else {
            return [];
        }
    }
    
    public function associateWithLibrary($library){
        $this->libraryType = $library->libraryType;
        $this->libraryID = $library->libraryID;
        $this->owningLibrary = $library;
    }
    
    //return the key as a string when passed an argument that 
    //could be either a string key or an object with a key property
    public static function extractKey($object){
        if(is_string($object)){
            return $object;
        }
        if(isset($object['key'])){
            return $object['key'];
        }
        if(!empty($object->key)){
            return $object->key;
        }
    }
    
    public function readXml($xml){
        $doc = new \DOMDocument();
        $doc->loadXml($xml);
        $entryNode = $doc->getElementsByTagName('entry')->item(0);
        $this->apiObj['meta']['created'] = $entryNode->getElementsByTagName("published")->item(0)->nodeValue;
        $this->apiObj['meta']['lastModified'] = $entryNode->getElementsByTagName("updated")->item(0)->nodeValue;
    }
}
namespace Zotero;
class Cite {
    private static $citePaperJournalArticleURL = false;

    //
    // Ported from cite.js in the Zotero client
    //
    
    /**
     * Mappings for names
     * Note that this is the reverse of the text variable map, since all mappings should be one to one
     * and it makes the code cleaner
     */
    private static $zoteroNameMap = array(
        "author" => "author",
        "editor" => "editor",
        "bookAuthor" => "container-author",
        "composer" => "composer",
        "interviewer" => "interviewer",
        "recipient" => "recipient",
        "seriesEditor" => "collection-editor",
        "translator" => "translator"
    );
    
    /**
     * Mappings for text variables
     */
    private static $zoteroFieldMap = array(
        "title" => array("title"),
        "container-title" => array("publicationTitle",  "reporter", "code"), /* reporter and code should move to SQL mapping tables */
        "collection-title" => array("seriesTitle", "series"),
        "collection-number" => array("seriesNumber"),
        "publisher" => array("publisher", "distributor"), /* distributor should move to SQL mapping tables */
        "publisher-place" => array("place"),
        "authority" => array("court"),
        "page" => array("pages"),
        "volume" => array("volume"),
        "issue" => array("issue"),
        "number-of-volumes" => array("numberOfVolumes"),
        "number-of-pages" => array("numPages"),
        "edition" => array("edition"),
        "version" => array("version"),
        "section" => array("section"),
        "genre" => array("type", "artworkSize"), /* artworkSize should move to SQL mapping tables, or added as a CSL variable */
        "medium" => array("medium", "system"),
        "archive" => array("archive"),
        "archive_location" => array("archiveLocation"),
        "event" => array("meetingName", "conferenceName"), /* these should be mapped to the same base field in SQL mapping tables */
        "event-place" => array("place"),
        "abstract" => array("abstractNote"),
        "URL" => array("url"),
        "DOI" => array("DOI"),
        "ISBN" => array("ISBN"),
        "call-number" => array("callNumber"),
        "note" => array("extra"),
        "number" => array("number"),
        "references" => array("history"),
        "shortTitle" => array("shortTitle"),
        "journalAbbreviation" => array("journalAbbreviation"),
        "language" => array("language")
    );
    
    private static $zoteroDateMap = array(
        "issued" => "date",
        "accessed" => "accessDate"
    );
    
    private static $zoteroTypeMap = array(
        'book' => "book",
        'bookSection' => "chapter",
        'journalArticle' => "article-journal",
        'magazineArticle' => "article-magazine",
        'newspaperArticle' => "article-newspaper",
        'thesis' => "thesis",
        'encyclopediaArticle' => "entry-encyclopedia",
        'dictionaryEntry' => "entry-dictionary",
        'conferencePaper' => "paper-conference",
        'letter' => "personal_communication",
        'manuscript' => "manuscript",
        'interview' => "interview",
        'film' => "motion_picture",
        'artwork' => "graphic",
        'webpage' => "webpage",
        'report' => "report",
        'bill' => "bill",
        'case' => "legal_case",
        'hearing' => "bill",                // ??
        'patent' => "patent",
        'statute' => "bill",                // ??
        'email' => "personal_communication",
        'map' => "map",
        'blogPost' => "webpage",
        'instantMessage' => "personal_communication",
        'forumPost' => "webpage",
        'audioRecording' => "song",     // ??
        'presentation' => "speech",
        'videoRecording' => "motion_picture",
        'tvBroadcast' => "broadcast",
        'radioBroadcast' => "broadcast",
        'podcast' => "song",            // ??
        'computerProgram' => "book"     // ??
    );
    
    private static $quotedRegexp = '/^".+"$/';
    
    public static function convertItem($zoteroItem) {
        if (!$zoteroItem) {
            throw new Exception("Zotero item not provided");
        }
        
        // don't return URL or accessed information for journal articles if a
        // pages field exists
        $itemType = $zoteroItem->get("itemType");//ItemTypes::getName($zoteroItem->itemTypeID);
        $cslType = isset(self::$zoteroTypeMap[$itemType]) ? self::$zoteroTypeMap[$itemType] : false;
        if (!$cslType) $cslType = "article";
        $ignoreURL = (($zoteroItem->get("accessDate") || $zoteroItem->get("url")) &&
                in_array($itemType, array("journalArticle", "newspaperArticle", "magazineArticle"))
                && $zoteroItem->get("pages")
                && self::$citePaperJournalArticleURL);
        
        $cslItem = array(
            'id' => $zoteroItem->owningLibrary->libraryID . "/" . $zoteroItem->get("key"),
            'type' => $cslType
        );
        
        // get all text variables (there must be a better way)
        // TODO: does citeproc-js permit short forms?
        foreach (self::$zoteroFieldMap as $variable=>$fields) {
            if ($variable == "URL" && $ignoreURL) continue;
            
            foreach($fields as $field) {
                $value = $zoteroItem->get($field);
                if ($value !== "" && $value !== null) {
                    // Strip enclosing quotes
                    if (preg_match(self::$quotedRegexp, $value)) {
                        $value = substr($value, 1, strlen($value)-2);
                    }
                    $cslItem[$variable] = $value;
                    break;
                }
            }
        }
        
        // separate name variables
        $creators = $zoteroItem->get('creators');
        foreach ($creators as $creator) {
            $creatorType = $creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
            if (!$creatorType) continue;
            
            if(isset($creator["name"])){
                $nameObj = array('literal' => $creator['name']);
            }
            else {
                $nameObj = array('family' => $creator['lastName'], 'given' => $creator['firstName']);
            }
            
            if (isset($cslItem[$creatorType])) {
                $cslItem[$creatorType][] = $nameObj;
            }
            else {
                $cslItem[$creatorType] = array($nameObj);
            }
        }
        
        // get date variables
        foreach (self::$zoteroDateMap as $key=>$val) {
            $date = $zoteroItem->get($val);
            if ($date) {
                $cslItem[$key] = array("raw" => $date);
            }
        }
        
        return $cslItem;
    }
}

namespace Zotero;
 /**
  * Representation of a Zotero Collection
  *
  * @package    libZotero
  * @see        Zotero_Entry
  */
class Collection extends ApiObject
{
    public $topLevel;
    public $pristine = array();
    public $childKeys = array();
    
    public function __construct($collectionArray, $library=null)
    {
        if(!$collectionArray){
            return;
        }
        parent::__construct($collectionArray);
        
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function __get($key) {
        if(array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        
        switch($key){
            case 'title':
                return $this->name;
            case 'key':
            case 'collectionKey':
                return $this->apiObj['key'];
            case 'version':
            case 'collectionVersion':
                return $this->apiObj['version'];
            case 'parentCollection':
            case 'parentCollectionKey':
                return $this->apiObj['data']['parentCollection'];
        }
        
        return null;
    }
    
    public function __set($key, $val) {
        if(array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        return $this;
    }
    
    public function get($key){
        return $this->$key;
    }
    
    public function set($key, $val){
        return $this->$key = $val;
    }
    
    public function collectionJson(){
        return json_encode($this->writeApiObject());
    }
    
    public function writeApiObject() {
        $updateItem = array_merge($this->pristine, $this->apiObj);
        return $updateItem;
    }
}

namespace Zotero;

/**
 * Representation of the set of collections belonging to a particular Zotero library
 * 
 * @package libZotero
 */
class Collections
{
    public $orderedArray;
    public $collectionObjects;
    public $dirty;
    public $loaded;
    
    public function __construct(){
        $this->orderedArray = array();
        $this->collectionObjects = array();
    }
    
    public static function sortByTitleCompare($a, $b){
        if(strtolower($a->title) == strtolower($b->title)){
            return 0;
        }
        if(strtolower($a->title) < strtolower($b->title)){
            return -1;
        }
        return 1;
    }
    
    public function addCollection($collection) {
        $this->collectionObjects[$collection->collectionKey] = $collection;
        $this->orderedArray[] = $collection;
    }
    
    public function getCollection($collectionKey) {
        if(isset($this->collectionObjects[$collectionKey])){
            return $this->collectionObjects[$collectionKey];
        }
        return false;
    }
    
    public function addCollectionsFromJson($jsonCollectionsArray) {
        $addedCollections = [];
        foreach($jsonCollectionsArray as $collectionArray){
            $collection = new Collection($collectionArray);
            $this->addCollection($collection);
            $addedCollections[] = $collection;
        }
        return $addedCollections;
    }
    
    //add keys of child collections to array
    public function nestCollections(){
        foreach($this->collectionObjects as $key=>$collection){
            if($collection->parentCollectionKey){
                $parentCollection = $this->getCollection($collection->parentCollectionKey);
                $parentCollection->childKeys[] = $collection->collectionKey;
            }
        }
    }
    
    public function orderCollections(){
        $orderedArray = array();
        foreach($this->collectionObjects as $key=>$collection){
            $orderedArray[] = $collection;
        }
        usort($orderedArray, '\Zotero\Collections::sortByTitleCompare');
        $this->orderedArray = $orderedArray;
        return $this->orderedArray;
    }
    
    public function topCollectionKeys($collections){
        $topCollections = array();
        foreach($collections as $collection){
            if($collection->parentCollectionKey == false){
                $topCollections[] = $collection->collectionKey;
            }
        }
        return $topCollections;
    }
    
    public function collectionsJson(){
        $collections = array();
        foreach($this->collectionObjects as $collection){
            $collections[] = $collection->apiObj['data'];
        }
        
        return json_encode($collections);
    }
    
    public function writeCollection($collection){
        $cols = $this->writeCollections(array($collection));
        if($cols === false){
            return false;
        }
        return $cols[0];
    }
    
    public function writeCollections($collections){
        $writeCollections = array();
        
        foreach($collections as $collection){
            $collectionKey = $collection->get('collectionKey');
            if($collectionKey == ""){
                $newCollectionKey = Utils::getKey();
                $collection->set('collectionKey', $newCollectionKey);
                $collection->set('collectionVersion', 0);
            }
            $writeCollections[] = $collection;
        }
        
        $aparams = array('target'=>'collections');
        $chunks = array_chunk($writeCollections, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $collection){
                $writeArray[] = $collection->writeApiObject();
            }
            $requestData = json_encode($writeArray);
            
            $writeResponse = $this->owningLibrary->request($aparams, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $collection){
                    $collection->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
            }
        }
        return $writeCollections;
    }
    
    public function writeUpdatedCollection($collection){
        $this->writeCollections(array($collection));
        return $collection;
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchAllCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'limit'=>100), $params);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        do{
            $response = $this->owningLibrary->net->request($reqUrl, 'GET');
            $respArray = $response->parseResponseBody();
            $this->addCollectionsFromJson($respArray);
            
            $responseLinks = $response->linkHeaders();
            if(isset($responseLinks['next'])){
                $reqUrl = $responseLinks['next'];
            } else {
                $reqUrl = false;
            }
        } while($reqUrl);
        
        $this->loaded = true;
        return $this->orderedArray;
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'limit'=>100), $params);
        $response = $this->owningLibrary->request($aparams);
        $respArray = $response->parseResponseBody();
        $addedCollections = $this->addCollectionsFromJson($respArray);
        
        return $addedCollections;
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Collection
     */
    public function fetchCollection($collectionKey){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collectionKey);
        $response = $this->owningLibrary->request($aparams);
        $respArray = $response->parseResponseBody();
        $collection = new Collection($respArray);
        $this->addCollection($collection);
        return $collection;
    }
    
}


namespace Zotero;


 /**
  * Representation of a Zotero Item Creator
  *
  * @package    libZotero
  */
class Creator
{
    public $creatorType = null;
    public $localized = null;
    public $firstName = null;
    public $lastName = null;
    public $name = null;
    
    public function getWriteObject(){
        if(empty($this->creatorType) || (empty($this->name) && empty($this->firstName) && empty($this->lastName) ) ){
            return false;
        }
        $a = array('creatorType'=>$this->creatorType);
        if(!empty($this->name)){
            $a['name'] = $this->name;
        }
        else{
            $a['firstName'] = $this->firstName;
            $a['lastName'] = $this->lastName;
        }
        
        return $a;
    }
}

namespace Zotero;

class File
{
    
}

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

namespace Zotero;
 /**
  * Representation of a Zotero Item
  * 
  * @package libZotero
  */

class Item extends ApiObject
{
    /**
     * @var Library
     */
    public $owningLibrary = null;
    
    /**
     * @var array
     */
    public $childKeys = array();
    
    /**
     * @var string
     */
    public $createdByUserID = null;
    
    /**
     * @var string
     */
    public $lastModifiedByUserID = null;
    
    /**
     * @var string
     */
    public $notes = array();
    
    public $writeFailure = null;
    
    public $pristine = null;
    
    /**
     * @var array
     */
    public static $fieldMap = array(
        "creator"             => "Creator",
        "itemType"            => "Type",
        "title"               => "Title",
        "dateAdded"           => "Date Added",
        "dateModified"        => "Modified",
        "source"              => "Source",
        "notes"               => "Notes",
        "tags"                => "Tags",
        "attachments"         => "Attachments",
        "related"             => "Related",
        "url"                 => "URL",
        "rights"              => "Rights",
        "series"              => "Series",
        "volume"              => "Volume",
        "issue"               => "Issue",
        "edition"             => "Edition",
        "place"               => "Place",
        "publisher"           => "Publisher",
        "pages"               => "Pages",
        "ISBN"                => "ISBN",
        "publicationTitle"    => "Publication",
        "ISSN"                => "ISSN",
        "date"                => "Date",
        "section"             => "Section",
        "callNumber"          => "Call Number",
        "archiveLocation"     => "Loc. in Archive",
        "distributor"         => "Distributor",
        "extra"               => "Extra",
        "journalAbbreviation" => "Journal Abbr",
        "DOI"                 => "DOI",
        "accessDate"          => "Accessed",
        "seriesTitle"         => "Series Title",
        "seriesText"          => "Series Text",
        "seriesNumber"        => "Series Number",
        "institution"         => "Institution",
        "reportType"          => "Report Type",
        "code"                => "Code",
        "session"             => "Session",
        "legislativeBody"     => "Legislative Body",
        "history"             => "History",
        "reporter"            => "Reporter",
        "court"               => "Court",
        "numberOfVolumes"     => "# of Volumes",
        "committee"           => "Committee",
        "assignee"            => "Assignee",
        "patentNumber"        => "Patent Number",
        "priorityNumbers"     => "Priority Numbers",
        "issueDate"           => "Issue Date",
        "references"          => "References",
        "legalStatus"         => "Legal Status",
        "codeNumber"          => "Code Number",
        "artworkMedium"       => "Medium",
        "number"              => "Number",
        "artworkSize"         => "Artwork Size",
        "libraryCatalog"      => "Library Catalog",
        "videoRecordingType"  => "Recording Type",
        "interviewMedium"     => "Medium",
        "letterType"          => "Type",
        "manuscriptType"      => "Type",
        "mapType"             => "Type",
        "scale"               => "Scale",
        "thesisType"          => "Type",
        "websiteType"         => "Website Type",
        "audioRecordingType"  => "Recording Type",
        "label"               => "Label",
        "presentationType"    => "Type",
        "meetingName"         => "Meeting Name",
        "studio"              => "Studio",
        "runningTime"         => "Running Time",
        "network"             => "Network",
        "postType"            => "Post Type",
        "audioFileType"       => "File Type",
        "version"             => "Version",
        "system"              => "System",
        "company"             => "Company",
        "conferenceName"      => "Conference Name",
        "encyclopediaTitle"   => "Encyclopedia Title",
        "dictionaryTitle"     => "Dictionary Title",
        "language"            => "Language",
        "programmingLanguage" => "Language",
        "university"          => "University",
        "abstractNote"        => "Abstract",
        "websiteTitle"        => "Website Title",
        "reportNumber"        => "Report Number",
        "billNumber"          => "Bill Number",
        "codeVolume"          => "Code Volume",
        "codePages"           => "Code Pages",
        "dateDecided"         => "Date Decided",
        "reporterVolume"      => "Reporter Volume",
        "firstPage"           => "First Page",
        "documentNumber"      => "Document Number",
        "dateEnacted"         => "Date Enacted",
        "publicLawNumber"     => "Public Law Number",
        "country"             => "Country",
        "applicationNumber"   => "Application Number",
        "forumTitle"          => "Forum/Listserv Title",
        "episodeNumber"       => "Episode Number",
        "blogTitle"           => "Blog Title",
        "caseName"            => "Case Name",
        "nameOfAct"           => "Name of Act",
        "subject"             => "Subject",
        "proceedingsTitle"    => "Proceedings Title",
        "bookTitle"           => "Book Title",
        "shortTitle"          => "Short Title",
        "docketNumber"        => "Docket Number",
        "numPages"            => "# of Pages"
    );

    public static $nonFieldData = array(
        'deleted' => true,
        'parentItem' => true,
    );
    
    /**
     * @var array
     */
    public static $typeMap = array(
        "note"                => "Note",
        "attachment"          => "Attachment",
        "book"                => "Book",
        "bookSection"         => "Book Section",
        "journalArticle"      => "Journal Article",
        "magazineArticle"     => "Magazine Article",
        "newspaperArticle"    => "Newspaper Article",
        "thesis"              => "Thesis",
        "letter"              => "Letter",
        "manuscript"          => "Manuscript",
        "interview"           => "Interview",
        "film"                => "Film",
        "artwork"             => "Artwork",
        "webpage"             => "Web Page",
        "report"              => "Report",
        "bill"                => "Bill",
        "case"                => "Case",
        "hearing"             => "Hearing",
        "patent"              => "Patent",
        "statute"             => "Statute",
        "email"               => "E-mail",
        "map"                 => "Map",
        "blogPost"            => "Blog Post",
        "instantMessage"      => "Instant Message",
        "forumPost"           => "Forum Post",
        "audioRecording"      => "Audio Recording",
        "presentation"        => "Presentation",
        "videoRecording"      => "Video Recording",
        "tvBroadcast"         => "TV Broadcast",
        "radioBroadcast"      => "Radio Broadcast",
        "podcast"             => "Podcast",
        "computerProgram"     => "Computer Program",
        "conferencePaper"     => "Conference Paper",
        "document"            => "Document",
        "encyclopediaArticle" => "Encyclopedia Article",
        "dictionaryEntry"     => "Dictionary Entry",
    );
    
    /**
     * @var array
     */
    public static $creatorMap = array(
        "author"         => "Author",
        "contributor"    => "Contributor",
        "editor"         => "Editor",
        "translator"     => "Translator",
        "seriesEditor"   => "Series Editor",
        "interviewee"    => "Interview With",
        "interviewer"    => "Interviewer",
        "director"       => "Director",
        "scriptwriter"   => "Scriptwriter",
        "producer"       => "Producer",
        "castMember"     => "Cast Member",
        "sponsor"        => "Sponsor",
        "counsel"        => "Counsel",
        "inventor"       => "Inventor",
        "attorneyAgent"  => "Attorney/Agent",
        "recipient"      => "Recipient",
        "performer"      => "Performer",
        "composer"       => "Composer",
        "wordsBy"        => "Words By",
        "cartographer"   => "Cartographer",
        "programmer"     => "Programmer",
        "reviewedAuthor" => "Reviewed Author",
        "artist"         => "Artist",
        "commenter"      => "Commenter",
        "presenter"      => "Presenter",
        "guest"          => "Guest",
        "podcaster"      => "Podcaster"
    );
    
    
    public function __construct($itemArray=null, $library=null)
    {
        if(!$itemArray){
            return;
        }
        
        parent::__construct($itemArray);
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function __get($key) {
        if(isset($this->apiObj['data']) && array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(isset($this->apiObj['meta']) && array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        if(isset($this->apiObj[$key])){
            return $this->apiObj[$key];
        }
        
        switch($key){
            //case 'key':
            case 'itemKey':
                return $this->key;
            //case 'version':
            case 'itemVersion':
                return $this->version;
            case 'year':
                throw new \Exception('Not implemented');
            //case 'parentItem':
            case 'parentItemKey':
                return $this->parentItem;
            case 'bibContent':
                return $this->bib;
        }
        
        return null;
    }
    
    public function __set($key, $val) {
        if(isset($this->apiObj['data']) && array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        if(isset($this->apiObj['meta']) && array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        
        switch($key){
            //case 'key':
            case 'itemKey':
                return $this->key = $val;
            //case 'version':
            case 'itemVersion':
                return $this->version = $val;
            case 'year':
                throw new \Exception('Not implemented');
            //case 'parentItem':
            case 'parentItemKey':
                return $this->parentItem = $val;
        }
        
        //set on apiObj.data if key is a known item fieldname
        if(isset(self::$fieldMap[$key]) || isset(self::$nonFieldData[$key])){
            $this->apiObj['data'][$key] = $val;
        }
        return $this;
    }
    
    public function initItemFromTemplate($template){
        $this->version = 0;
        
        $this->itemType = $template['itemType'];
        $this->key = '';
        $this->pristine = $template;
        $this->apiObj['data'] = $template;
    }
    
    public function get($key){
        return $this->$key;
    }
    
    public function set($key, $val){
        $this->$key = $val;
    }
    
    public function addCreator($creatorArray){
        $this->creators[] = $creatorArray;
        $this->apiObj['data']['creators'][] = $creatorArray;
    }
    
    public function updateItemObject(){
        return $this->writeApiObject();
    }
    
    public function newItemObject(){
        $newItem = $this->apiObj;
        $newCreatorsArray = array();
        if(isset($newItem['creators'])) {
            foreach($newItem['creators'] as $creator){
                if($creator['creatorType']){
                    if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                        continue;
                    }
                    else{
                        $newCreatorsArray[] = $creator;
                    }
                }
            }
            $newItem['creators'] = $newCreatorsArray;
        }
        
        return $newItem;
    }
    
    public function isAttachment(){
        if($this->itemType == 'attachment'){
            return true;
        }
    }
    
    public function hasFile(){
        if(!$this->isAttachment()){
            return false;
        }
        $hasEnclosure = isset($this->links['enclosure']);
        $linkMode = $this->get('linkMode');
        if($hasEnclosure && ($linkMode == 0 || $linkMode == 1)){
            return true;
        }
    }
    
    public function attachmentIsSnapshot(){
        if(!isset($this->links['enclosure'])) return false;
        if(!isset($this->links['enclosure']['text/html'])) return false;
        $tail = substr($this->links['enclosure']['text/html']['href'], -4);
        if($tail == "view") return true;
        return false;
    }
    
    public function json(){
        return json_encode($this->apiObj);
    }
    
    public function formatItemField($field){
        switch($field){
            case "title":
                return htmlspecialchars($this->title);
                break;
            case "creator":
                if(isset($this->creatorSummary)){
                    return htmlspecialchars($this->creatorSummary);
                }
                else{
                    return '';
                }
                break;
            case "dateModified":
            case "dateUpdated":
                return htmlspecialchars($this->dateUpdated);
                break;
            case "dateAdded":
                return htmlspecialchars($this->dateAdded);
                break;
            default:
                if(isset($this->apiObj['data'][$field])){
                    return htmlspecialchars($this->apiObj['data'][$field]);
                }
                else{
                    return '';
                }
        }
    }
    
    public function compareItem($otherItem){
        $diff = array_diff_assoc($this->apiObj, $otherItem->apiObj);
        return $diff;
    }
    
    public function addToCollection($collection){
        $collectionKey = $this->extractKey($collection);
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            if(!in_array($collectionKey, $memberCollectionKeys)) {
                $memberCollectionKeys[] = $collectionKey;
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function removeFromCollection($collection){
        $collectionKey = $this->extractKey($collection);
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            $ind = array_search($collectionKey, $memberCollectionKeys);
            if($ind !== false){
                array_splice($memberCollectionKeys, $ind, 1);
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function addTag($newtagname, $type=null){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $tag){
            if(is_string($tag) && $tag == $newtagname){
                return;
            }
            elseif(is_array($tag) && isset($tag['tag']) && $tag['tag'] == $newtagname) {
                return;
            }
        }
        if($type !== null){
            $itemTags[] = array('tag'=>$newtagname, 'type'=>$type);
        }
        else {
            $itemTags[] = array('tag'=>$newtagname);
        }
        $this->set('tags', $itemTags);
    }
    
    public function removeTag($rmtagname){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $ind=>$tag){
            if( (is_string($tag) && $tag == $rmtagname) ||
                (is_array($tag) && isset($tag['tag']) && $tag['tag'] == $rmtagname) ){
                array_splice($itemTags, $ind, 1);
                $this->set('tags', $itemTags);
                return;
            }
        }
    }
    
    public function addNote($noteItem){
        $this->notes[] = $noteItem;
    }
    
    public function uploadFile(){
        
    }
    
    public function uploadChildAttachment(){
        
    }
    
    public function writeApiObject(){
        $updateItem = array_merge($this->pristine, $this->apiObj['data']);
        if(empty($updateItem['creators'])){
            return $updateItem;
        }
        
        $newCreators = array();
        foreach($updateItem['creators'] as $creator){
            if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                continue;
            }
            else {
                $newCreators[] = $creator;
            }
        }
        $updateItem['creators'] = $newCreators;
        return $updateItem;
    }
    
    public function writePatch(){
        
    }
    
    public function trashItem(){
        $this->set('deleted', 1);
    }
    
    public function untrashItem(){
        $this->set('deleted', 0);
    }
    
    public function save() {
        return $this->owningLibrary->items->writeItems(array($this));
    }
    
    public function getChildren(){
        //short circuit if has item has no children
        if(!($this->numChildren)){//} || (this.parentItemKey !== false)){
            return array();
        }
        
        $config = array('target'=>'children', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'itemKey'=>$this->key);
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        
        $response = $this->owningLibrary->_request($requestUrl, 'GET');
        
        //load response into item objects
        $respArray = $response->parseResponseBody();
        $fetchedItems = $this->owningLibrary->items->addItemsFromJson($respArray);
        return $fetchedItems;
    }
    
    public function getCSLItem(){
        return Cite::convertItem($this);
    }
}

namespace Zotero;

/**
 * Representation of a set of items belonging to a particular Zotero library
 * 
 * @package  libZotero
 */
class Items
{
    public $itemObjects = array();
    public $owningLibrary;
    public $itemsVersion = 0;
    
    //get an item from this container of items by itemKey
    public function getItem($itemKey) {
        if(isset($this->itemObjects[$itemKey])){
            return $this->itemObjects[$itemKey];
        }
        return false;
    }
    
    //add a Item to this container of items
    public function addItem($item) {
        $itemKey = $item->key;
        $this->itemObjects[$itemKey] = $item;
        if($this->owningLibrary){
            $item->associateWithLibrary($this->owningLibrary);
        }
    }
    
    public function addItemsFromJson($jsonItemsArray) {
        $addedItems = [];
        foreach($jsonItemsArray as $itemArray){
            $item = new Item($itemArray);
            $this->addItem($item);
            $addedItems[] = $item;
        }
        return $addedItems;
    }
    
    //replace an item in this container with a new Item object with the same itemKey
    //useful for example after updating an item when the etag is out of date and to make sure
    //the current item we have reflects the best knowledge of the api
    public function replaceItem($item) {
        $this->addItem($item);
    }
    
    public function addChildKeys() {
        //empty existing childkeys first
        foreach($this->itemObjects as $key=>$item){
            $item->childKeys = array();
        }
        
        //run through and add item keys to their parent's item if we have the parent
        foreach($this->itemObjects as $key=>$item){
            if($item->parentKey){
                $pitem = $this->getItem($item->parentKey);
                if($pitem){
                    $pitem->childKeys[] = $item->key;
                }
            }
        }
    }
    
    public function getPreloadedChildren($item){
        $children = array();
        foreach($item->childKeys as $childKey){
            $childItem = $this->getItem($childKey);
            if($childItem){
                $children[] = $childItem;
            }
        }
        return $children;
    }
    
    public function writeItem($item){
        return $this->writeItems(array($item));
    }
    
    //accept an array of `Item`s
    public function writeItems($items){
        $writeItems = array();
        
        foreach($items as $item){
            $itemKey = $item->key;
            if($itemKey == ""){
                $newItemKey = Utils::getKey();
                $item->key = $newItemKey;
                $item->version = 0;
            }
            $writeItems[] = $item;
            
            //add separate note items if this item has any
            $itemNotes = $item->get('notes');
            if($itemNotes && (count($itemNotes) > 0) ){
                foreach($itemNotes as $note){
                    $note->parentItem = $item->key;
                    $note->key = Utils::getKey();
                    $note->version = 0;
                    $writeItems[] = $note;
                }
            }
        }
        
        $aparams = array('target'=>'items');
        $chunks = array_chunk($writeItems, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $item){
                $writeArray[] = $item->writeApiObject();
            }
            $requestData = json_encode($writeArray);
            
            $writeResponse = $this->owningLibrary->request($aparams, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $item){
                    $item->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
            }
        }
        return $writeItems;
    }
    
    public function trashItem($item){
        $item->trashItem();
        return $item->save();
    }
    
    public function trashItems($items){
        foreach($items as $item){
            $item->trashItem();
        }
        return $this->writeItems($items);
    }
    
    public function deleteItem($item){
        $aparams = array('target'=>'item', 'itemKey'=>$item->key);
        $response = $this->owningLibrary->request($aparams, 'DELETE', null, array('If-Unmodified-Since-Version'=>$item->version));
        return $response;
    }
    
    //delete multiple items
    //modified version we submit to the api falls back from explicit argument, to $items->itemsVersion
    //if set and non-zero, to the max itemVersion of items passed for deletion
    public function deleteItems($items, $version=null){
        if(count($items) > 50){
            throw new Exception("Too many items to delete");
        }
        $itemKeys = array();
        $latestItemVersion = 0;
        foreach($items as $item){
            array_push($itemKeys, $item->key);
            $v = $item->get('version');
            if($v > $latestItemVersion){
                $latestItemVersion = $v;
            }
        }
        if($version === null){
            if($this->itemsVersion !== 0){
                $version = $this->itemsVersion;
            }
            else {
                $version = $latestItemVersion;
            }
        }
        
        $aparams = array('target'=>'items', 'itemKey'=>$itemKeys);
        $response = $this->owningLibrary->request($aparams, 'DELETE', null, array('If-Unmodified-Since-Version'=>$version));
        return $response;
    }
}

namespace Zotero;

function libZoteroDebug($m){
    if(LIBZOTERO_DEBUG){
        error_log($m);
    }
    return;
}

/**
 * Interface to API and storage of a Zotero user or group library
 * 
 * @package libZotero
 */
class Library
{
    public $apiKey = '';
    public $libraryType = null;
    public $libraryID = null;
    public $libraryUrlIdentifier = null;
    public $libraryBaseWebsiteUrl = null;
    public $items = null;
    public $collections = null;
    public $dirty = null;
    public $useLibraryAsContainer = true;
    public $libraryVersion = 0;
    public $net;
    protected $_lastResponse = null;
    
    /**
     * Constructor for Library
     *
     * @param string $libraryType user|group
     * @param string $libraryID id for zotero library, unique when combined with libraryType
     * @param string $libraryUrlIdentifier library identifier used in urls, either ID or slug
     * @param string $apiKey zotero api key
     * @param string $baseWebsiteUrl base url to use when generating links to the website version of items
     * @param string $cachettl cache time to live in seconds, cache disabled if 0
     * @return Library
     */
    public function __construct($libraryType = null, $libraryID = null, $libraryUrlIdentifier = null, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org", $cachettl=0)
    {
        $this->apiKey = $apiKey;
        if (!extension_loaded('curl')) {
            throw new Exception("You need cURL");
        }
        
        $this->libraryType = $libraryType;
        $this->libraryID = $libraryID;
        $this->libraryUrlIdentifier = $libraryUrlIdentifier;
        
        $this->libraryBaseWebsiteUrl = $baseWebsiteUrl . '/';
        if($this->libraryType == 'group'){
            $this->libraryBaseWebsiteUrl .= 'groups/';
        }
        $this->libraryBaseWebsiteUrl .= $this->libraryUrlIdentifier . '/items';
        
        $this->items = new Items();
        $this->items->owningLibrary = $this;
        $this->collections = new Collections();
        $this->collections->owningLibrary = $this;
        $this->collections->libraryUrlIdentifier = $this->libraryUrlIdentifier;
        $this->dirty = false;
        $this->net = new Net();
    }
    
    public function request($params, $method="GET", $body=NULL, $headers=array(), $basicauth=array()){
        $params = array_merge(
            [
                'libraryType' => $this->libraryType,
                'libraryID' => $this->libraryID,
                'key' => $this->apiKey
            ],
            $params);
        if(isset($params['content'])) {
            $params['include'] = $params['content'];
            unset($params['content']);
            $params['include'] = str_replace('json', 'data', $params['include']);
        }
        libZoteroDebug(print_r($params, true));
        return $this->net->request($params);
    }
    
    public function setFollow($follow){
        return $this->net->setFollow($follow);
    }
    
    public function setCacheTtl($cachettl){
        return $this->net->setCacheTtl($cachettl);
    }
    /**
     * get the last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastResponse(){
        return $this->net->getLastResponse();
    }
    
    /**
     * get the last status code from last HTTP_Response returned
     *
     * @return HTTP_Response
     */
    public function getLastStatus(){
        return $this->net->getLastResponse()->getStatus();
    }
    
    public function libraryString(){
        return Util::libraryString($this->libraryType, $this->libraryID);
    }
    
    /**
     * generate an api url for a request based on array of parameters
     *
     * @param array $params list of parameters that define the request
     * @param string $base the base api url
     * @return string
     */
    public function apiRequestUrl($params = array()) {
        return Url::apiRequestUrl(array_merge(
            [
                'libraryType' => $this->libraryType,
                'libraryID' => $this->libraryID
            ],
            $params)
        );
    }
    
    /**
     * generate an api query string for a request based on array of parameters
     *
     * @param array $passedParams list of parameters that define the request
     * @return string
     */
    public function apiQueryString($passedParams=array()){
        if((!isset($passedParams['key'])) && $this->apiKey){
            $passedParams['key'] = $this->apiKey;
        }
        return Url::apiQueryString($passedParams);
    }
    
    public function apiRequestString($params = array()) {
        $merge = [
            'libraryType' => $this->libraryType,
            'libraryID' => $this->libraryID,
        ];
        if($this->apiKey){
            $merge['key'] = $this->apiKey;
        }
        $params = array_merge($merge, $params);
        
        return Url::apiRequestString($params);
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchAllCollections($params = array()){
        return $this->collections->fetchAllCollections($params);
    }
    
    /**
     * Load 1 request worth of collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchCollections($params = array()){
        return $this->collections->fetchCollections($params);
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Collection
     */
    public function fetchCollection($collectionKey){
        return $this->collections->fetchCollection($collectionKey);
    }
    
    /**
     * Make a single request loading top level items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemsTop($params=array()){
        $params['targetModifier'] = 'top';
        return $this->fetchItems($params);
    }
    
    /**
     * Make a single request loading item keys
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemKeys($params=array()){
        $fetchedKeys = [];
        $aparams = array_merge(['target'=>'items', 'format'=>'keys'], $params);
        $response = $this->request($aparams);
        if($response->isError()){
            throw new Exception("Error fetching item keys");
        }
        $body = $response->getRawBody();
        $fetchedKeys = explode("\n", trim($body) );
        
        return $fetchedKeys;
    }
    
    /**
     * Make a single request loading items in the trash
     *
     * @param array $params list of parameters additionally filtering the request
     * @return array of fetched items
     */
    public function fetchTrashedItems($params=array()){
        $fetchedItems = array();
        $aparams = array_merge($params, ['collectionKey'=>'trash', 'target'=>'items']);
        $response = $this->request($aparams);
        $responseArray = $response->parseResponseBody();
        $fetchedItems = $this->items->addItemsFromJson($responseArray);
        
        return $fetchedItems;
    }
    
    /**
     * Make a single request loading a list of items
     *
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItems($params = array()){
        $fetchedItems = array();
        $aparams = array_merge($params, ['target'=>'items']);
        $response = $this->request($aparams);
        $respArray = $response->parseResponseBody();
        $fetchedItems = $this->items->addItemsFromJson($respArray);
        
        return $fetchedItems;
    }

    /**
     * Make a single request loading a list of items
     *
     * @param string $itemKey key of item to stop retrieval at
     * @param array $params list of parameters that define the request
     * @return array of fetched items
     */
    public function fetchItemsAfter($itemKey, $params = array()){
        $fetchedItems = array();
        $itemKeys = $this->fetchItemKeys($params);
        if($itemKey != ''){
            $index = array_search($itemKey, $itemKeys);
            if($index == false){
                return array();
            }
        }
        
        $offset = 0;
        while($offset < $index){
            if($index - $offset > 50){
                $uindex = $offset + 50;
            }
            else{
                $uindex = $index;
            }
            $itemKeysToFetch = array_slice($itemKeys, 0, $uindex);
            $offset == $uindex;
            $params['itemKey'] = implode(',', $itemKeysToFetch);
            $fetchedSet = $this->fetchItems($params);
            $fetchedItems = array_merge($fetchedItems, $fetchedSet);
        }
        
        return $fetchedItems;
    }
    
    
    /**
     * Load a single item by itemKey
     *
     * @param string $itemKey
     * @return Item
     */
    public function fetchItem($itemKey, $params=array()){
        $aparams = array_merge(array('target'=>'item', 'itemKey'=>$itemKey), $params);
        $response = $this->request($aparams, 'GET');
        $respArray = $response->parseResponseBody();
        $item = new Item($respArray, $this);
        $this->items->addItem($item);
        return $item;
    }
    
    /**
     * Load a single item bib by itemKey
     *
     * @param string $itemKey
     * @return Item
     */
    public function fetchItemBib($itemKey, $style){
        //TODO:parse correctly and return just bib
        $aparams = array('target'=>'item', 'include'=>'bib', 'itemKey'=>$itemKey);
        if($style){
            $aparams['style'] = $style;
        }
        $response = $this->request($aparams, 'GET');
        $respArray = $response->parseResponseBody();
        
        $item = new Item($respArray, $this);
        $this->items->addItem($item);
        return $item;
    }

    /**
     * construct the url for file download of the item if it exists
     *
     * @param string $itemKey
     * @return string
     */
    public function itemDownloadLink($itemKey){
        $aparams = array('target'=>'item', 'itemKey'=>$itemKey, 'targetModifier'=>'file');
        return $this->apiRequestString($aparams);
    }
    
    /**
     * Write a modified item back to the api
     *
     * @param Item $item the modified item to be written back
     * @return Zotero_Response
     */
    public function writeUpdatedItem($item){
        if($item->owningLibrary == null) {
            $item->associateWithLibrary($this);
        }
        return $this->items->writeItem($item);
    }
    
    /**
     * Upload the file for a previously created attachment item
     * @param  \Zotero\Item $item         Existing item of type attachment
     * @param  filedata $fileContents Contents of the file
     * @param  array  $fileinfo     md5, filename, filesize, and mtime for the file
     * @return bool               boolean success
     */
    public function uploadNewAttachedFile($item, $fileContents, $fileinfo=array()){
        //get attachment template
        //create child attachment item / modify existing
        //get upload authorization
        //full upload
        //register upload
        //
        //get upload authorization
        $aparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->key);
        $postData = "md5={$fileinfo['md5']}&filename={$fileinfo['filename']}&filesize={$fileinfo['filesize']}&mtime={$fileinfo['mtime']}";
        libZoteroDebug("uploadNewAttachedFile postData: $postData");
        $headers = array('If-None-Match'=>'*');
        $response = $this->request($aparams, 'POST', $postData, $headers);
        
        if($response->getStatus() == 200){
            libZoteroDebug("200 response from upload authorization ");
            $body = $response->getRawBody();
            $resObject = json_decode($body, true);
            if(!empty($resObject['exists'])){
                libZoteroDebug("File already exists ");
                return true;//api already has a copy, short-circuit with positive result
            }
            else{
                libZoteroDebug("uploading filecontents padded as specified ");
                //upload file padded with information we just got
                $uploadPostData = $resObject['prefix'] . $fileContents . $resObject['suffix'];
                libZoteroDebug($uploadPostData);
                $uploadHeaders = array('Content-Type'=>$resObject['contentType']);
                $uploadResponse = $this->net->request($resObject['url'], 'POST', $uploadPostData, $uploadHeaders);
                if($uploadResponse->getStatus() == 201){
                    libZoteroDebug("got upload response 201 ");
                    //register upload
                    $ruparams = array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$item->key);
                    //$registerUploadData = array('upload'=>$resObject['uploadKey']);
                    $registerUploadData = "upload=" . $resObject['uploadKey'];
                    
                    $regUpResponse = $this->request($ruparams, 'POST', $registerUploadData, array('If-None-Match'=>'*'));
                    if($regUpResponse->getStatus() == 204){
                        libZoteroDebug("successfully registered upload ");
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
        }
        else{
            libZoteroDebug("non-200 response from upload authorization ");
            return false;
        }
    }
    
    public function createAttachmentItem($parentItem, $linkMode='imported_file'){
        //get attachment template
        $templateItem = $this->getTemplateItem('attachment', $linkMode);
        $templateItem->parentKey = $parentItem->key;
        
        //create child item
        return $this->createItem($templateItem);
    }
    
    /**
     * Make API request to create a new item
     *
     * @param Item $item the newly created Item to be added to the server
     * @return Zotero_Response
     */
    public function createItem($items){
        if(is_array($items)){
            return $this->items->writeItems($items);
        } else {
            return $this->items->writeItems([$item]);
        }
    }
    
    /**
     * Get a template for a new item of a certain type
     *
     * @param string $itemType type of item the template is for
     * @return Item
     */
    public function getTemplateItem($itemType, $linkMode=null){
        $newItem = new Item(null, $this);
        $aparams = array('target'=>'itemTemplate', 'itemType'=>$itemType);
        if($linkMode){
            $aparams['linkMode'] = $linkMode;
        }
        
        $response = $this->request($aparams);
        if($response->isError()){
            throw new Exception("API error retrieving item template - {$response->getStatus()} : {$response->getRawBody()}");
        }
        libZoteroDebug($response->getRawBody());
        $itemTemplate = json_decode($response->getRawBody(), true);
        $newItem->initItemFromTemplate($itemTemplate);
        return $newItem;
    }
    
    /**
     * Add child notes to a parent item
     *
     * @param Item $parentItem the item the notes are to be children of
     * @param Item|array $noteItem the note item or items
     * @return array of Item
     */
    public function addNotes($parentItem, $noteItem){
        $aparams = array('target'=>'items');
        $reqUrl = $this->apiRequestString($aparams);
        $noteWriteItems = array();
        if(!is_array($noteItem)){
            if(get_class($noteItem) == "Item"){
                $noteWriteItems[] = $noteItem;
            }
            else {
                throw new Exception("Unexpected note item type");
            }
        }
        else{
            foreach($noteItem as $nitem){
                $noteWriteItems[] = $nitem;
            }
        }
        
        //set parentItem for all notes
        $parentItemKey = $parentItem->key;
        foreach($noteWriteItems as $nitem){
            $nitem->set("parentItem", $parentItemKey);
        }
        return $this->items->writeItems($noteWriteItems);
    }
    
    /**
     * Create a new collection in this library
     *
     * @param string $name the name of the new item
     * @param Item $parent the optional parent collection for the new collection
     * @return Zotero_Response
     */
    public function createCollection($name, $parent = false){
        $collection = new Collection(null, $this);
        $collection->set('name', $name);
        $collection->set('parentCollectionKey', $parent);
        return $this->collections->writeCollection($collection);
    }
    
    /**
     * Delete a collection from the library
     *
     * @param Collection $collection collection object to be deleted
     * @return Zotero_Response
     */
    public function removeCollection($collection){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->collectionKey);
        $response = $this->request($aparams, 'DELETE', null, array('If-Unmodified-Since-Version'=>$collection->get('collectionVersion')));
        return $response;
    }
    
    /**
     * Add Items to a collection
     *
     * @param Collection $collection to add items to
     * @param array $items
     * @return Zotero_Response
     */
    public function addItemsToCollection($collection, $items){
        foreach($items as $item){
            $item->addToCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove items from a collection
     *
     * @param Collection $collection to add items to
     * @param array $items
     * @return array $removedItemKeys list of itemKeys successfully removed
     */
    public function removeItemsFromCollection($collection, $items){
        foreach($items as $item){
            $item->removeFromCollection($collection);
        }
        $updatedItems = $this->items->writeItems($items);
        return $updatedItems;
    }
    
    /**
     * Remove a single item from a collection
     *
     * @param Collection $collection to add items to
     * @param Item $item
     * @return Zotero_Response
     */
    public function removeItemFromCollection($collection, $item){
        $item->removeFromCollection($collection);
        return $this->items->writeItems(array($item));
    }
    
    /**
     * Write a modified collection object back to the api
     *
     * @param Collection $collection to modify
     * @return Zotero_Response
     */
    public function writeUpdatedCollection($collection){
        return $this->collections->writeUpdatedCollection($collection);
    }
    
    /**
     * Permanently delete an item from the API
     *
     * @param Item $item
     * @return Zotero_Response
     */
    public function deleteItem($item){
        $this->items->deleteItem($item);
    }
    
    public function deleteItems($items, $version=null){
        $this->items->deleteItems($items, $version);
    }
    
    /**
     * Put an item in the trash
     *
     * @param Item $item
     * @return Zotero_Response
     */
    public function trashItem($item){
        return $item->trashItem();
    }
    
    /**
     * Fetch any child items of a particular item
     *
     * @param Item $item
     * @return array $fetchedItems
     */
    public function fetchItemChildren($item){
        $itemKey = ApiObject::extractKey($item);
        
        $aparams = array('target'=>'children', 'itemKey'=>$itemKey);
        $response = $this->request($aparams, 'GET');
        
        //load response into item objects
        $fetchedItems = array();
        if($response->isError()){
            return false;
            throw new Exception("Error fetching items");
        }
        
        $respArray = $response->parseResponseBody();
        return $this->items->addItemsFromJson($respArray);
    }
    
    /**
     * Get the list of itemTypes the API knows about
     *
     * @return array $itemTypes
     */
    public function getItemTypes(){
        return $this->net->getItemTypes();
    }
    
    /**
     * Get the list of item Fields the API knows about
     *
     * @return array $itemFields
     */
    public function getItemFields(){
        return $this->net->getItemFields();
    }
    
    /**
     * Get the creatorTypes associated with an itemType
     *
     * @param string $itemType
     * @return array $creatorTypes
     */
    public function getCreatorTypes($itemType){
        return $this->net->getCreatorTypes($itemType);
    }
    
    /**
     * Get the creator Fields the API knows about
     *
     * @return array $creatorFields
     */
    public function getCreatorFields(){
        return $this->getCreatorFields();
    }
    
    /**
     * Fetch all the tags defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchAllTags($params){
        $aparams = array_merge(array('target'=>'tags', 'limit'=>50), $params);
        $reqUrl = $this->apiRequestString($aparams);
        do{
            $response = $this->net->request($reqUrl, 'GET');
            $respArray = $response->parseResponseBody();
            foreach($respArray as $tagArray){
                $tag = new Tag($tagArray);
                $tags[] = $tag;
            }
            
            $responseLinks = $response->linkHeaders();
            if(isset($responseLinks['next'])){
                $reqUrl = $responseLinks['next'];
            } else {
                $reqUrl = false;
            }
        } while($reqUrl);
        
        return $tags;
    }
    
    /**
     * Make a single request for Zotero tags in this library defined by the passed parameters
     *
     * @param array $params list of parameters defining the request
     * @return array $tags
     */
    public function fetchTags($params = array()){
        $aparams = array_merge(array('target'=>'tags', 'limit'=>50), $params);
        $tags = [];
        $response = $this->request($aparams, 'GET');
        $respArray = $response->parseResponseBody();
        foreach($respArray as $tagArray){
            $tag = new Tag($tagArray);
            $tags[] = $tag;
        }
        
        return $tags;
    }
    
    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    public function getKeyPermissions($userID=null, $key=false) {
        if($userID === null){
            $userID = $this->libraryID;
        }
        if($key == false){
            if($this->apiKey == '') {
                false;
            }
            $key = $this->apiKey;
        }
        return $this->net->getKeyPermissions($userID, $key);
    }
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function fetchGroups($userID=''){
        if($userID == ''){
            $userID = $this->libraryID;
        }
        
        return $this->net->fetchGroups($userID);
    }
    
    /**
     * Get recently created public groups
     *
     * @return array $groups
     */
    public function fetchRecentGroups(){
        return $this->net->fetchRecentGroups();
    }
    
    /**
     * Get CV for a user
     *
     * @param string $userID
     * @return array $groups
     */
    public function getCV($userID=''){
        return $this->net->getCV($userID);
    }
    
    //these functions aren't really necessary for php since serializing
    //or apc caching works fine, with only the possible loss of a curl
    //handle that will be re-initialized
    public function saveLibrary(){
        $serialized = serialize($this);
        return $serialized;
    }
    
    public static function loadLibrary($dump){
        return unserialize($dump);
    }

    //load aliases for fetch functions
    public function loadAllCollections($params = []){
        return $this->fetchAllCollections($params);
    }
    
    public function loadCollections($params = []){
        return $this->fetchCollections($params);
    }
    
    public function loadItemsTop($params=[]){
        return $this->fetchItemsTop($params);
    }

    //alias for fetchItems
    public function loadItems($params = []){
        return $this->fetchItems($params);
    }
    
    public function loadItem($itemKey){
        return $this->fetchItem($itemKey);
    }
}


namespace Zotero;

 /**
  * Explicit mappings for Zotero
  *
  * @package    libZotero
  */
class Mappings
{
    public $itemTypes = array();
    public $itemFields = array();
    public $itemTypeCreatorTypes = array();
    public $creatorFields = array();
    
    
}


namespace Zotero;

const ZOTERO_URI = 'https://api.zotero.org';
const ZOTERO_WWW_URI = 'https://www.zotero.org';
const LIBZOTERO_DEBUG = 0;
const ZOTERO_API_VERSION = 3;

 /**
  * Handle making requests for Zotero API
  *
  * @package    Zotero
  */
class Net
{
    protected $ch = null;
    public $followRedirects;
    public $userAgent = 'LibZotero-php';
    public $cacheResponses = true;
    public $cachettl = 300;
    public $cache;
    
    public function __construct()
    {
        if (extension_loaded('curl')) {
            $this->ch = curl_init();
        } else {
            throw new Exception("You need cURL");
        }
        
        $this->cache = new ApcCache();
    }
    
    /**
     * Destructor, closes cURL.
     */
    public function __destruct() {
        curl_close($this->ch);
    }
    
    /**
     * Make http request to zotero api
     *
     * @param string $url target api url
     * @param string $method http method GET|POST|PUT|DELETE
     * @param string $body request body if write
     * @param array $headers headers to set on request
     * @return HTTP_Response
     */
    public function request($url, $method="GET", $body=NULL, $headers=array(), $basicauth=array()) {
        if (is_array($url)){
            $url = Url::apiRequestString($url);
        }
        libZoteroDebug( "url being requested: " . $url . "\n\n");
        $ch = curl_init();
        $httpHeaders = array();
        //set api version - allowed to be overridden by passed in value
        if(!isset($headers['Zotero-API-Version'])){
            $headers['Zotero-API-Version'] = ZOTERO_API_VERSION;
        }
        if(!isset($headers['User-Agent'])){
            $headers['User-Agent'] = 'LibZotero-php';
        }
        
        foreach($headers as $key=>$val){
            $httpHeaders[] = "$key: $val";
        }
        //disable Expect header
        $httpHeaders[] = 'Expect:';
        
        if(!empty($basicauth)){
            $passString = $basicauth['username'] . ':' . $basicauth['password'];
            curl_setopt($ch, CURLOPT_USERPWD, $passString);
            curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        if($this->followRedirects){
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        }
        else{
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        }
        
        $umethod = strtoupper($method);
        switch($umethod){
            case "GET":
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                break;
            case "POST":
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "PUT":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                break;
            case "DELETE":
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
                break;
        }
        
        $gotCached = false;
        if($this->cacheResponses && $umethod == 'GET'){
            $cachedResponse = $this->cache->fetch($url, $success);
            if($success){
                $responseBody = $cachedResponse['responseBody'];
                $responseInfo = $cachedResponse['responseInfo'];
                $zresponse = HttpResponse::fromString($responseBody);
                $gotCached = true;
            }
        }
        
        if(!$gotCached){
            $responseBody = curl_exec($ch);
            $responseInfo = curl_getinfo($ch);
            $zresponse = HttpResponse::fromString($responseBody);
            //Zend Response does not parse out the multiple sets of headers returned when curl automatically follows
            //a redirect and the new headers are left in the body. Zend_Http_Client gets around this by manually
            //handling redirects. That may end up being a better solution, but for now we'll just re-read responses
            //until a non-redirect is read
            if($this->followRedirects){
                while($zresponse->isRedirect()){
                    $redirectedBody = $zresponse->getBody();
                    $zresponse = HttpResponse::fromString($redirectedBody);
                }
            }
            
            $saveCached = array(
                'responseBody'=>$responseBody,
                'responseInfo'=>$responseInfo,
            );
            if($this->cacheResponses && !($zresponse->isError()) ){
                $this->cache->store($url, $saveCached, $this->cachettl);
            }
        }
        $this->_lastResponse = $zresponse;
        return $zresponse;
    }
    
    public function proxyHttpRequest($url, $method='GET', $body=null, $headers=array()) {
        $endPoint = $url;
        try{
            $response = $this->request($url, $method, $body, $headers);
            if($response->getStatus() == 303){
                //this might not account for GET parameters in the first url depending on the server
                $newLocation = $response->getHeader("Location");
                $reresponse = $this->request($newLocation, $method, $body, $headers);
                return $reresponse;
            }
        }
        catch(\Exception $e){
            $r = new HttpResponse(500, array(), $e->getMessage());
            return $r;
        }
        
        return $response;
    }
    
    /**
     * Set _followRedirect, controlling whether curl automatically follows location header redirects
     * @param bool $follow automatically follow location header redirect
     */
    public function setFollow($follow){
        $this->followRedirects = $follow;
    }
    
    /**
     * set the cache time to live after initialization
     *
     * @param int $cachettl cache time to live in seconds, 0 disables
     * @return null
     */
    public function setCacheTtl($cachettl){
        if($cachettl == 0){
            $this->cacheResponses = false;
            $this->cachettl = 0;
        }
        else{
            $this->cacheResponses = true;
            $this->cachettl = $cachettl;
        }
    }
    
    /**
     * Get groups a user belongs to
     *
     * @param string $userID
     * @return array $groups
     */
    public function fetchGroups($userID=''){
        $aparams = array('target'=>'userGroups', 'userID'=>$userID, 'order'=>'title');
        $reqUrl = Url::apiRequestString($aparams);
        
        $response = $this->request($reqUrl, 'GET');
        $respArray = $response->parseResponseBody();
        $groups = array();
        foreach($respArray as $groupArray){
            $group = new Group($groupArray);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get recently created public groups
     *
     * @return array $groups
     */
    public function fetchRecentGroups(){
        $aparams = array('target'=>'groups', 'limit'=>'10', 'order'=>'dateAdded', 'sort'=>'desc', 'fq'=>'-GroupType:Private');
        $reqUrl = Url::apiRequestString($aparams);
        $response = $this->request($reqUrl, 'GET');
        $respArray = $response->parseResponseBody();
        $groups = array();
        foreach($respArray as $groupArray){
            $group = new Group($groupArray);
            $groups[] = $group;
        }
        return $groups;
    }
    
    /**
     * Get CV for a user
     *
     * @param string $userID
     * @return array $groups
     */
    public function getCV($userID=''){
        if($userID == '' && $this->libraryType == 'user'){
            $userID = $this->libraryID;
        }
        $aparams = array('target'=>'cv', 'libraryType'=>'user', 'libraryID'=>$userID, 'linkwrap'=>'1');
        $reqUrl = Url::apiRequestString($aparams);
        
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            return false;
        }
        
        $doc = new \DOMDocument();
        $doc->loadXml($response->getBody());
        $sectionNodes = $doc->getElementsByTagNameNS('*', 'cvsection');
        $sections = array();
        foreach($sectionNodes as $sectionNode){
            $sectionTitle = $sectionNode->getAttribute('title');
            $c = $doc->saveHTML($sectionNode);// $sectionNode->nodeValue;
            $sections[] = array('title'=> $sectionTitle, 'content'=>$c);
        }
        return $sections;
    }
    
    /**
     * Get the list of itemTypes the API knows about
     *
     * @return array $itemTypes
     */
    public function getItemTypes(){
        $reqUrl = ZOTERO_URI . 'itemTypes';
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemTypes");
        }
        $itemTypes = json_decode($response->getBody(), true);
        return $itemTypes;
    }
    
    /**
     * Get the list of item Fields the API knows about
     *
     * @return array $itemFields
     */
    public function getItemFields(){
        $reqUrl = ZOTERO_URI . 'itemFields';
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch itemFields");
        }
        $itemFields = json_decode($response->getBody(), true);
        return $itemFields;
    }
    
    /**
     * Get the creatorTypes associated with an itemType
     *
     * @param string $itemType
     * @return array $creatorTypes
     */
    public function getCreatorTypes($itemType){
        $reqUrl = ZOTERO_URI . 'itemTypeCreatorTypes?itemType=' . $itemType;
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorTypes");
        }
        $creatorTypes = json_decode($response->getBody(), true);
        return $creatorTypes;
    }
    
    /**
     * Get the creator Fields the API knows about
     *
     * @return array $creatorFields
     */
    public function getCreatorFields(){
        $reqUrl = ZOTERO_URI . 'creatorFields';
        $response = $this->request($reqUrl, 'GET');
        if($response->isError()){
            throw new Zotero_Exception("failed to fetch creatorFields");
        }
        $creatorFields = json_decode($response->getBody(), true);
        return $creatorFields;
    }
    
    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    public function getKeyPermissions($userID, $key) {
        $aparams = ['target'=>'key', 'apiKey'=>$key, 'userID'=>$userID];
        $response = $this->request($aparams, 'GET');
        $keyArray = $response->parseResponseBody();
        return $keyArray;
    }
    
    public function _cacheSave(){
        
    }
    
    public function _cacheLoad(){
        
    }

    public function getLastResponse() {
        return $this->_lastResponse;
    }

}


namespace Zotero;

/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://framework.zend.com/license/new-bsd
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@zend.com so we can send you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_Http
 * @subpackage Response
 * @version    $Id: Response.php 23484 2010-12-10 03:57:59Z mjh_ca $
 * @copyright  Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */

/**
 * Zend_Http_Response represents an HTTP 1.0 / 1.1 response message. It
 * includes easy access to all the response's different elemts, as well as some
 * convenience methods for parsing and validating HTTP responses.
 *
 * @package    Zend_Http
 * @subpackage Response
 * @copyright  Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
//class Zend_Http_Response
class HttpResponse
{
    /**
     * List of all known HTTP response codes - used by responseCodeAsText() to
     * translate numeric codes to messages.
     *
     * @var array
     */
    protected static $messages = array(
        // Informational 1xx
        100 => 'Continue',
        101 => 'Switching Protocols',

        // Success 2xx
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',

        // Redirection 3xx
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',  // 1.1
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        // 306 is deprecated but reserved
        307 => 'Temporary Redirect',

        // Client Error 4xx
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Timeout',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Requested Range Not Satisfiable',
        417 => 'Expectation Failed',

        // Server Error 5xx
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
        505 => 'HTTP Version Not Supported',
        509 => 'Bandwidth Limit Exceeded'
    );

    /**
     * The HTTP version (1.0, 1.1)
     *
     * @var string
     */
    protected $version;

    /**
     * The HTTP response code
     *
     * @var int
     */
    protected $code;

    /**
     * The HTTP response code as string
     * (e.g. 'Not Found' for 404 or 'Internal Server Error' for 500)
     *
     * @var string
     */
    protected $message;

    /**
     * The HTTP response headers array
     *
     * @var array
     */
    protected $headers = array();

    /**
     * The HTTP response body
     *
     * @var string
     */
    protected $body;

    /**
     * HTTP response constructor
     *
     * In most cases, you would use Zend_Http_Response::fromString to parse an HTTP
     * response string and create a new Zend_Http_Response object.
     *
     * NOTE: The constructor no longer accepts nulls or empty values for the code and
     * headers and will throw an exception if the passed values do not form a valid HTTP
     * responses.
     *
     * If no message is passed, the message will be guessed according to the response code.
     *
     * @param int    $code Response code (200, 404, ...)
     * @param array  $headers Headers array
     * @param string $body Response body
     * @param string $version HTTP version
     * @param string $message Response code as text
     * @throws Exception
     */
    public function __construct($code, array $headers, $body = null, $version = '1.1', $message = null)
    {
        // Make sure the response code is valid and set it
        if (self::responseCodeAsText($code) === null) {
            
            throw new Exception("{$code} is not a valid HTTP response code");
        }

        $this->code = $code;

        foreach ($headers as $name => $value) {
            if (is_int($name)) {
                $header = explode(":", $value, 2);
                if (count($header) != 2) {
                    
                    throw new Exception("'{$value}' is not a valid HTTP header");
                }

                $name  = trim($header[0]);
                $value = trim($header[1]);
            }

            $this->headers[ucwords(strtolower($name))] = $value;
        }

        // Set the body
        $this->body = $body;

        // Set the HTTP version
        if (! preg_match('|^\d\.\d$|', $version)) {
            
            throw new Exception("Invalid HTTP response version: $version");
        }

        $this->version = $version;

        // If we got the response message, set it. Else, set it according to
        // the response code
        if (is_string($message)) {
            $this->message = $message;
        } else {
            $this->message = self::responseCodeAsText($code);
        }
    }

    /**
     * Check whether the response is an error
     *
     * @return boolean
     */
    public function isError()
    {
        $restype = floor($this->code / 100);
        if ($restype == 4 || $restype == 5) {
            return true;
        }

        return false;
    }

    /**
     * Check whether the response in successful
     *
     * @return boolean
     */
    public function isSuccessful()
    {
        $restype = floor($this->code / 100);
        if ($restype == 2 || $restype == 1) { // Shouldn't 3xx count as success as well ???
            return true;
        }

        return false;
    }

    /**
     * Check whether the response is a redirection
     *
     * @return boolean
     */
    public function isRedirect()
    {
        $restype = floor($this->code / 100);
        if ($restype == 3) {
            return true;
        }

        return false;
    }

    /**
     * Get the response body as string
     *
     * This method returns the body of the HTTP response (the content), as it
     * should be in it's readable version - that is, after decoding it (if it
     * was decoded), deflating it (if it was gzip compressed), etc.
     *
     * If you want to get the raw body (as transfered on wire) use
     * $this->getRawBody() instead.
     *
     * @return string
     */
    public function getBody()
    {
        //added by fcheslack - curl adapter handles these things already so they are transparent to Zend_Response
        return $this->getRawBody();
        
        
        $body = '';

        // Decode the body if it was transfer-encoded
        switch (strtolower($this->getHeader('transfer-encoding'))) {

            // Handle chunked body
            case 'chunked':
                $body = self::decodeChunkedBody($this->body);
                break;

            // No transfer encoding, or unknown encoding extension:
            // return body as is
            default:
                $body = $this->body;
                break;
        }

        // Decode any content-encoding (gzip or deflate) if needed
        switch (strtolower($this->getHeader('content-encoding'))) {

            // Handle gzip encoding
            case 'gzip':
                $body = self::decodeGzip($body);
                break;

            // Handle deflate encoding
            case 'deflate':
                $body = self::decodeDeflate($body);
                break;

            default:
                break;
        }

        return $body;
    }

    /**
     * Get the raw response body (as transfered "on wire") as string
     *
     * If the body is encoded (with Transfer-Encoding, not content-encoding -
     * IE "chunked" body), gzip compressed, etc. it will not be decoded.
     *
     * @return string
     */
    public function getRawBody()
    {
        return $this->body;
    }

    /**
     * Get the HTTP version of the response
     *
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Get the HTTP response status code
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->code;
    }

    /**
     * Return a message describing the HTTP response code
     * (Eg. "OK", "Not Found", "Moved Permanently")
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Get the response headers
     *
     * @return array
     */
    public function getHeaders()
    {
        return $this->headers;
    }

    /**
     * Get a specific header as string, or null if it is not set
     *
     * @param string$header
     * @return string|array|null
     */
    public function getHeader($header)
    {
        $header = ucwords(strtolower($header));
        if (! is_string($header) || ! isset($this->headers[$header])) return null;

        return $this->headers[$header];
    }

    /**
     * Get all headers as string
     *
     * @param boolean $status_line Whether to return the first status line (IE "HTTP 200 OK")
     * @param string $br Line breaks (eg. "\n", "\r\n", "<br />")
     * @return string
     */
    public function getHeadersAsString($status_line = true, $br = "\n")
    {
        $str = '';

        if ($status_line) {
            $str = "HTTP/{$this->version} {$this->code} {$this->message}{$br}";
        }

        // Iterate over the headers and stringify them
        foreach ($this->headers as $name => $value)
        {
            if (is_string($value))
                $str .= "{$name}: {$value}{$br}";

            elseif (is_array($value)) {
                foreach ($value as $subval) {
                    $str .= "{$name}: {$subval}{$br}";
                }
            }
        }

        return $str;
    }

    /**
     * Get the entire response as string
     *
     * @param string $br Line breaks (eg. "\n", "\r\n", "<br />")
     * @return string
     */
    public function asString($br = "\n")
    {
        return $this->getHeadersAsString(true, $br) . $br . $this->getRawBody();
    }

    /**
     * Implements magic __toString()
     *
     * @return string
     */
    public function __toString()
    {
        return $this->asString();
    }

    /**
     * A convenience function that returns a text representation of
     * HTTP response codes. Returns 'Unknown' for unknown codes.
     * Returns array of all codes, if $code is not specified.
     *
     * Conforms to HTTP/1.1 as defined in RFC 2616 (except for 'Unknown')
     * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10 for reference
     *
     * @param int $code HTTP response code
     * @param boolean $http11 Use HTTP version 1.1
     * @return string
     */
    public static function responseCodeAsText($code = null, $http11 = true)
    {
        $messages = self::$messages;
        if (! $http11) $messages[302] = 'Moved Temporarily';

        if ($code === null) {
            return $messages;
        } elseif (isset($messages[$code])) {
            return $messages[$code];
        } else {
            return 'Unknown';
        }
    }

    /**
     * Extract the response code from a response string
     *
     * @param string $response_str
     * @return int
     */
    public static function extractCode($response_str)
    {
        preg_match("|^HTTP/[\d\.x]+ (\d+)|", $response_str, $m);

        if (isset($m[1])) {
            return (int) $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the HTTP message from a response
     *
     * @param string $response_str
     * @return string
     */
    public static function extractMessage($response_str)
    {
        preg_match("|^HTTP/[\d\.x]+ \d+ ([^\r\n]+)|", $response_str, $m);

        if (isset($m[1])) {
            return $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the HTTP version from a response
     *
     * @param string $response_str
     * @return string
     */
    public static function extractVersion($response_str)
    {
        preg_match("|^HTTP/([\d\.x]+) \d+|i", $response_str, $m);

        if (isset($m[1])) {
            return $m[1];
        } else {
            return false;
        }
    }

    /**
     * Extract the headers from a response string
     *
     * @param   string $response_str
     * @return  array
     */
    public static function extractHeaders($response_str)
    {
        $headers = array();

        // First, split body and headers
        $parts = preg_split('|(?:\r?\n){2}|m', $response_str, 2);
        if (! $parts[0]) return $headers;

        // Split headers part to lines
        $lines = explode("\n", $parts[0]);
        unset($parts);
        $last_header = null;

        foreach($lines as $line) {
            $line = trim($line, "\r\n");
            if ($line == "") break;

            // Locate headers like 'Location: ...' and 'Location:...' (note the missing space)
            if (preg_match("|^([\w-]+):\s*(.+)|", $line, $m)) {
                unset($last_header);
                $h_name = strtolower($m[1]);
                $h_value = $m[2];

                if (isset($headers[$h_name])) {
                    if (! is_array($headers[$h_name])) {
                        $headers[$h_name] = array($headers[$h_name]);
                    }

                    $headers[$h_name][] = $h_value;
                } else {
                    $headers[$h_name] = $h_value;
                }
                $last_header = $h_name;
            } elseif (preg_match("|^\s+(.+)$|", $line, $m) && $last_header !== null) {
                if (is_array($headers[$last_header])) {
                    end($headers[$last_header]);
                    $last_header_key = key($headers[$last_header]);
                    $headers[$last_header][$last_header_key] .= $m[1];
                } else {
                    $headers[$last_header] .= $m[1];
                }
            }
        }

        return $headers;
    }

    /**
     * Extract the body from a response string
     *
     * @param string $response_str
     * @return string
     */
    public static function extractBody($response_str)
    {
        $parts = preg_split('|(?:\r?\n){2}|m', $response_str, 2);
        if (isset($parts[1])) {
            return $parts[1];
        }
        return '';
    }

    /**
     * Decode a "chunked" transfer-encoded body and return the decoded text
     *
     * @param string $body
     * @return string
     */
    public static function decodeChunkedBody($body)
    {
        // Added by Dan S. -- don't fail on Transfer-encoding:chunked response
        //that isn't really chunked
        if (! preg_match("/^([\da-fA-F]+)[^\r\n]*\r\n/sm", trim($body), $m)) {
            return $body;
        }
       
        $decBody = '';

        // If mbstring overloads substr and strlen functions, we have to
        // override it's internal encoding
        if (function_exists('mb_internal_encoding') &&
           ((int) ini_get('mbstring.func_overload')) & 2) {

            $mbIntEnc = mb_internal_encoding();
            mb_internal_encoding('ASCII');
        }

        while (trim($body)) {
            if (! preg_match("/^([\da-fA-F]+)[^\r\n]*\r\n/sm", $body, $m)) {
                
                throw new Exception("Error parsing body - doesn't seem to be a chunked message");
            }

            $length = hexdec(trim($m[1]));
            $cut = strlen($m[0]);
            $decBody .= substr($body, $cut, $length);
            $body = substr($body, $cut + $length + 2);
        }

        if (isset($mbIntEnc)) {
            mb_internal_encoding($mbIntEnc);
        }

        return $decBody;
    }

    /**
     * Decode a gzip encoded message (when Content-encoding = gzip)
     *
     * Currently requires PHP with zlib support
     *
     * @param string $body
     * @return string
     */
    public static function decodeGzip($body)
    {
        if (! function_exists('gzinflate')) {
            
            throw new Exception(
                'zlib extension is required in order to decode "gzip" encoding'
            );
        }

        return gzinflate(substr($body, 10));
    }

    /**
     * Decode a zlib deflated message (when Content-encoding = deflate)
     *
     * Currently requires PHP with zlib support
     *
     * @param string $body
     * @return string
     */
    public static function decodeDeflate($body)
    {
        if (! function_exists('gzuncompress')) {
            
            throw new Exception(
                'zlib extension is required in order to decode "deflate" encoding'
            );
        }

        /**
         * Some servers (IIS ?) send a broken deflate response, without the
         * RFC-required zlib header.
         *
         * We try to detect the zlib header, and if it does not exsit we
         * teat the body is plain DEFLATE content.
         *
         * This method was adapted from PEAR HTTP_Request2 by (c) Alexey Borzov
         *
         * @link http://framework.zend.com/issues/browse/ZF-6040
         */
        $zlibHeader = unpack('n', substr($body, 0, 2));
        if ($zlibHeader[1] % 31 == 0) {
            return gzuncompress($body);
        } else {
            return gzinflate($body);
        }
    }

    /**
     * Create a new Zend_Http_Response object from a string
     *
     * @param string $response_str
     * @return Zend_Http_Response
     */
    public static function fromString($response_str)
    {
        $code    = self::extractCode($response_str);
        $headers = self::extractHeaders($response_str);
        $body    = self::extractBody($response_str);
        $version = self::extractVersion($response_str);
        $message = self::extractMessage($response_str);

        return new HttpResponse($code, $headers, $body, $version, $message);
    }
    
    public function linkHeaders()
    {
        $parsedLinks = [];
        $linkHeader = $this->getHeader('Link');
        $links = explode(',', $linkHeader);
        $linkRegex = '/^<([^>]+)>; rel="([^\"]*)"$/';
        foreach($links as $link){
            $matches = [];
            preg_match($linkRegex, $link, $matches);
            if(count($matches)){
                $parsedLinks[$matches[2]] = $matches[1];
            }
        }
        return $parsedLinks;
    }
    
    public function parseResponseBody() {
        $bodyString = $this->getBody();
        if($this->isError()){
            throw new Exception("Request was an error: {$bodyString}");
        }
        if($this->getHeader('Content-Type') != 'application/json'){
            $contentType = $this->getHeader('Content-Type');
            throw new Exception("Unexpected content type not application/json. {$contentType}");
        }
        $parsedJson = json_decode($bodyString, true);
        return $parsedJson;
    }
    
    public function getTotalResults() {
        return intval($this->getHeader('Total-Results'));
    }
}

namespace Zotero;
 /**
  * Representation of a Zotero Tag
  * 
  * @package libZotero
  */
class Tag extends ApiObject
{
    public function __construct($tagArray)
    {
        if(!$tagArray){
            return;
        }
        elseif(is_string($tagArray)){
            $tagArray = json_decode($tagArray);
        }
        
        parent::__construct($tagArray);
    }
    
    public function __get($key) {
        switch($key){
            case "tag":
            case "name":
            case "title":
                return $this->apiObj['tag'];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        if(array_key_exists($key, $this->apiObj)) {
            return $this->apiObj[$key];
        }
        return null;
    }
    
    public function __set($key, $val) {
        if(array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        return $this;
    }

    public function get($key) {
        return $this->$key;
    }
}

namespace Zotero;

class Url
{
    /**
     * generate an api url for a request based on array of parameters
     *
     * @param array $params list of parameters that define the request
     * @return string
     */
    public static function apiRequestUrl($params = []) {
        $base = ZOTERO_URI;
        
        if(!isset($params['target'])){
            throw new Exception("No target defined for api request");
        }
        
        //special case for www based api requests until those methods are mapped for api.zotero
        if($params['target'] == 'user' || $params['target'] == 'cv'){
            $base = ZOTERO_WWW_API_URI;
        }
        
        $url = $base;
        if(isset($params['libraryType'])){
            $url .= '/' . $params['libraryType'] . 's/';
            if(isset($params['libraryID'])){
                $url .= $params['libraryID'];
            }
        }
        
        if(!empty($params['collectionKey'])){
            if($params['collectionKey'] == 'trash'){
                $url .= '/items/trash';
                return $url;
            }
            else{
                $url .= '/collections/' . $params['collectionKey'];
            }
        }
        
        switch($params['target']){
            case 'items':
                $url .= '/items';
                break;
            case 'item':
                if(!empty($params['itemKey'])){
                    $url .= '/items/' . $params['itemKey'];
                }
                else{
                    $url .= '/items';
                }
                break;
            case 'collections':
                $url .= '/collections';
                break;
            case 'collection':
                break;
            case 'tags':
                $url .= '/tags';
                break;
            case 'children':
                $url .= '/items/' . $params['itemKey'] . '/children';
                break;
            case 'itemTemplate':
                $url = $base . '/items/new';
                break;
            case 'key':
                $url = $base . '/users/' . $params['userID'] . '/keys/' . $params['apiKey'];
                break;
            case 'userGroups':
                $url = $base . '/users/' . $params['userID'] . '/groups';
                break;
            case 'groups':
                $url = $base . '/groups';
                break;
            case 'cv':
                $url .= '/cv';
                break;
            case 'deleted':
                $url .= '/deleted';
                break;
            default:
                return false;
        }
        if(isset($params['targetModifier'])){
            switch($params['targetModifier']){
                case 'top':
                    $url .= '/top';
                    break;
                case 'children':
                    $url .= '/children';
                    break;
                case 'file':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file';
                    break;
                case 'fileview':
                    if($params['target'] != 'item'){
                        throw new Exception('Trying to get file on non-item target');
                    }
                    $url .= '/file/view';
                    break;
            }
        }
        return $url;
    }
    
    /**
     * generate an api query string for a request based on array of parameters
     *
     * @param array $passedParams list of parameters that define the request
     * @return string
     */
    public static function apiQueryString($passedParams=array()){
        // Tags query formats
        //
        // ?tag=foo
        // ?tag=foo bar // phrase
        // ?tag=-foo // negation
        // ?tag=\-foo // literal hyphen (only for first character)
        // ?tag=foo&tag=bar // AND
        // ?tag=foo&tagType=0
        // ?tag=foo bar || bar&tagType=0
        
        $queryParamOptions = array('start',
                                 'limit',
                                 'order',
                                 'sort',
                                 'content',
                                 'include',
                                 'q',
                                 'itemType',
                                 'locale',
                                 'key',
                                 'itemKey',
                                 'tag',
                                 'tagType',
                                 'style',
                                 'format',
                                 'linkMode',
                                 'linkwrap'
                                 );
        //build simple api query parameters object
        $queryParams = array();
        foreach($queryParamOptions as $i=>$val){
            if(isset($passedParams[$val]) && ($passedParams[$val] != '')) {
                //check if itemKey belongs in the url or the querystring
                if($val == 'itemKey' && isset($passedParams['target']) && ($passedParams['target'] != 'items') ) continue;
                $queryParams[$val] = $passedParams[$val];
            }
        }
        
        $queryString = '?';
        ksort($queryParams);
        $queryParamsArray = array();
        foreach($queryParams as $index=>$value){
            if(is_array($value)){
                if($index == 'itemKey'){
                    $queryParamsArray[] = urlencode($index) . '=' . urlencode(implode(',', $value));
                } else {
                    foreach($value as $key=>$val){
                        if(is_string($val) || is_int($val)){
                            $queryParamsArray[] = urlencode($index) . '=' . urlencode($val);
                        }
                    }
                }
            } elseif(is_string($value) || is_int($value)){
                $queryParamsArray[] = urlencode($index) . '=' . urlencode($value);
            }
        }
        $queryString .= implode('&', $queryParamsArray);
        return $queryString;
    }
    
    public static function apiRequestString($params = []) {
        return self::apiRequestUrl($params) . self::apiQueryString($params);
    }
    
    /**
     * parse a query string and separate into parameters
     * without using the php way of representing query strings
     *
     * @param string $query
     * @return array
     */
    public static function parseQueryString($query){
        $params = explode('&', $query);
        $aparams = array();
        foreach($params as $val){
            $t = explode('=', $val);
            $aparams[urldecode($t[0])] = urldecode($t[1]);
        }
        return $aparams;
    
    }
}

namespace Zotero;
/**
 * Utility functions for libZotero
 * 
 * @package libZotero
 */
class Utils
{
    public static function randomString($len=0, $chars=null) {
        if ($chars === null) {
            $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if ($len==0) {
            $len = 8;
        }
        $randomstring = '';
        for ($i = 0; $i < $len; $i++) {
            $rnum = rand(0, strlen($chars) - 1);
            $randomstring .= $chars[$rnum];
        }
        return $randomstring;
    }
    
    public static function getKey() {
        $baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Utils::randomString(8, $baseString);
    }
    
    //update items appropriately based on response to multi-write request
    //for success:
    //  update objectKey if item doesn't have one yet (newly created item)
    //  update itemVersion to response's Last-Modified-Version header
    //  mark as synced
    //for unchanged:
    //  don't need to do anything? itemVersion should remain the same?
    //  mark as synced if not already?
    //for failed:
    //  do something. flag as error? display some message to user?
    public static function updateObjectsFromWriteResponse($objectsArray, $response){
        $data = json_decode($response->getRawBody(), true);
        if($response->getStatus() == 200){
            $newLastModifiedVersion = $response->getHeader("Last-Modified-Version");
            if(isset($data['success'])){
                foreach($data['success'] as $ind=>$key){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    
                    $objectKey = $object->get('key');
                    if($objectKey != '' && $objectKey != $key){
                        throw new Exception("Item key mismatch in multi-write request");
                    }
                    if($objectKey == ''){
                        $object->set('key', $key);
                    }
                    $object->set('version', $newLastModifiedVersion);
                    $object->synced = true;
                    $object->writeFailure = false;
                }
            }
            if(isset($data['failed'])){
                foreach($data['failed'] as $ind=>$val){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    $object->writeFailure = $val;
                }
            }
        }
        elseif($response->getStatus() == 204){
            $objectsArray[0]->synced = true;
        }
    }
    
    /**
     * Construct a string that uniquely identifies a library
     * This is not related to the server GUIDs
     *
     * @return string
     */
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring += $libraryID;
        return $lstring;
    }
    
    public static function wrapDOIs($txt){
        $matches = array();
        $doi = preg_match("(10\.[^\s\/]+\/[^\s]+)", $txt, $matches);
        $m1 = htmlspecialchars($matches[0]);
        $safetxt = htmlspecialchars($txt);
        return "<a href=\"http://dx.doi.org/{$matches[0]}\" rel=\"nofollow\">{$safetxt}</a>";
    }
    
    public static function translateMimeType($mimeType)
    {
        switch ($mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return $mimeType;
        }
    }
}


?>