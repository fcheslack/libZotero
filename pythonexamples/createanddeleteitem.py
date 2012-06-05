#!/usr/bin/python

import sys
sys.path.append('../lib/py')
import json
from libZotero import zotero

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

#create a new item of type book
newItem = zotero.getTemplateItem('book')
newItem.set('title', 'This is a book ---')
newItem.set('abstractNote', 'Created using a zotero php library and the write api')
createItemResponse = zlib.createItem(newItem)
print(createItemResponse)
if createItemResponse.status_code != 201:
    print(createItemResponse.status_code)
    print(createItemResponse.text)
    sys.exit(1)
else:
    #load the item into the library so it is included and has the itemKey and etag
    #and anything else the api populates that we didn't set in our item
    createItemFeed = zotero.Feed(createItemResponse.text)
    createdItem = zlib.items.addItemsFromFeed(createItemFeed)
    createdItem = createdItem[0]
    print("Item created")
existingItem = zotero.Item(createItemResponse.text)

#add child note
newNoteItem = zlib.getTemplateItem('note')
addNoteResponse = zlib.addNotes(existingItem, newNoteItem)
if addNoteResponse.status_code != 201:
    print(addNoteResponse.status_code)
    print(addNoteResponse.text)
    sys.exit(1)
print("added child note")

existingItem.set('date', '2011')
updateItemResponse = zlib.writeUpdatedItem(existingItem)
if not (updateItemResponse.status_code < 300):
    print("Error updating item")
    print(updateItemResponse.status_code)
    print(updateItemResponse.text)
    sys.exit(1)
#replace the item in library->items with the api response
updatedItem = zotero.Item(updateItemResponse.text)
zlib.items.replaceItem(updatedItem)
print("Item updated")

#try to get the items we just created separately to make sure the api has them
#and they've been updated correctly
existingItemKey = existingItem.itemKey
print("getting existing item")
retrievedExistingItem = zlib.fetchItem(existingItemKey)
print("got existing item")
print("Deleting created item")
deleteResponse = zlib.deleteItem(retrievedExistingItem)
if not (deleteResponse.status_code < 300):
    print("Error deleting item:")
    print(deleteResponse.status_code)
    print(deleteResponse.text)
else:
    print("Item Deleted")
