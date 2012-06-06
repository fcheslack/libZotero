#!/usr/bin/python

import sys
import json
import hashlib
import bsdiff4
import os.path
import mimetypes
import argparse
import logging

sys.path.append('../lib/py')
from libZotero import zotero

zotero.ZOTERO_URI = 'https://api.zotero.org'

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

parser = argparse.ArgumentParser(description="Upload a patch for an existing Zotero attachment")
parser.add_argument('attachmentItemKey')
parser.add_argument('oldfilepath')
parser.add_argument('newfilepath')
args = parser.parse_args()
print(args)

#read Zotero API credentials from file
creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
#instantiate a zotero Library using provided credentials
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

#filepath info
oldfilepath = args.oldfilepath
newfilepath = args.newfilepath

#get file information
efilestat = os.stat(oldfilepath)
ef = open(oldfilepath, 'rb')
efdata = ef.read()
m = hashlib.md5()
m.update(efdata)
digest = m.hexdigest()

finfo = {'md5': digest,
         'filename': os.path.basename(oldfilepath),
         'filesize': efilestat.st_size,
         'mtime': int(efilestat.st_mtime * 1000)  # the zotero api accepts mtime in ms, os.stat may return seconds depending on operating system
         }
print(finfo)

#get existing attachment item
existingAttachmentItem = zlib.fetchItem(args.attachmentItemKey)
print(existingAttachmentItem)
#compare md5 of our original file with the md5 of the uploaded file
apiMD5 = existingAttachmentItem.get('md5')
print('md5sum of the file existing on the Zotero server: ' + apiMD5)
if apiMD5 != finfo['md5']:
    raise Exception("MD5 mismatch : " + apiMD5 + " : " + finfo['md5'])

#get information for new version of file and diff with old version
nfilestat = os.stat(newfilepath)
nf = open(newfilepath, 'rb')
nfdata = nf.read()
newmd5 = hashlib.md5()
newmd5.update(nfdata)
newDigest = newmd5.hexdigest()
diffData = str(bsdiff4.diff(efdata, nfdata))

nfinfo = {'md5': newDigest,
         'filename': os.path.basename(oldfilepath),
         'filesize': nfilestat.st_size,
         'mtime': int(nfilestat.st_mtime * 1000)  # the zotero api accepts mtime in ms, os.stat may return seconds depending on operating system
         }
#guess mimetype info
nfinfo['contentType'], nfinfo['charset'] = mimetypes.guess_type(newfilepath)

print("new file info:")
print(nfinfo)
#xddiffData = open('samplefile.xd3.diff', 'rb').read()
#upload diff
zlib.uploadAttachedFilePatch(existingAttachmentItem, diffData, nfinfo, 'bsdiff')
#zlib.uploadAttachedFilePatch(existingAttachmentItem, xddiffData, nfinfo, 'xdelta')
