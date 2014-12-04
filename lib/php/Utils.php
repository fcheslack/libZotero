<?php
namespace Zotero;
/**
 * Utility functions for libZotero
 * 
 * @package libZotero
 */
class Utils
{
    public static function randomString($len=0, $chars=null) {
        if ($chars === null) {
            $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if ($len==0) {
            $len = 8;
        }
        $randomstring = '';
        for ($i = 0; $i < $len; $i++) {
            $rnum = rand(0, strlen($chars) - 1);
            $randomstring .= $chars[$rnum];
        }
        return $randomstring;
    }
    
    public static function getKey() {
        $baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Utils::randomString(8, $baseString);
    }
    
    //update items appropriately based on response to multi-write request
    //for success:
    //  update objectKey if item doesn't have one yet (newly created item)
    //  update itemVersion to response's Last-Modified-Version header
    //  mark as synced
    //for unchanged:
    //  don't need to do anything? itemVersion should remain the same?
    //  mark as synced if not already?
    //for failed:
    //  do something. flag as error? display some message to user?
    public static function updateObjectsFromWriteResponse($objectsArray, $response){
        $data = json_decode($response->getRawBody(), true);
        if($response->getStatus() == 200){
            $newLastModifiedVersion = $response->getHeader("Last-Modified-Version");
            if(isset($data['success'])){
                foreach($data['success'] as $ind=>$key){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    
                    $objectKey = $object->get('key');
                    if($objectKey != '' && $objectKey != $key){
                        throw new Exception("Item key mismatch in multi-write request");
                    }
                    if($objectKey == ''){
                        $object->set('key', $key);
                    }
                    $object->set('version', $newLastModifiedVersion);
                    $object->synced = true;
                    $object->writeFailure = false;
                }
            }
            if(isset($data['failed'])){
                foreach($data['failed'] as $ind=>$val){
                    $i = intval($ind);
                    $object = $objectsArray[$i];
                    $object->writeFailure = $val;
                }
            }
        }
        elseif($response->getStatus() == 204){
            $objectsArray[0]->synced = true;
        }
    }
    
    /**
     * Construct a string that uniquely identifies a library
     * This is not related to the server GUIDs
     *
     * @return string
     */
    public static function libraryString($type, $libraryID){
        $lstring = '';
        if($type == 'user') $lstring = 'u';
        elseif($type == 'group') $lstring = 'g';
        $lstring += $libraryID;
        return $lstring;
    }
    
    public static function wrapDOIs($txt){
        $matches = array();
        $doi = preg_match("(10\.[^\s\/]+\/[^\s]+)", $txt, $matches);
        $m1 = htmlspecialchars($matches[0]);
        $safetxt = htmlspecialchars($txt);
        return "<a href=\"http://dx.doi.org/{$matches[0]}\" rel=\"nofollow\">{$safetxt}</a>";
    }
    
    public static function translateMimeType($mimeType)
    {
        switch ($mimeType) {
            case 'text/html':
                return 'html';
            
            case 'application/pdf':
            case 'application/x-pdf':
            case 'application/acrobat':
            case 'applications/vnd.pdf':
            case 'text/pdf':
            case 'text/x-pdf':
                return 'pdf';
            
            case 'image/jpg':
            case 'image/jpeg':
                return 'jpg';
            
            case 'image/gif':
                return 'gif';
            
            case 'application/msword':
            case 'application/doc':
            case 'application/vnd.msword':
            case 'application/vnd.ms-word':
            case 'application/winword':
            case 'application/word':
            case 'application/x-msw6':
            case 'application/x-msword':
                return 'doc';
            
            case 'application/vnd.oasis.opendocument.text':
            case 'application/x-vnd.oasis.opendocument.text':
                return 'odt';
            
            case 'video/flv':
            case 'video/x-flv':
                return 'flv';
            
            case 'image/tif':
            case 'image/tiff':
            case 'image/tif':
            case 'image/x-tif':
            case 'image/tiff':
            case 'image/x-tiff':
            case 'application/tif':
            case 'application/x-tif':
            case 'application/tiff':
            case 'application/x-tiff':
                return 'tiff';
            
            case 'application/zip':
            case 'application/x-zip':
            case 'application/x-zip-compressed':
            case 'application/x-compress':
            case 'application/x-compressed':
            case 'multipart/x-zip':
                return 'zip';
                
            case 'video/quicktime':
            case 'video/x-quicktime':
                return 'mov';
                
            case 'video/avi':
            case 'video/msvideo':
            case 'video/x-msvideo':
                return 'avi';
                
            case 'audio/wav':
            case 'audio/x-wav':
            case 'audio/wave':
                return 'wav';
                
            case 'audio/aiff':
            case 'audio/x-aiff':
            case 'sound/aiff':
                return 'aiff';
            
            case 'text/plain':
                return 'plain text';
            case 'application/rtf':
                return 'rtf';
                
            default:
                return $mimeType;
        }
    }
}


