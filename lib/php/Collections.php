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
    
    public function addCollectionsFromJson($jsonCollectionsArray) {
        $addedCollections = [];
        foreach($jsonCollectionsArray as $collectionArray){
            $collection = new Zotero_Collection($collectionArray);
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
                $newCollectionKey = Zotero_Lib_Utils::getKey();
                $collection->set('collectionKey', $newCollectionKey);
                $collection->set('collectionVersion', 0);
            }
            $writeCollections[] = $collection;
        }
        
        $config = array('target'=>'collections', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID);
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        
        $chunks = array_chunk($writeCollections, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $collection){
                $writeArray[] = $collection->writeApiObject();
            }
            $requestData = json_encode(array('collections'=>$writeArray));
            
            $writeResponse = $this->owningLibrary->_request($requestUrl, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $collection){
                    $collection->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Zotero_Lib_Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
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
            $response = $this->owningLibrary->_request($reqUrl);
            $respArray = $this->owningLibrary->parseResponseBody($response);
            $this->addCollectionsFromJson($respArray);
            
            $linkHeaders = $response->linkHeaders();
            if(isset($linkHeaders['next'])){
                $reqUrl = $linkHeaders['next'];
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
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl);
        $respArray = $this->owningLibrary->parseResponseBody($response);
        $addedCollections = $this->addCollectionsFromJson($respArray);
        
        return $addedCollections;
    }
    
    /**
     * Load a single collection by collectionKey
     *
     * @param string $collectionKey
     * @return Zotero_Collection
     */
    public function fetchCollection($collectionKey){
        $aparams = array('target'=>'collection', 'collectionKey'=>$collectionKey);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        
        $response = $this->owningLibrary->_request($reqUrl, 'GET');
        $respArray = $response->parseResponseBody();
        $collection = new Zotero_Collection($respArray);
        $this->addCollection($collection);
        return $collection;
    }
    
}

