import sys
sys.path.append('../')
import unittest
from libZotero import zotero


class TestApiUrlBuilding(unittest.TestCase):

    def test_apiurls(self):
        config = {'target': 'collections', 'libraryType': 'user', 'libraryID': 1, 'content': 'json', 'limit': '100'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/collections")
        self.assertEqual(zotero.apiQueryString(config), "?content=json&limit=100")

        config = {'target': 'items', 'libraryType': 'group', 'libraryID': 1, 'format': 'atom', 'content': 'json', 'limit': '100'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/groups/1/items")
        self.assertEqual(zotero.apiQueryString(config), "?content=json&format=atom&limit=100")

        config = {'target': 'items', 'libraryType': 'user', 'libraryID': 1, 'content': 'json,coins', 'limit': '25'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/items")
        self.assertEqual(zotero.apiQueryString(config), "?content=json%2Ccoins&limit=25")

        config = {'target': 'item', 'libraryType': 'user', 'libraryID': 1, 'content': 'json', 'itemKey': 'ASDF1234'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/items/ASDF1234")
        self.assertEqual(zotero.apiQueryString(config), "?content=json")

        config = {'target': 'items', 'libraryType': 'user', 'libraryID': 1, 'content': 'bibtex', 'limit': '100', 'itemKey': 'ASDF1234,FDSA4321'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/items")
        self.assertEqual(zotero.apiQueryString(config), "?content=bibtex&itemKey=ASDF1234%2CFDSA4321&limit=100")

        config = {'target': 'deleted', 'libraryType': 'user', 'libraryID': 1, 'content': 'json', 'limit': '100'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/deleted")
        self.assertEqual(zotero.apiQueryString(config), "?content=json&limit=100")

        config = {'target': 'children', 'libraryType': 'user', 'libraryID': 1, 'itemKey': 'ASDF1234', 'content': 'json', 'limit': '100'}
        self.assertEqual(zotero.apiRequestUrl(config), "https://api.zotero.org/users/1/items/ASDF1234/children")
        self.assertEqual(zotero.apiQueryString(config), "?content=json&limit=100")


if __name__ == '__main__':
    unittest.main()
