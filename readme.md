## Example code
    require_once './config.php'; //library credentials
    
    require_once './lib/Library.php';
    $library = new Zotero_Library($libraryType, $userID, $userSlug, $apiKey);
    
    /*
    //get some tags
    $tags = $library->fetchTags(array('limit'=>5, 'order'=>'title', 'sort'=>'desc'));
    foreach($tags as $tag){
        if($tag->numItems > 0){
            echo $tag->name . " - " . $tag->numItems . "\n";
        }
        else{
            echo $tag->name . " - has no items\n"; 
        }
    }
    //var_dump($tags);
    $items = $library->loadItems(array('tag'=>'zotero'));
    var_dump($items);
    die;
    */
    
    //get groups the key has access to
    /*
    $r = $library->getAccessibleGroups($userID);
    var_dump($r);die;
    */
    
    //get permissions for the key
    //$permissions = $library->getKeyPermissions();
    
    //load some existing items
    /*
    $items = $library->loadItemsTop(array('limit'=>10));
    foreach($items as $item){
        echo "Top level item with title: " . $item->get('title') . "\n";
    }
    */
    
    /*
    //load the items currently in the trash
    $items = $library->loadTrashedItems(array('limit'=>10));
    foreach($items as $item){
        echo "Trashed item with title: " . $item->get('title') . "\n";
        //echo "now deleting item \n";
        //$library->deleteItem($item);
    }
    */
    
    //create a new item of type book
    $newItem = $library->getTemplateItem('book');
    $newItem->set('title', 'This is a book');
    $newItem->set('abstractNote', 'Created using a zotero php library and the write api');
    $createItemResponse = $library->createItem($newItem);
    if($createItemResponse->isError()){
        echo $createItemResponse->getStatus() . "\n";
        echo $createItemResponse->getBody() . "\n";
        die("Error creating Zotero item\n\n");
    }
    echo "Item created\n\n";
    $existingItem = new Zotero_Item($createItemResponse->getBody());
    //add child note
    $newNoteItem = $library->getTemplateItem('note');
    $addNoteResponse = $library->addNotes($existingItem, $newNoteItem);
    if($addNoteResponse->isError()){
        echo $addNoteResponse->getStatus() . "\n";
        echo $addNoteResponse->getBody() . "\n";
        die("error adding child note to item");
    }
    echo "added child note\n";
    /*
    $existingItem->set('date', '2011');
    //$existingItem->set('deleted', 1);
    $updateItemResponse = $library->writeUpdatedItem($existingItem);
    if($updateItemResponse->isError()){
        die("Error updating Zotero item\n\n");
    }
    echo "Item updated\n\n";
    */
    
    //$library->loadItems(array());
    //$library->loadAllCollections(array());
    //var_dump($item);
    //$item->set('title', 'newtitle');
    //$updateResponse = $library->updateItem($item->itemKey);
    //$deleteResponse = $library->deleteItem($item);
    //var_dump($updateResponse);
    /*
    $item = $library->getTemplateItem('book');
    var_dump($item);
    */
    
## api

Many functions return http response objects.
The response object used is copied from Zend_Http_Response.

### Response

* public function __construct($code, array $headers, $body = null, $version = '1.1', $message = null)
* public function isError()
* public function isSuccessful()
* public function isRedirect()
* public function getBody()
* public function getVersion();
* public function getStatus();
* public function getMessage();
* public function getHeaders();
* public function getHeader($header);
* public function getHeadersAsString($status_line = true, $br = "\n")
* public function asString($br = "\n") //get entire response as string

### Zotero_Library

* const ZOTERO_URI = 'https://apidev.zotero.org/';
* protected $_apiKey;
* protected $_ch;
* public $libraryType;
* public $libraryID;
* public $libraryString;
* public $libraryUrlIdentifier;
* public $libraryBaseWebsiteUrl;
* public $items;
* public $collections;
* public $dirty;
* public $useLibraryAsContainer
* __construct($libraryType, $libraryID, $libraryUrlIdentifier, $apiKey = null, $baseWebsiteUrl="http://www.zotero.org")
* public function _request($url, $method="GET", $body=NULL, $headers=array()) {
* public function getLastResponse()
* public static function libraryString($type, $libraryID)
* public function apiRequestUrl($params, $base = Zotero_Library::ZOTERO_URI)
* public function apiQueryString($passedParams)
* public function parseQueryString($query)
* public function loadAllCollections($params)
* public function loadCollections($params)
* public function loadItemsTop($params=array())
* public function loadItems($params)
* public function loadItem($itemKey)
* public function writeUpdatedItem($item)
* public function createItem($item)
* public function deleteItem($item)
* public function getTemplateItem($itemType)
* public function createCollection($name, $parent = false)
* public function removeCollection($collection)
* public function addItemsToCollection($collection, $items)
* public function removeItemsFromCollection($collection, $items)
* public function removeItemFromCollection($collection, $item)
* public function writeUpdatedCollection($collection)
* public function trashItem($item)
* public function fetchItemChildren($item)
* public function getItemTypes()
* public function getItemFields()
* public function getCreatorTypes($itemType)
* public function getCreatorFields()
* public function fetchTags($params)





