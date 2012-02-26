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


//concatenate js files into a single file to include
$jsfiles = array(
'jquery.ba-bbq.min.js',
'Base.js',
'Ajax.js',
'Feed.js',
'Library.js',
'Entry.js',
'Collections.js',
'Items.js',
'Tags.js',
'Collection.js',
'Item.js',
'Tag.js',
'Group.js',
'User.js',
'Utils.js',
'Url.js'
);

$fulljs = "";

foreach($jsfiles as $file){
    $ftext = file_get_contents('../lib/js/' . $file);
    $fulljs .= $ftext;
}

file_put_contents('../build/libZoteroSingle.js', $fulljs);


?>