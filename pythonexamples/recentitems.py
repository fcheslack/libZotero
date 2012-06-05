#!/usr/bin/python

import sys
sys.path.append('../lib/py')
import json
from libZotero import zotero

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])

collectionKey = None
items = zlib.fetchItems({'limit': 10, 'collectionKey': collectionKey, 'order': 'dateAdded', 'sort': 'desc'})

for i in items:
    print(i.title)
