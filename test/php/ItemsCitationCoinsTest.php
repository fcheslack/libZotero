<?php
require_once "../../build/libZoteroSingle.php";

class Zotero_TopItemsCitationsTest extends PHPUnit_Framework_TestCase
{
    public function testTopItems()
    {
        $topItemsResponseBody = file_get_contents("../data/apiv2/topItemsBibCitationCoins");
        $topItemsResponse = libZotero_Http_Response::fromString($topItemsResponseBody);
        
        $libstub = $this->getMock('Zotero_Library', array('_request'), array('user', '475425', 'z_public_library'));
        
        $aparams = array('limit'=>10, 'content'=>'bib,citation,coins', 'linkwrap'=>1, 'style'=>'chicago-fullnote-bibliography', 'target'=>'items', 'targetModifier'=>'top');
        $topItemsUrl = $libstub->apiRequestUrl($aparams) . $libstub->apiQueryString($aparams);
        $map = array(
            array($topItemsUrl, 'GET', NULL, array(), array(), $topItemsResponse)
            );
        
        $libstub->expects($this->any())
             ->method('_request')
             ->will($this->returnValueMap($map) );
        
        $items = $libstub->fetchItemsTop(array('limit'=>10, 'content'=>'bib,citation,coins', 'linkwrap'=>1, 'style'=>'chicago-fullnote-bibliography'));
        
        $this->assertEquals(count($items), 10, "Got 10 item results");
        
        $i = 0;
        foreach($items as $item){
            //test that subcontent blocks were extracted and are present
            $this->assertTrue(!empty($item->bibContent), "non-empty bibContent $i");
            $this->assertTrue(!empty($item->subContents['bib']), "non-empty bib subContent $i");
            $this->assertEquals(trim($item->bibContent), trim($item->subContents['bib']), 'bibContent and subContents[bib] are the same');
            $this->assertTrue(!empty($item->subContents['citation']), "non-empty citation subContent $i");
            $this->assertTrue(isset($item->subContents['coins']), "subContents['coins'] is set, even if empty $i");
            
            //check that subcontent blocks are parseable
            $doc = new DOMDocument();
            $this->assertTrue($doc->loadXml($item->subContents['bib']), "bibContent parsed into dom" );
            $this->assertTrue($doc->loadXml($item->subContents['citation']), "subContents['citation'] parsed into dom" );
            //TODO: should the decoding be necessary on the user side or should libZotero be decoding this before saving?
            //is all export translator data similarly encoded?
            if(!empty($item->subContents['coins'])){
                $this->assertTrue($doc->loadXml(htmlspecialchars_decode($item->subContents['coins']) ), "subContents['coins'] parsed into dom" );
            }
            
            $i++;
        }
        
        $firstItem = $items[0];
        
        $doc = new DOMDocument();
        $doc->loadXml($item->bibContent);
        $linkNodes = $doc->getElementsByTagName("a");
        $this->assertTrue($linkNodes->length > 0, "anchor link found in bibContent");
    }
}