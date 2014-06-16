<?php
 /**
  * Representation of a Zotero Item
  * 
  * @package libZotero
  */

class Zotero_Item extends Zotero_ApiObject
{
    /**
     * @var Zotero_Library
     */
    public $owningLibrary = null;
    
    /**
     * @var array
     */
    public $childKeys = array();
    
    /**
     * @var string
     */
    public $createdByUserID = null;
    
    /**
     * @var string
     */
    public $lastModifiedByUserID = null;
    
    /**
     * @var string
     */
    public $notes = array();
    
    public $writeFailure = null;
    
    public $pristineData = null;
    
    /**
     * @var array
     */
    public static $fieldMap = array(
        "creator"             => "Creator",
        "itemType"            => "Type",
        "title"               => "Title",
        "dateAdded"           => "Date Added",
        "dateModified"        => "Modified",
        "source"              => "Source",
        "notes"               => "Notes",
        "tags"                => "Tags",
        "attachments"         => "Attachments",
        "related"             => "Related",
        "url"                 => "URL",
        "rights"              => "Rights",
        "series"              => "Series",
        "volume"              => "Volume",
        "issue"               => "Issue",
        "edition"             => "Edition",
        "place"               => "Place",
        "publisher"           => "Publisher",
        "pages"               => "Pages",
        "ISBN"                => "ISBN",
        "publicationTitle"    => "Publication",
        "ISSN"                => "ISSN",
        "date"                => "Date",
        "section"             => "Section",
        "callNumber"          => "Call Number",
        "archiveLocation"     => "Loc. in Archive",
        "distributor"         => "Distributor",
        "extra"               => "Extra",
        "journalAbbreviation" => "Journal Abbr",
        "DOI"                 => "DOI",
        "accessDate"          => "Accessed",
        "seriesTitle"         => "Series Title",
        "seriesText"          => "Series Text",
        "seriesNumber"        => "Series Number",
        "institution"         => "Institution",
        "reportType"          => "Report Type",
        "code"                => "Code",
        "session"             => "Session",
        "legislativeBody"     => "Legislative Body",
        "history"             => "History",
        "reporter"            => "Reporter",
        "court"               => "Court",
        "numberOfVolumes"     => "# of Volumes",
        "committee"           => "Committee",
        "assignee"            => "Assignee",
        "patentNumber"        => "Patent Number",
        "priorityNumbers"     => "Priority Numbers",
        "issueDate"           => "Issue Date",
        "references"          => "References",
        "legalStatus"         => "Legal Status",
        "codeNumber"          => "Code Number",
        "artworkMedium"       => "Medium",
        "number"              => "Number",
        "artworkSize"         => "Artwork Size",
        "libraryCatalog"      => "Library Catalog",
        "videoRecordingType"  => "Recording Type",
        "interviewMedium"     => "Medium",
        "letterType"          => "Type",
        "manuscriptType"      => "Type",
        "mapType"             => "Type",
        "scale"               => "Scale",
        "thesisType"          => "Type",
        "websiteType"         => "Website Type",
        "audioRecordingType"  => "Recording Type",
        "label"               => "Label",
        "presentationType"    => "Type",
        "meetingName"         => "Meeting Name",
        "studio"              => "Studio",
        "runningTime"         => "Running Time",
        "network"             => "Network",
        "postType"            => "Post Type",
        "audioFileType"       => "File Type",
        "version"             => "Version",
        "system"              => "System",
        "company"             => "Company",
        "conferenceName"      => "Conference Name",
        "encyclopediaTitle"   => "Encyclopedia Title",
        "dictionaryTitle"     => "Dictionary Title",
        "language"            => "Language",
        "programmingLanguage" => "Language",
        "university"          => "University",
        "abstractNote"        => "Abstract",
        "websiteTitle"        => "Website Title",
        "reportNumber"        => "Report Number",
        "billNumber"          => "Bill Number",
        "codeVolume"          => "Code Volume",
        "codePages"           => "Code Pages",
        "dateDecided"         => "Date Decided",
        "reporterVolume"      => "Reporter Volume",
        "firstPage"           => "First Page",
        "documentNumber"      => "Document Number",
        "dateEnacted"         => "Date Enacted",
        "publicLawNumber"     => "Public Law Number",
        "country"             => "Country",
        "applicationNumber"   => "Application Number",
        "forumTitle"          => "Forum/Listserv Title",
        "episodeNumber"       => "Episode Number",
        "blogTitle"           => "Blog Title",
        "caseName"            => "Case Name",
        "nameOfAct"           => "Name of Act",
        "subject"             => "Subject",
        "proceedingsTitle"    => "Proceedings Title",
        "bookTitle"           => "Book Title",
        "shortTitle"          => "Short Title",
        "docketNumber"        => "Docket Number",
        "numPages"            => "# of Pages"
    );
    
