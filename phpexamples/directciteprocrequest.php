<!DOCTYPE html>
<?php
error_reporting(E_ALL | E_STRICT);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);

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
$cslItems = array();
foreach($items as $item){
    $cslItems[] = $item->getCSLItem();
}
$cslContainer = array("items"=>$cslItems);

$body = json_encode($cslContainer);
$url = 'http://127.0.0.1:8085/';

$ch = curl_init();
$httpHeaders = array();
//set api version - allowed to be overridden by passed in value
//disable Expect header
$httpHeaders[] = 'Expect:';
curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLINFO_HEADER_OUT, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$responseBody = curl_exec($ch);
$responseInfo = curl_getinfo($ch);

$zresponse = libZotero_Http_Response::fromString($responseBody);
$bib = json_decode($zresponse->getRawBody(), true);
$bibMeta = $bib["bibliography"][0];
$bibEntries = $bib["bibliography"][1];

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
    <ul>
    <?foreach($items as $item):?>
        <li>
            <?=print_r($item->getCSLItem(), true);?>
        </li>
    <?endforeach;?>
    </ul>
    <?=$bibMeta['bibstart'];?>
    <?foreach($bibEntries as $entry):?>
        <?=$entry;?>
    <?endforeach;?>
    <?=$bibMeta['bibend'];?>
    <?var_dump($bib);?>
</body>
</html>