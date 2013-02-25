test( "instantiate user library", function() {
    var library = new Zotero.Library('user', 1, 'test', null);
    equal(library.instance, "Zotero.Library");
    equal(library.items.instance, "Zotero.Items");
    equal(library.collections.instance, "Zotero.Collections");
    equal(library.tags.instance, "Zotero.Tags");
    equal(library.searches.instance, "Zotero.Searches");
} );
