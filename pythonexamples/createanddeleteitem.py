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
# make the request to the API to create the item
# a Zotero Item object will be returned
# if the creation went okay it will have a writeFailure property set to False
createdItem = zlib.createItem(newItem)
if createdItem.writeFailure != False:
    print(createdItem.writeFailure['code'])
    print(createdItem.writeFailure['message'])
    sys.exit(1)

#add child note
newNoteItem = zlib.getTemplateItem('note')
addedNote = zlib.addNotes(createdItem, newNoteItem)
if addedNote.writeFailure != False:
    print(addedNote.writeFailure['code'])
    print(addedNote.writeFailure['message'])
    sys.exit(1)
print("added child note")

createdItem.set('date', '2011')
updatedItem = zlib.writeUpdatedItem(createdItem)
if updatedItem.writeFailure != False:
    print("Error updating item")
    print(updatedItem.writeFailure['code'])
    print(updatedItem.writeFailure['message'])
    sys.exit(1)

#try to get the items we just created separately to make sure the api has them
#and they've been updated correctly
existingItemKey = createdItem.get('itemKey')
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
