# libZotero PHP #

This is the PHP implementation of libZotero.

### Installation ###
A single file concatenation of the libZotero php code is available in the build directory.
 - Place the libZoteroSingle.php file somewhere in your php path
 - include or require_once libZoteroSingle.php in scripts

### Example Usage ###

Examples of using libZotero.php are available in the phpexamples directory at the root of the repository.

Each Zotero library (user or group) you want to interact with must have a library object instantiated.

    $library = new Zotero_Library(<'user'|'group'>, <libraryID>, '', <apiKey>);

This is the object you'll use to start all interactions. Other objects, such as items and collections, from this Zotero library will be associated with this library object.

In cases where a function allows you to pass in parameters, they are passed through when building a url. These will mostly be used to make requests more specific by passing URL parameters as documented at http://www.zotero.org/support/dev/server_api/v2/read_requests#url_parameters

For example, to get a list of recent items:

    $recentItems = $library->fetchItems(array('limit'=>10, 'collectionKey'=>$collectionKey, 'order'=>'dateAdded', 'sort'=>'desc'));



/*
 * To test:
 *  - $collections = $library->fetchCollections(array('collectionKey'=>'', 'content'=>'json'));
 *  - $items = $library->fetchItemsTop(array('limit'=>10, 'collectionKey'=>$collectionKey));
 *  - $items = $library->fetchItems(array('limit'=>10, 'collectionKey'=>$collectionKey));
 *  - $library->fetchItems(array('limit'=>10, 'content'=>'json,bib,coines')) //check subcontents
 *  - $library->createItem($newItem)
 *  - $library->deleteItem($existingItem)
 *  - $library->apiRequestUrl
 *  - $library->apiQueryString
 *  - $library->parseQueryString
 *  - $library->fetchAllCollections
 *  - $library->fetchCollections
 *  - $library->fetchCollection
 *  - $library->fetchItemsTop
 *  - $library->fetchItemKeys //not necessary anymore?
 *  - $library->fetchTrashedItems
 *  - $library->fetchItems              (move to Zotero_Items? with alias here)
 *  - $library->fetchItem($key)         (move to Zotero_Items? with alias here)
 *  - $library->fetchItemBib
 *  - $library->itemDownloadLink
 *  - $library->writeUpdatedItem
 *  - $library->createAttachmentItem
 *  - $library->getTemplateItem
 *  - $library->addNotes
 *  - $library->createCollection
 *  - $library->removeCollection
 *  - $library->addItemsToCollection
 *  - $library->removeItemsFromCollection
 *  - $library->removeItemFromCollection
 *  - $library->writeUpdatedCollection
 *  - $library->deleteItem //permanently deletes, doesn't trash
 *  - $library->trashItem // trashes item, doesn't permanently delete
 *  - $library->fetchItemChildren
 *  - $library->getItemTypes
 *  - $library->getItemFields
 *  - $library->getCreatorTypes
 *  - $library->getCreatorFields
 *  - $library->fetchAllTags
 *  - $library->fetchTags
 *  - $library->getKeyPermissions
 *  - $library->parseKey
 *  - $library->fetchGroups
 *  - $library->fetchRecentGroups (make static method not associated with library?)
 *  - $library->getCV
 */


Zotero_Items:
getItem
addItem
addItemsFromFeed
replaceItem
addChildKeys
getPreloadedChildren
writeItem
writeItems
trashItem
trashItems
deleteItem
deleteItems


Zotero_Item:
__construct
parseContentNode
initItemFromTemplate -> initEmptyFromTemplate
get
set
addCreator
updateItemObject
newItemObject
isAttachment
hasFile
attachmentIsSnapshot
json
formatItemField
compareItem
TODO:
uploadFile
uploadChildAttachment
addToCollection
removeFromCollection
writeApiObj
writePatch


Zotero_Collections:
addCollection
getCollection
addCollectionsFromFeed
nestCollections
orderCollections
topCollectionKeys
collectionsJson

TODO:
assignDepths
nestedOrderingArray


Zotero_Collection
collectionJson
dataObject
TODO:
addItems
getMemberItemKeys
removeItem
update
writeApiObject
remove

