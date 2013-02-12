<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
$library->setCacheTtl(300);

//load a couple items with multiple content types
$items = $library->fetchItems(array('content'=>'bib,coins', 'linkwrap'=>1, 'style'=>'chicago-fullnote-bibliography', 'collectionKey'=>$collectionKey));

?>
<html>
<head>
    <title>Publications</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Publications</h2>
    <?foreach($items as $item):?>
    <p><?=$item->bibContent;?><a href="./download.php?itemkey=<?=$item->itemKey;?>">Download</a></p>
    <?=htmlspecialchars_decode($item->subContents['coins']);?>
    <?endforeach;?>
</body>
</html>