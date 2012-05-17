#!/usr/bin/python

import sys
sys.path.append('../lib/py/zotero')
import json
import zotero

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

itemKeys = zlib.fetchItemKeys()
print("got " + str(len(itemKeys)) + " item keys from Zotero api")

for k in itemKeys:
    print k
