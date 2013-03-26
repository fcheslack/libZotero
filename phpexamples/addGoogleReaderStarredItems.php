<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
</head>
<body>
<form action="" method="post" enctype="multipart/form-data">
    <table>
        <tr>
            <th><label for="libraryID">libraryID:</label></th>
            <td><input name="libraryID" type="text" /></td>
        </tr>
        <tr>
            <th><label for="libraryType">libraryType:</label></th>
            <td><input name="libraryType" type="text" /></td>
        </tr>
        <tr>
            <th><label for="apiKey">apiKey:</label></th>
            <td><input name="apiKey" type="text" /></td>
        </tr>
        <tr>
            <th><label for="starredJson">Starred Json:</label></th>
            <td><input name="jsonfile" type="file" /></td>
        </tr>
        <tr>
            <th></th>
            <td><input type="submit" value="Add Items" /></td>
        </tr>
    </table>
</form>
<?php
error_reporting(E_ALL | E_STRICT);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
require_once '../build/libZoteroSingle.php';

if(!empty($_POST)){
    $libraryID = $_POST['libraryID'];
    $libraryType = $_POST['libraryType'];
    $apiKey = $_POST['apiKey'];
    $starredJson = file_get_contents($_FILES['jsonfile']['tmp_name']);
    $zlib = new Zotero_Library($libraryType, $libraryID, '', $apiKey);
    
    $starredCollection = $zlib->createCollection('Google Reader Starred');
    if($starredCollection === false || $starredCollection->writeFailure != false){
        print "<p>Error creating collection</p>";
        var_dump($zlib->getLastResponse());
        var_dump($starredCollection->writeFailure);
        die;
    }
    
    print "<p>New Zotero collection created for google reader starred items with collectionKey {$starredCollection->get('collectionKey')}</p>";
    
    //read the starred items from the json and create a Zotero item for each one
    $starredObject = json_decode($starredJson, true);
    $starredReaderItems = $starredObject['items'];
    $zItems = array();
    foreach($starredReaderItems as $readerItem){
        print "<p>Reader starred item: {$readerItem['title']}</p>";
        $item = $zlib->getTemplateItem('webpage');
        $item->set('title', $readerItem['title']);
        $item->set('date', date('Y-m-d', $readerItem['published']));
        $item->addCreator(array('creatorType'=>'author', 'name'=>$readerItem['author']));
        if(array_key_exists('content', $readerItem) && array_key_exists('content', $readerItem['content']) ){
            $item->set('abstractNote', $readerItem['content']['content']);
        }
        elseif(array_key_exists('summary', $readerItem) && array_key_exists('content', $readerItem['summary'])){
            $item->set('abstractNote', $readerItem['summary']['content']);
        }
        foreach($readerItem['alternate'] as $alt){
            if($alt['type'] == "text/html"){
                $item->set('url', $alt['href']);
                break;
            }
        }
        $item->addToCollection($starredCollection);
        $zItems[] = $item;
    }
    
    //make request to save items to the Zotero server
    $writtenItems = $zlib->items->writeItems($zItems);
    //returns false if entire request fails
    if($writtenItems === false){
        print "<p>Error writing items</p>";
    }
    //individual items may also fail even if the request goes through, so we can
    //check each one for errors
    foreach($writtenItems as $item){
        if($item->writeFailure != false){
            print "<p>Failed writing item {$item->get('itemKey')} - {$item->get('title')}</p>";
        }
        else{
            print "<p>Item successfully created. itemKey: {$item->get('itemKey')} - {$item->get('title')}</p>";
        }
    }
}
?>

</body>
</html>