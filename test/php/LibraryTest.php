<?php
require_once "../../build/libZoteroSingle.php";

class Zotero_LibraryTest extends PHPUnit_Framework_TestCase
{
    protected $libstub;
    
    protected function setUp(){
        $libstub = $this->getMock('Zotero_Library', array('_request'), array('user', '475425', 'z_public_library'));
        
        $aparams = array('target'=>'item', 'key'=>$libstub->_apiKey, 'content'=>'json', 'itemKey'=>'X42A7DEE');
        $fetchItemUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $itemResponseBody = file_get_contents("../data/apiv2/individualItemJson");
        $itemResponse = libZotero_Http_Response::fromString($itemResponseBody);
        
        
        $aparams = array('target'=>'items', 'key'=>$libstub->_apiKey, 'collectionKey'=>'N7W92H48', 'content'=>'json,bib');
        $collectionItemsUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $collectionItemsJsonBibResponseBody = file_get_contents("../data/apiv2/collectionItemsJsonBib");
        $collectionItemsResponse = libZotero_Http_Response::fromString($collectionItemsJsonBibResponseBody);
        
        
        $aparams = array('target'=>'collections', 'content'=>'json', 'limit'=>'100', 'key'=>$libstub->_apiKey);
        $fetchCollectionsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $allcollectionsResponseBody = file_get_contents("../data/apiv2/allCollections");
        $allcollectionsResponse = libZotero_Http_Response::fromString($allcollectionsResponseBody);
        
        
        $aparams = array('target'=>'collections', 'limit'=>100, 'content'=>'json', 'collectionKey'=>'N7W92H48', 'key'=>$libstub->_apiKey);
        $fetchChildCollectionsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $childCollectionsResponseBody = file_get_contents("../data/apiv2/childCollections");
        $childCollectionsResponse = libZotero_Http_Response::fromString($childCollectionsResponseBody);
        
        
        $aparams = array('target'=>'tags', 'limit'=>50, 'content'=>'json', 'key'=>$libstub->_apiKey);
        $fetchTagsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $tagsResponseBody = file_get_contents("../data/apiv2/tagsresponse");
        $tagsResponse = libZotero_Http_Response::fromString($tagsResponseBody);
        
        
        $aparams = array('limit'=>10, 'content'=>'json', 'target'=>'items', 'targetModifier'=>'top');
        $fetchItemsTopUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $fetchItemsTopResponseBody = file_get_contents("../data/apiv2/itemsTopResponse");
        $fetchItemsTopResponse = libZotero_Http_Response::fromString($fetchItemsTopResponseBody);
        
        
        $aparams = array('limit'=>10, 'content'=>'json', 'target'=>'items', 'targetModifier'=>'top', 'collectionKey'=>'N7W92H48');
        $fetchItemsTopInCollectionUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $fetchItemsTopInCollectionResponseBody = file_get_contents("../data/apiv2/itemsTopInCollectionResponse");
        $fetchItemsTopInCollectionResponse = libZotero_Http_Response::fromString($fetchItemsTopInCollectionResponseBody);
        
        
        $aparams = array('content'=>'json', 'target'=>'children', 'itemKey'=>'GUVBGARB');
        $fetchChildItemsUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $fetchChildItemsResponseBody = file_get_contents("../data/apiv2/childItems");
        $fetchChildItemsResponse = libZotero_Http_Response::fromString($fetchChildItemsResponseBody);
        
        
        $aparams = array('content'=>'json', 'target'=>'collection', 'collectionKey'=>'N7W92H48');
        $singleCollectionUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $singleCollectionResponseBody = file_get_contents("../data/apiv2/singleCollection");
        $singleCollectionResponse = libZotero_Http_Response::fromString($singleCollectionResponseBody);
        
        
        $map = array(
            array($collectionItemsUrl, 'GET', NULL, array(), array(), $collectionItemsResponse),
            array($fetchItemUrl1, 'GET', NULL, array(), array(), $itemResponse),
            array($fetchCollectionsUrl1, 'GET', NULL, array(), array(), $allcollectionsResponse),
            array($fetchChildCollectionsUrl1, 'GET', NULL, array(), array(), $childCollectionsResponse),
            array($fetchTagsUrl1, 'GET', NULL, array(), array(), $tagsResponse),
            array($fetchItemsTopUrl, 'GET', NULL, array(), array(), $fetchItemsTopResponse),
            array($fetchItemsTopInCollectionUrl, 'GET', NULL, array(), array(), $fetchItemsTopInCollectionResponse),
            array($fetchChildItemsUrl, 'GET', NULL, array(), array(), $fetchChildItemsResponse),
            array($singleCollectionUrl, 'GET', NULL, array(), array(), $singleCollectionResponse),
            
            );
        
        $libstub->expects($this->any())
             ->method('_request')
             ->will($this->returnValueMap($map) );
        /*
        echo "Stubbing Requests to GET URLS:\n";
        foreach($map as $stubMapEntry){
            echo $stubMapEntry[0] . "\n";
        }
        echo "\n";
        */
        $this->libstub = $libstub;
    }
    
