<?php
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

?>