#!/usr/bin/php
<?php
chdir(dirname(__FILE__));
echo "building libZotero\n";
echo getcwd() . "\n";
//concatenate php files into a single file to include
$files = [
    "Exception.php",
    "Apc.php",
    "ApiObject.php",
    "Cite.php",
    "Collection.php",
    "Collections.php",
    "Creator.php",
    "File.php",
    "Group.php",
    "Item.php",
    "Items.php",
    "Library.php",
    "Mappings.php",
    "Net.php",
    "Response.php",
    "Tag.php",
    "Url.php",
    "Utils.php"
];

$fullText = "<?php\n";

foreach($files as $file){
    $ftext = file_get_contents('../lib/php/' . $file);
    $ftext = str_replace(array('<?php', '<?', '?>'), '', $ftext);
    $fullText .= $ftext;
}

$fullText .= "?>";

//$fullText = str_replace('https://api.zotero.org', 'https://apidev.zotero.org', $fullText);
file_put_contents('../build/libZoteroSingle.php', $fullText);

?>