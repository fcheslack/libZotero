import sys
sys.path.append('../')
import unittest
import json
import logging
from libZotero import zotero


class TestItemFunctions(unittest.TestCase):

    def setUp(self):
        pass
        #self.seq = range(10)

    def test_templates(self):
        #zlib = zotero.Library('user', '475425', 'z_public_library', '')

        #create a new item of type book
        newItem = zotero.getTemplateItem('book')
        newItem.set('title', 'This is a book ---')
        newItem.set('abstractNote', 'Created using a zotero python library and the write api')

        self.assertEqual(newItem.get('title'), 'This is a book ---')
        self.assertEqual(newItem.get('abstractNote'), "Created using a zotero python library and the write api")

    def test_setandget(self):
        templateJsonString = """{"itemType":"journalArticle","title":"","creators":[{"creatorType":"author","firstName":"","lastName":""}],"abstractNote":"","publicationTitle":"","volume":"","issue":"","pages":"","date":"","series":"","seriesTitle":"","seriesText":"","journalAbbreviation":"","language":"","DOI":"","ISSN":"","shortTitle":"","url":"","accessDate":"","archive":"","archiveLocation":"","libraryCatalog":"","callNumber":"","rights":"","extra":"","tags":[],"collections":[],"relations":{}}"""

        templateArray = json.loads(templateJsonString)
        item = zotero.Item()
        item.initItemFromTemplate(templateArray)

        item.set('title', 'Journal Article Title')
        item.set('itemKey', 'ASDF1234')
        item.set('itemVersion', 74)
        item.set('itemType', 'conferencePaper')
        item.set('deleted', 1)
        item.set('parentItem', 'HJKL9876')
        item.set('abstractNote', 'This is a test item.')
        item.set('notRealField', 'Not a real field value.')

        #test that get returns what it should for each set
        self.assertEqual(item.get('title'), 'Journal Article Title', "get title should return what was set.")
        self.assertEqual(item.get('itemKey'), 'ASDF1234', "get itemkey should return what was set.")
        self.assertEqual(item.get('itemVersion'), 74, "get itemVersion should return what was set.")
        self.assertEqual(item.get('itemType'), 'conferencePaper', 'get itemType should return what was set.')
        self.assertEqual(item.get('deleted'), 1, "get deleted should return what was set.")
        self.assertEqual(item.get('parentItem'), 'HJKL9876', 'get parentItem should return what was set')
        self.assertEqual(item.get('abstractNote'), 'This is a test item.', 'get abstractNote should return what was set.')
        self.assertEqual(item.get('notRealField'), None, "get fake field value should return None.")

        self.assertEqual(item.title, 'Journal Article Title', 'title should be set on item object')
        self.assertEqual(item.apiObject['title'], 'Journal Article Title', 'title should be set on item apiObject')
        self.assertEqual(item.pristine['title'], "", 'title should not be set on item pristine')

        self.assertEqual(item.itemKey, 'ASDF1234', 'itemKey should be set on item object')
        self.assertEqual(item.apiObject['itemKey'], 'ASDF1234', 'itemKey should be set on item apiObject')
        self.assertNotIn('itemKey', item.pristine, 'isset(itemKey) should be false for pristine')

        self.assertEqual(item.itemVersion, 74, 'itemVersion should be set on item object')
        self.assertEqual(item.apiObject['itemVersion'], 74, 'itemVersion should be set on item apiObject')
        self.assertNotIn('itemVersion', item.pristine, 'isset(itemVersion) should be false for item pristine')

        self.assertEqual(item.apiObject['deleted'], 1, 'deleted should be set on item apiObject')

    def test_creators(self):
        templateJsonString = """{"itemType":"journalArticle","title":"","creators":[{"creatorType":"author","firstName":"","lastName":""}],"abstractNote":"","publicationTitle":"","volume":"","issue":"","pages":"","date":"","series":"","seriesTitle":"","seriesText":"","journalAbbreviation":"","language":"","DOI":"","ISSN":"","shortTitle":"","url":"","accessDate":"","archive":"","archiveLocation":"","libraryCatalog":"","callNumber":"","rights":"","extra":"","tags":[],"collections":[],"relations":{}}"""

        templateArray = json.loads(templateJsonString)
        item = zotero.Item()
        item.initItemFromTemplate(templateArray)

    def test_modifications(self):
        #log = logging.getLogger("TestItemFunctions.test_modifications")
        item = zotero.getTemplateItem('book')
        item.set('title', 'test book')
        item.addToCollection("ASDF1234")
        item.addToCollection("LKJH0987")

        itemCollections = item.get('collections')
        self.assertTrue('ASDF1234' in itemCollections)
        self.assertTrue('LKJH0987' in itemCollections)
        self.assertEqual(len(itemCollections), 2)

        itemTags = item.get('tags')
        self.assertEqual(len(itemTags), 0)

        item.addTag('Unread')
        item.addTag('purple')
        item.addTag('useless tripe')
        item.removeFromCollection('YUOI8765')  # remove from collection it doesn't belong to
        item.removeFromCollection('ASDF1234')

        itemCollections = item.get('collections')
        itemTags = item.get('tags')
        self.assertEqual(len(itemCollections), 1)
        self.assertEqual(len(itemTags), 3)
        self.assertIn('LKJH0987', itemCollections)
        self.assertNotIn('ASDF1234', itemCollections)
        self.assertIn('Unread', itemTags)
        self.assertIn('purple', itemTags)
        self.assertIn('useless tripe', itemTags)
        self.assertNotIn('Green', itemTags)

        item.removeTag('Unread')
        itemTags = item.get('tags')
        self.assertEqual(len(itemTags), 2)
        self.assertNotIn('Unread', itemTags)


if __name__ == '__main__':
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("TestItemFunctions.test_modifications").setLevel(logging.DEBUG)
    unittest.main()