    /**
     * @var array
     */
    public static $typeMap = array(
        "note"                => "Note",
        "attachment"          => "Attachment",
        "book"                => "Book",
        "bookSection"         => "Book Section",
        "journalArticle"      => "Journal Article",
        "magazineArticle"     => "Magazine Article",
        "newspaperArticle"    => "Newspaper Article",
        "thesis"              => "Thesis",
        "letter"              => "Letter",
        "manuscript"          => "Manuscript",
        "interview"           => "Interview",
        "film"                => "Film",
        "artwork"             => "Artwork",
        "webpage"             => "Web Page",
        "report"              => "Report",
        "bill"                => "Bill",
        "case"                => "Case",
        "hearing"             => "Hearing",
        "patent"              => "Patent",
        "statute"             => "Statute",
        "email"               => "E-mail",
        "map"                 => "Map",
        "blogPost"            => "Blog Post",
        "instantMessage"      => "Instant Message",
        "forumPost"           => "Forum Post",
        "audioRecording"      => "Audio Recording",
        "presentation"        => "Presentation",
        "videoRecording"      => "Video Recording",
        "tvBroadcast"         => "TV Broadcast",
        "radioBroadcast"      => "Radio Broadcast",
        "podcast"             => "Podcast",
        "computerProgram"     => "Computer Program",
        "conferencePaper"     => "Conference Paper",
        "document"            => "Document",
        "encyclopediaArticle" => "Encyclopedia Article",
        "dictionaryEntry"     => "Dictionary Entry",
    );
    
    /**
     * @var array
     */
    public static $creatorMap = array(
        "author"         => "Author",
        "contributor"    => "Contributor",
        "editor"         => "Editor",
        "translator"     => "Translator",
        "seriesEditor"   => "Series Editor",
        "interviewee"    => "Interview With",
        "interviewer"    => "Interviewer",
        "director"       => "Director",
        "scriptwriter"   => "Scriptwriter",
        "producer"       => "Producer",
        "castMember"     => "Cast Member",
        "sponsor"        => "Sponsor",
        "counsel"        => "Counsel",
        "inventor"       => "Inventor",
        "attorneyAgent"  => "Attorney/Agent",
        "recipient"      => "Recipient",
        "performer"      => "Performer",
        "composer"       => "Composer",
        "wordsBy"        => "Words By",
        "cartographer"   => "Cartographer",
        "programmer"     => "Programmer",
        "reviewedAuthor" => "Reviewed Author",
        "artist"         => "Artist",
        "commenter"      => "Commenter",
        "presenter"      => "Presenter",
        "guest"          => "Guest",
        "podcaster"      => "Podcaster"
    );
    
    
    public function __construct($itemArray=null, $library=null)
    {
        if(!$itemArray){
            return;
        }
        
        parent::__construct($itemArray);
        if($library !== null){
            $this->associateWithLibrary($library);
        }
    }
    
    public function __get($key) {
        if(array_key_exists($key, $this->apiObj['data'])){
            return $this->apiObj['data'][$key];
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            return $this->apiObj['meta'][$key];
        }
        
        switch($key){
            case 'key':
            case 'itemKey':
                return $this->apiObj['key'];
            case 'version':
            case 'itemVersion':
                return $this->apiObj['version'];
            case 'year':
                throw new \Exception('Not implemented');
            case 'parentItem':
            case 'parentItemKey':
                return $this->apiObj['data']['parentItem'];
        }
        
        return null;
    }
    
    public function __set($key, $val) {
        if(array_key_exists($key, $this->apiObj['data'])){
            $this->apiObj['data'][$key] = $val;
        }
        if(array_key_exists($key, $this->apiObj['meta'])){
            $this->apiObj['meta'][$key] = $val;
        }
        return $this;
    }
    
    public function initItemFromTemplate($template){
        $this->version = 0;
        
        $this->itemType = $template['itemType'];
        $this->key = '';
        $this->pristine = $template;
        $this->apiObject = $template;
    }
    
    public function get($key){
        return $this->$key;
    }
    
    public function set($key, $val){
        $this->$key = $val;
    }
    
    public function addCreator($creatorArray){
        $this->creators[] = $creatorArray;
        $this->apiObject['creators'][] = $creatorArray;
    }
    
    public function updateItemObject(){
        return $this->writeApiObject();
    }
    
    public function newItemObject(){
        $newItem = $this->apiObject;
        $newCreatorsArray = array();
        if(isset($newItem['creators'])) {
            foreach($newItem['creators'] as $creator){
                if($creator['creatorType']){
                    if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                        continue;
                    }
                    else{
                        $newCreatorsArray[] = $creator;
                    }
                }
            }
            $newItem['creators'] = $newCreatorsArray;
        }
        
