asyncTest( "Parse Tags Feed", function(){
    expect( 8 );
    
    J.get("../data/tagsjson.atom", function(data, textstatus, jqxhr){
        var library = new Zotero.Library('user', 1, 'test', null);
        
        var tagsfeed = new Zotero.Feed(data);
        var tags = library.tags;
        var addedTags = tags.addTagsFromFeed(tagsfeed);
        
        equal(tagsfeed.title, "Zotero / Z public library / Tags");
        equal(tagsfeed.id, "http://zotero.org/users/475425/tags?content=json");
        equal(tagsfeed.totalResults, 192, "test total Results");
        equal(tagsfeed.apiVersion, null, "test apiVersion");
        //deepEqual(tagsfeed.links, );
        equal(tagsfeed.lastPageStart, 150, "correctly found lastPageStart");
        equal(tagsfeed.lastPage, 4, "correctly found lastPage");
        equal(tagsfeed.currentPage, 1, "correctly found currentPage");
        
        var expectedDate = new Date();
        expectedDate.setTime( Date.parse( "2011-04-11T16:37:49Z" ) );
        equal(tagsfeed.updated.toString(), expectedDate.toString(), "found and parsed updated date" );
        
        
        start();
    });
});