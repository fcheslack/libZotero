asyncTest( "Parse Items Feed", function(){
    expect( 23 );
    
    J.get("../data/itemsjson.atom", function(data, textstatus, jqxhr){
        var library = new Zotero.Library('user', 1, 'test', null);
        
        var jFeedOb = J(data);
        var itemfeed = new Zotero.Feed(data);
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        
        //test that feed was parsed properly - 8 assertions
        equal(itemfeed.title, "Zotero / fcheslack / Items in Collection ‘Pervasive Computing’", "Test feed title");
        equal(itemfeed.id, "http://zotero.org/users/10150/collections/WDDWB8WT/items?content=json", "test feed id");
        equal(itemfeed.totalResults, 33, "test total results - 33");
        equal(itemfeed.apiVersion, null, "test apiVersion of feed");
        //deepEqual(itemfeed.links, );
        equal(itemfeed.lastPageStart, '', "test lastPageStart is empty");
        equal(itemfeed.lastPage, 1, 'test lastPage is 1');
        equal(itemfeed.currentPage, 1, 'test currentPage is 1');
        
        var expectedDate = new Date();
        expectedDate.setTime( Date.parse( "2013-01-20T01:41:47Z" ) );
        equal(itemfeed.updated.toString(), expectedDate.toString(), 'compare parsed updated string' );
        
        
        //check that items were parsed and put into items object - 11 assertions
        ok(items.getItem("359R9STK"), "first item retrieved by key");
        
        var item = items.getItem("XI6489RN");
        ok(item, 'second item retrieved by key');
        equal(item.title, "An architecture for privacy-sensitive ubiquitous computing", "ite title is what we expect");
        equal(item.author.name, "fcheslack", "author name is what we expect");
        equal(item.author.uri, "http://zotero.org/fcheslack", "author uri is what we expect");
        equal(item.id, "http://zotero.org/users/10150/items/XI6489RN", 'item.id is what we expect');
        equal(item.published, "2013-01-19T14:35:47Z", 'item.published is what we expect');
        equal(item.updated, "2013-01-19T14:35:47Z", 'item.updated is what we expect');
        
        equal(item.get('itemType'), 'conferencePaper', 'itemType is conferencePaper');
        equal(item.get('title'), 'An architecture for privacy-sensitive ubiquitous computing', 'item title is as expected');
        //equal(item.apiObj.collections[0], "WDDWB8WT");
        ok(J.inArray("WDDWB8WT", item.get('collections')) !== -1, "item in correct collection");
        
        //test setting and getting item data - 2 assertions
        item.set('conferenceName', '2nd international conference on Mobile systems, applications, and services');
        equal(item.apiObj.conferenceName, '2nd international conference on Mobile systems, applications, and services', 'setting item data set it in apiObj');
        equal(item.get('conferenceName'), '2nd international conference on Mobile systems, applications, and services', 'item.get gets back the information we item.set');
        
        
        //test adding and removing from collections - 2 assertions
        item.addToCollection("HJKL7890");
        ok(J.inArray("HJKL7890", item.get('collections')) !== -1, "Item added to collection locally");
        item.removeFromCollection("WDDWB8WT");
        ok(J.inArray("WDDWB8WT", item.get('collections')) === -1, "Item removed from collection locally");
        
        start();
    });
});