    public function testApiStrings()
    {
        $library = $this->libstub;
        
        $config;
        
        $config = array('target'=>'collections', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/collections");
        $this->assertEquals($library->apiQueryString($config), "?content=json&limit=100");
        
        $config = array('target'=>'items', 'libraryType'=>'group', 'libraryID'=>1, 'format'=>'atom', 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/groups/1/items");
        $this->assertEquals($library->apiQueryString($config), "?content=json&format=atom&limit=100");
        
        $config = array('target'=>'items', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'json,coins', 'limit'=>'25');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/items");
        $this->assertEquals($library->apiQueryString($config), "?content=json%2Ccoins&limit=25");
        
        $config = array('target'=>'item', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'json', 'itemKey'=>'ASDF1234');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/items/ASDF1234");
        $this->assertEquals($library->apiQueryString($config), "?content=json");
        
        $config = array('target'=>'items', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'bibtex', 'limit'=>'100', 'itemKey'=>'ASDF1234,FDSA4321');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/items");
        $this->assertEquals($library->apiQueryString($config), "?content=bibtex&itemKey=ASDF1234%2CFDSA4321&limit=100");
        
        $config = array('target'=>'deleted', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/deleted");
        $this->assertEquals($library->apiQueryString($config), "?content=json&limit=100");
        
        $config = array('target'=>'children', 'libraryType'=>'user', 'libraryID'=>1, 'itemKey'=>'ASDF1234', 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/items/ASDF1234/children");
        $this->assertEquals($library->apiQueryString($config), "?content=json&limit=100");
        
    }
    
    public function testFetchItems(){
        $libstub = $this->libstub;
        
        $items = $libstub->fetchItems(array('collectionKey'=>'N7W92H48', 'content'=>'json,bib') );
        $this->assertEquals(count($items), 22, "should be 20 items in response" );
        $this->assertEquals($items[0]->itemKey, 'TTJFTW87', "First itemKey matches");
        $this->assertTrue(!empty($items[0]->subContents['bib']), "Bib should be set and not empty");
        $this->assertTrue(!empty($items[0]->bibContent), "special bibContent attribute should be present");
        
        //test get for every field on this item
        $item = $libstub->items->getItem('GUVBGARB');
        $this->assertTrue(!empty($item));
        $this->assertEquals($item->get('title'), 'Pure Science: Marie Curie and the American Gift', "title equal");
        $this->assertEquals($item->get('numChildren'), 1, "numChildren equal");
        $this->assertEquals($item->get('numTags'), 0, "numTags equal");
        $this->assertEquals($item->get('itemType'), 'journalArticle', "itemType equal");
        //$this->assertEquals($item->etag, "b0e4895ece6350453e830571e89a0983", "etag equal");
        $this->assertEquals($item->get('abstractNote'), "", "abstractNote equal");
        $this->assertEquals($item->get('url'), "http://www.jstor.org/stable/4338209", "url equal");
        $this->assertEquals($item->get('accessDate'), "", "accessDate equal");
        $this->assertEquals($item->get('publicationTitle'), "The Kenyon Review", "publication title equal");
        $creators = $item->get('creators');
        $this->assertEquals($creators[0]['creatorType'] , 'author', "creatorType equal");
        $this->assertEquals($creators[0]['firstName'], "Marie", "creator firstName equal");
        $this->assertEquals($creators[0]['lastName'], "Curie", "creator lastName equal");
        $this->assertEquals($item->get('volume'), "23", "volume equal");
        $this->assertEquals($item->get('issue'), '2', "issue equal");
        $this->assertEquals($item->get('pages'), "94-112", "pages equal");
        $this->assertEquals($item->get('date'), "April 01, 2001", "date equal");
        $this->assertEquals($item->get('series'), "New Series", "series equal");
        $this->assertEquals($item->get('ISSN'), "0163075X", "ISSN equal");
        $this->assertEquals($item->get('extra'), "ArticleType: research-article / Issue Title: Cultures of Creativity: The Centennial Celebration of the Nobel Prizes / Full publication date: Spring, 2001 / Copyright © 2001 Kenyon College", "extra equal");
        $this->assertTrue(!empty($item->bibContent), "bibContent not empty");
        
        foreach($items as $item){
            $this->assertTrue(!empty($item->owningLibrary));
            $this->assertEquals($item->libraryType, 'user', "libraryType matches");
            $this->assertEquals($item->libraryID, '475425', "libraryID matches");
        }
    }
    
    public function testFetchItemsTop(){
        $libstub = $this->libstub;
        
        $items = $libstub->fetchItemsTop(array('limit'=>10, 'content'=>'json'));
        $this->assertEquals(count($items), 10, "got 10 items");
        
        foreach($items as $item){
            $parentItemKey = $item->get('parentItem');
            $this->assertTrue($parentItemKey !== null, "parentItem not strictly null");
            $this->assertTrue(empty($parentItemKey), "parentItem is emptyish" );
            
            $this->assertTrue(isset($item->apiObject), "apiObject exists");
            $title = $item->get('title');
            $this->assertTrue(!empty($title), "title exists");
        }
    }
    
    public function testFetchItemsTopInCollection(){
        $libstub = $this->libstub;
        
        $items = $libstub->fetchItemsTop(array('limit'=>10, 'content'=>'json', 'collectionKey'=>'N7W92H48'));
        $this->assertEquals(count($items), 10, "got 10 items");
        
        foreach($items as $item){
            $parentItemKey = $item->get('parentItem');
            $this->assertTrue($parentItemKey !== null, "parentItem not strictly null");
            $this->assertTrue(empty($parentItemKey), "parentItem is emptyish" );
            
            $this->assertTrue(isset($item->apiObject), "apiObject exists");
            $title = $item->get('title');
            $this->assertTrue(!empty($title), "title exists");
            
            //check that item is in collection
            $this->assertTrue(in_array('N7W92H48', $item->get('collections')), "item is in the collection we fetched from");
        }
    }
    
    public function testFetchItemsWithTag(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testFetchTrashedItems(){
        $libstub = $this->libstub;
        
        //$items = $libstub->fetchTrashedItems(array('limit'=>10));
        
    }
    
    public function testFetchItem(){
        //test fetching single item by key
        $libstub = $this->libstub;
        
        $item = $libstub->fetchItem('X42A7DEE');
        $this->assertEquals($item->get('itemKey'), 'X42A7DEE', 'itemKey matches');
        $this->assertEquals($item->get('title'), 'Electron Microscopy and Analysis 1993: Proceedings of the Institute of Physics Electron Microscopy and Analysis Group Conference, University of Liverpool, 14-17 September1993', 'title matches');
        $this->assertEquals($item->get('itemType'), 'book', 'itemType matches');
        $this->assertEquals($item->get('creatorSummary'), 'Institute of Physics (Great Britain)', 'creatorSummary matches');
        $this->assertEquals($item->get('ISBN'), '0750303212', 'ISBN matches');
        $relations = $item->get('relations');
        $this->assertEquals($relations['owl:sameAs'], 'http://zotero.org/groups/36222/items/E6IGUT5Z', 'sameAs relation matches');
    }
    
    public function testFetchItemChildren(){
        $libstub = $this->libstub;
        
        $childItems = $libstub->fetchItemChildren('GUVBGARB');
        
        $this->assertEquals(count($childItems), 1);
        $childItem = $childItems[0];
        $this->assertEquals($childItem->get('title'), '4338209', "child title equal");
        $this->assertEquals($childItem->get('itemKey'), 'PZESGPV4', 'itemKey equal');
        $this->assertEquals($childItem->get('parentItem'), 'GUVBGARB', 'parentItem equal');
        
    }
    
    public function testItemGetChildren(){
        $libstub = $this->libstub;
        
        $items = $libstub->fetchItemsTop(array('limit'=>10, 'content'=>'json', 'collectionKey'=>'N7W92H48'));
        $item = $libstub->items->getItem('GUVBGARB');
        $childItems = $item->getChildren();
        
        $this->assertEquals(count($childItems), 1);
        $childItem = $childItems[0];
        $this->assertEquals($childItem->get('title'), '4338209', "child title equal");
        $this->assertEquals($childItem->get('itemKey'), 'PZESGPV4', 'itemKey equal');
        $this->assertEquals($childItem->get('parentItem'), 'GUVBGARB', 'parentItem equal');
        
    }

    public function testFetchCollections(){
        $libstub = $this->libstub;
        
        $collections = $libstub->fetchCollections();
        $this->assertEquals(count($collections), 15, "should be 15 collections in response" );
        
    }
    
    public function testFetchItemBib(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testItemDownloadLink(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testFetchCollection(){
        $libstub = $this->libstub;
        
        $collection = $libstub->fetchCollection('N7W92H48');
        $this->assertEquals($collection->get('collectionKey'), 'N7W92H48', 'collectionKey matches');
        $this->assertEquals($collection->get('name'), 'LoC', 'collection name matches');
        $this->assertEquals($collection->get('title'), 'LoC', 'collection title matches');
        $this->assertEquals($collection->get('parentCollection'), false, 'parentCollection matches');
        $this->assertEquals($collection->get('relations'), array(), 'collection relations matches');
        $this->assertEquals($collection->get('numCollections'), 1, 'collection numCollections matches');
        $this->assertEquals($collection->get('numItems'), 16, 'collection numItems matches');
    }
    
    public function testFetchChildCollections(){
        $libstub = $this->libstub;
        
        $childCollections = $libstub->fetchCollections(array('collectionKey'=>'N7W92H48'));
        $this->assertEquals(count($childCollections), 1, "Should be 1 child collection");
        $childCollection = $childCollections[0];
        $this->assertEquals($childCollection->get('name'), 'Digital Newspaper project', "child collection title matches");
        $this->assertEquals($childCollection->get('title'), 'Digital Newspaper project', "child collection title matches");
        $this->assertEquals($childCollection->get('collectionKey'), 'M7MNCCXU', "child collectionKey matches");
        $this->assertEquals($childCollection->get('numItems'), 0, "numItems matches");
        $this->assertEquals($childCollection->get('numCollections'), 0, "numCollections matches");
        $this->assertEquals($childCollection->get('parentCollection'), 'N7W92H48', "parentCollection matches");
        $this->assertTrue($childCollection->get('relations') !== null, 'Relations is not null');
    }
    
    public function testFetchTags(){
        $libstub = $this->libstub;
        
        $tags = $libstub->fetchTags(array());
        $this->assertEquals(count($tags), 50, "should be 50 tags in response");
        $this->assertEquals($tags[0]->get('name'), "Fitzharris, Edward, 1648?-1681 -- Early works to 1800. ; Great Britain -- History -- Charles II, 1660-1685 -- Early works to 1800.", "first tag name equal");
        $this->assertEquals($tags[1]->get('name'), "New York Times", "second name equal");
        $this->assertEquals($tags[1]->get('title'), "New York Times", "second title equal");
        $this->assertEquals($tags[1]->get('tag'), "New York Times", "second tag equal");
        $this->assertEquals($tags[1]->get('type'), 1, "second type equal");
        $this->assertEquals($tags[1]->get('numItems'), 2, "second numItems equal");
        
    }
    
    public function testGetTemplateItem(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetItemTypes(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetItemFields(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetCreatorTypes(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetCreatorFields(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testParseKey(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testFetchGroups(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetCV(){
        $libstub = $this->libstub;
        
        
    }
    
    public function testGetUsers(){
        $libstub = $this->libstub;
        
        
    }
}
?>