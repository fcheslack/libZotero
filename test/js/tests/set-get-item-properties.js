test( "Set/Get item properties", function() {
      
      var journalTemplate = {
            "itemType":"journalArticle",
            "title":"",
            "creators":[{"creatorType":"author","firstName":"","lastName":""}],
            "abstractNote":"",
            "publicationTitle":"",
            "volume":"",
            "issue":"",
            "pages":"",
            "date":"",
            "series":"",
            "seriesTitle":"",
            "seriesText":"",
            "journalAbbreviation":"",
            "language":"",
            "DOI":"",
            "ISSN":"",
            "shortTitle":"",
            "url":"",
            "accessDate":"",
            "archive":"",
            "archiveLocation":"",
            "libraryCatalog":"",
            "callNumber":"",
            "rights":"",
            "extra":"",
            "tags":[],
            "collections":[],
            "relations":{}
      };
      
      var item = new Zotero.Item();
      item.initEmptyFromTemplate(journalTemplate);
      
      item.set('title', 'Journal Article Title');
      item.set('itemKey', 'ASDF1234');
      item.set('itemVersion', 74);
      item.set('itemType', 'conferencePaper');
      item.set('deleted', 1);
      item.set('parentItem', 'HJKL9876');
      item.set('abstractNote', 'This is a test item.');
      item.set('notRealField', 'Not a real field value.');
      
      //test that get returns what it should for each set
      equal(item.get('title'), 'Journal Article Title', "get title should return what was set.");
      equal(item.get('itemKey'), 'ASDF1234', "get itemkey should return what was set.");
      equal(item.get('itemVersion'), 74, "get itemVersion should return what was set.");
      equal(item.get('itemType'), 'conferencePaper', 'get itemType should return what was set.');
      equal(item.get('deleted'), 1, "get deleted should return what was set.");
      equal(item.get('parentItem'), 'HJKL9876', 'get parentItem should return what was set');
      equal(item.get('abstractNote'), 'This is a test item.', 'get abstractNote should return what was set.');
      equal(item.get('notRealField'), null, "get fake field value should return null.");
      
      equal(item.title, 'Journal Article Title', 'title should be set on item object');
      equal(item.apiObj.title, 'Journal Article Title', 'title should be set on item apiObj');
      equal(item.pristine.title, '', 'title should not be set on item pristine');
      
      equal(item.itemKey, 'ASDF1234', 'itemKey should be set on item object');
      equal(item.apiObj.itemKey, 'ASDF1234', 'itemKey should be set on item apiObj');
      equal(item.pristine.itemKey, undefined, 'itemKey should be undefined on pristine');
      
      equal(item.itemVersion, 74, 'itemVersion should be set on item object');
      equal(item.apiObj.itemVersion, 74, 'itemVersion should be set on item apiObj');
      equal(item.pristine.itemVersion, undefined, 'itemVersion should be undefined on item pristine');
      
      equal(item.deleted, undefined, "deleted should not be set on item object");
      equal(item.apiObj.deleted, 1, 'deleted should be set on item apiObj');
      
      
} );

