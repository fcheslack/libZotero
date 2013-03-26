#!/usr/bin/python

import sys
sys.path.append('../lib/py')  # unnecessary if libZotero is installed separately
import json
import time
import argparse
from libZotero import zotero

parser = argparse.ArgumentParser(description='Add starred items from google reader to your Zotero library.')
parser.add_argument('--libraryID', required=True)
parser.add_argument('--libraryType', required=True)
parser.add_argument('--apiKey', required=True)
parser.add_argument('--starredFile', required=True)

args = parser.parse_args()
print args
zlib = zotero.Library(args.libraryType, args.libraryID, '', args.apiKey)

#create a collection for the items
starredCollection = zlib.createCollection('Google Reader Starred')
if starredCollection.writeFailure != False:
    print "Error creating collection"
    print starredCollection.writeFailure['code'], ": ", starredCollection.writeFailure['message']
    sys.exit(1)

print "New Zotero collection created for google reader starred items with collectionKey ", starredCollection.get('collectionKey')

#read the starred items from the json file and create a Zotero item for each one
starredObject = json.loads(open(args.starredFile).read())
starredReaderItems = starredObject['items']
zItems = []
for readerItem in starredReaderItems:
    print "Reader starred item: ", readerItem['title']
    item = zlib.getTemplateItem('webpage')
    item.set('title', readerItem['title'])
    pubtime = time.gmtime(readerItem['published'])
    item.set('date', time.strftime("%Y-%m-%d", pubtime))
    item.addCreator({'creatorType': 'author', 'name': readerItem['author']})
    if 'content' in readerItem and 'content' in readerItem['content']:
        item.set('abstractNote', readerItem['content']['content'])
    elif 'summary' in readerItem and 'content' in readerItem['summary']:
        item.set('abstractNote', readerItem['summary']['content'])
    for alt in readerItem['alternate']:
        if alt['type'] == "text/html":
            item.set('url', alt['href'])
            break
    item.addToCollection(starredCollection)
    zItems.append(item)

#make the request to save the items to the Zotero server
writtenItems = zlib.items.writeItems(zItems)
#returns false if the entire request fails
if writtenItems == False:
    print "Error writing items"
    lastResponse = zlib._lastResponse
    print "Code: {}".format(lastResponse.status_code)
    print "Message: {}".format(lastResponse.text)
    sys.exit()
#individual items may also fail even if the request goes through, so we can
#check each one for errors
for item in writtenItems:
    if item.writeFailure != False:
        print "Failed writing item {}\n".format(item.writeFailure['key'])
        print "Status code: {}\n".format(item.writeFailure['code'])
        print "Message: {}\n\n".format(item.writeFailure['message'])
    else:
        print "Item successfully created. itemKey: ", item.get('itemKey'), " - ", item.get('title')
