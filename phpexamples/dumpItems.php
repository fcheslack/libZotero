<?php
//library credentials
require_once './config.php';
//load the zotero php library
require_once '../build/libZoteroSingle.php';

//create a library object to interact with the zotero API
$library = new Zotero_Library($libraryType, $libraryID, 'fcheslack', '3yRptRxDIpL3qHMHDfB5Kh8S');

//use Alternative PHP Cache to save API responses for 30 minutes
//this will cache unique api responses so we get faster responses
//and don't get rate-limited by the API for making too many requests
$library->setCacheTtl(1800);

//parameters we'll pass when retrieving items to order by item titles
$feedParams = array('order'=>'title');

//restrict the total items we'll fetch to 200
$totalItemLimit = 200;
//start at the beginning of our list by setting an offset of 0
$offset = 0;
//limit to 100 items per http request
//this is the maximum number of items the API will return in a single request
$perRequestLimit = 100;
//keep count of the items we've gotten
$fetchedItemsCount = 0;
//keep track of whether there are more items to fetch
$moreItems = true;
//where we'll keep the list of items we retrieve
$items = array();

//while there are more items and we haven't gotten to our limit yet
while(($fetchedItemsCount < $totalItemLimit) && $moreItems){
    echo "fetching items starting at $offset with $perRequestLimit items per request <br />";
    //fetching items starting at $offset with $perRequestLimit items per request
    $fetchedItems = $library->fetchItemsTop(array_merge($feedParams, array('limit'=>$perRequestLimit, 'start'=>$offset)));
    //put the items from this last request into our array of items
    $items = array_merge($items, $fetchedItems);
    //update the count of items we've got and offset by that amount
    $fetchedItemsCount += count($fetchedItems);
    $offset = $fetchedItemsCount;
    
    //Zotero_Library keeps track of the last feed it got so we can check if there is a 'next' link
    //indicating more results to be fetched
    if(!isset($library->getLastFeed()->links['next'])){
        $moreItems = false;
    }
}

//output the page
?>
<!DOCTYPE html>
<html>

<head>
    <title>Dump Items</title>
    <meta charset="utf-8">
</head>
<body>
    <p>Here we fetch a set of items from our library ordered by title and display the itemKey and title of each item in the list below.</p>
    <ul>
    <?foreach($items as $item):?>
        <li>
            itemKey:<?=$item->itemKey;?> | title:<?=$item->get('title');?>
        </li>
    <?endforeach;?>
    </ul>
</body>
</html>