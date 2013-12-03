/*
 * Test cases:
 * create a new item with no children
 *     single POST to /items
 */
asyncTest( "Create item", function(){
    expect( 5 );
    console.log("config:");
    console.log(Zotero.config);
    var library = new Zotero.Library(Zotero.testing.libraryType, Zotero.testing.libraryID, '', '');
    
    var item = new Zotero.Item();
    item.associateWithLibrary(library);
    var d = item.initEmpty('conferencePaper');
    d.done(J.proxy(function(item){
        item.set('title', 'GurunGo: coupling personal computers and mobile devices through mobile data types');
        item.set('conferenceName', 'Eleventh Workshop on Mobile Computing Systems & Applications');
        
        var writeItemD = item.writeItem();
        writeItemD.done(function(itemsArray){
            equal(itemsArray.length, 1, "We expect 1 items was written");
            ok(itemsArray[0].itemKey, "We expect the first item to have an itemKey");
            
            //delete the newly created items
            var deleteXhr = library.items.deleteItems(itemsArray);
            deleteXhr.done(function(data, statusText, jqxhr){
                equal(jqxhr.status, 204, "Expect successful delete to respond with 204 no content");
                start();
            });
        });
    }, this) );
});