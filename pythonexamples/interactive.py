#!/usr/bin/python

import sys
sys.path.append('../lib/py/zotero')
import json
import zotero

creds = json.loads(open('./user_writing_config.json').read())  # library credentials
print(creds)
zlib = zotero.Library(creds['libraryType'], creds['libraryID'], creds['librarySlug'], creds['apiKey'])
