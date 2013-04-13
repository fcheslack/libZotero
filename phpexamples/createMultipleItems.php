<?php
require_once './user_writing_config.php'; //library credentials

require_once '../build/libZoteroSingle.php';

//create the zotero library object which will be our interface for interacting with the Zotero API
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

/* create a new item of type book
 * getting a template item causes the appropriate fields to be present in the item
 * without doing this the item doesn't know what fields are valid for this item type
 * even if we do
 */
$newBookItem = $library->getTemplateItem('book');
// give the book a title
$newBookItem->set('title', "Foo");

//create a note item that we'll attach to the book
$newNote = $library->getTemplateItem('note');
$newNote->set('note', "Bar");

//create a second note item we'll also attach
$newNote2 = $library->getTemplateItem('note');
$newNote2->set('note', "Baz");

//Attach the items to the book. Attaching them this way means they'll also be
//written to the Zotero server when we write the book.
$newBookItem->addNote($newNote);
$newBookItem->addNote($newNote2);

//create a journal article item we'll also create in the library
$newJournalItem = $library->getTemplateItem('journalArticle');
$newJournalItem->set('title', 'Bat');

//write multiple items in a single request
//we only pass in the book and journal items, since the notes go with the book
//(Note that we could also create the notes separately by giving them a parentItem,
//but with a parent item that has only been created locally so far it is simpler to
//let libZotero do it)
$writtenItems = $library->items->writeItems(array($newBookItem, $newJournalItem));
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
