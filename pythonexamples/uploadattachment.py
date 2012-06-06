#!/usr/bin/python

import sys
import json
import hashlib
import os.path
import mimetypes
import logging
import argparse

sys.path.append('../lib/py')
from libZotero import zotero

zotero.ZOTERO_URI = 'https://api.zotero.org'

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

parser = argparse.ArgumentParser(description="Upload an attachment to a Zotero library")
parser.add_argument('--title', default='')
parser.add_argument('--type', default='document')
parser.add_argument('filepath')
args = parser.parse_args()
print(args)

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

filepath = args.filepath
filestat = os.stat(filepath)
nf = open(filepath, 'rb')
nfdata = nf.read()
m = hashlib.md5()
m.update(nfdata)
digest = m.hexdigest()

finfo = {'md5': digest,
         'filename': os.path.basename(filepath),
         'filesize': filestat.st_size,
         'mtime': filestat.st_mtime  # the zotero api accepts mtime in ms, os.stat may return seconds depending on operating system
         }

#guess mimetype info
finfo['contentType'], finfo['charset'] = mimetypes.guess_type(filepath)
print(finfo)

#create a new item of type book
newItem = zotero.getTemplateItem(args.type)
newItem.set('title', args.title)
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
    createdItems = zlib.items.addItemsFromFeed(createItemFeed)
    createdItem = createdItems[0]
    print("Item created")
    print("created Item key: " + createdItem.get('itemKey'))
    logging.info(createdItem)
existingItem = zotero.Item(createItemResponse.text)

#add child attachment
#create attachment item
logging.info("Calling createAttachmentItem")
attachmentItemResponse = zlib.createAttachmentItem(createdItem, {'filename': finfo['filename']})
if attachmentItemResponse.status_code != 201:
    print(attachmentItemResponse.status_code)
    print(attachmentItemResponse.text)
    sys.exit(1)

attachmentItemsFeed = zotero.Feed(attachmentItemResponse.text)
attachmentItems = zlib.items.addItemsFromFeed(attachmentItemsFeed)
attachmentItem = attachmentItems[0]
print("created attachment Item Key: " + attachmentItem.get('itemKey'))

#upload attachment file
uploadResponse = zlib.uploadNewAttachedFile(attachmentItem, nfdata, finfo)
if uploadResponse == True:
    print('Upload Successful')
