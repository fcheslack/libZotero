## PHP API

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

* const ZOTERO_URI = 'https://api.zotero.org/';
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


