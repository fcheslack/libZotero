<?php

require_once './classes/Library.php';
$library = new Zotero_Library('user', 10150, 'fcheslack', 'fa1qlarxjerb41vumzh1r2d6');
$library->loadItems(array());

var_dump($library->items);
//$response = $library->_request('https://api.zotero.org/users/10150/items?limit=5&content=json&key=fa1qlarxjerb41vumzh1r2d6');

//var_dump($response);
//$response = $zotero->getItemsTop(10150, array('limit'=>5, 'content'=>'json'), 'users');
//$response = $zotero->getCollections(10150, array('limit'=>5, 'content'=>'json'), 'users');
//$response = $zotero->getItemsTop(10150, array('limit'=>5, 'content'=>'json'), 'users');

//$dom = new DOMDocument();
//$dom->loadXml($response);



?>