<?php

/**
 * Representation of a set of items belonging to a particular Zotero library
 * 
 * @package  libZotero
 */
class Zotero_Items
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
    
    //add a Zotero_Item to this container of items
    public function addItem($item) {
        $itemKey = $item->itemKey;
        $this->itemObjects[$itemKey] = $item;
        if($this->owningLibrary){
            $item->associateWithLibrary($this->owningLibrary);
        }
    }
    
    //add items to this container from a Zotero_Feed object
    public function addItemsFromFeed($feed) {
        $entries = $feed->entryNodes;
        $addedItems = array();
        foreach($entries as $entry){
            $item = new Zotero_Item($entry);
            $this->addItem($item);
            $addedItems[] = $item;
        }
        return $addedItems;
    }
    
    //replace an item in this container with a new Zotero_Item object with the same itemKey
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
                    $pitem->childKeys[] = $item->itemKey;
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
    
    //accept an array of `Zotero_Item`s
    public function writeItems($items){
        $writeItems = array();
        
        foreach($items as $item){
            $itemKey = $item->get('itemKey');
            if($itemKey == ""){
                $newItemKey = Zotero_Lib_Utils::getKey();
                $item->set('itemKey', $newItemKey);
                $item->set('itemVersion', 0);
            }
            $writeItems[] = $item;
            
            //add separate note items if this item has any
            $itemNotes = $item->get('notes');
            if($itemNotes && (count($itemNotes) > 0) ){
                foreach($itemNotes as $note){
                    $note->set('parentItem', $item->get('itemKey'));
                    $note->set('itemKey', Zotero_Lib_Utils::getKey());
                    $note->set('itemVersion', 0);
                    $writeItems[] = $note;
                }
            }
        }
        
        $config = array('target'=>'items', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'content'=>'json');
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        $chunks = array_chunk($writeItems, 50);
        foreach($chunks as $chunk){
            $writeArray = array();
            foreach($chunk as $item){
                $writeArray[] = $item->writeApiObject();
            }
            $requestData = json_encode(array('items'=>$writeArray));
            
            $writeResponse = $this->owningLibrary->_request($requestUrl, 'POST', $requestData, array('Content-Type'=> 'application/json'));
            if($writeResponse->isError()){
                foreach($chunk as $item){
                    $item->writeFailure = array('code'=>$writeResponse->getStatus(), 'message'=>$writeResponse->getBody());
                }
            }
            else {
                Zotero_Lib_Utils::UpdateObjectsFromWriteResponse($chunk, $writeResponse);
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
        $aparams = array('target'=>'item', 'itemKey'=>$item->itemKey);
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$item->itemVersion));
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
            array_push($itemKeys, $item->get('itemKey'));
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
        $reqUrl = $this->owningLibrary->apiRequestString($aparams);
        $response = $this->owningLibrary->_request($reqUrl, 'DELETE', null, array('If-Unmodified-Since-Version'=>$version));
        return $response;
    }
}
