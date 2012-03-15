<?php
 /**
  * Representation of a Zotero Item
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */

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
    public $childKeys = array();
    
    /**
     * @var string
     */
    public $parentKey = '';
    
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
    
    
    public function __construct($entryNode=null)
    {
        if(!$entryNode){
            return;
        }
        elseif(is_string($entryNode)){
            $xml = $entryNode;
            $doc = new DOMDocument();
            $doc->loadXml($xml);
            $entryNode = $doc->getElementsByTagName('entry')->item(0);
        }
        
        parent::__construct($entryNode);
        
        //check if we have multiple subcontent nodes
        $subcontentNodes = $entryNode->getElementsByTagNameNS("*", "subcontent");
        
        //save raw Content node in case we need it
        if($entryNode->getElementsByTagName("content")->length > 0){
            $d = $entryNode->ownerDocument;
            $this->contentNode = $entryNode->getElementsByTagName("content")->item(0);
            $this->content = $d->saveXml($this->contentNode);
        }
        
        
        // Extract the itemId and itemType
        $this->itemKey = $entryNode->getElementsByTagNameNS('*', 'key')->item(0)->nodeValue;
        $this->itemType = $entryNode->getElementsByTagNameNS('*', 'itemType')->item(0)->nodeValue;
        
        // Look for numChildren node
        $numChildrenNode = $entryNode->getElementsByTagNameNS('*', "numChildren")->item(0);
        if($numChildrenNode){
            $this->numChildren = $numChildrenNode->nodeValue;
        }
        
        // Look for numTags node
        $numTagsNode = $entryNode->getElementsByTagNameNS('*', "numTags")->item(0);
        if($numTagsNode){
            $this->numTags = $numTagsNode->nodeValue;
        }
        
        $creatorSummaryNode = $entryNode->getElementsByTagNameNS('*', "creatorSummary")->item(0);
        if($creatorSummaryNode){
            $this->creatorSummary = $creatorSummaryNode->nodeValue;
        }
        
        if($subcontentNodes->length > 0){
            for($i = 0; $i < $subcontentNodes->length; $i++){
                $scnode = $subcontentNodes->item($i);
                $type = $scnode->getAttribute('zapi:type');
                if($type == 'application/json' || $type == 'json'){
                    $this->apiObject = json_decode($scnode->nodeValue, true);
                    $this->etag = $scnode->getAttribute('zapi:etag');
                    if(isset($this->apiObject['creators'])){
                        $this->creators = $this->apiObject['creators'];
                    }
                    else{
                        $this->creators = array();
                    }
                }
                elseif($type == 'bib'){
                    $bibNode = $scnode->getElementsByTagName('div')->item(0);
                    $this->bibContent = $bibNode->ownerDocument->saveXML($bibNode);
                }
                else{
                    throw new Exception("Unknown zapi:subcontent type " . $type);
                }
            }
        }
        else{
            $contentNode = $entryNode->getElementsByTagName('content')->item(0);
            $contentType = parent::getContentType($entryNode);
            if($contentType == 'application/json' || $contentType == 'json'){
                $this->apiObject = json_decode($contentNode->nodeValue, true);
                $this->etag = $contentNode->getAttribute('zapi:etag');
                if(isset($this->apiObject['creators'])){
                    $this->creators = $this->apiObject['creators'];
                }
                else{
                    $this->creators = array();
                }
            }
        }
        
        if(isset($this->links['up'])){
            $parentLink = $this->links['up']['application/atom+xml']['href'];
            $matches = array();
            preg_match("/items\/([A-Z0-9]{8})/", $parentLink, $matches);
            if(count($matches) == 2){
                $this->parentKey = $matches[1];
            }
        }
        else{
            $this->parentKey = false;
        }
    }
    
    public function get($key){
        if($key == 'tags'){
            if(isset($this->apiObject['tags'])){
                return $this->apiObject['tags'];
            }
        }
        elseif($key == 'creators'){
            //special case
            if(isset($this->apiObject['creators'])){
                return $this->apiObject['creators'];
            }
        }
        else{
            if(isset($this->apiObject[$key])){
                return $this->apiObject[$key];
            }
            else{
                return null;
            }
        }
    }
    
    public function set($key, $val){
        if($key == 'creators' || $key == 'tags'){
            //TODO: special case empty value and correctly in arrays
            $this->apiObject[$key] = $val;
        }
        else{
            //if(in_array($key, array_keys($this->fieldMap))) {
                $this->apiObject[$key] = $val;
            //}
        }
    }
    
    public function addCreator($creatorArray){
        $this->creators[] = $creatorArray;
        $this->apiObject['creators'][] = $creatorArray;
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
    
    public function json(){
        return json_encode($this->apiObject());
    }
    
    public function fullItemJSON(){
        return json_encode($this->fullItemArray());
    }
    
    public function fullItemArray(){
        $jsonItem = array();
        
        //inherited from Entry
        $jsonItem['title'] = $this->title;
        $jsonItem['dateAdded'] = $this->dateAdded;
        $jsonItem['dateUpdated'] = $this->dateUpdated;
        $jsonItem['id'] = $this->id;
        
        $jsonItem['links'] = $this->links;
        
        //Item specific vars
        $jsonItem['itemKey'] = $this->itemKey;
        $jsonItem['itemType'] = $this->itemType;
        $jsonItem['creatorSummary'] = $this->creatorSummary;
        $jsonItem['numChildren'] = $this->numChildren;
        $jsonItem['numTags'] = $this->numTags;
        
        $jsonItem['creators'] = $this->creators;
        $jsonItem['createdByUserID'] = $this->createdByUserID;
        $jsonItem['lastModifiedByUserID'] = $this->lastModifiedByUserID;
        $jsonItem['note'] = $this->note;
        $jsonItem['linkMode'] = $this->linkMode;
        $jsonItem['mimeType'] = $this->mimeType;
        
        $jsonItem['apiObject'] = $this->apiObject;
        return $jsonItem;
    }
    
    public function formatItemField($field){
        switch($field){
            case "title":
                return $this->title;
                break;
            case "creator":
                if(isset($this->creatorSummary)){
                    return $this->creatorSummary;
                }
                else{
                    return '';
                }
                break;
            case "dateModified":
                return $this->dateModified;
                break;
            case "dateAdded":
                return $this->dateAdded;
                break;
            default:
                if(isset($this->apiObject[$field])){
                    return $this->apiObject[$field];
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
}
