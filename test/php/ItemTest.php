<?php
include "../config.php"; //library credentials
require_once "../../build/libZoteroSingle.php";

class Zotero_ItemTest extends PHPUnit_Framework_TestCase
{
    public function testSetAndGet()
    {
        $templateJsonString = <<<'EOD'
{"itemType":"journalArticle","title":"","creators":[{"creatorType":"author","firstName":"","lastName":""}],"abstractNote":"","publicationTitle":"","volume":"","issue":"","pages":"","date":"","series":"","seriesTitle":"","seriesText":"","journalAbbreviation":"","language":"","DOI":"","ISSN":"","shortTitle":"","url":"","accessDate":"","archive":"","archiveLocation":"","libraryCatalog":"","callNumber":"","rights":"","extra":"","tags":[],"collections":[],"relations":{}}
EOD;
        
        $templateArray = json_decode($templateJsonString, true);
        $item = new Zotero_Item();
        $item->initItemFromTemplate($templateArray);
        
        $item->set('title', 'Journal Article Title');
        $item->set('itemKey', 'ASDF1234');
        $item->set('itemVersion', 74);
        $item->set('itemType', 'conferencePaper');
        $item->set('deleted', 1);
        $item->set('parentItem', 'HJKL9876');
        $item->set('abstractNote', 'This is a test item.');
        $item->set('notRealField', 'Not a real field value.');
        
        //test that get returns what it should for each set
        $this->assertEquals($item->get('title'), 'Journal Article Title', "get title should return what was set.");
        $this->assertEquals($item->get('itemKey'), 'ASDF1234', "get itemkey should return what was set.");
        $this->assertEquals($item->get('itemVersion'), 74, "get itemVersion should return what was set.");
        $this->assertEquals($item->get('itemType'), 'conferencePaper', 'get itemType should return what was set.');
        $this->assertEquals($item->get('deleted'), 1, "get deleted should return what was set.");
        $this->assertEquals($item->get('parentItem'), 'HJKL9876', 'get parentItem should return what was set');
        $this->assertEquals($item->get('abstractNote'), 'This is a test item.', 'get abstractNote should return what was set.');
        $this->assertEquals($item->get('notRealField'), null, "get fake field value should return null.");
        
        $this->assertEquals($item->title, 'Journal Article Title', 'title should be set on item object');
        $this->assertEquals($item->apiObject['title'], 'Journal Article Title', 'title should be set on item apiObject');
        $this->assertEquals($item->pristine['title'], '', 'title should not be set on item pristine');
        
        $this->assertEquals($item->itemKey, 'ASDF1234', 'itemKey should be set on item object');
        $this->assertEquals($item->apiObject['itemKey'], 'ASDF1234', 'itemKey should be set on item apiObject');
        $this->assertEquals(isset($item->pristine['itemKey']), false, 'isset(itemKey) should be false for pristine');
        
        $this->assertEquals($item->itemVersion, 74, 'itemVersion should be set on item object');
        $this->assertEquals($item->apiObject['itemVersion'], 74, 'itemVersion should be set on item apiObject');
        $this->assertEquals(isset($item->pristine['itemVersion']), false, 'isset(itemVersion) should be false for item pristine');
        
        $this->assertEquals($item->apiObject['deleted'], 1, 'deleted should be set on item apiObject');
        
    }
    
    public function testCollectionAndTags()
    {
        $templateJsonString = <<<'EOD'
{"itemType":"journalArticle","title":"","creators":[{"creatorType":"author","firstName":"","lastName":""}],"abstractNote":"","publicationTitle":"","volume":"","issue":"","pages":"","date":"","series":"","seriesTitle":"","seriesText":"","journalAbbreviation":"","language":"","DOI":"","ISSN":"","shortTitle":"","url":"","accessDate":"","archive":"","archiveLocation":"","libraryCatalog":"","callNumber":"","rights":"","extra":"","tags":[],"collections":[],"relations":{}}
EOD;
        
        $templateArray = json_decode($templateJsonString, true);
        $item = new Zotero_Item();
        $item->initItemFromTemplate($templateArray);
        
        $item->addToCollection("ASDF1234");
        $item->addToCollection("FDSA4321");
        
        $item->addTag("Green");
        $item->addTag("purple", 1);
        $item->addTag("Red");
        
        $itemCollections = $item->get('collections');
        $this->assertEquals(count($itemCollections), 2, 'right number of collections');
        $this->assertEquals($itemCollections[0], "ASDF1234", "first col match");
        $this->assertEquals($itemCollections[1], "FDSA4321", "Second col match");
        
        $itemTags = $item->get('tags');
        $this->assertEquals(count($itemTags), 3);
        $this->assertEquals($itemTags[0], "Green");
        $this->assertEquals($itemTags[1]['tag'], "purple");
        $this->assertEquals($itemTags[1]['type'], 1);
        $this->assertEquals($itemTags[2], "Red");
        
        //test removal
        $item->removeFromCollection('OIUSDGAS');
        $item->removeFromCollection("ASDF1234");
        
        $item->removeTag("Red");
        $item->removeTag("Green");
        
        
        $itemCollections = $item->get('collections');
        $this->assertEquals(count($itemCollections), 1, 'right number of collections');
        $this->assertEquals($itemCollections[0], "FDSA4321", "first col match");
        
        $itemTags = $item->get('tags');
        $this->assertEquals(count($itemTags), 1);
        $this->assertEquals($itemTags[0]['tag'], "purple");
        $this->assertEquals($itemTags[0]['type'], 1);
        
    }
}
?>