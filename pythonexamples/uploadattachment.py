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
createdItem = zlib.createItem(newItem)
if createdItem.writeFailure != False:
    print("Created item has non-false writeFailure")
    print(createdItem.writeFailure['code'])
    print(createdItem.writeFailure['message'])
    sys.exit(1)

#add child attachment
#create attachment item
logging.info("Calling createAttachmentItem")
attachmentItem = zlib.createAttachmentItem(createdItem, {'filename': finfo['filename']})
if attachmentItem.writeFailure != False:
    print(attachmentItem.writeFailure)
    print(attachmentItem.writeFailure['code'])
    print(attachmentItem.writeFailure['message'])
    sys.exit(1)

print("created attachment Item Key: " + attachmentItem.get('itemKey'))

#upload attachment file
uploadResponse = zlib.uploadNewAttachedFile(attachmentItem, nfdata, finfo)
if uploadResponse == True:
    print('Upload Successful')
