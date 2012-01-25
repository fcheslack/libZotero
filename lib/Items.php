<?php

class Zotero_Items
{
    public $itemObjects = array();
    
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
}
