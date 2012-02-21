<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//load the items currently in the trash
$trashedItems = $library->fetchTrashedItems(array('limit'=>10));

?>
<html>
<head>
    <title>Trash</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Trashed Items</h2>
    <?if(count($trashedItems) == 0):?>
    <p>There are no items in this library's trash</p>
    <?else:?>
    <ul>
        <?foreach($trashedItems as $item):?>
        <li><?=$item->get('title');?></li>
        <?endforeach;?>
    </ul>
    <?endif;?>
</body>
</html>