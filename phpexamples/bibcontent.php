<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
$library->setCacheTtl(90);

//load a couple items with multiple content types
$items = $library->fetchItemsTop(array('limit'=>10, 'content'=>'bib,coins'));

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
    <?=$item->bibContent;?>
    <?endforeach;?>
    
    <h2>Bib-Content with live links</h2>
    <?foreach($items as $item):?>
    <p>Citation:</p>
    <?=Zotero_Lib_Utils::wrapLinks($item->bibContent);?>
    <?endforeach;?>
    
    <h2>COINS</h2>
    <?foreach($items as $item):?>
    <p>Coins:</p>
    <?=htmlspecialchars_decode($item->subContents['coins']);?>
    <?endforeach;?>

</body>
</html>