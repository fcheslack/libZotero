<?php
require_once './config.php'; //library credentials

require_once './build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $userID, $userSlug, $apiKey);


//get some tags
/*
$tags = $library->fetchTags(array('limit'=>5, 'order'=>'title', 'sort'=>'desc'));
foreach($tags as $tag){
    if($tag->numItems > 0){
        echo $tag->name . " - " . $tag->numItems . "\n";
    }
    else{
        echo $tag->name . " - has no items\n"; 
    }
}
$items = $library->loadItems(array('tag'=>'zotero'));
*/

//get groups the key has access to
//need more complete groups information in normal responses before this is useful
//but for now it can get IDs at least
/*
$r = $library->getAccessibleGroups($userID);
*/

//get permissions for the key
//$permissions = $library->getKeyPermissions();

//load some existing items
/*
$items = $library->loadItemsTop(array('limit'=>10));
foreach($items as $item){
    echo "Top level item with title: " . $item->get('title') . "\n";
}
var_dump($items);die;
*/
/*
//load the items currently in the trash
$items = $library->loadTrashedItems(array('limit'=>10));
foreach($items as $item){
    echo "Trashed item with title: " . $item->get('title') . "\n";
    //echo "now deleting item \n";
    //$library->deleteItem($item);
}
*/

//create a new item of type book
/*
$newItem = $library->getTemplateItem('book');
$newItem->set('title', 'This is a book');
$newItem->set('abstractNote', 'Created using a zotero php library and the write api');
$createItemResponse = $library->createItem($newItem);
if($createItemResponse->isError()){
    echo $createItemResponse->getStatus() . "\n";
    echo $createItemResponse->getBody() . "\n";
    die("Error creating Zotero item\n\n");
}
echo "Item created\n\n";
$existingItem = new Zotero_Item($createItemResponse->getBody());
//add child note
$newNoteItem = $library->getTemplateItem('note');
$addNoteResponse = $library->addNotes($existingItem, $newNoteItem);
if($addNoteResponse->isError()){
    echo $addNoteResponse->getStatus() . "\n";
    echo $addNoteResponse->getBody() . "\n";
    die("error adding child note to item");
}
echo "added child note\n";
*/
/*
$existingItem->set('date', '2011');
//$existingItem->set('deleted', 1);
$updateItemResponse = $library->writeUpdatedItem($existingItem);
if($updateItemResponse->isError()){
    die("Error updating Zotero item\n\n");
}
echo "Item updated\n\n";
*/

//$library->loadItems(array());
//$library->loadAllCollections(array());
//var_dump($item);
//$item->set('title', 'newtitle');
//$updateResponse = $library->updateItem($item->itemKey);
//$deleteResponse = $library->deleteItem($item);
//var_dump($updateResponse);
/*
$item = $library->getTemplateItem('book');
var_dump($item);
*/




?>