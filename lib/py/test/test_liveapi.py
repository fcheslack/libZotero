import sys
sys.path.append('../')
import unittest
from libZotero import zotero


class TestItemCreateFunctions(unittest.TestCase):

    def setUp(self):
        self.seq = range(10)

    def test_templates(self):
        #zlib = zotero.Library('user', '475425', 'z_public_library', '')

        #create a new item of type book
        newItem = zotero.getTemplateItem('book')
        newItem.set('title', 'This is a book ---')
        newItem.set('abstractNote', 'Created using a zotero python library and the write api')

        self.assertEqual(newItem.get('title'), 'This is a book ---')
        self.assertEqual(newItem.get('abstractNote'), "Created using a zotero python library and the write api")


if __name__ == '__main__':
    unittest.main()
