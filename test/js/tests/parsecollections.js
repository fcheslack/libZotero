asyncTest( "Parse Collections Feed", function(){
    expect( 8 );
    
    J.get("../data/collectionsjson.atom", function(data, textstatus, jqxhr){
        var library = new Zotero.Library('user', 1, 'test', null);
        
        var jFeedOb = J(data);
        var collectionfeed = new Zotero.Feed(data);
        var collections = library.collections;
        //clear out display items
        var collectionsAdded = collections.addCollectionsFromFeed(collectionfeed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        
        
        equal(collectionfeed.title, "Zotero / Z public library / Collections");
        equal(collectionfeed.id, "http://zotero.org/users/475425/collections?content=json");
        equal(collectionfeed.totalResults, 15);
        equal(collectionfeed.apiVersion, null);
        //deepEqual(collectionfeed.links, );
        equal(collectionfeed.lastPageStart, '');
        equal(collectionfeed.lastPage, 1);
        equal(collectionfeed.currentPage, 1);
        
        var expectedDate = new Date();
        expectedDate.setTime( Date.parse( "2011-06-29T14:29:32Z" ) );
        equal(collectionfeed.updated.toString(), expectedDate.toString() );
        
        
        start();
    });
});