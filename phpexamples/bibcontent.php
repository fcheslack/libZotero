<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//load a couple items with multiple content types
$items = $library->fetchItemsTop(array('limit'=>2, 'content'=>'bib'));

?>
<html>
<head>
    <title>Multi-Content</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Bib-Content</h2>
    <?foreach($items as $item):?>
    <p>Citation:</p>
    <p><?=$item->bibContent;?></p>
    <?endforeach;?>
</body>
</html>