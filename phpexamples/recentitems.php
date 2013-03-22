<!DOCTYPE html>
<?php
//load credentials and library info from our config file
require_once './config.php';
//load the zotero php library
require_once '../build/libZoteroSingle.php';

//create a library object to interact with the zotero API
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//use Alternative PHP Cache to save API responses for 30 minutes
$library->setCacheTtl(1800);

//fetch most recently added items from a collection
//since the collection will never change we just use a hard coded collection key
//that was set in our config file
$items = $library->fetchItemsTop(array('limit'=>10, 'collectionKey'=>$collectionKey, 'order'=>'dateAdded', 'sort'=>'desc'));

//output the page
//if the item has a url, we'll turn the title into a link
?>
<html>

<head>
    <title>Recent Items</title>
    <meta charset="utf-8">
</head>
<body>
    <ul>
    <?foreach($items as $item):?>
        <li>
        <?$url = $item->get('url');?>
        <?if($url):?>
            <a href="<?=$url?>"><?=$item->get('title');?></a>
        <?else:?>
            <?=$item->get('title');?>
        <?endif;?>
        </li>
    <?endforeach;?>
    </ul>
</body>
</html>