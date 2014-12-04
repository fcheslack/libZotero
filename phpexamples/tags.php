<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new \Zotero\Library($libraryType, $libraryID, $librarySlug, $apiKey);

//get some tags
$tags = $library->fetchTags(array('limit'=>20, 'order'=>'title', 'sort'=>'desc'));

?>
<html>
<head>
    <title>Tags</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Tags</h2>
    <ul>
        <?foreach($tags as $tag):?>
        <li><?=$tag->name;?> has <?=$tag->numItems;?> items associated with it.</li>
        <?endforeach;?>
    </ul>
</body>
</html>