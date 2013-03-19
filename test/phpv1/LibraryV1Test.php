<?php
require_once "../../build/libZoteroSinglePreV2.php";

/*
 * Mandatory to keep working the same:
 *  $library->fetchItems
 *  $library->fetchItemsTop
 *  $library->fetchAllCollections
 *  $library->fetchCollections
 *  $library->fetchChildCollections
 *  
 *  $item->bibContent
 */

/*
 * To test:
 *  - $collections = $library->fetchCollections(array('collectionKey'=>'', 'content'=>'json'));
 *  - $items = $library->fetchItemsTop(array('limit'=>10, 'collectionKey'=>$collectionKey));
 *  - $items = $library->fetchItems(array('limit'=>10, 'collectionKey'=>$collectionKey));
 *  - $library->fetchItems(array('limit'=>10, 'content'=>'json,bib,coins')) //check subcontents
 *  - $library->createItem($newItem)
 *  - $library->deleteItem($existingItem)
 *  - $library->apiRequestUrl
 *  - $library->apiQueryString
 *  - $library->parseQueryString
 *  - $library->fetchAllCollections
 *  - $library->fetchCollections
 *  - $library->fetchCollection
 *  - $library->fetchItemsTop
 *  - $library->fetchItemKeys //not necessary anymore?
 *  - $library->fetchTrashedItems
 *  - $library->fetchItems              (move to Zotero_Items? with alias here)
 *  - $library->fetchItem($key)         (move to Zotero_Items? with alias here)
 *  - $library->fetchItemBib
 *  - $library->itemDownloadLink
 *  - $library->writeUpdatedItem
 *  - $library->createAttachmentItem
 *  - $library->getTemplateItem
 *  - $library->addNotes
 *  - $library->createCollection
 *  - $library->removeCollection
 *  - $library->addItemsToCollection
 *  - $library->removeItemsFromCollection
 *  - $library->removeItemFromCollection
 *  - $library->writeUpdatedCollection
 *  - $library->deleteItem //permanently deletes, doesn't trash
 *  - $library->trashItem // trashes item, doesn't permanently delete
 *  - $library->fetchItemChildren
 *  - $library->getItemTypes
 *  - $library->getItemFields
 *  - $library->getCreatorTypes
 *  - $library->getCreatorFields
 *  - $library->fetchAllTags
 *  - $library->fetchTags
 *  - $library->getKeyPermissions
 *  - $library->parseKey
 *  - $library->fetchGroups
 *  - $library->fetchRecentGroups (make static method not associated with library?)
 *  - $library->getCV
 */
class Zotero_LibraryV1Test extends PHPUnit_Framework_TestCase
{
    protected $libstub;
    
    protected function setUp(){
        $libstub = $this->getMock('Zotero_Library', array('_request'), array('user', '475425', 'z_public_library'));
        
        $itemResponseBody = file_get_contents("../data/apiv1/individualItemJson");
        $collectionItemsJsonBibResponseBody = file_get_contents("../data/apiv1/collectionItemsJsonBib");
        $allcollectionsResponseBody = file_get_contents("../data/apiv1/allCollections");
        $childCollectionsResponseBody = file_get_contents("../data/apiv1/childCollections");
        $tagsResponseBody = file_get_contents("../data/apiv1/tagsresponse");
        
        $collectionItemsResponse = libZotero_Http_Response::fromString($collectionItemsJsonBibResponseBody);
        $itemResponse = libZotero_Http_Response::fromString($itemResponseBody);
        $tagsResponse = libZotero_Http_Response::fromString($tagsResponseBody);
        $allcollectionsResponse = libZotero_Http_Response::fromString($allcollectionsResponseBody);
        $childCollectionsResponse = libZotero_Http_Response::fromString($childCollectionsResponseBody);
        
        //build urls with instance of library so it adds key if it will have it and stays consistent since we're not testing url building here
        $aparams = array('target'=>'items', 'key'=>$libstub->_apiKey, 'collectionKey'=>'N7W92H48', 'content'=>'json,bib');
        $fetchCollectionItemsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        
        $aparams = array('target'=>'item', 'key'=>$libstub->_apiKey, 'content'=>'json', 'itemKey'=>'X42A7DEE');
        $fetchItemUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        
        $aparams = array('target'=>'collections', 'content'=>'json', 'limit'=>'100', 'key'=>$libstub->_apiKey);
        $fetchCollectionsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        
        $aparams = array('target'=>'collections', 'content'=>'json', 'collectionKey'=>'N7W92H48', 'key'=>$libstub->_apiKey);
        $fetchChildCollectionsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        
        $aparams = array('target'=>'tags', 'content'=>'json', 'key'=>$libstub->_apiKey);
        $fetchTagsUrl1 = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        
        
        $map = array(
            array($fetchCollectionItemsUrl1, 'GET', NULL, array(), array(), $collectionItemsResponse),
            array($fetchItemUrl1, 'GET', NULL, array(), array(), $itemResponse),
            array($fetchCollectionsUrl1, 'GET', NULL, array(), array(), $allcollectionsResponse),
            array($fetchChildCollectionsUrl1, 'GET', NULL, array(), array(), $childCollectionsResponse),
            array($fetchTagsUrl1, 'GET', NULL, array(), array(), $tagsResponse),
            
            );
        
        $libstub->expects($this->any())
             ->method('_request')
             ->will($this->returnValueMap($map) );
        
        $this->libstub = $libstub;
    }
    
