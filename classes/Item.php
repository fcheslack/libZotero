<?php
 /**
  * Representation of a Zotero Item
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
  * @see        Zotero_Entry
  */

require_once "Entry.php";

class Zotero_Item extends Zotero_Entry
{
    /**
     * @var int
     */
    public $itemKey = '';

    /**
     * @var string
     */
    public $itemType = null;
    
    /**
     * @var string
     */
    public $creatorSummary = '';
    
    /**
     * @var string
     */
    public $numChildren = 0;

    /**
     * @var string
     */
    public $numTags = 0;
    
    /**
     * @var array
     */
    public $creators = array(); 

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
    public $note = null;
    
    /**
     * @var int Represents the relationship of the child to the parent. 0:file, 1:file, 2:snapshot, 3:web-link
     */
    public $linkMode = null;
    
    /**
     * @var string
     */
    public $mimeType = null;
    
    public $parsedJson = null;
    public $etag = '';
    
    /**
     * @var string content node of response useful if formatted bib request and we need to use the raw content
     */
    public $content;
    
    public $apiObject = array();
    
    /**
     * @var array
     */
    public static $fieldMap = array(
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
    
    
    public function __construct($entryNode=null)
    {
        if(!$entryNode){
            return;
        }
        elseif(is_string($entryNode)){
            $xml = $entryNode;
            $doc = new DOMDocument();
            echo $xml;
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        
        parent::__construct($entryNode);
        
        //save raw Content node in case we need it
        if($entryNode->getElementsByTagName("content")->length > 0){
            $this->content = $entryNode->getElementsByTagName("content")->item(0)->nodeValue;
        }
        
        // Extract the itemId and itemType
        $this->itemKey = $entryNode->getElementsByTagNameNS('*', 'key')->item(0)->nodeValue;
        $this->itemType = $entryNode->getElementsByTagNameNS('*', 'itemType')->item(0)->nodeValue;
        
        // Look for numChildren node
        if($entryNode->getElementsByTagName("numChildren")->length > 0){
            $this->numChildren = $entryNode->getElementsByTagName("numChildren")->item(0)->nodeValue;
        }
        
        // Look for numTags node
        if($entryNode->getElementsByTagName("numTags")->length > 0){
            $this->numTags = $entryNode->getElementsByTagName("numTags")->item(0)->nodeValue;
        }
        
        $contentNode = $entryNode->getElementsByTagName('content')->item(0);
        $contentType = parent::getContentType($entryNode);
        if($contentType == 'application/json'){
            $this->apiObject = json_decode($contentNode->nodeValue, true);
            $this->etag = $contentNode->getAttribute('etag');
        }
        elseif($contentType == 'xhtml'){
        }
        
        
    }
    
    public function get($key){
        if($key == 'creators' || $key == 'tags'){
            //special case
        }
        else{
            if(in_array($key, array_keys(Zotero_Item::$fieldMap))){
                if(isset($this->apiObject[$key])){
                    return $this->apiObject[$key];
                }
                else{
                    return null;
                }
            }
        }
    }
    
    public function set($key, $val){
        if($key == 'creators' || $key == 'tags'){
            //special case
        }
        else{
            //if(in_array($key, array_keys($this->fieldMap))) {
                $this->apiObject[$key] = $val;
            //}
        }
    }
    
    public function updateItemObject(){
        $updateItem = $this->apiObject;
        //remove notes as they can't be in update json
        unset($updateItem['notes']);
        $newCreatorsArray = array();
        foreach($updateItem['creators'] as $creator){
            if($creator['creatorType']){
                if(empty($creator['name']) && empty($creator['firstName']) && empty($creator['lastName'])){
                    continue;
                }
                else{
                    $newCreatorsArray[] = $creator;
                }
            }
        }
        $updateItem['creators'] = $newCreatorsArray;
        return $updateItem;
    }
    
    public function newItemObject(){
        $newItem = $this->apiObject;
        $newCreatorsArray = array();
        if(!isset($newItem['creators'])) {
            return $newItem;
        }
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
        return $newItem;
    }
    
    public function parseXhtmlContent($contentNode){
        //$xpath = new DOMXPath($contentNode);
        
        // Pull any fields in the item
        //$fieldNodes = $xpath->evaluate('//field');
        foreach($fieldNodes as $field){
            $fieldName = $field->getAttribute("name");
            $this->fields[$fieldName] = $field->nodeValue;
        }
        
        //TODO: is this information still available anywhere without content=full?
        // Get the attributes of the item element (present if content=full)
        /*
        foreach($entryNode->getElementsByTagName("item") as $item){
            $this->mimeType             = $item->getAttribute("mimeType");
            $this->linkMode             = $item->getAttribute("linkMode");
            $this->createdByUserID      = $item->getAttribute("createdByUserID");
            $this->lastModifiedByUserID = $item->getAttribute("lastModifiedByUserID");
        }
        */
        
        // If there is a note element, get the contents
        foreach($contentNode->getElementsByTagName("note") as $note){
            $this->note = $note->nodeValue;
        }
        
        // If there is a creatorSummary element, get the contents
        // The creatorSummary contains a string that shows primary author, shows just author if there's an editor too,
        // if there are multiple authors it shows one, two, and/or et al, if there's just an editor it shows that, etc.
        foreach($contentNode->getElementsByTagName("creatorSummary") as $creatorSummary){
            $this->creatorSummary = $creatorSummary->nodeValue;
        }
        
        // Extract creators
        foreach($contentNode->getElementsByTagName("creator") as $creatorNode){
            
            // If this is an inner creator node, don't process it
            if($creatorNode->getElementsByTagName("creator")->length == 0){
                continue;
            }
            
            // Get some info from the outer creator element's attributes
            $id           = $creatorNode->getAttribute("id");
            $index        = $creatorNode->getAttribute("index");
            $creatorType  = $creatorNode->getAttribute("creatorType");
            
            // Pull out the nested creator node and extract it's attributes
            $creatorNode  = $creatorNode->getElementsByTagName("creator")->item(0);
            $key          = $creatorNode->getAttribute("key");
            $dateAdded    = $creatorNode->getAttribute("dataAdded");
            $dateModified = $creatorNode->getAttribute("dateModified");
            
            // Pull out the name
            if($creatorNode->getElementsByTagName("fieldMode")->length){
                $name = $creatorNode->getElementsByTagName("name")->item(0)->nodeValue;
            } else {
                $name = array("firstName" => $creatorNode->getElementsByTagName("firstName")->item(0)->nodeValue,
                              "lastName"  => $creatorNode->getElementsByTagName("lastName")->item(0)->nodeValue);
            }
            
            // Add the creator to the creator list
            $this->creators[$index] = compact("id", "index", "creatorType", "key", "dateAdded", "dateModified", "name");
        }
    }
    
    public function json(){
        return json_encode($this->apiObject());
    }
    
    public function dataObject(){
        $jsonItem = new stdClass;
        
        //inherited from Entry
        $jsonItem->title = htmlspecialchars($this->title);
        $jsonItem->dateAdded = $this->dateAdded;
        $jsonItem->dateUpdated = $this->dateUpdated;
        $jsonItem->id = $this->id;
        
        $jsonItem->links = $this->links;
        
        foreach($this->entries as $entry){
            $jsonItem->entries[] = $entry->dataObject();
        }
        
        //Item specific vars
        $jsonItem->itemID = $this->itemID;
        $jsonItem->itemType = $this->itemType;
        $jsonItem->creatorSummary = htmlspecialchars($this->creatorSummary);
        $jsonItem->numChildren = $this->numChildren;
        $jsonItem->numTags = $this->numTags;
        //$jsonItem->fields = $this->fields;
        $jsonItem->creators = $this->creators;
        $jsonItem->createdByUserID = $this->createdByUserID;
        $jsonItem->lastModifiedByUserID = $this->lastModifiedByUserID;
        $jsonItem->note = $this->note;
        $jsonItem->linkMode = $this->linkMode;
        $jsonItem->mimeType = $this->mimeType;
        
        foreach($this->fields as $key=>$val){
            $jsonItem->fields[$key] = htmlspecialchars($val);
        }
        /*
        foreach($jsonItem->creators as $key=>$val){
            $jsonItem->creators[$key] = htmlspecialchars($val);
        }*/
        return $jsonItem;
    }
}
