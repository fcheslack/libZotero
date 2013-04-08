#!/usr/bin/python

import sys
sys.path.append('../lib/py')  # unnecessary if libZotero is installed separately
import json
import logging
from libZotero import zotero

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

zItems = []
for i in range(70):
    item = zlib.getTemplateItem('webpage')
    item.set('title', 'zotero webpage item')
    zItems.append(item)

#make the request to save the items to the Zotero server
writtenItems = zlib.items.writeItems(zItems)
#individual items may fail even if the request goes through, so we should check each one for errors
for item in writtenItems:
    if item.writeFailure != False:
        print "Failed writing item {} - {}\n".format(item.writeFailure['key'], item.get('title'))
        print "Status code: {}\n".format(item.writeFailure['code'])
        print "Message: {}\n\n".format(item.writeFailure['message'])
    else:
        print "Item successfully created. itemKey: ", item.get('itemKey'), " - ", item.get('title')

#get the version of the last item to use for delete requests
version = writtenItems[-1].get('itemVersion')
#split written items into chunks since we can only delete 50 at a time
chunks = [writtenItems[i:i + 50] for i in range(0, len(writtenItems), 50)]
for chunk in chunks:
    deletedItemResponse = zlib.items.deleteItems(chunk, version)
    if zotero.responseIsError(deletedItemResponse):
        print("Error: {} {}\n".format(deletedItemResponse.status_code, deletedItemResponse.text))
    else:
        print("Chunk of items deleted.")
    newVersion = deletedItemResponse.headers['Last-Modified-Version']
    if newVersion > version:
        version = newVersion
