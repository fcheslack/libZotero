<?php
namespace Zotero;
class Cite {
    private static $citePaperJournalArticleURL = false;

    //
    // Ported from cite.js in the Zotero client
    //
    
    /**
     * Mappings for names
     * Note that this is the reverse of the text variable map, since all mappings should be one to one
     * and it makes the code cleaner
     */
    private static $zoteroNameMap = array(
        "author" => "author",
        "editor" => "editor",
        "bookAuthor" => "container-author",
        "composer" => "composer",
        "interviewer" => "interviewer",
        "recipient" => "recipient",
        "seriesEditor" => "collection-editor",
        "translator" => "translator"
    );
    
    /**
     * Mappings for text variables
     */
    private static $zoteroFieldMap = array(
        "title" => array("title"),
        "container-title" => array("publicationTitle",  "reporter", "code"), /* reporter and code should move to SQL mapping tables */
        "collection-title" => array("seriesTitle", "series"),
        "collection-number" => array("seriesNumber"),
        "publisher" => array("publisher", "distributor"), /* distributor should move to SQL mapping tables */
        "publisher-place" => array("place"),
        "authority" => array("court"),
        "page" => array("pages"),
        "volume" => array("volume"),
        "issue" => array("issue"),
        "number-of-volumes" => array("numberOfVolumes"),
        "number-of-pages" => array("numPages"),
        "edition" => array("edition"),
        "version" => array("version"),
        "section" => array("section"),
        "genre" => array("type", "artworkSize"), /* artworkSize should move to SQL mapping tables, or added as a CSL variable */
        "medium" => array("medium", "system"),
        "archive" => array("archive"),
        "archive_location" => array("archiveLocation"),
        "event" => array("meetingName", "conferenceName"), /* these should be mapped to the same base field in SQL mapping tables */
        "event-place" => array("place"),
        "abstract" => array("abstractNote"),
        "URL" => array("url"),
        "DOI" => array("DOI"),
        "ISBN" => array("ISBN"),
        "call-number" => array("callNumber"),
        "note" => array("extra"),
        "number" => array("number"),
        "references" => array("history"),
        "shortTitle" => array("shortTitle"),
        "journalAbbreviation" => array("journalAbbreviation"),
        "language" => array("language")
    );
    
    private static $zoteroDateMap = array(
        "issued" => "date",
        "accessed" => "accessDate"
    );
    
    private static $zoteroTypeMap = array(
        'book' => "book",
        'bookSection' => "chapter",
        'journalArticle' => "article-journal",
        'magazineArticle' => "article-magazine",
        'newspaperArticle' => "article-newspaper",
        'thesis' => "thesis",
        'encyclopediaArticle' => "entry-encyclopedia",
        'dictionaryEntry' => "entry-dictionary",
        'conferencePaper' => "paper-conference",
        'letter' => "personal_communication",
        'manuscript' => "manuscript",
        'interview' => "interview",
        'film' => "motion_picture",
        'artwork' => "graphic",
        'webpage' => "webpage",
        'report' => "report",
        'bill' => "bill",
        'case' => "legal_case",
        'hearing' => "bill",                // ??
        'patent' => "patent",
        'statute' => "bill",                // ??
        'email' => "personal_communication",
        'map' => "map",
        'blogPost' => "webpage",
        'instantMessage' => "personal_communication",
        'forumPost' => "webpage",
        'audioRecording' => "song",     // ??
        'presentation' => "speech",
        'videoRecording' => "motion_picture",
        'tvBroadcast' => "broadcast",
        'radioBroadcast' => "broadcast",
        'podcast' => "song",            // ??
        'computerProgram' => "book"     // ??
    );
    
    private static $quotedRegexp = '/^".+"$/';
    
    public static function convertItem($zoteroItem) {
        if (!$zoteroItem) {
            throw new Exception("Zotero item not provided");
        }
        
        // don't return URL or accessed information for journal articles if a
        // pages field exists
        $itemType = $zoteroItem->get("itemType");//ItemTypes::getName($zoteroItem->itemTypeID);
        $cslType = isset(self::$zoteroTypeMap[$itemType]) ? self::$zoteroTypeMap[$itemType] : false;
        if (!$cslType) $cslType = "article";
        $ignoreURL = (($zoteroItem->get("accessDate") || $zoteroItem->get("url")) &&
                in_array($itemType, array("journalArticle", "newspaperArticle", "magazineArticle"))
                && $zoteroItem->get("pages")
                && self::$citePaperJournalArticleURL);
        
        $cslItem = array(
            'id' => $zoteroItem->owningLibrary->libraryID . "/" . $zoteroItem->get("key"),
            'type' => $cslType
        );
        
        // get all text variables (there must be a better way)
        // TODO: does citeproc-js permit short forms?
        foreach (self::$zoteroFieldMap as $variable=>$fields) {
            if ($variable == "URL" && $ignoreURL) continue;
            
            foreach($fields as $field) {
                $value = $zoteroItem->get($field);
                if ($value !== "" && $value !== null) {
                    // Strip enclosing quotes
                    if (preg_match(self::$quotedRegexp, $value)) {
                        $value = substr($value, 1, strlen($value)-2);
                    }
                    $cslItem[$variable] = $value;
                    break;
                }
            }
        }
        
        // separate name variables
        $creators = $zoteroItem->get('creators');
        foreach ($creators as $creator) {
            $creatorType = $creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
            if (!$creatorType) continue;
            
            if(isset($creator["name"])){
                $nameObj = array('literal' => $creator['name']);
            }
            else {
                $nameObj = array('family' => $creator['lastName'], 'given' => $creator['firstName']);
            }
            
            if (isset($cslItem[$creatorType])) {
                $cslItem[$creatorType][] = $nameObj;
            }
            else {
                $cslItem[$creatorType] = array($nameObj);
            }
        }
        
        // get date variables
        foreach (self::$zoteroDateMap as $key=>$val) {
            $date = $zoteroItem->get($val);
            if ($date) {
                $cslItem[$key] = array("raw" => $date);
            }
        }
        
        return $cslItem;
    }
}
