Zotero.config = {
    librarySettings: {allowEdit: 1},
    baseApiUrl: 'https://api.zotero.org',
    baseWebsiteUrl: 'https://zotero.org',
    baseFeedUrl: 'https://api.zotero.org',
    baseZoteroWebsiteUrl: 'https://www.zotero.org',
    baseDownloadUrl: '',
    directDownloads: false,
    proxyDownloads: true,
    
    staticPath: '',
    staticLoadUrl: window.location.pathname,
    proxyPath: '../proxyRequest.php',
    ignoreLoggedInStatus: true,
    storePrefsRemote: false,
    proxy: true,
    breadcrumbsBase: [],
    apiKey: '',
    ajax: 1,
    apiVersion: 2,
    CORSallowed: false,
    locale: 'en-US',
    cacheStoreType: 'localStorage',
    preloadCachedLibrary: true,
    rte: 'ckeditor',
    mobile:0,
    sortOrdering: {
     'dateAdded': 'desc',
     'dateModified': 'desc',
     'date': 'desc',
     'year': 'desc',
     'accessDate': 'desc',
     'title': 'asc',
     'creator': 'asc'
    },
    defaultSortColumn: 'title',
    defaultSortOrder: 'asc',
    largeFields: {
     'title': 1,
     'abstractNote': 1,
     'extra' : 1
    },
    richTextFields: {
     'note': 1
    },
    maxFieldSummaryLength: {title:60},
    exportFormats: [
    "bibtex",
    "bookmarks",
    "mods",
    "refer",
    "rdf_bibliontology",
    "rdf_dc",
    "rdf_zotero",
    "ris",
    "wikipedia"
    ],
    defaultApiArgs: {
    'order': 'title',
    'sort': 'asc',
    'limit': 50,
    'start': 0,
    'content':'json',
    'format': 'atom'
    } };