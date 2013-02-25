
asyncTest( "Write Nonexistent Items", function(){
    expect( 7 );
    console.log("config:");
    console.log(Zotero.testing);
    var library = new Zotero.Library(Zotero.testing.libraryType, Zotero.testing.libraryID, '', '');
    
    var item = new Zotero.Item();
    item.associateWithLibrary(library);
    var d = item.initEmpty('conferencePaper');
    d.done(J.proxy(function(item){
        item.updateItemKey('ASDF1234');
        item.set('itemVersion', 3);
        item.set('title', 'GurunGo: coupling personal computers and mobile devices through mobile data types');
        item.set('conferenceName', 'Eleventh Workshop on Mobile Computing Systems & Applications');
        
        var writeItemD = item.writeItem();
        writeItemD.done(J.proxy(function(itemsArray){
            equal(itemsArray.length, 1, "We expect 1 item to be affected");
            var itemAfter = itemsArray[0];
            ok(itemAfter.writeFailure, "Expect item to have something in writeFailure");
            equal(itemAfter.writeFailure.key, 'ASDF1234', 'Expect failed item to keep same fake key we gave it.');
            equal(itemAfter.writeFailure.code, 400, "Expect write to have failed because of invalid item key");
            ok(itemAfter.writeFailure.message, "Expect some message text in the failure object, may not be fixed so anything will do.");
            
            //delete the non-existent items
            var deleteXhr = library.items.deleteItems(itemsArray);
            deleteXhr.done(J.proxy(function(data, statusText, jqxhr){
                equal(jqxhr.status, 204, "Expect multi-delete to respond with 204 even for non-existent item");
                
                //try deleting with single item method
                var delete2Xhr = library.items.deleteItem(item);
                delete2Xhr.always(J.proxy(function(jqxhr){
                    equal(jqxhr.status, 404, "Expect delete of single non-existent item to respond with 404");
                    
                    start();
                    
                }, this) );
            }, this) );
        }, this) );
    }, this) );
});