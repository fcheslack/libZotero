<?php
include "../config.php"; //library credentials
require_once "../../build/libZoteroSingle.php";

class Zotero_FeedTest extends PHPUnit_Framework_TestCase
{
    public function testParsing()
    {
        $collectionsJsonAtomString = file_get_contents("../data/collectionsjson.atom");
        $tagsJsonAtomString = file_get_contents("../data/tagsjson.atom");
        
        $doc = new DOMDocument();
        $doc->loadXml($collectionsJsonAtomString);
        $collectionfeed = new Zotero_Feed($doc);
        
        $this->assertEquals($collectionfeed->title, "Zotero / Z public library / Collections");
        $this->assertEquals($collectionfeed->id, "http://zotero.org/users/475425/collections?content=json");
        $this->assertEquals($collectionfeed->totalResults, 15);
        $this->assertEquals($collectionfeed->apiVersion, null);
        //deepEqual(collectionfeed.links, );
        //$this->assertEquals($collectionfeed->lastPageStart, '');
        //$this->assertEquals($collectionfeed->lastPage, 1);
        //$this->assertEquals($collectionfeed->currentPage, 1);
        
        $this->assertEquals($collectionfeed->dateUpdated, "2011-06-29T14:29:32Z" );
        
        
        
        $doc = new DOMDocument();
        $doc->loadXml($tagsJsonAtomString);
        $tagsfeed = new Zotero_Feed($doc);
        
        $this->assertEquals($tagsfeed->title, "Zotero / Z public library / Tags");
        $this->assertEquals($tagsfeed->id, "http://zotero.org/users/475425/tags?content=json");
        $this->assertEquals($tagsfeed->totalResults, 192, "test total Results");
        $this->assertEquals($tagsfeed->apiVersion, null, "test apiVersion");
        //deepEqual(tagsfeed.links, );
        //$this->assertEquals($tagsfeed->lastPageStart, 150, "correctly found lastPageStart");
        //$this->assertEquals($tagsfeed->lastPage, 4, "correctly found lastPage");
        //$this->assertEquals($tagsfeed->currentPage, 1, "correctly found currentPage");
        $this->assertEquals($tagsfeed->dateUpdated, "2011-04-11T16:37:49Z", "found and parsed updated date" );
        
    }
}
?>