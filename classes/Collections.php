<?php

class Zotero_Collections
{
    public $collectionsArray;
    public $dirty;
    public $loaded;
    
    public static function sortByTitleCompare($a, $b){
    if(strtolower($a->title) == strtolower($b->title)){
        return 0;
    }
    if(strtolower($a->title) < strtolower($b->title)){
        return -1;
    }
    return 1;
}
/*
public function assignDepths(depth, cArray){
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.entries);
            }
        });
    };
    J.each(this.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                insertchildren(2, collection.entries);
            }
        }
    });
};

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
}
