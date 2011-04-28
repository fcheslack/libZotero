<?php

require_once "Collection.php";

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
}

/*
public function assignDepths($depth, $cArray){
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.entries);
            }
        });
    };
    foreach($this->collectionsArray as $index=>$collection){
        if($collection->topLevel){
            $collection->nestingDepth = depth;
            if($collection->hasChildren){
                $this->assignDepths(2, collection.entries);
            }
        }
    });
}
*/
/*
Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.entries);
            }
        }
    });
    return nested;
};
*/