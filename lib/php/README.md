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
TODO:
writeItem
writeItems
deleteItem
deleteItems
trashItem
trashItems


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

