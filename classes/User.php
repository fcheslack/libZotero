<?php
 /**
  * Representation of a Zotero User
  *
  * @copyright  Copyright (c) 2008  Center for History and New Media (http://chnm.gmu.edu)
  * @license    http://www.opensource.org/licenses/ecl1.php    ECL License
  * @since      Class available since Release 0.0
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