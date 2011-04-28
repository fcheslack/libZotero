<?php

class Zotero_Items
{
    public $itemObjects = array();
    
    public function getItem($itemKey) {
        if(isset($this->itemObjects[$itemKey])){
            return $this->itemObjects[$itemKey];
        }
        return false;
    }
    
    public function addItem($item) {
        $itemKey = $item->itemKey;
        $this->itemObjects[$itemKey] = $item;
    }
}
