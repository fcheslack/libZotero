
asyncTest( "Create items, modify with ok, unchanged, fail results.", function(){
    expect( 9 );
    console.log("config:");
    console.log(Zotero.config);
    var library = new Zotero.Library(Zotero.testing.libraryType, Zotero.testing.libraryID, '', '');
    
    var item1 = new Zotero.Item();
    var item2 = new Zotero.Item();
    var item3 = new Zotero.Item();
    var item4 = new Zotero.Item();
    item1.initEmptyNote();
    item2.initEmptyNote();
    item3.initEmptyNote();
    item4.initEmptyNote();
    library.items.addItem(item1);
    library.items.addItem(item2);
    library.items.addItem(item3);
    library.items.addItem(item4);
    
    var d = library.items.writeItems([item1, item2, item3, item4]);
    d.done(J.proxy(function(itemsArray){
        equal(item1.writeFailure, false, "Expect no write failure.");
        equal(item2.writeFailure, false, "Expect no write failure.");
        equal(item3.writeFailure, false, "Expect no write failure.");
        equal(item4.writeFailure, false, "Expect no write failure.");
        
        item1.set('note', 'GurunGo: coupling personal computers and mobile devices through mobile data types');
        item3.apiObj['title'] = 'Eleventh Workshop on Mobile Computing Systems & Applications';
        item4.set('note', 'GurunGo: coupling personal computers and mobile devices through mobile data types');
        item4.set('itemVersion', 0); //set an itemVersion that should fail
        
        var d2 = library.items.writeItems([item1, item2, item3, item4]);
        d2.done(J.proxy(function(itemsArray){
            equal(item1.writeFailure, false, "Expect no write failure.");
            equal(item2.writeFailure, false, "Expect no write failure.");
            equal(item3.writeFailure.code, 400, "Expect bad input.");
            equal(item4.writeFailure.code, 412, "Expect precondition failed.");
            
            //delete the newly created items
            var deleteXhr = library.items.deleteItems(itemsArray);
            deleteXhr.done(J.proxy(function(data, statusText, jqxhr){
                equal(jqxhr.status, 204, "Expect successful delete to respond with 204 no content");
                start();
            }, this) );
        }, this) );
    }, this) );
});