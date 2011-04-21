<?php

require_once './classes/Library.php';
//$library = new Zotero_Library('user', 10150, 'fcheslack', 'fa1qlarxjerb41vumzh1r2d6');
$library = new Zotero_Library('user', 10150, 'fcheslack', '2GLoGDRtIiXlzOd2Gi6rS6n9');

//load some existing items
$items = $library->loadItemsTop(array('limit'=>10));
foreach($items as $item){
    echo "Top level item with title: " . $item->get('title') . "\n";
}
/*
//create a new item of type book
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
$existingItem->set('date', '2011');
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