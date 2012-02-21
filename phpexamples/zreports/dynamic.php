<?php

require_once './ZReport.php';
require_once './config.php'; //library credentials

require_once './libZoteroSingle.php';


if(empty($_GET['uncached'])){
    if($libraryCacheType == 'file'){
        if(file_exists($librarySaveFilePath))
        $lcacheString = file_get_contents($librarySaveFilePath);

        if($lcacheString){
            $library = unserialize($lcacheString);
        }
    }
    elseif($libraryCacheType == 'apc'){
        $library = apc_fetch('zreportlibrarycache');
    }
}
else{
    apc_clear_cache('user');
}

if(empty($library)){
    $library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey, "http://www.zotero.org", 3600);
}

$itemKeys = $library->fetchItemKeys(array('collectionKey'=>$reportCollectionKey, 'order'=>'date', 'sort'=>'desc'));

$unknownItemKeys = array();
foreach($itemKeys as $key){
    if($library->items->getItem($key) === false && $key != ''){
        $unknownItemKeys[] = $key;
    }
}

$offset = 0;
$length = 50;
$index = count($unknownItemKeys);
try{
    while($offset < $index){
        if($index - $offset > $length){
            $uindex = $offset + $length;
        }
        else{
            $uindex = $index;
        }
//        echo "fetching set of items from $offset to $uindex \n\n";
        $itemKeysToFetch = array_slice($unknownItemKeys, $offset, $length);
        $offset = $uindex;
        $params['itemKey'] = implode(',', $itemKeysToFetch);
//        echo $params['itemKey'] . "\n";
        $fetchedSet = $library->fetchItems($params);
//        echo "Got items up to $uindex \n\n";
    }
}
catch(Exception $e){
    echo "Error fetching items\n";
    echo $e->getMessage() . "\n";
    $lastResponse = $library->getLastResponse();
    var_dump($lastResponse);
    echo "Last Response Body: " . $lastResponse->getRawBody() . " \n";
    die("Leaving\n");
}

$library->items->addChildKeys();

$items = array();
foreach($itemKeys as $key){
    $item = $library->items->getItem($key);
    if($item !== false && empty($item->links['up']) ){
        $items[] = $item;
    }
}

$zreport = new ZReport();
$zreport->setLibrary($library);
$zreport->baseUrl = $baseUrl;
$zreport->paginationType = 'query'; //set pagination type so we always use this page
$zreport->headerTemplateFile = $headerTemplateFilePath;
$zreport->postTemplateFile = $postTemplateFilePath;
$zreport->footerTemplateFile = $footerTemplateFilePath;

$p = isset($_GET['p']) ? (int)$_GET['p'] - 1 : 0;

$pages = $zreport->writePages($items);

echo $pages[$p];

//save library
if($libraryCacheType == 'file'){
    file_put_contents($librarySaveFilePath, serialize($library));
}
elseif($libraryCacheType == 'apc'){
    apc_store('zreportlibrarycache', $library, $ttl);
}

?>