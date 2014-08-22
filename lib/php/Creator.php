<?php
namespace Zotero;


 /**
  * Representation of a Zotero Item Creator
  *
  * @package    libZotero
  */
class Creator
{
    public $creatorType = null;
    public $localized = null;
    public $firstName = null;
    public $lastName = null;
    public $name = null;
    
    public function getWriteObject(){
        if(empty($this->creatorType) || (empty($this->name) && empty($this->firstName) && empty($this->lastName) ) ){
            return false;
        }
        $a = array('creatorType'=>$this->creatorType);
        if(!empty($this->name)){
            $a['name'] = $this->name;
        }
        else{
            $a['firstName'] = $this->firstName;
            $a['lastName'] = $this->lastName;
        }
        
        return $a;
    }
}