    public function testInit()
    {
        include "../config.php"; //library credentials
        
        $library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
        
        $this->library = $library;
    }
    
    public function testApiStrings()
    {
        include "../config.php"; //library credentials
        
        $library = $this->libstub;
        
        $config;
        $url;
        
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
        /*
        $config = array('target'=>'deleted', 'libraryType'=>'user', 'libraryID'=>1, 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/deleted");
        $this->assertEquals($library->apiQueryString($config), "?content=json&limit=100");
        */
        $config = array('target'=>'children', 'libraryType'=>'user', 'libraryID'=>1, 'itemKey'=>'ASDF1234', 'content'=>'json', 'limit'=>'100');
        $this->assertEquals($library->apiRequestUrl($config), "https://api.zotero.org/users/1/items/ASDF1234/children");
        $this->assertEquals($library->apiQueryString($config), "?content=json&limit=100");
        
    }
    
    public function testv1Library(){
        $libstub = $this->libstub;
        
        
        $items = $libstub->fetchItems(array('collectionKey'=>'N7W92H48', 'content'=>'json,bib') );
        $this->assertEquals(count($items), 20, "should be 20 items in response" );
        $this->assertEquals($items[0]->itemKey, 'NM66T6EF', "First itemKey matches");
        $this->assertTrue(!isset($items[0]->apiObject['itemKey']), "First itemKey matches");
        $this->assertTrue(!empty($items[0]->subContents['bib']), "Bib should be set and not empty");
        $this->assertTrue(!empty($items[0]->bibContent), "special bibContent attribute should be present");
        
        //test get for every field on this item
        $item = $libstub->items->getItem('NM66T6EF');
        $this->assertTrue(!empty($item));
        $this->assertEquals($item->get('title'), 'HowStuffWorks "How Earthquakes Work"', "title equal");
        $this->assertEquals($item->numChildren, 2, "numChildren equal");
        $this->assertEquals($item->get('numTags'), 0, "numTags equal");
        $this->assertEquals($item->get('itemType'), 'webpage', "itemType equal");
        //$this->assertEquals($item->etag, "b0e4895ece6350453e830571e89a0983", "etag equal");
        $this->assertEquals($item->get('abstractNote'), "", "abstractNote equal");
        $this->assertEquals($item->get('url'), "http://science.howstuffworks.com/nature/natural-disasters/earthquake.htm", "url equal");
        $this->assertEquals($item->get('accessDate'), "2011-02-02 22:26:36", "accessDate equal");
        
        $item = $libstub->items->getItem('PQKBRC33');
        $this->assertEquals($item->get('itemType'), 'journalArticle', "itemType equal");
        $this->assertEquals($item->creatorSummary, "R. Creighton Buck", "creatorSummary equal");
        //$this->assertEquals($item->apiObject['year'], 1980, "year equal");
        $this->assertEquals($item->title, "Sherlock Holmes in Babylon", "title equal");
        $creators = $item->get('creators');
        $this->assertEquals($creators[0]['creatorType'] , 'author', "creatorType equal");
        $this->assertEquals($creators[0]['lastName'], "R. Creighton Buck", "creator lastName equal");
        $this->assertEquals($item->get('publicationTitle'), "The American Mathematical Monthly", "publicationTitle equal");
        $this->assertEquals($item->get('volume'), "87", "volume equal");
        $this->assertEquals($item->get('issue'), '5', "issue equal");
        $this->assertEquals($item->get('pages'), "335-345", "pages equal");
        $this->assertEquals($item->get('date'), "May 01, 1980", "date equal");
        $this->assertEquals($item->get('DOI'), "10.2307/2321200", "doi equal");
        $this->assertEquals($item->get('ISSN'), "00029890", "ISSN equal");
        $this->assertEquals($item->get('url'), "http://www.jstor.org/stable/2321200", "url equal");
        $this->assertEquals($item->get('archive'), "", "archive equal");
        $this->assertEquals($item->get('extra'), "ArticleType: research-article / Full publication date: May, 1980 / Copyright © 1980 Mathematical Association of America", "extra equal");
        $this->assertTrue(!empty($item->bibContent), "bibContent not empty");
        
        
        $collections = $libstub->fetchCollections();
        $this->assertEquals(count($collections), 15, "should be 15 collections in response" );
        
        
        $childCollections = $libstub->fetchCollections(array('collectionKey'=>'N7W92H48'));
        $this->assertEquals(count($childCollections), 1, "Should be 1 child collection");
        
        
        $tags = $libstub->fetchTags();
        $this->assertEquals(count($tags), 10, "should be 10 tags in response");
        
        
        /*
        $this->assertEquals($item->get(''), , " equal");
        $this->assertEquals($item->get(''), , " equal");
        $this->assertEquals($item->get(''), , " equal");
        $this->assertEquals($item->get(''), , " equal");
        $this->assertEquals($item->get(''), , " equal");
        */
        
        $this->assertTrue(!empty($items[1]->subContents['bib']), "Bib should be set and not empty");
        $this->assertTrue(!empty($items[1]->bibContent), "special bibContent attribute should be present");
        
        
        
    }
    
    public function testFetchCollections(){
        
    }
    
}
?>