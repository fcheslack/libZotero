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


//concatenate js files into a single file to include
$jsfiles = array(
'jquery.ba-bbq.min.js',
'promise-0.1.1.min.js',
'spark-md5.min.js',
//'IndexedDBShim.min.js',
'Base.js',
'Ajax.js',
'ApiObject.js',
'ApiResponse.js',
'Net.js',
'Library.js',
'Container.js',
'Collections.js',
'Items.js',
'Tags.js',
'Groups.js',
'Searches.js',
'Deleted.js',
'Collection.js',
'Item.js',
'ItemMaps.js',
'Tag.js',
'Search.js',
'Group.js',
'User.js',
'Utils.js',
'Url.js',
'File.js',
'Idb.js',
//sets of functions with similar purposes that should probably be combined and clarified
'CollectionFunctions.js',
'ItemFunctions.js',
'TagFunctions.js',
'LibraryCache.js',
'Preferences.js',
);

$fulljs = "";

foreach($jsfiles as $file){
    $ftext = file_get_contents('../lib/js/' . $file);
    $fulljs .= $ftext;
}

file_put_contents('../build/libZoteroSingle.js', $fulljs);

?>