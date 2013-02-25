test( "Zotero.Ajax.apiRequestUrl", function() {
      var oldBaseApiUrl = Zotero.config.baseApiUrl;
      Zotero.config.baseApiUrl = 'https://api.zotero.org';
      
      var config;
      var url;
      
      config = {'target':'collections', 'libraryType':'user', 'libraryID':1, 'content':'json', limit:'100'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/collections");
      equal(Zotero.ajax.apiQueryString(config), "?content=json&limit=100");
      
      config = {'target':'items', 'libraryType':'group', 'libraryID':1, 'format':'atom', 'content':'json', limit:'100'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/groups/1/items");
      equal(Zotero.ajax.apiQueryString(config), "?content=json&format=atom&limit=100");
      
      config = {'target':'item', 'libraryType':'user', 'libraryID':1, 'content':'json,coins', limit:'25'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/items");
      equal(Zotero.ajax.apiQueryString(config), "?content=json%2Ccoins&limit=25");
      
      config = {'target':'item', 'libraryType':'user', 'libraryID':1, 'content':'json', itemKey:'ASDF1234'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/items/ASDF1234");
      equal(Zotero.ajax.apiQueryString(config), "?content=json");
      
      config = {'target':'items', 'libraryType':'user', 'libraryID':1, 'content':'bibtex', limit:'100', itemKey:'ASDF1234,FDSA4321'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/items");
      equal(Zotero.ajax.apiQueryString(config), "?content=bibtex&itemKey=ASDF1234%2CFDSA4321&limit=100");
      
      config = {'target':'deleted', 'libraryType':'user', 'libraryID':1, 'content':'json', limit:'100'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/deleted");
      equal(Zotero.ajax.apiQueryString(config), "?content=json&limit=100");
      
      config = {'target':'children', 'libraryType':'user', 'libraryID':1, 'itemKey':'ASDF1234', 'content':'json', limit:'100'};
      equal(Zotero.ajax.apiRequestUrl(config), "https://api.zotero.org/users/1/items/ASDF1234/children");
      equal(Zotero.ajax.apiQueryString(config), "?content=json&limit=100");
      
      
      Zotero.config.baseApiUrl = oldBaseApiUrl;
} );

