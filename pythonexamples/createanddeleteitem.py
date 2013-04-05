#!/usr/bin/python

import sys
sys.path.append('../lib/py')
import json
from libZotero import zotero

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
#create the zotero library object which will be our interface for interacting with the Zotero API
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

#create a new item of type book
#getting a template item causes the appropriate fields to be present in the item
#without doing this the item doesn't know what fields are valid for this item type
#even if we do
newItem = zlib.getTemplateItem('book')
#set values for a couple of the valid fields
newItem.set('title', 'Book 1')
newItem.set('abstractNote', 'Created using a zotero python library and the write api')
# make the request to the API to create the item
# a Zotero Item object will be returned
# if the creation went okay it will have a writeFailure property set to False
createdItem = zlib.createItem(newItem)
if createdItem.writeFailure != False:
    print(createdItem.writeFailure['code'])
    print(createdItem.writeFailure['message'])
    sys.exit(1)

#add child note to our new item
newNoteItem = zlib.getTemplateItem('note')
addedNote = zlib.addNotes(createdItem, newNoteItem)
if addedNote.writeFailure != False:
    print(addedNote.writeFailure['code'])
    print(addedNote.writeFailure['message'])
    sys.exit(1)
print("Added child note. Our new note has itemKey {}".format(addedNote.get('itemKey')))

#note that we can also do these both in a single request which will be faster
secondParentItem = zlib.getTemplateItem('book')
secondParentItem.set('title', "Book 2")
secondParentItem.set('abstractNote', 'Also created using a zotero python library and the write api')
secondNote = zlib.getTemplateItem('note')
secondNote.set("note", "This is a note on Book 2")
secondParentItem.addNote(secondNote)
writtenItems = zlib.items.writeItems([secondParentItem])
#writtenItems is an array with the items that were created
#if the operation didn't fail the items have been updated with itemKeys and versions
#if the operation did fail the items have a non-False writeFailure property
#writtenItems holds references to the same items we passed in, so those items have also been modified
#and we could use the same variables to refer to them
for item in writtenItems:
    if item.writeFailure != False:
        print("Error updating item")
        print(item.writeFailure['code'])
        print(item.writeFailure['message'])
        sys.exit(1)
    else:
        print("Created an item of type {} with itemKey {}\n".format(item.get('itemType'), item.get('itemKey')))
print("The parent item of the note should be the same as the itemKey of Book2 - {}:{}".format(secondParentItem.get('itemKey'), secondNote.get('parentItem')))
print("We can also keep track of what version the items are at - {} and {}".format(secondParentItem.get('itemVersion'), secondNote.get('itemVersion')))

#after we've created items, we can update the existing items with new information
#this can be done in several ways
#for a single item the simplest way is to call item.save() after modifying it
#for multiple items you can use library.items.writeItems([item1, item2...])
secondParentItem.set('date', '2011')
secondParentItem.save()
if secondParentItem.writeFailure != False:
    print("Error updating item")
    print(secondParentItem.writeFailure['code'])
    print(secondParentItem.writeFailure['message'])
    sys.exit(1)
print("The version for the second parent item should have increased from the last write. It is now version {}".format(secondParentItem.get('itemVersion')))

#if we want to get rid of items we can delete them with library.items.deleteItems([...])
#unlike creating/updating, deletes return an http response
deleteResponse = zlib.items.deleteItems([newItem, newNoteItem, secondParentItem, secondNote])
if not (deleteResponse.status_code != 204):
    print("Error deleting item:")
    print(deleteResponse.status_code)
    print(deleteResponse.text)
else:
    print("The delete request returned with a status of {}".format(deleteResponse.status_code))
    print("Items Deleted")
