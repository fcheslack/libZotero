<!DOCTYPE html>
<?php
require_once './config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

if(isset($_GET['userID'])){
    $cv = $library->getCV($_GET['userID']);
}
else{
    $cv = false;
}
?>
<html>
<head>
    <title>User C.V.</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>User C.V.</h2>
    <?if($cv):?>
        <?foreach($cv as $section):?>
            <div class='cv-section' style="padding:5px; margin:5px;">
            <?=$section;?>
            </div>
        <?endforeach;?>
    <?else:?>
        <form method="GET">
            <label>User ID</label><input type="text" name="userID">
            <button type="submit">Submit</button>
        </form>
    <?endif;?>
</body>
</html>