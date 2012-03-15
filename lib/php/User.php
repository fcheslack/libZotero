<?php

 /**
  * Representation of a Zotero User
  * 
  * @package libZotero
  * @see        Zotero_Entry
  */
class Zotero_User extends Zotero_Entry
{
    /**
     * @var int
     */
    public $userID;

    public function __construct($entryNode)
    {
        parent::__construct($entryNode);
        
    }
}