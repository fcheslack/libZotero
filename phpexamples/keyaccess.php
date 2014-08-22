<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new \Zotero\Library($libraryType, $libraryID, $librarySlug, $apiKey);

//get permissions for the key
$userID = '';
$key = '';
$permissions = $library->getKeyPermissions($userID, $key);
?>
<html>
<head>
    <title>Key Permissions</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>Key Permissions</h2>
    <?if($key == ''):?>
        No key specified in library.
    <?else:?>
        <?=json_encode($permissions, JSON_PRETTY_PRINT);?>
    <?endif;?>
</body>
</html>