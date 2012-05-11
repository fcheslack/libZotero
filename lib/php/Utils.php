<?php
/**
 * Utility functions for libZotero
 * 
 * @package libZotero
 */
class Zotero_Lib_Utils
{
    public static function wrapLinks($txt, $nofollow=false){
        //extremely ugly wrapping of urls in html
        if($nofollow){
            $repstring = " <a rel='nofollow' href='$1'>$1</a>";
        }
        else{
            $repstring = " <a href='$1'>$1</a>";
        }
        //will break completely on CDATA with unescaped brackets, and probably on alot of malformed html
        return preg_replace('/(http:\/\/[-a-zA-Z0-9._~:\/?#\[\]@!$&\'\(\)*+,;=]+)(?=\.|,|;|\s)(?![^<]*>)/i', $repstring, $txt);
        
        
        //alternative regexes
        /*
        return preg_replace('/(?<!<[^>]*)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        return preg_replace('/<(?[^>]+>)(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        
        return preg_replace('/\s(http:\/\/[\S]+)(?=\.|,|;)/i', " <a href='$1'>$1</a>", $txt);
        */
    }
    
    public static function wrapDOIs($txt){
        
    }
}


