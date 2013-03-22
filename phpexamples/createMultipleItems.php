<?php
require_once './user_writing_config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//create a new item of type book
$newBookItem = $library->getTemplateItem('book');
$newBookItem->set('title', "Foo");

$newNote = $library->getTemplateItem('note');
$newNote->set('note', "Bar");

$newNote2 = $library->getTemplateItem('note');
$newNote2->set('note', "Baz");

$newBookItem->addNote($newNote);
$newBookItem->addNote($newNote2);

$newJournalItem = $library->getTemplateItem('journalArticle');
$newJournalItem->set('title', 'Bat');

//write multiple items in a single request
$writtenItems = $library->items->writeItems(array($newBookItem, $newJournalItem));
if($writtenItems === false){
    echo "An error occurred\n";
    $errorResponse = $library->getLastResponse();
    echo "HTTP Status Code: {$errorResponse->getStatus()} : {$errorResponse->getMessage()}\n";
    echo "Body: {$errorResponse->getRawBody()}\n";
    die;
}

//$writtenItems will hold the same item objects we created, but updated with version numbers
//(or possibly failure messages if something went wrong)
//Note that even the note items will be at the first level of the array
//since they are just more Zotero items with a parentItem set.
foreach($writtenItems as $item){
    if($item->writeFailure !== false){
        echo "Error writing item\n";
        echo "ItemKey: " . $item->writeFailure['key'] . "\n";
        echo "ErrorCode: " . $item->writeFailure['code'] . "\n";
        echo "ErrorMessage: " . $item->writeFailure['message'] . "\n";
    }
    else {
        echo "Item written successfully: " . $item->get("itemKey") . " : " . $item->get("title") . "\n";
    }
}
