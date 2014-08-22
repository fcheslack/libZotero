<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new \Zotero\Library($libraryType, $libraryID, $librarySlug, $apiKey);

//load all itemkeys in the library
$itemKeys = $library->fetchItemKeys();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Item Keys</title>
    <meta charset="utf-8">
</head>
<body>
    <p>List of all item keys in the library.</p>
    <p>There are a total of <?=count($itemKeys);?> items in this library/collection, including top level items and their children (notes/attachments).</p>
    <ul>
        <?foreach($itemKeys as $itemKey):?>
        <li><?=$itemKey;?></li>
        <?endforeach;?>
    </ul>
</body>
</html>