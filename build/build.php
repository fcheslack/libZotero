<?php
//concatenate php files into a single file to include
$files = array(
"Zotero_Exception.php",
"Mappings.php",
"Feed.php",
"Entry.php",
"Collection.php",
"Collections.php",
"Items.php",
"Response.php",
"Item.php",
"Group.php",
"Tag.php",
"User.php",
"Creator.php",
"Library.php"
);

$fullText = "<?php\n";

foreach($files as $file){
    $ftext = file_get_contents('../lib/' . $file);
    $ftext = str_replace(array('<?php', '<?', '?>'), '', $ftext);
    $fullText .= $ftext;
}

$fullText .= "?>";

file_put_contents('../build/libZoteroSingle.php', $fullText);

?>