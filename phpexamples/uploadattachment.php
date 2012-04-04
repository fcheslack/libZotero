<?php
require_once './user_writing_config.php'; //library credentials

require_once '../build/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);

//add child attachment
//get attachment template
echo "adding attachment item\n";
try{
$templateItem = $library->getTemplateItem('attachment', 'imported_file');
$templateItem->parentKey = 'HP8M9UQB';
echo "creating attachment \n";
$createAttachmentResponse = $library->createItem($templateItem);
if($createAttachmentResponse->isError()){
    echo $createAttachmentResponse->getStatus() . "\n";
    echo $createAttachmentResponse->getBody() . "\n";
    die("Error creating attachment item\n\n");
}
else {
    //read new item we created
    $createdAttachmentFeed = new Zotero_Feed($createAttachmentResponse->getBody());
    $createdAttachment = $library->items->addItemsFromFeed($createdAttachmentFeed);
    $createdAttachment = $createdAttachment[0];
    echo "attachment item created \n";
    
    //upload file for attachment
    $fileContents = file_get_contents('./zotero_sticker.ai');
    
    $fileinfo = array('md5'=>md5($fileContents), 'filename'=>'zotero_sticker.ai', 'filesize'=>filesize('./zotero_sticker.ai'), 'mtime'=>filemtime('./zotero_sticker.ai'));
    echo "<br /><br />\n\nFile Info:";
    var_dump($fileinfo);
    $res = $library->uploadNewAttachedFile($createdAttachment, $fileContents, $fileinfo);
    if($res){
        echo "successfully uploaded file\n";
    }
    else{
        $errResponse = $library->getLastResponse();
        echo $errResponse->getStatus() . "\n";
        echo $errResponse->getBody() . "\n";
        die("Error uploading file\n\n");
    }
}
}
catch(Exception $e){
    echo $e->getMessage();
    $lastResponse = $library->getLastResponse();
    echo $lastResponse->getStatus() . "\n";
    echo $lastResponse->getRawBody() . "\n";
}

?>