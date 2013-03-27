<?php

/**
 * Representation of the set of collections belonging to a particular Zotero library
 * 
 * @package libZotero
 */
class Zotero_Collections
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
    
    public function addCollectionsFromFeed($feed) {
        $entries = $feed->entryNodes;
        if(empty($entries)){
            var_dump($feed);
            die;
            return array();
        }
        $addedCollections = array();
        foreach($entries as $entry){
            $collection = new Zotero_Collection($entry);
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
        usort($orderedArray, array('Zotero_Collections', 'sortByTitleCompare'));
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
            $collections[] = $collection->dataObject();
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
                $newCollectionKey = Zotero_Lib_Utils::getKey();
                $collection->set('collectionKey', $newCollectionKey);
                $collection->set('collectionVersion', 0);
            }
            $writeCollections[] = $collection;
        }
        
        $config = array('target'=>'collections', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'content'=>'json');
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        $writeArray = array();
        foreach($writeCollections as $collection){
            $writeArray[] = $collection->writeApiObject();
        }
        $requestData = json_encode(array('collections'=>$writeArray));
        $writeResponse = $this->owningLibrary->_request($requestUrl, 'POST', $requestData, array('Content-Type'=> 'application/json'));
        if($writeResponse->isError()){
            return false;
        }
        Zotero_Lib_Utils::UpdateObjectsFromWriteResponse($writeCollections, $writeResponse);
        return $writeCollections;
    }
    
    public function writeUpdatedCollection($collection){
        if($this->writeCollections(array($collection)) === false){
            return false;
        }
        return $collection;
        /*
        $aparams = array('target'=>'collection', 'collectionKey'=>$collection->get('collectionKey'));
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $json = json_encode($collection->writeApiObject());
        $response = $this->owningLibrary->_request($reqUrl, 'PUT', $json);
        if(!$response->isError()){
            $newLastModifiedVersion = $response->getHeader("Last-Modified-Version");
            $collection->set('collectionVersion', $newLastModifiedVersion);
            $collection->writeFailure = false;
        }
        else {
            $collection->writeFailure = array('key'=>$collection->get('collectionKey'), 
                                              'code'=>$response->getStatus(),
                                              'message'=>$response->getBody());
        }
        
        return $collection;
        */
    }
    
    /**
     * Load all collections in the library into the collections container
     *
     * @param array $params list of parameters limiting the request
     * @return null
     */
    public function fetchAllCollections($params = array()){
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), $params);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        do{
            $response = $this->owningLibrary->_request($reqUrl);
            if($response->isError()){
                throw new Exception("Error fetching collections");
            }
            
            $feed = new Zotero_Feed($response->getRawBody());
            $this->addCollectionsFromFeed($feed);
            
            if(isset($feed->links['next'])){
                $nextUrl = $feed->links['next']['href'];
                $parsedNextUrl = parse_url($nextUrl);
                $parsedNextUrl['query'] = $this->owningLibrary->apiQueryString($this->parseQueryString($parsedNextUrl['query']) );
                $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
            }
            else{
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
        $aparams = array_merge(array('target'=>'collections', 'content'=>'json', 'limit'=>100), $params);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl);
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collections");
        }
        
        $feed = new Zotero_Feed($response->getRawBody());
        $this->owningLibrary->_lastFeed = $feed;
        $addedCollections = $this->addCollectionsFromFeed($feed);
        
        if(isset($feed->links['next'])){
            $nextUrl = $feed->links['next']['href'];
            $parsedNextUrl = parse_url($nextUrl);
            $parsedNextUrl['query'] = $this->apiQueryString($this->parseQueryString($parsedNextUrl['query']) );
            $reqUrl = $parsedNextUrl['scheme'] . '://' . $parsedNextUrl['host'] . $parsedNextUrl['path'] . $parsedNextUrl['query'];
        }
        else{
            $reqUrl = false;
        }
        return $addedCollections;
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Zotero_Collection
     */
    public function fetchCollection($collectionKey){
        $aparams = array('target'=>'collection', 'content'=>'json', 'collectionKey'=>$collectionKey);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        
        $response = $this->owningLibrary->_request($reqUrl, 'GET');
        if($response->isError()){
            return false;
            throw new Exception("Error fetching collection");
        }
        
        $entry = Zotero_Lib_Utils::getFirstEntryNode($response->getRawBody());
        if($entry == null){
            return false;
        }
        $collection = new Zotero_Collection($entry, $this);
        $this->addCollection($collection);
        return $collection;
    }
    
}