        return $newItem;
    }
    
    public function isAttachment(){
        if($this->itemType == 'attachment'){
            return true;
        }
    }
    
    public function hasFile(){
        if(!$this->isAttachment()){
            return false;
        }
        $hasEnclosure = isset($this->links['enclosure']);
        $linkMode = $this->apiObject['linkMode'];
        if($hasEnclosure && ($linkMode == 0 || $linkMode == 1)){
            return true;
        }
    }
    
    public function attachmentIsSnapshot(){
        if(!isset($this->links['enclosure'])) return false;
        if(!isset($this->links['enclosure']['text/html'])) return false;
        $tail = substr($this->links['enclosure']['text/html']['href'], -4);
        if($tail == "view") return true;
        return false;
    }
    
    public function json(){
        return json_encode($this->apiObject());
    }
    
    public function formatItemField($field){
        switch($field){
            case "title":
                return htmlspecialchars($this->title);
                break;
            case "creator":
                if(isset($this->creatorSummary)){
                    return htmlspecialchars($this->creatorSummary);
                }
                else{
                    return '';
                }
                break;
            case "dateModified":
            case "dateUpdated":
                return htmlspecialchars($this->dateUpdated);
                break;
            case "dateAdded":
                return htmlspecialchars($this->dateAdded);
                break;
            default:
                if(isset($this->apiObject[$field])){
                    return htmlspecialchars($this->apiObject[$field]);
                }
                else{
                    return '';
                }
        }
    }
    
    public function compareItem($otherItem){
        $diff = array_diff_assoc($this->apiObject, $otherItem->apiObject);
        return $diff;
    }
    
    public function addToCollection($collection){
        $collectionKey = $this->extractKey($collection);
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            if(!in_array($collectionKey, $memberCollectionKeys)) {
                $memberCollectionKeys[] = $collectionKey;
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function removeFromCollection($collection){
        $collectionKey = $this->extractKey($collection);
        
        $memberCollectionKeys = $this->get('collections');
        if(!is_array($memberCollectionKeys)){
            $memberCollectionKeys = array($collectionKey);
            $this->set('collections', $memberCollectionKeys);
        }
        else {
            $ind = array_search($collectionKey, $memberCollectionKeys);
            if($ind !== false){
                array_splice($memberCollectionKeys, $ind, 1);
                $this->set('collections', $memberCollectionKeys);
            }
        }
    }
    
    public function addTag($newtagname, $type=null){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $tag){
            if(is_string($tag) && $tag == $newtagname){
                return;
            }
            elseif(is_array($tag) && isset($tag['tag']) && $tag['tag'] == $newtagname) {
                return;
            }
        }
        if($type !== null){
            $itemTags[] = array('tag'=>$newtagname, 'type'=>$type);
        }
        else {
            $itemTags[] = array('tag'=>$newtagname);
        }
        $this->set('tags', $itemTags);
    }
    
    public function removeTag($rmtagname){
        $itemTags = $this->get('tags');
        //assumes we'll get an array
        foreach($itemTags as $ind=>$tag){
            if( (is_string($tag) && $tag == $rmtagname) ||
                (is_array($tag) && isset($tag['tag']) && $tag['tag'] == $rmtagname) ){
                array_splice($itemTags, $ind, 1);
                $this->set('tags', $itemTags);
                return;
            }
        }
    }
    
    public function addNote($noteItem){
        $this->notes[] = $noteItem;
    }
    
    public function uploadFile(){
        
    }
    
    public function uploadChildAttachment(){
        
    }
    
    public function writeApiObject(){
        $updateItem = array_merge($this->pristine, $this->apiObject);
        if(empty($updateItem['creators'])){
            return $updateItem;
        }
        
        $newCreators = array();
        foreach($updateItem['creators'] as $creator){
            if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                continue;
            }
            else {
                $newCreators[] = $creator;
            }
        }
        $updateItem['creators'] = $newCreators;
        return $updateItem;
    }
    
    public function writePatch(){
        
    }
    
    public function trashItem(){
        $this->set('deleted', 1);
    }
    
    public function untrashItem(){
        $this->set('deleted', 0);
    }
    
    public function save() {
        return $this->owningLibrary->items->writeItems(array($this));
    }
    
    public function getChildren(){
        //short circuit if has item has no children
        if(!($this->numChildren)){//} || (this.parentItemKey !== false)){
            return array();
        }
        
        $config = array('target'=>'children', 'libraryType'=>$this->owningLibrary->libraryType, 'libraryID'=>$this->owningLibrary->libraryID, 'itemKey'=>$this->key);
        $requestUrl = $this->owningLibrary->apiRequestString($config);
        
        $response = $this->owningLibrary->_request($requestUrl, 'GET');
        
        //load response into item objects
        $respArray = $response->parseResponseBody();
        $fetchedItems = $this->owningLibrary->items->addItemsFromJson($respArray);
        return $fetchedItems;
    }
    
    public function getCSLItem(){
        return Zotero_Cite::convertItem($this);
    }
}
