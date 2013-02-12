<?php
require_once './config.php'; //library credentials

require_once '../../build/libZoteroSingle.php';

/**
 * Load a single item by itemKey only if it belongs to a specific collection
 *
 * @param Zotero_Library $library
 * @param string $itemKey
 * @param string $collectionKey
 * @return Zotero_Item
 */
function fetchCollectionItem($library, $itemKey, $collectionKey){
    $citemKey = $itemKey . ','; //hackish way to get a single item by itemKey + collectionKey by forcing itemKey into querystring
    $aparams = array('target'=>'items', 'content'=>'json', 'itemKey'=>$itemKey, 'collectionKey'=>$collectionKey);
    $reqUrl = $library->apiRequestUrl($aparams) . $library->apiQueryString($aparams);
    $response = $library->_request($reqUrl, 'GET');
    if($response->isError()){
        return false;
        throw new Exception("Error fetching items");
    }
    
    $body = $response->getRawBody();
    $doc = new DOMDocument();
    $doc->loadXml($body);
    $entries = $doc->getElementsByTagName("entry");
    if(!$entries->length){
        return false;
        throw new Exception("no item with specified key found");
    }
    else{
        $entry = $entries->item(0);
        $item = new Zotero_Item($entry);
        $library->items->addItem($item);
        return $item;
    }
}

$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
$library->setCacheTtl(300);

$itemKey = $_GET["itemkey"];

$item = fetchCollectionItem($library, $itemKey, $collectionKey);
if($item === false){
    $lastResponse = $library->getLastResponse();
    http_response_code($lastResponse->getStatus());
    return;
}
$children = $library->fetchItemChildren($item);
$firstChild = $children[0];
$item = $firstChild;
//var_dump($firstChild);die;
$itemKey = $item->itemKey;

if($item->attachmentIsSnapshot()){
    $library->setFollow(false);
    $fileSnapshotLink = $library->apiRequestUrl(array('target'=>'item', 'targetModifier'=>'fileview', 'itemKey'=>$itemKey)) . "?key=" . $apiKey;
    $itemDownloadResponse = $library->_request($fileSnapshotLink);
    $library->setFollow(true);
    
    if(($itemDownloadResponse instanceof libZotero_Http_Response) && ($itemDownloadResponse->getStatus() == 302)){
        $responseHeaders = $itemDownloadResponse->getHeaders();
        $framesrc = $responseHeaders['Location'];
    }
    else{
        http_response_code(404);
        return;
    }
}
elseif($item->hasFile()) {
    $library->setFollow(false);
    $itemDownloadUrl = $library->apiRequestUrl(array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$itemKey)) . '?key=' . $apiKey;
    $itemDownloadResponse = $library->_request($itemDownloadUrl);
    
    if(($itemDownloadResponse instanceof libZotero_Http_Response) && ($itemDownloadResponse->getStatus() == 302)){
        $responseHeaders = $itemDownloadResponse->getHeaders();
        header('Location: ' . $responseHeaders['Location']);
        http_response_code($itemDownloadResponse->getStatus());
        return;
    }
    else{
        http_response_code(404);
        return;
    }
}
else {
    $framesrc = "";
    http_response_code(404);
    echo "No attachment";
    return;
}
?>
<!DOCTYPE html>
<html lang="en" class="no-js" style="height:100%; margin:0; padding:0;"> 
    <head>
        <title>Zotero Snapshot</title>
         <style type="text/css">
            #zoterosnapshot-header {
                min-height: 25px;
                background-color: rgba(0, 0, 0, .1);
                box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                -webkit-box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                -moz-box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                position: relative;
                font-family: "Lucida Grande", sans-serif;
                font-size: 1em;
                padding: 10px;
                line-height: 25px;
            }

            #zoterosnapshot-header a {
                text-decoration: none;
                color: #38C;
            }
         </style>
    </head>
    <body style="height:100%; margin:0; overflow:hidden">
        <div id="zoterosnapshot-header">
            <div id='leave-frame-div' style="float:right;">
                <a id="leave-frame-link" href='#'>Leave Frame</a>
            </div>
            <div style="text-align:center;">
            You are viewing a Zotero snapshot. 
            </div>
        </div>
        <div id="frame-container" style="height:95%">
        <iframe id="zoterosnapshotframe" name="zoterosnapshotframe" width='100%' marginwidth="0" marginheight="0" frameborder="0" scrolling='auto' sandbox='' style="width:100%; height:100%; padding:0; margin:0;" src="<?=$framesrc;?>">
            Frame not available. <a href="<?=$framesrc;?>">View without frame.</a>
        </iframe>
        </div>
        
        <script type="text/javascript" charset="utf-8" src="http://code.jquery.com/jquery-1.9.0.min.js"></script>
        <script type="text/javascript" charset="utf-8">
            jQuery(document).ready(function() {
                jQuery('#leave-frame-link').on('click', function(e){
                    window.location = jQuery('#zoterosnapshotframe').prop('src');
                });
                jQuery(window).resize(function(){
                    var newFrameHeight = jQuery(window).height() - jQuery('#zoterosnapshot-header').height();
                    jQuery('#frame-container').css('height', '' + newFrameHeight + 'px');
                });
                var newFrameHeight = jQuery(window).height() - jQuery('#zoterosnapshot-header').height();
                jQuery('#frame-container').css('height', '' + newFrameHeight + 'px');
            });
        </script>
    </body>
</html>