<?php
require_once './user_writing_config.php'; //library credentials

require_once '../build/libZoteroSingle.php';

//create the zotero library object which will be our interface for interacting with the Zotero API
$zlib = new \Zotero\Library($libraryType, $libraryID, $librarySlug, $apiKey);

$zItems = array();
for($i= 0; $i < 5; $i++) {
    $item = $zlib->getTemplateItem('webpage');
    $item->set('title', 'zotero webpage item');
    $zItems[] = $item;
}
#make the request to save the items to the Zotero server
$writtenItems = $zlib->items->writeItems($zItems);
#individual items may fail even if the request goes through, so we should check each one for errors
foreach($writtenItems as $item){
    if($item->writeFailure != false) {
        echo "Failed writing item {$item->writeFailure['key']} - {$item->get('title')}\n";
        echo "Status code: {$item->writeFailure['code']}\n";
        echo "Message: {$item->writeFailure['message']}\n\n";
    }
    else {
        echo "Item successfully created. itemKey: {$item->get('itemKey')} - {$item->get('title')}";
    }
}

#get the version of the last item to use for delete requests
$version = $writtenItems[count($writtenItems)-1]->get('itemVersion');
#split written items into chunks since we can only delete 50 at a time
$chunks = array_chunk($writtenItems, 50);
foreach($chunks as $chunk) {
    $deletedItemResponse = $zlib->items->deleteItems($chunk, $version);
    if($deletedItemResponse->isError()) {
        print "Error: {$deletedItemResponse->getStatus()} {$deletedItemResponse->getBody()}\n";
    }
    else {
        print("Chunk of items deleted.");
    }
    $newVersion = $deletedItemResponse->getHeader('Last-Modified-Version');
    if ($newVersion > $version) {
        $version = $newVersion;
    }
}
?>