<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//fetch subcollections of a collection
$collections = $library->fetchCollections(array('collectionKey'=>'', 'content'=>'json'));

$collectionKey = '';
if(count($collections)){
    $collectionKey = $collections[0]->collectionKey;
}
//fetch items from this library
$items = $library->fetchItemsTop(array('limit'=>10, 'collectionKey'=>$collectionKey));

?>
<html>
<head>
    <title>Collection and Items</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Collections</h2>
    <ul>
        <?foreach($collections as $collection):?>
        <li><?=$collection->name;?> : <?=$collection->collectionKey;?></li>
        <?endforeach;?>
    </ul>
    
    <h2>Items</h2>
    <ul>
        <?foreach($items as $item):?>
        <li><?=$item->get('title');?></li>
        <?endforeach;?>
    </ul>
</body>
</html>