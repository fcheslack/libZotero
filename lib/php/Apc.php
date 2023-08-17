<?php
namespace Zotero;
/**
 * APC backed cache implementing interface required for Library caching
 * 
 * @package libZotero
 */
class ApcCache
{
    public $prefix = 'LibZotero';
    protected $ext;

    public function __construct(){
        if(extension_loaded('apcu')){
            $this->ext = 'apcu';
        } else if(extension_loaded('apc')){
            $this->ext = 'apc';
        } else {
            throw new \Zotero\Exception('No APC extension loaded');
        }
    }
    
    public function add($key, $val, $ttl=0){
        if($this->ext == 'apcu'){
            return apcu_add($key, $val, $ttl);
        } else {
            return apc_add($key, $val, $ttl);
        }
    }
    
    public function store($key, $val, $ttl=0){
        if($this->ext == 'apcu'){
            return apcu_store($key, $val, $ttl);
        } else {
            return apc_store($key, $val, $ttl);
        }
    }
    
    public function delete($key){
        if($this->ext == 'apcu'){
            return apcu_delete($key);
        } else {
            return apc_delete($key);
        }
    }
    
    public function fetch($key, &$success){
        if($this->ext == 'apcu'){
            return apcu_fetch($key, $success);
        } else {
            return apc_fetch($key, $success);
        }
    }
    
    public function exists($keys){
        if($this->ext == 'apcu'){
            return apcu_exists($keys);
        } else {
            return apc_exists($keys);
        }
    }
}
