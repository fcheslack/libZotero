<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
$library->setCacheTtl(90);

//load a couple items with multiple content types
$items = $library->fetchItemsTop(array('limit'=>10, 'content'=>'bib,citation,coins', 'linkwrap'=>1, 'style'=>'chicago-fullnote-bibliography'));

?>
<html>
<head>
    <title>Multi-Content</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Bib-Content</h2>
    <?foreach($items as $item):?>
    <p><?=$item->bibContent;?></p>
    <?endforeach;?>
    
    <h2>Citation</h2>
    <?foreach($items as $item):?>
    <p><?=$item->subContents['citation'];?></p>
    <?endforeach;?>
    
    <h2>COINS</h2>
    <?foreach($items as $item):?>
    <?=htmlspecialchars_decode($item->subContents['coins']);?>
    <?endforeach;?>

</body>
</html>