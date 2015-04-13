Zotero.Tag = function (tagObj) {
    this.instance = "Zotero.Tag";
    this.color = null;
    this.version = 0;
    if( typeof tagObj == 'object'){
        this.parseJsonTag(tagObj);
    } else if(typeof tagObj == 'string') {
        this.parseJsonTag(this.templateApiObj(tagObj));
    } else {
        this.parseJsonTag(this.tamplateApiObj(''));
    }
};

Zotero.Tag.prototype = new Zotero.ApiObject();

Zotero.Tag.prototype.parseJsonTag = function(tagObj) {
    var tag = this;
    tag.apiObj = J.extend({}, tagObj);
    tag.urlencodedtag = encodeURIComponent(tag.apiObj.tag);
    tag.version = tag.apiObj.version;
};

Zotero.Tag.prototype.templateApiObj = function(tagString) {
    return {
        tag: tagString,
        links: {},
        meta: {
            type:0,
            numItems:1,
        },
    };
};

Zotero.Tag.prototype.tagComparer = function(){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.tag, b.apiObj.tag);
        };
    } else {
        return function(a, b) {
            if(a.apiObj.tag.toLocaleLowerCase() == b.apiObj.tag.toLocaleLowerCase()){
                return 0;
            }
            if(a.apiObj.tag.toLocaleLowerCase() < b.apiObj.tag.toLocaleLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

Zotero.Tag.prototype.set = function(key, val){
    var tag = this;
    
    if(key in tag.apiObj){
        tag.apiObj[key] = val;
    }
    if(key in tag.apiObj.meta){
        tag.apiObj.meta[key] = val;
    }
    
    switch (key) {
        case "tagVersion":
        case "version":
            tag.version = val;
            tag.apiObj.version = val;
            break;
    }
    
    return tag;
};

