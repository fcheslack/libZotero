<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new \Zotero\Library($libraryType, $libraryID, $librarySlug, $apiKey);

//load a couple items with multiple content types
$items = $library->fetchItemsTop(array('limit'=>2, 'include'=>'data,bib'));

?>
<html>
<head>
    <title>Multi-Content</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Multi-Content</h2>
    <?foreach($items as $item):?>
    <p>Citation:</p>
    <p><?=$item->bibContent;?></p>
    <p>JSON encoded metadata:</p>
    <p>
    <?=json_encode($item->apiObj['data']);?>
    </p>
    <?endforeach;?>
</body>
</html>