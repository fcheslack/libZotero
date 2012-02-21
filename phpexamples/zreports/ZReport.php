<?php

Class ZReport
{
    public $publishDir = './pages';
    public $pageNameBase = 'p';
    public $baseUrl = '';
    public $library;
    public $checkChildren = true;
    public $saveIndividualPostPages = false;
    public $individualPostDir = './posts';
    public $usePreviouslyRenderedPosts = false;
    public $headerTemplateFile = './postTemplates/header.phtml';
    public $postTemplateFile = './postTemplates/reportPost.phtml';
    public $footerTemplateFile = './postTemplates/footer.phtml';
    public $paginationType = 'static';
    
    public function __construct($publishDir = './pages', $perPage = 10){
        $this->publishDir = $publishDir;
        $this->perPage = $perPage;
        
        return;
    }
    
    public function setLibrary($library){
        $this->library = $library;
    }
    
    public function nextPage($cur){
        if($this->paginationType == 'query'){
            $n = $cur + 1;
            return "?p=$n";
        }
        else{
            return $this->pageNameBase . ($cur + 1) . ".html";
        }
    }
    
    public function prevPage($cur){
        if($this->paginationType == 'query'){
            $n = $cur - 1;
            return "?p=$n";
        }
        else{
            return $this->pageNameBase . ($cur - 1) . ".html";
        }
    }
    
    public function writePages($items){
        $last = 0;
        $count = 1;
        $prevLink = false;
        $nextLink = false;
        $pages = array();
        do{
            $titems = array_slice($items, $last, $this->perPage);
            $last = $last + $this->perPage;
            if($last < count($items)){
                $nextLink = $this->nextPage($count);// $this->pageNameBase . ($count + 1) . ".html";
            }
            else{$nextLink = false;}
            if($count > 1){
                $prevLink = $this->prevPage($count);// $this->pageNameBase . ($count - 1) . ".html";
            }
            $page = $this->writePage($titems, $prevLink, $nextLink);
            $count++;
            array_push($pages, $page);
        }while($last < count($items));
        return $pages;
    }
    
    public function writePage($items, $prevLink=false, $nextLink=false){
        $posts = array();
        foreach($items as $item){
            //initialize post array
            $post = array();
            $post['item'] = $item;
            $post['title'] = $item->get('title');
            $post['url'] = $item->get('url');
            $post['abstract'] = $item->get('abstractNote');
            $post['summary'] = '';
            $post['also'] = array();
            
            if($this->checkChildren && $item->numChildren){
                //echo "childKeys for item: " . print_r($item->childKeys, true) . "\n";
                $children = $this->library->items->getPreloadedChildren($item);
                
                $attachments = array();
                $notes = array();
                foreach($children as $child){
                    if($child->itemType == 'attachment'){
                        $attachments[] = $child;
                    }
                    elseif($child->itemType == 'note'){
                        $notes[] = $child;
                    }
                }
                
                $item->children = $children;
                $item->attachments = $attachments;
                $item->notes = $notes;
                
                foreach($children as $child){
                    $childTags = $child->get('tags');
                    foreach($childTags as $tag){
                        if($tag['tag'] == 'zreport-summary'){
                            $post['summary'] = $child->get('note');
                        }
                        elseif($tag['tag'] == 'zreport-also'){
                            array_push($post['also'], array('url'=>$child->get('url'), 'title'=>$child->get('title')));
                        }
                    }
                }
            }
            $posts[] = $post;
        }
        
        $vars = array('baseUrl'=>$this->baseUrl, 'prevLink'=>$prevLink, 'nextLink'=>$nextLink);
        $page = $this->renderHeader($vars);
        
        foreach($posts as $post){
            $renderedPost = $this->renderPost($post);
            $page .= $renderedPost;
            
            if($this->saveIndividualPostPages){
                $this->savePost($renderedPost, $post['item']->itemKey);
            }
        }
        
        $page .= $this->renderFooter($vars);
        
        return $page;
    }
    
    public function movePagesBack(){
        $files = scandir('./');
        foreach($files as $file){
            
        }
    }
    
    public function renderPost($post){
        ob_start();
        include($this->postTemplateFile);
        return ob_get_clean();
    }
    
    public function renderHeader($vars){
        ob_start();
        include($this->headerTemplateFile);
        return ob_get_clean();
    }
    
    public function renderFooter($vars){
        ob_start();
        include($this->footerTemplateFile);
        return ob_get_clean();
    }
    
    public function savePage($page, $num){
        echo "Publish directory: " . $this->publishDir . "\n";
        $filename = $this->publishDir . '/' . $this->pageNameBase . $num . '.html';
        echo "writing file " . $filename . "\n";
        file_put_contents($filename, $page);
    }
    
    public function savePost($renderedPost, $itemKey){
        if(!$this->saveIndividualPostPages) return;
        echo "Saving individual post for item $itemKey\n";
        $filename = $this->individualPostDir . '/' . $itemKey;
        echo "writing file $filename \n";
        file_put_contents($filename, $renderedPost);
    }
}
