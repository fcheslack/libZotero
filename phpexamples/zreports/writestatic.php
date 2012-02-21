<?php

require_once './ZReport.php';
require_once './config.php'; //library credentials

require_once './libZoteroSingle.php';

$libraryCacheType = 'file';//file or apc
$librarySaveFilePath = './_librarycache';

$uncached = getopt('u');
if(empty($uncached)) {
    if($libraryCacheType == 'file'){
        if(file_exists($librarySaveFilePath)){
            $lcacheString = file_get_contents($librarySaveFilePath);

            if($lcacheString){
                $library = unserialize($lcacheString);
                echo "unserialized cached library\n";
            }
        }
    }
    elseif($libraryCacheType == 'apc'){
        if(apc_exists('zreportlibrarycache')){
            $library = apc_fetch('zreportlibrarycache');
            echo "got cached library from apc\n";
        }
    }
}
else{
    apc_clear_cache('user');
}

if(empty($library)){
    echo "No cached library\n";
    $library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey, "http://www.zotero.org", 3600);
}

echo "initialized Library\n";
$itemKeys = $library->fetchItemKeys(array('collectionKey'=>$reportCollectionKey, 'order'=>'date', 'sort'=>'desc'));

$unknownItemKeys = array();
foreach($itemKeys as $key){
    if($library->items->getItem($key) === false && $key != ''){
        $unknownItemKeys[] = $key;
    }
}
echo "Unknown Keys to be retrieved:\n";
var_dump($unknownItemKeys);

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
        echo "fetching set of items from $offset to $uindex \n\n";
        $itemKeysToFetch = array_slice($unknownItemKeys, $offset, $length);
        $offset = $uindex;
        $params['itemKey'] = implode(',', $itemKeysToFetch);
        echo $params['itemKey'] . "\n";
        $fetchedSet = $library->fetchItems($params);
        echo "Got items up to $uindex \n\n";
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

//clear the cache for static generation - the static files are our cache
//apc_clear_cache('user');

//$items = $library->fetchItems(array('collectionKey'=>$reportCollectionKey, 'limit'=>100));

echo "have items: " . count($items) . "\n";
$pages = $zreport->writePages($items);

for($i = 0; $i < count($pages); $i++){
    $zreport->savePage($pages[$i], $i+1);
}

//save library
if($libraryCacheType == 'file'){
    file_put_contents($librarySaveFilePath, serialize($library));
}
elseif($libraryCacheType == 'apc'){
    apc_store('zreportlibrarycache', $library);
}

?>