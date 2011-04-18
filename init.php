<?php

require_once './classes/Library.php';
//$library = new Zotero_Library('user', 10150, 'fcheslack', 'fa1qlarxjerb41vumzh1r2d6');
$library = new Zotero_Library('user', 10150, 'fcheslack', '2GLoGDRtIiXlzOd2Gi6rS6n9');
//$library->loadItems(array());
//$library->loadAllCollections(array());
$item = $library->loadItem('E3QBAZDC');
//$item->set('title', 'newtitle');
//$updateResponse = $library->updateItem($item->itemKey);
$deleteResponse = $library->deleteItem($item);
var_dump($updateResponse);
/*
$item = $library->getTemplateItem('book');
var_dump($item);
*/




?>