#!/usr/bin/php
<?php
chdir(dirname(__FILE__));
echo "building libZotero\n";
echo getcwd() . "\n";
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
"Cite.php",
"Item.php",
"Group.php",
"Tag.php",
"User.php",
"Creator.php",
"Library.php",
"Utils.php"
);

$fullText = "<?php\n";

foreach($files as $file){
    $ftext = file_get_contents('../lib/php/' . $file);
    $ftext = str_replace(array('<?php', '<?', '?>'), '', $ftext);
    $fullText .= $ftext;
}

$fullText .= "?>";

file_put_contents('../build/libZoteroSingle.php', $fullText);


//concatenate js files into a single file to include
$jsfiles = array(
//'underscore-min.js',
'jquery.ba-bbq.min.js',
//'WebToolKit.MD5.js',
'spark-md5.min.js',
'IndexedDBShim.min.js',
'Base.js',
'Ajax.js',
'Feed.js',
'Library.js',
'Entry.js',
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
'Filestorage.js',
'Idb.js',
//sets of functions with similar purposes that should probably be combined and clarified
'CollectionFunctions.js',
'ItemFunctions.js',
'TagFunctions.js',
'OfflineLibrary.js',
'LibraryCache.js',
'Preferences.js',
);

$fulljs = "";

foreach($jsfiles as $file){
    $ftext = file_get_contents('../lib/js/' . $file);
    $fulljs .= $ftext;
}

file_put_contents('../build/libZoteroSingle.js', $fulljs);

copy('../build/libZoteroSingle.js', '../../zotero/git-trunk/public/static/library/libZotero/libZoteroSingle.js');
copy('../build/libZoteroSingle.js', '../../web-library/library/libZotero/libZoteroSingle.js');
copy('../build/libZoteroSingle.php', '../../zotero/git-trunk/library/libZotero/libZoteroSingle.php');
copy('../build/libZoteroSingle.php', '../../web-library/library/libZotero/libZoteroSingle.php');

?>