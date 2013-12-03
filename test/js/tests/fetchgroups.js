asyncTest( "Fetch Groups", function(){
    expect( 1 );
    
    Zotero.config.apiKey = "NfMdcSUC2gbiapHfCf4ComvP";
    var library = new Zotero.Library('user', 10150, 'fcheslack', 'NfMdcSUC2gbiapHfCf4ComvP');
    
    var d = library.groups.fetchUserGroups(10150);
    
    d.done(J.proxy(function(){
        ok(library.groups.groupsArray.length > 0, "non-empty groups array");
        console.log("num groups: " + library.groups.groupsArray.length);
        console.log(library.groups.groupsArray);
        for(var i = 0; i < library.groups.groupsArray.length; i++){
            console.log("Group name: " + library.groups.groupsArray[i].get('name'));
            console.log(library.groups.groupsArray[i]);
        }
        
        start();
    }, this ) );
});