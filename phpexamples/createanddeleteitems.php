<?php
require_once './user_writing_config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $userID, $userSlug, $apiKey);

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
else{
    //load the item into the library so it is included and has the itemKey and etag
    //and anything else the api populates that we didn't set in our item
    $createItemFeed = new Zotero_Feed($createItemResponse->getBody());
    $createdItem = $library->items->addItemsFromFeed($createItemFeed);
    $createdItem = $createdItem[0];
    echo "Item created\n\n\n<br />";
}
$existingItem = new Zotero_Item($createItemResponse->getBody());

//add child note
$newNoteItem = $library->getTemplateItem('note');
$addNoteResponse = $library->addNotes($existingItem, $newNoteItem);
if($addNoteResponse->isError()){
    echo $addNoteResponse->getStatus() . "\n";
    echo $addNoteResponse->getBody() . "\n";
    die("error adding child note to item");
}
echo "added child note\n\n<br />";

$existingItem->set('date', '2011');
//$existingItem->set('deleted', 1);
$updateItemResponse = $library->writeUpdatedItem($existingItem);
if($updateItemResponse->isError()){
    echo "<br /><br />\n\n" . $updateItemResponse->getStatus();
    echo "<br /><br />\n\n" . $updateItemResponse->getBody();
    die("Error updating Zotero item\n\n");
}
//replace the item in library->items with the api response
$updatedItem = new Zotero_Item($updateItemResponse->getBody());
$library->items->replaceItem($updatedItem);
echo "Item updated\n\n\n<br />";

//try to get the items we just created separately to make sure the api has them
//and they've been updated correctly
$existingItemKey = $existingItem->itemKey;
echo "getting existing item\n<br />";
$retrievedExistingItem = $library->loadItem($existingItemKey);
echo "got existing item\n<br />";
$diff = $existingItem->compareItem($retrievedExistingItem);
echo "difference between created item and retrieved item:\n<br />";
var_dump($diff);
if($existingItem === $retrievedExistingItem){
    echo "existingItem and retrievedExistingItem point to the same object\n<br />";
}
else{
    echo "pointing to different items\n<br />";
}

echo "Deleting created item \n<br />";
$deleteResponse = $library->deleteItem($retrievedExistingItem);
if($deleteResponse->isError()){
    echo "Error deleting item: \n<br />";
    echo $deleteResponse->getStatus();
    echo $deleteResponse->getBody();
}
else{
    echo "Item Deleted\n<br />";
}

?>