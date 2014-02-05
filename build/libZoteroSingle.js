/*
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,r){var h,n=Array.prototype.slice,t=decodeURIComponent,a=$.param,j,c,m,y,b=$.bbq=$.bbq||{},s,x,k,e=$.event.special,d="hashchange",B="querystring",F="fragment",z="elemUrlAttr",l="href",w="src",p=/^.*\?|#.*$/g,u,H,g,i,C,E={};function G(I){return typeof I==="string"}function D(J){var I=n.call(arguments,1);return function(){return J.apply(this,I.concat(n.call(arguments)))}}function o(I){return I.replace(H,"$2")}function q(I){return I.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/,"$1")}function f(K,P,I,L,J){var R,O,N,Q,M;if(L!==h){N=I.match(K?H:/^([^#?]*)\??([^#]*)(#?.*)/);M=N[3]||"";if(J===2&&G(L)){O=L.replace(K?u:p,"")}else{Q=m(N[2]);L=G(L)?m[K?F:B](L):L;O=J===2?L:J===1?$.extend({},L,Q):$.extend({},Q,L);O=j(O);if(K){O=O.replace(g,t)}}R=N[1]+(K?C:O||!N[1]?"?":"")+O+M}else{R=P(I!==h?I:location.href)}return R}a[B]=D(f,0,q);a[F]=c=D(f,1,o);a.sorted=j=function(J,K){var I=[],L={};$.each(a(J,K).split("&"),function(P,M){var O=M.replace(/(?:%5B|=).*$/,""),N=L[O];if(!N){N=L[O]=[];I.push(O)}N.push(M)});return $.map(I.sort(),function(M){return L[M]}).join("&")};c.noEscape=function(J){J=J||"";var I=$.map(J.split(""),encodeURIComponent);g=new RegExp(I.join("|"),"g")};c.noEscape(",/");c.ajaxCrawlable=function(I){if(I!==h){if(I){u=/^.*(?:#!|#)/;H=/^([^#]*)(?:#!|#)?(.*)$/;C="#!"}else{u=/^.*#/;H=/^([^#]*)#?(.*)$/;C="#"}i=!!I}return i};c.ajaxCrawlable(0);$.deparam=m=function(L,I){var K={},J={"true":!0,"false":!1,"null":null};$.each(L.replace(/\+/g," ").split("&"),function(O,T){var N=T.split("="),S=t(N[0]),M,R=K,P=0,U=S.split("]["),Q=U.length-1;if(/\[/.test(U[0])&&/\]$/.test(U[Q])){U[Q]=U[Q].replace(/\]$/,"");U=U.shift().split("[").concat(U);Q=U.length-1}else{Q=0}if(N.length===2){M=t(N[1]);if(I){M=M&&!isNaN(M)?+M:M==="undefined"?h:J[M]!==h?J[M]:M}if(Q){for(;P<=Q;P++){S=U[P]===""?R.length:U[P];R=R[S]=P<Q?R[S]||(U[P+1]&&isNaN(U[P+1])?{}:[]):M}}else{if($.isArray(K[S])){K[S].push(M)}else{if(K[S]!==h){K[S]=[K[S],M]}else{K[S]=M}}}}else{if(S){K[S]=I?h:""}}});return K};function A(K,I,J){if(I===h||typeof I==="boolean"){J=I;I=a[K?F:B]()}else{I=G(I)?I.replace(K?u:p,""):I}return m(I,J)}m[B]=D(A,0);m[F]=y=D(A,1);$[z]||($[z]=function(I){return $.extend(E,I)})({a:l,base:l,iframe:w,img:w,input:w,form:"action",link:l,script:w});k=$[z];function v(L,J,K,I){if(!G(K)&&typeof K!=="object"){I=K;K=J;J=h}return this.each(function(){var O=$(this),M=J||k()[(this.nodeName||"").toLowerCase()]||"",N=M&&O.attr(M)||"";O.attr(M,a[L](N,K,I))})}$.fn[B]=D(v,B);$.fn[F]=D(v,F);b.pushState=s=function(L,I){if(G(L)&&/^#/.test(L)&&I===h){I=2}var K=L!==h,J=c(location.href,K?L:{},K?I:2);location.href=J};b.getState=x=function(I,J){return I===h||typeof I==="boolean"?y(I):y(J)[I]};b.removeState=function(I){var J={};if(I!==h){J=x();$.each($.isArray(I)?I:arguments,function(L,K){delete J[K]})}s(J,2)};e[d]=$.extend(e[d],{add:function(I){var K;function J(M){var L=M[F]=c();M.getState=function(N,O){return N===h||typeof N==="boolean"?m(L,N):m(L,O)[N]};K.apply(this,arguments)}if($.isFunction(I)){K=I;return J}else{K=I.handler;I.handler=J}}})})(jQuery,this);
!function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)"exports"===i[l]?k.push(g={}):k.push(b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/cast",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.cast=b}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:(c[a]=b,void 0)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a="Promise"in window&&"cast"in window.Promise&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var a;return new window.Promise(function(b){a=b}),f(a)}();a||(window.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h,i){"use strict";function j(a){if(!w(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof j))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],k(a,this)}function k(a,b){function c(a){p(b,a)}function d(a){r(b,a)}try{a(c,d)}catch(e){d(e)}}function l(a,b,c,d){var e,f,g,h,i=w(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;o(b,e)||(i&&g?p(b,e):h?r(b,f):a===F?p(b,e):a===G&&r(b,e))}function m(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+F]=c,e[f+G]=d}function n(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],l(b,c,d,f);a._subscribers=null}function o(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(v(b)&&(d=b.then,w(d)))return d.call(b,function(d){return c?!0:(c=!0,b!==d?p(a,d):q(a,d),void 0)},function(b){return c?!0:(c=!0,r(a,b),void 0)}),!0}catch(e){return c?!0:(r(a,e),!0)}return!1}function p(a,b){a===b?q(a,b):o(a,b)||q(a,b)}function q(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(s,a))}function r(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(t,a))}function s(a){n(a,a._state=F)}function t(a){n(a,a._state=G)}var u=a.config,v=(a.configure,b.objectOrFunction),w=b.isFunction,x=(b.now,c.cast),y=d.all,z=e.race,A=f.resolve,B=g.reject,C=h.asap;u.async=C;var D=void 0,E=0,F=1,G=2;j.prototype={constructor:j,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;u.async(function(){l(c._state,d,e[c._state-1],c._detail)})}else m(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},j.all=y,j.cast=x,j.race=z,j.resolve=A,j.reject=B,i.Promise=j}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}();var SparkMD5=function(){function h(f,d,b,a,c,e){d=k(k(d,f),k(a,e));return k(d<<c|d>>>32-c,b)}function g(f,d,b,a,c,e,g){return h(d&b|~d&a,f,d,c,e,g)}function i(f,d,b,a,c,e,g){return h(d&a|b&~a,f,d,c,e,g)}function j(f,d,b,a,c,e,g){return h(b^(d|~a),f,d,c,e,g)}function l(f,d){var b=f[0],a=f[1],c=f[2],e=f[3],b=g(b,a,c,e,d[0],7,-680876936),e=g(e,b,a,c,d[1],12,-389564586),c=g(c,e,b,a,d[2],17,606105819),a=g(a,c,e,b,d[3],22,-1044525330),b=g(b,a,c,e,d[4],7,-176418897),e=g(e,b,a,c,d[5],12,1200080426),c=g(c,
e,b,a,d[6],17,-1473231341),a=g(a,c,e,b,d[7],22,-45705983),b=g(b,a,c,e,d[8],7,1770035416),e=g(e,b,a,c,d[9],12,-1958414417),c=g(c,e,b,a,d[10],17,-42063),a=g(a,c,e,b,d[11],22,-1990404162),b=g(b,a,c,e,d[12],7,1804603682),e=g(e,b,a,c,d[13],12,-40341101),c=g(c,e,b,a,d[14],17,-1502002290),a=g(a,c,e,b,d[15],22,1236535329),b=i(b,a,c,e,d[1],5,-165796510),e=i(e,b,a,c,d[6],9,-1069501632),c=i(c,e,b,a,d[11],14,643717713),a=i(a,c,e,b,d[0],20,-373897302),b=i(b,a,c,e,d[5],5,-701558691),e=i(e,b,a,c,d[10],9,38016083),
c=i(c,e,b,a,d[15],14,-660478335),a=i(a,c,e,b,d[4],20,-405537848),b=i(b,a,c,e,d[9],5,568446438),e=i(e,b,a,c,d[14],9,-1019803690),c=i(c,e,b,a,d[3],14,-187363961),a=i(a,c,e,b,d[8],20,1163531501),b=i(b,a,c,e,d[13],5,-1444681467),e=i(e,b,a,c,d[2],9,-51403784),c=i(c,e,b,a,d[7],14,1735328473),a=i(a,c,e,b,d[12],20,-1926607734),b=h(a^c^e,b,a,d[5],4,-378558),e=h(b^a^c,e,b,d[8],11,-2022574463),c=h(e^b^a,c,e,d[11],16,1839030562),a=h(c^e^b,a,c,d[14],23,-35309556),b=h(a^c^e,b,a,d[1],4,-1530992060),e=h(b^a^c,e,
b,d[4],11,1272893353),c=h(e^b^a,c,e,d[7],16,-155497632),a=h(c^e^b,a,c,d[10],23,-1094730640),b=h(a^c^e,b,a,d[13],4,681279174),e=h(b^a^c,e,b,d[0],11,-358537222),c=h(e^b^a,c,e,d[3],16,-722521979),a=h(c^e^b,a,c,d[6],23,76029189),b=h(a^c^e,b,a,d[9],4,-640364487),e=h(b^a^c,e,b,d[12],11,-421815835),c=h(e^b^a,c,e,d[15],16,530742520),a=h(c^e^b,a,c,d[2],23,-995338651),b=j(b,a,c,e,d[0],6,-198630844),e=j(e,b,a,c,d[7],10,1126891415),c=j(c,e,b,a,d[14],15,-1416354905),a=j(a,c,e,b,d[5],21,-57434055),b=j(b,a,c,e,
d[12],6,1700485571),e=j(e,b,a,c,d[3],10,-1894986606),c=j(c,e,b,a,d[10],15,-1051523),a=j(a,c,e,b,d[1],21,-2054922799),b=j(b,a,c,e,d[8],6,1873313359),e=j(e,b,a,c,d[15],10,-30611744),c=j(c,e,b,a,d[6],15,-1560198380),a=j(a,c,e,b,d[13],21,1309151649),b=j(b,a,c,e,d[4],6,-145523070),e=j(e,b,a,c,d[11],10,-1120210379),c=j(c,e,b,a,d[2],15,718787259),a=j(a,c,e,b,d[9],21,-343485551);f[0]=k(b,f[0]);f[1]=k(a,f[1]);f[2]=k(c,f[2]);f[3]=k(e,f[3])}function n(f){var d=[],b;for(b=0;64>b;b+=4)d[b>>2]=f.charCodeAt(b)+
(f.charCodeAt(b+1)<<8)+(f.charCodeAt(b+2)<<16)+(f.charCodeAt(b+3)<<24);return d}function o(f){var d=f.length,b=[1732584193,-271733879,-1732584194,271733878],a,c,e;for(a=64;a<=d;a+=64)l(b,n(f.substring(a-64,a)));f=f.substring(a-64);c=f.length;e=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(a=0;a<c;a+=1)e[a>>2]|=f.charCodeAt(a)<<(a%4<<3);e[a>>2]|=128<<(a%4<<3);if(55<a){l(b,e);for(a=0;16>a;a+=1)e[a]=0}e[14]=8*d;l(b,e);return b}function m(f){var d;for(d=0;d<f.length;d+=1){for(var b=f,a=d,c=f[d],e="",g=void 0,
g=0;4>g;g+=1)e+=q[c>>8*g+4&15]+q[c>>8*g&15];b[a]=e}return f.join("")}var k=function(f,d){return f+d&4294967295},q="0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f".split(",");"5d41402abc4b2a76b9719d911017c592"!==m(o("hello"))&&(k=function(f,d){var b=(f&65535)+(d&65535);return(f>>16)+(d>>16)+(b>>16)<<16|b&65535});var p=function(){this.append=function(f){/[\u0080-\uFFFF]/.test(f)&&(f=unescape(encodeURIComponent(f)));this.appendBinary(f);return this};this.appendBinary=function(f){var d=64-this._buff.length,b=this._buff+
f.substr(0,d),a;this._length+=f.length;if(64<=b.length){l(this._state,n(b));for(a=f.length-64;d<=a;)b=f.substr(d,64),l(this._state,n(b)),d+=64;this._buff=f.substr(d,64)}else this._buff=b;return this};this.end=function(f){var d=this._buff,b=d.length,a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],c;for(c=0;c<b;c+=1)a[c>>2]|=d.charCodeAt(c)<<(c%4<<3);a[c>>2]|=128<<(c%4<<3);if(55<c){l(this._state,a);for(c=0;16>c;c+=1)a[c]=0}a[14]=8*this._length;l(this._state,a);f=f?this._state:m(this._state);this.reset();return f};
this.reset=function(){this._buff="";this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};this.destroy=function(){delete this._state;delete this._buff;delete this._length};this.reset()};p.hash=function(f,d){/[\u0080-\uFFFF]/.test(f)&&(f=unescape(encodeURIComponent(f)));var b=o(f);return d?b:m(b)};p.hashBinary=function(f,d){var b=o(f);return d?b:m(b)};return p}();/*! IndexedDBShim - v0.1.2 - 2013-07-11 */
"use strict";var idbModules={};(function(e){function t(e,t,n,o){n.target=t,"function"==typeof t[e]&&t[e].apply(t,[n]),"function"==typeof o&&o()}function n(t,n,o){var i=new DOMException.constructor(0,n);throw i.name=t,i.message=n,e.DEBUG&&(console.log(t,n,o,i),console.trace&&console.trace()),i}var o=function(){this.length=0,this._items=[],Object.defineProperty&&Object.defineProperty(this,"_items",{enumerable:!1})};if(o.prototype={contains:function(e){return-1!==this._items.indexOf(e)},item:function(e){return this._items[e]},indexOf:function(e){return this._items.indexOf(e)},push:function(e){this._items.push(e),this.length+=1;for(var t=0;this._items.length>t;t++)this[t]=this._items[t]},splice:function(){this._items.splice.apply(this._items,arguments),this.length=this._items.length;for(var e in this)e===parseInt(e,10)+""&&delete this[e];for(e=0;this._items.length>e;e++)this[e]=this._items[e]}},Object.defineProperty)for(var i in{indexOf:!1,push:!1,splice:!1})Object.defineProperty(o.prototype,i,{enumerable:!1});e.util={throwDOMException:n,callback:t,quote:function(e){return"'"+e+"'"},StringList:o}})(idbModules),function(idbModules){var Sca=function(){return{decycle:function(object,callback){function checkForCompletion(){0===queuedObjects.length&&returnCallback(derezObj)}function readBlobAsDataURL(e,t){var n=new FileReader;n.onloadend=function(e){var n=e.target.result,o="blob";updateEncodedBlob(n,t,o)},n.readAsDataURL(e)}function updateEncodedBlob(dataURL,path,blobtype){var encoded=queuedObjects.indexOf(path);path=path.replace("$","derezObj"),eval(path+'.$enc="'+dataURL+'"'),eval(path+'.$type="'+blobtype+'"'),queuedObjects.splice(encoded,1),checkForCompletion()}function derez(e,t){var n,o,i;if(!("object"!=typeof e||null===e||e instanceof Boolean||e instanceof Date||e instanceof Number||e instanceof RegExp||e instanceof Blob||e instanceof String)){for(n=0;objects.length>n;n+=1)if(objects[n]===e)return{$ref:paths[n]};if(objects.push(e),paths.push(t),"[object Array]"===Object.prototype.toString.apply(e))for(i=[],n=0;e.length>n;n+=1)i[n]=derez(e[n],t+"["+n+"]");else{i={};for(o in e)Object.prototype.hasOwnProperty.call(e,o)&&(i[o]=derez(e[o],t+"["+JSON.stringify(o)+"]"))}return i}return e instanceof Blob?(queuedObjects.push(t),readBlobAsDataURL(e,t)):e instanceof Boolean?e={$type:"bool",$enc:""+e}:e instanceof Date?e={$type:"date",$enc:e.getTime()}:e instanceof Number?e={$type:"num",$enc:""+e}:e instanceof RegExp&&(e={$type:"regex",$enc:""+e}),e}var objects=[],paths=[],queuedObjects=[],returnCallback=callback,derezObj=derez(object,"$");checkForCompletion()},retrocycle:function retrocycle($){function dataURLToBlob(e){var t,n,o,i=";base64,";if(-1===e.indexOf(i))return n=e.split(","),t=n[0].split(":")[1],o=n[1],new Blob([o],{type:t});n=e.split(i),t=n[0].split(":")[1],o=window.atob(n[1]);for(var r=o.length,a=new Uint8Array(r),s=0;r>s;++s)a[s]=o.charCodeAt(s);return new Blob([a.buffer],{type:t})}function rez(value){var i,item,name,path;if(value&&"object"==typeof value)if("[object Array]"===Object.prototype.toString.apply(value))for(i=0;value.length>i;i+=1)item=value[i],item&&"object"==typeof item&&(path=item.$ref,value[i]="string"==typeof path&&px.test(path)?eval(path):rez(item));else if(void 0!==value.$type)switch(value.$type){case"blob":case"file":value=dataURLToBlob(value.$enc);break;case"bool":value=Boolean("true"===value.$enc);break;case"date":value=new Date(value.$enc);break;case"num":value=Number(value.$enc);break;case"regex":value=eval(value.$enc)}else for(name in value)"object"==typeof value[name]&&(item=value[name],item&&(path=item.$ref,value[name]="string"==typeof path&&px.test(path)?eval(path):rez(item)));return value}var px=/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;return rez($),$},encode:function(e,t){function n(e){t(JSON.stringify(e))}this.decycle(e,n)},decode:function(e){return this.retrocycle(JSON.parse(e))}}}();idbModules.Sca=Sca}(idbModules),function(e){var t=["","number","string","boolean","object","undefined"],n=function(){return{encode:function(e){return t.indexOf(typeof e)+"-"+JSON.stringify(e)},decode:function(e){return e===void 0?void 0:JSON.parse(e.substring(2))}}},o={number:n("number"),"boolean":n(),object:n(),string:{encode:function(e){return t.indexOf("string")+"-"+e},decode:function(e){return""+e.substring(2)}},undefined:{encode:function(){return t.indexOf("undefined")+"-undefined"},decode:function(){return void 0}}},i=function(){return{encode:function(e){return o[typeof e].encode(e)},decode:function(e){return o[t[e.substring(0,1)]].decode(e)}}}();e.Key=i}(idbModules),function(e){var t=function(e,t){return{type:e,debug:t,bubbles:!1,cancelable:!1,eventPhase:0,timeStamp:new Date}};e.Event=t}(idbModules),function(e){var t=function(){this.onsuccess=this.onerror=this.result=this.error=this.source=this.transaction=null,this.readyState="pending"},n=function(){this.onblocked=this.onupgradeneeded=null};n.prototype=t,e.IDBRequest=t,e.IDBOpenRequest=n}(idbModules),function(e,t){var n=function(e,t,n,o){this.lower=e,this.upper=t,this.lowerOpen=n,this.upperOpen=o};n.only=function(e){return new n(e,e,!0,!0)},n.lowerBound=function(e,o){return new n(e,t,o,t)},n.upperBound=function(e){return new n(t,e,t,open)},n.bound=function(e,t,o,i){return new n(e,t,o,i)},e.IDBKeyRange=n}(idbModules),function(e,t){function n(n,o,i,r,a,s){this.__range=n,this.source=this.__idbObjectStore=i,this.__req=r,this.key=t,this.direction=o,this.__keyColumnName=a,this.__valueColumnName=s,this.source.transaction.__active||e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."),this.__offset=-1,this.__lastKeyContinued=t,this["continue"]()}n.prototype.__find=function(n,o,i,r){var a=this,s=["SELECT * FROM ",e.util.quote(a.__idbObjectStore.name)],u=[];s.push("WHERE ",a.__keyColumnName," NOT NULL"),a.__range&&(a.__range.lower||a.__range.upper)&&(s.push("AND"),a.__range.lower&&(s.push(a.__keyColumnName+(a.__range.lowerOpen?" >":" >= ")+" ?"),u.push(e.Key.encode(a.__range.lower))),a.__range.lower&&a.__range.upper&&s.push("AND"),a.__range.upper&&(s.push(a.__keyColumnName+(a.__range.upperOpen?" < ":" <= ")+" ?"),u.push(e.Key.encode(a.__range.upper)))),n!==t&&(a.__lastKeyContinued=n,a.__offset=0),a.__lastKeyContinued!==t&&(s.push("AND "+a.__keyColumnName+" >= ?"),u.push(e.Key.encode(a.__lastKeyContinued))),s.push("ORDER BY ",a.__keyColumnName),s.push("LIMIT 1 OFFSET "+a.__offset),e.DEBUG&&console.log(s.join(" "),u),o.executeSql(s.join(" "),u,function(n,o){if(1===o.rows.length){var r=e.Key.decode(o.rows.item(0)[a.__keyColumnName]),s="value"===a.__valueColumnName?e.Sca.decode(o.rows.item(0)[a.__valueColumnName]):e.Key.decode(o.rows.item(0)[a.__valueColumnName]);i(r,s)}else e.DEBUG&&console.log("Reached end of cursors"),i(t,t)},function(t,n){e.DEBUG&&console.log("Could not execute Cursor.continue"),r(n)})},n.prototype["continue"]=function(e){var n=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){n.__offset++,n.__find(e,o,function(e,o){n.key=e,n.value=o,r(n.key!==t?n:t,n.__req)},function(e){a(e)})})},n.prototype.advance=function(n){0>=n&&e.util.throwDOMException("Type Error - Count is invalid - 0 or negative",n);var o=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,i,r,a){o.__offset+=n,o.__find(t,e,function(e,n){o.key=e,o.value=n,r(o.key!==t?o:t,o.__req)},function(e){a(e)})})},n.prototype.update=function(n){var o=this,i=this.__idbObjectStore.transaction.__createRequest(function(){});return e.Sca.encode(n,function(n){this.__idbObjectStore.__pushToQueue(i,function(i,r,a,s){o.__find(t,i,function(t){var r="UPDATE "+e.util.quote(o.__idbObjectStore.name)+" SET value = ? WHERE key = ?";e.DEBUG&&console.log(r,n,t),i.executeSql(r,[e.Sca.encode(n),e.Key.encode(t)],function(e,n){1===n.rowsAffected?a(t):s("No rowns with key found"+t)},function(e,t){s(t)})},function(e){s(e)})})}),i},n.prototype["delete"]=function(){var n=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){n.__find(t,o,function(i){var s="DELETE FROM  "+e.util.quote(n.__idbObjectStore.name)+" WHERE key = ?";e.DEBUG&&console.log(s,i),o.executeSql(s,[e.Key.encode(i)],function(e,n){1===n.rowsAffected?r(t):a("No rowns with key found"+i)},function(e,t){a(t)})},function(e){a(e)})})},e.IDBCursor=n}(idbModules),function(idbModules,undefined){function IDBIndex(e,t){this.indexName=this.name=e,this.__idbObjectStore=this.objectStore=this.source=t;var n=t.__storeProps&&t.__storeProps.indexList;n&&(n=JSON.parse(n)),this.keyPath=n&&n[e]&&n[e].keyPath||e,["multiEntry","unique"].forEach(function(t){this[t]=!!(n&&n[e]&&n[e].optionalParams&&n[e].optionalParams[t])},this)}IDBIndex.prototype.__createIndex=function(indexName,keyPath,optionalParameters){var me=this,transaction=me.__idbObjectStore.transaction;transaction.__addToTransactionQueue(function(tx,args,success,failure){me.__idbObjectStore.__getStoreProps(tx,function(){function error(){idbModules.util.throwDOMException(0,"Could not create new index",arguments)}2!==transaction.mode&&idbModules.util.throwDOMException(0,"Invalid State error, not a version transaction",me.transaction);var idxList=JSON.parse(me.__idbObjectStore.__storeProps.indexList);idxList[indexName]!==undefined&&idbModules.util.throwDOMException(0,"Index already exists on store",idxList);var columnName=indexName;idxList[indexName]={columnName:columnName,keyPath:keyPath,optionalParams:optionalParameters},me.__idbObjectStore.__storeProps.indexList=JSON.stringify(idxList);var sql=["ALTER TABLE",idbModules.util.quote(me.__idbObjectStore.name),"ADD",columnName,"BLOB"].join(" ");idbModules.DEBUG&&console.log(sql),tx.executeSql(sql,[],function(tx,data){tx.executeSql("SELECT * FROM "+idbModules.util.quote(me.__idbObjectStore.name),[],function(tx,data){(function initIndexForRow(i){if(data.rows.length>i)try{var value=idbModules.Sca.decode(data.rows.item(i).value),indexKey=eval("value['"+keyPath+"']");tx.executeSql("UPDATE "+idbModules.util.quote(me.__idbObjectStore.name)+" set "+columnName+" = ? where key = ?",[idbModules.Key.encode(indexKey),data.rows.item(i).key],function(){initIndexForRow(i+1)},error)}catch(e){initIndexForRow(i+1)}else idbModules.DEBUG&&console.log("Updating the indexes in table",me.__idbObjectStore.__storeProps),tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?",[me.__idbObjectStore.__storeProps.indexList,me.__idbObjectStore.name],function(){me.__idbObjectStore.__setReadyState("createIndex",!0),success(me)},error)})(0)},error)},error)},"createObjectStore")})},IDBIndex.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"value"),n},IDBIndex.prototype.openKeyCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"key"),n},IDBIndex.prototype.__fetchIndexData=function(e,t){var n=this;return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){var s=["SELECT * FROM ",idbModules.util.quote(n.__idbObjectStore.name)," WHERE",n.indexName,"NOT NULL"],u=[];e!==undefined&&(s.push("AND",n.indexName," = ?"),u.push(idbModules.Key.encode(e))),idbModules.DEBUG&&console.log("Trying to fetch data for Index",s.join(" "),u),o.executeSql(s.join(" "),u,function(e,n){var o;o="count"==typeof t?n.rows.length:0===n.rows.length?undefined:"key"===t?idbModules.Key.decode(n.rows.item(0).key):idbModules.Sca.decode(n.rows.item(0).value),r(o)},a)})},IDBIndex.prototype.get=function(e){return this.__fetchIndexData(e,"value")},IDBIndex.prototype.getKey=function(e){return this.__fetchIndexData(e,"key")},IDBIndex.prototype.count=function(e){return this.__fetchIndexData(e,"count")},idbModules.IDBIndex=IDBIndex}(idbModules),function(idbModules){var IDBObjectStore=function(e,t,n){this.name=e,this.transaction=t,this.__ready={},this.__setReadyState("createObjectStore",n===void 0?!0:n),this.indexNames=new idbModules.util.StringList};IDBObjectStore.prototype.__setReadyState=function(e,t){this.__ready[e]=t},IDBObjectStore.prototype.__waitForReady=function(e,t){var n=!0;if(t!==void 0)n=this.__ready[t]===void 0?!0:this.__ready[t];else for(var o in this.__ready)this.__ready[o]||(n=!1);if(n)e();else{idbModules.DEBUG&&console.log("Waiting for to be ready",t);var i=this;window.setTimeout(function(){i.__waitForReady(e,t)},100)}},IDBObjectStore.prototype.__getStoreProps=function(e,t,n){var o=this;this.__waitForReady(function(){o.__storeProps?(idbModules.DEBUG&&console.log("Store properties - cached",o.__storeProps),t(o.__storeProps)):e.executeSql("SELECT * FROM __sys__ where name = ?",[o.name],function(e,n){1!==n.rows.length?t():(o.__storeProps={name:n.rows.item(0).name,indexList:n.rows.item(0).indexList,autoInc:n.rows.item(0).autoInc,keyPath:n.rows.item(0).keyPath},idbModules.DEBUG&&console.log("Store properties",o.__storeProps),t(o.__storeProps))},function(){t()})},n)},IDBObjectStore.prototype.__deriveKey=function(tx,value,key,callback){function getNextAutoIncKey(){tx.executeSql("SELECT * FROM sqlite_sequence where name like ?",[me.name],function(e,t){1!==t.rows.length?callback(0):callback(t.rows.item(0).seq)},function(e,t){idbModules.util.throwDOMException(0,"Data Error - Could not get the auto increment value for key",t)})}var me=this;me.__getStoreProps(tx,function(props){if(props||idbModules.util.throwDOMException(0,"Data Error - Could not locate defination for this table",props),props.keyPath)if(key!==void 0&&idbModules.util.throwDOMException(0,"Data Error - The object store uses in-line keys and the key parameter was provided",props),value)try{var primaryKey=eval("value['"+props.keyPath+"']");primaryKey?callback(primaryKey):"true"===props.autoInc?getNextAutoIncKey():idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath")}catch(e){idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath",e)}else idbModules.util.throwDOMException(0,"Data Error - KeyPath was specified, but value was not");else key!==void 0?callback(key):"false"===props.autoInc?idbModules.util.throwDOMException(0,"Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ",props):getNextAutoIncKey()})},IDBObjectStore.prototype.__insertData=function(tx,value,primaryKey,success,error){var paramMap={};primaryKey!==void 0&&(paramMap.key=idbModules.Key.encode(primaryKey));var indexes=JSON.parse(this.__storeProps.indexList);for(var key in indexes)try{paramMap[indexes[key].columnName]=idbModules.Key.encode(eval("value['"+indexes[key].keyPath+"']"))}catch(e){error(e)}var sqlStart=["INSERT INTO ",idbModules.util.quote(this.name),"("],sqlEnd=[" VALUES ("],sqlValues=[];for(key in paramMap)sqlStart.push(key+","),sqlEnd.push("?,"),sqlValues.push(paramMap[key]);sqlStart.push("value )"),sqlEnd.push("?)"),sqlValues.push(value);var sql=sqlStart.join(" ")+sqlEnd.join(" ");idbModules.DEBUG&&console.log("SQL for adding",sql,sqlValues),tx.executeSql(sql,sqlValues,function(){success(primaryKey)},function(e,t){error(t)})},IDBObjectStore.prototype.add=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(i){n.transaction.__pushToQueue(o,function(o,r,a,s){n.__deriveKey(o,e,t,function(e){n.__insertData(o,i,e,a,s)})})}),o},IDBObjectStore.prototype.put=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(i){n.transaction.__pushToQueue(o,function(o,r,a,s){n.__deriveKey(o,e,t,function(e){var t="DELETE FROM "+idbModules.util.quote(n.name)+" where key = ?";o.executeSql(t,[idbModules.Key.encode(e)],function(t,o){idbModules.DEBUG&&console.log("Did the row with the",e,"exist? ",o.rowsAffected),n.__insertData(t,i,e,a,s)},function(e,t){s(t)})})})}),o},IDBObjectStore.prototype.get=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("SELECT * FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Fetched data",t);try{if(0===t.rows.length)return i();i(idbModules.Sca.decode(t.rows.item(0).value))}catch(n){idbModules.DEBUG&&console.log(n),i(void 0)}},function(e,t){r(t)})})})},IDBObjectStore.prototype["delete"]=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("DELETE FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Deleted from database",t.rowsAffected),i()},function(e,t){r(t)})})})},IDBObjectStore.prototype.clear=function(){var e=this;return e.transaction.__addToTransactionQueue(function(t,n,o,i){e.__waitForReady(function(){t.executeSql("DELETE FROM "+idbModules.util.quote(e.name),[],function(e,t){idbModules.DEBUG&&console.log("Cleared all records from database",t.rowsAffected),o()},function(e,t){i(t)})})})},IDBObjectStore.prototype.count=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o="SELECT * FROM "+idbModules.util.quote(t.name)+(e!==void 0?" WHERE key = ?":""),a=[];e!==void 0&&a.push(idbModules.Key.encode(e)),n.executeSql(o,a,function(e,t){i(t.rows.length)},function(e,t){r(t)})})})},IDBObjectStore.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this,n,"key","value"),n},IDBObjectStore.prototype.index=function(e){var t=new idbModules.IDBIndex(e,this);return t},IDBObjectStore.prototype.createIndex=function(e,t,n){var o=this;n=n||{},o.__setReadyState("createIndex",!1);var i=new idbModules.IDBIndex(e,o);return o.__waitForReady(function(){i.__createIndex(e,t,n)},"createObjectStore"),o.indexNames.push(e),i},IDBObjectStore.prototype.deleteIndex=function(e){var t=new idbModules.IDBIndex(e,this,!1);return t.__deleteIndex(e),t},idbModules.IDBObjectStore=IDBObjectStore}(idbModules),function(e){var t=0,n=1,o=2,i=function(o,i,r){if("number"==typeof i)this.mode=i,2!==i&&e.DEBUG&&console.log("Mode should be a string, but was specified as ",i);else if("string"==typeof i)switch(i){case"readwrite":this.mode=n;break;case"readonly":this.mode=t;break;default:this.mode=t}this.storeNames="string"==typeof o?[o]:o;for(var a=0;this.storeNames.length>a;a++)r.objectStoreNames.contains(this.storeNames[a])||e.util.throwDOMException(0,"The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",this.storeNames[a]);this.__active=!0,this.__running=!1,this.__requests=[],this.__aborted=!1,this.db=r,this.error=null,this.onabort=this.onerror=this.oncomplete=null};i.prototype.__executeRequests=function(){if(this.__running&&this.mode!==o)return e.DEBUG&&console.log("Looks like the request set is already running",this.mode),void 0;this.__running=!0;var t=this;window.setTimeout(function(){2===t.mode||t.__active||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",t.__active),t.db.__db.transaction(function(n){function o(t,n){n&&(a.req=n),a.req.readyState="done",a.req.result=t,delete a.req.error;var o=e.Event("success");e.util.callback("onsuccess",a.req,o),s++,r()}function i(){a.req.readyState="done",a.req.error="DOMError";var t=e.Event("error",arguments);e.util.callback("onerror",a.req,t),s++,r()}function r(){return s>=t.__requests.length?(t.__active=!1,t.__requests=[],void 0):(a=t.__requests[s],a.op(n,a.args,o,i),void 0)}t.__tx=n;var a=null,s=0;try{r()}catch(u){e.DEBUG&&console.log("An exception occured in transaction",arguments),"function"==typeof t.onerror&&t.onerror()}},function(){e.DEBUG&&console.log("An error in transaction",arguments),"function"==typeof t.onerror&&t.onerror()},function(){e.DEBUG&&console.log("Transaction completed",arguments),"function"==typeof t.oncomplete&&t.oncomplete()})},1)},i.prototype.__addToTransactionQueue=function(t,n){this.__active||this.mode===o||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished.",this.__mode);var i=this.__createRequest();return this.__pushToQueue(i,t,n),i},i.prototype.__createRequest=function(){var t=new e.IDBRequest;return t.source=this.db,t},i.prototype.__pushToQueue=function(e,t,n){this.__requests.push({op:t,args:n,req:e}),this.__executeRequests()},i.prototype.objectStore=function(t){return new e.IDBObjectStore(t,this)},i.prototype.abort=function(){!this.__active&&e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",this.__active)},i.prototype.READ_ONLY=0,i.prototype.READ_WRITE=1,i.prototype.VERSION_CHANGE=2,e.IDBTransaction=i}(idbModules),function(e){var t=function(t,n,o,i){this.__db=t,this.version=o,this.__storeProperties=i,this.objectStoreNames=new e.util.StringList;for(var r=0;i.rows.length>r;r++)this.objectStoreNames.push(i.rows.item(r).name);this.name=n,this.onabort=this.onerror=this.onversionchange=null};t.prototype.createObjectStore=function(t,n){var o=this;n=n||{},n.keyPath=n.keyPath||null;var i=new e.IDBObjectStore(t,o.__versionTransaction,!1),r=o.__versionTransaction;return r.__addToTransactionQueue(function(r,a,s){function u(){e.util.throwDOMException(0,"Could not create new object store",arguments)}o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction);var c=["CREATE TABLE",e.util.quote(t),"(key BLOB",n.autoIncrement?", inc INTEGER PRIMARY KEY AUTOINCREMENT":"PRIMARY KEY",", value BLOB)"].join(" ");e.DEBUG&&console.log(c),r.executeSql(c,[],function(e){e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)",[t,n.keyPath,n.autoIncrement?!0:!1,"{}"],function(){i.__setReadyState("createObjectStore",!0),s(i)},u)},u)}),o.objectStoreNames.push(t),i},t.prototype.deleteObjectStore=function(t){var n=function(){e.util.throwDOMException(0,"Could not delete ObjectStore",arguments)},o=this;!o.objectStoreNames.contains(t)&&n("Object Store does not exist"),o.objectStoreNames.splice(o.objectStoreNames.indexOf(t),1);var i=o.__versionTransaction;i.__addToTransactionQueue(function(){o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction),o.__db.transaction(function(o){o.executeSql("SELECT * FROM __sys__ where name = ?",[t],function(o,i){i.rows.length>0&&o.executeSql("DROP TABLE "+e.util.quote(t),[],function(){o.executeSql("DELETE FROM __sys__ WHERE name = ?",[t],function(){},n)},n)})})})},t.prototype.close=function(){},t.prototype.transaction=function(t,n){var o=new e.IDBTransaction(t,n||1,this);return o},e.IDBDatabase=t}(idbModules),function(e){var t=4194304;if(window.openDatabase){var n=window.openDatabase("__sysdb__",1,"System Database",t);n.transaction(function(t){t.executeSql("SELECT * FROM dbVersions",[],function(){},function(){n.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);",[],function(){},function(){e.util.throwDOMException("Could not create table __sysdb__ to save DB versions")})})})},function(){e.DEBUG&&console.log("Error in sysdb transaction - when selecting from dbVersions",arguments)});var o={open:function(o,i){function r(){if(!u){var t=e.Event("error",arguments);s.readyState="done",s.error="DOMError",e.util.callback("onerror",s,t),u=!0}}function a(a){var u=window.openDatabase(o,1,o,t);s.readyState="done",i===void 0&&(i=a||1),(0>=i||a>i)&&e.util.throwDOMException(0,"An attempt was made to open a database using a lower version than the existing version.",i),u.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)",[],function(){t.executeSql("SELECT * FROM __sys__",[],function(t,c){var d=e.Event("success");s.source=s.result=new e.IDBDatabase(u,o,i,c),i>a?n.transaction(function(t){t.executeSql("UPDATE dbVersions set version = ? where name = ?",[i,o],function(){var t=e.Event("upgradeneeded");t.oldVersion=a,t.newVersion=i,s.transaction=s.result.__versionTransaction=new e.IDBTransaction([],2,s.source),e.util.callback("onupgradeneeded",s,t,function(){var t=e.Event("success");e.util.callback("onsuccess",s,t)})},r)},r):e.util.callback("onsuccess",s,d)},r)},r)},r)}var s=new e.IDBOpenRequest,u=!1;return n.transaction(function(e){e.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(e,t){0===t.rows.length?e.executeSql("INSERT INTO dbVersions VALUES (?,?)",[o,i||1],function(){a(0)},r):a(t.rows.item(0).version)},r)},r),s},deleteDatabase:function(o){function i(t){if(!s){a.readyState="done",a.error="DOMError";var n=e.Event("error");n.message=t,n.debug=arguments,e.util.callback("onerror",a,n),s=!0}}function r(){n.transaction(function(t){t.executeSql("DELETE FROM dbVersions where name = ? ",[o],function(){a.result=void 0;var t=e.Event("success");t.newVersion=null,t.oldVersion=u,e.util.callback("onsuccess",a,t)},i)},i)}var a=new e.IDBOpenRequest,s=!1,u=null;return n.transaction(function(n){n.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(n,s){if(0===s.rows.length){a.result=void 0;var c=e.Event("success");return c.newVersion=null,c.oldVersion=u,e.util.callback("onsuccess",a,c),void 0}u=s.rows.item(0).version;var d=window.openDatabase(o,1,o,t);d.transaction(function(t){t.executeSql("SELECT * FROM __sys__",[],function(t,n){var o=n.rows;(function a(n){n>=o.length?t.executeSql("DROP TABLE __sys__",[],function(){r()},i):t.executeSql("DROP TABLE "+e.util.quote(o.item(n).name),[],function(){a(n+1)},function(){a(n+1)})})(0)},function(){r()})},i)})},i),a},cmp:function(t,n){return e.Key.encode(t)>e.Key.encode(n)?1:t===n?0:-1}};e.shimIndexedDB=o}}(idbModules),function(e,t){e.openDatabase!==void 0&&(e.shimIndexedDB=t.shimIndexedDB,e.shimIndexedDB&&(e.shimIndexedDB.__useShim=function(){e.indexedDB=t.shimIndexedDB,e.IDBDatabase=t.IDBDatabase,e.IDBTransaction=t.IDBTransaction,e.IDBCursor=t.IDBCursor,e.IDBKeyRange=t.IDBKeyRange},e.shimIndexedDB.__debug=function(e){t.DEBUG=e})),e.indexedDB=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.oIndexedDB||e.msIndexedDB,e.indexedDB===void 0&&e.openDatabase!==void 0?e.shimIndexedDB.__useShim():(e.IDBDatabase=e.IDBDatabase||e.webkitIDBDatabase,e.IDBTransaction=e.IDBTransaction||e.webkitIDBTransaction,e.IDBCursor=e.IDBCursor||e.webkitIDBCursor,e.IDBKeyRange=e.IDBKeyRange||e.webkitIDBKeyRange,e.IDBTransaction||(e.IDBTransaction={}),e.IDBTransaction.READ_ONLY=e.IDBTransaction.READ_ONLY||"readonly",e.IDBTransaction.READ_WRITE=e.IDBTransaction.READ_WRITE||"readwrite")}(window,idbModules);
//@ sourceMappingURL=http://nparashuram.com/IndexedDBShim/dist/IndexedDBShim.min.map'use strict';
var J = jQuery.noConflict();

var Zotero = {
    ajax: {},
    callbacks: {},
    ui: {
        callbacks: {},
        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },
    },
    url: {},
    utils: {},
    offline: {},
    temp: {},
    localizations: {},
    
    config: {librarySettings: {},
             baseApiUrl: 'https://api.zotero.org',
             baseWebsiteUrl: 'https://zotero.org',
             baseFeedUrl: 'https://api.zotero.org',
             baseZoteroWebsiteUrl: 'https://www.zotero.org',
             baseDownloadUrl: 'https://www.zotero.org',
             directDownloads: true,
             proxyPath: '/proxyrequest',
             ignoreLoggedInStatus: false,
             storePrefsRemote: true,
             preferUrlItem: true,
             sessionAuth: false,
             proxy: false,
             apiKey: '',
             ajax: 1,
             apiVersion: 2,
             eventful: false,
             locale: 'en-US',
             cacheStoreType: 'localStorage',
             preloadCachedLibrary: true,
             mobile:0,
             sortOrdering: {
                 'dateAdded': 'desc',
                 'dateModified': 'desc',
                 'date': 'desc',
                 'year': 'desc',
                 'accessDate': 'desc',
                 'title': 'asc',
                 'creator': 'asc'
             },
             defaultSortColumn: 'title',
             defaultSortOrder: 'asc',
             largeFields: {
                 'title': 1,
                 'abstractNote': 1,
                 'extra' : 1
             },
             richTextFields: {
                 'note': 1
             },
             maxFieldSummaryLength: {title:60},
             exportFormats: [
                'bibtex',
                'bookmarks',
                'mods',
                'refer',
                'rdf_bibliontology',
                'rdf_dc',
                'rdf_zotero',
                'ris',
                'wikipedia'
                ],
            exportFormatsMap: {
                'bibtex': 'BibTeX',
                'bookmarks': 'Bookmarks',
                'mods': 'MODS',
                'refer': 'Refer/BibIX',
                'rdf_bibliontology': 'Bibliontology RDF',
                'rdf_dc': 'Unqualified Dublin Core RDF',
                'rdf_zotero': 'Zotero RDF',
                'ris': 'RIS',
                'wikipedia': 'Wikipedia Citation Templates',
            },
            defaultApiArgs: {
                'order': 'title',
                'sort': 'asc',
                'limit': 50,
                'start': 0,
                'content':'json',
                'format': 'atom'
            }
             },
    
    debug: function(debugstring, level){
        var prefLevel = 3;
        if(typeof console == 'undefined'){
            return;
        }
        if(typeof(level) !== "number"){
            level = 1;
        }
        if(Zotero.preferences !== undefined){
            prefLevel = Zotero.preferences.getPref('debug_level');
        }
        if(level <= prefLevel) {
            console.log(debugstring);
        }
    },
    
    warn: function(warnstring){
        if(typeof console == 'undefined' || typeof console.warn == 'undefined'){
            this.debug(warnstring);
        }
        else{
            console.warn(warnstring);
        }
    },
    
    error: function(errorstring){
        if(typeof console == 'undefined' || typeof console.error == 'undefined'){
            this.debug(errorstring);
        }
        else{
            console.error(errorstring);
        }
    },
    
    feeds: {},
    
    cacheFeeds: {},
    
    libraries: {},
    
    validator: {
        patterns: {
            //'itemKey': /^([A-Z0-9]{8,},?)+$/,
            'itemKey': /^.+$/,
            'collectionKey': /^([A-Z0-9]{8,})|trash$/,
            //'tag': /^[^#]*$/,
            'libraryID': /^[0-9]+$/,
            'libraryType': /^(user|group|)$/,
            'target': /^(items?|collections?|tags|children|deleted|userGroups|key|settings)$/,
            'targetModifier': /^(top|file|file\/view)$/,
            
            //get params
            'sort': /^(asc|desc)$/,
            'start': /^[0-9]*$/,
            'limit': /^[0-9]*$/,
            'order': /^\S*$/,
            'content': /^((html|json|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            'q': /^.*$/,
            'fq': /^\S*$/,
            'itemType': /^\S*$/,
            'locale': /^\S*$/,
            'tag': /^.*$/,
            'tagType': /^(0|1)$/,
            'key': /^\S*/,
            'format': /^(atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
            'style': /^\S*$/,
            'linkwrap': /^(0|1)*$/
        },
        
        validate: function(arg, type){
            Z.debug("Zotero.validate", 4);
            if(arg === ''){
                return null;
            }
            else if(arg === null){
                return true;
            }
            Z.debug(arg + " " + type, 4);
            var patterns = this.patterns;
            
            if(patterns.hasOwnProperty(type)){
                return patterns[type].test(arg);
            }
            else{
                return null;
            }
        }
    },
    
    _logEnabled: 0,
    enableLogging: function(){
        Zotero._logEnabled++;
        if(Zotero._logEnabled > 0){
            //TODO: enable debug_log?
        }
    },
    
    disableLogging: function(){
        Zotero._logEnabled--;
        if(Zotero._logEnabled <= 0){
            Zotero._logEnabled = 0;
            //TODO: disable debug_log?
        }
    },
    
    init: function(){
        var store;
        if(Zotero.config.cacheStoreType == 'localStorage' && typeof localStorage != 'undefined'){
            store = localStorage;
        }
        else if(Zotero.config.cacheStoreType == 'sessionStorage' && typeof sessionStorage != 'undefined'){
            store = sessionStorage;
        }
        else{
            store = {};
        }
        Zotero.store = store;
        
        Zotero.cache = new Zotero.Cache(store);
        
        //initialize global preferences object
        Zotero.preferences = new Zotero.Preferences(Zotero.store, 'global');
        
        //get localized item constants if not stored in localstorage
        var locale = 'en-US';
        if(Zotero.config.locale){
            locale = Zotero.config.locale;
        }
        locale = 'en-US';
        
        J.ajaxSettings.traditional = true;
        
    }
};

Zotero.Cache = function(store){
    this.store = store;
    var registry = this.store['_registry'];
    if(typeof registry == 'null' || typeof registry == 'undefined'){
        registry = {};
        this.store['_registry'] = JSON.stringify(registry);
    }
};

//build a consistent string from an object to use as a cache key
//put object key/value pairs into array, sort array, and concatenate
//array with '/'
Zotero.Cache.prototype.objectCacheString = function(params){
    var paramVarsArray = [];
    J.each(params, function(index, value){
        if(!value) { return; }
        else if(value instanceof Array){
            J.each(value, function(i, v){
                paramVarsArray.push(index + '/' + encodeURIComponent(v) );
            });
        }
        else{
            paramVarsArray.push(index + '/' + encodeURIComponent(value) );
        }
    });
    paramVarsArray.sort();
    Z.debug(paramVarsArray, 4);
    var objectCacheString = paramVarsArray.join('/');
    return objectCacheString;
};

//should use setItem and getItem if I extend that to the case where no Storage object is available in the browser
Zotero.Cache.prototype.save = function(params, object, cachetags){
    //cachetags for expiring entries
    if(!J.isArray(cachetags)){
        cachetags = [];
    }
    //get registry object from storage
    var registry = JSON.parse(this.store['_registry']);
    if(!registry){
        registry = {};
    }
    var objectCacheString = this.objectCacheString(params);
    //save object in storage
    this.store[objectCacheString] = JSON.stringify(object);
    //make registry entry for object
    var registryEntry = {'id':objectCacheString, saved:Date.now(), cachetags:cachetags};
    registry[objectCacheString] = registryEntry;
    //save registry back to storage
    this.store['_registry'] = JSON.stringify(registry);
};

Zotero.Cache.prototype.load = function(params){
    Z.debug("Zotero.Cache.load", 3);
    var objectCacheString = this.objectCacheString(params);
    Z.debug(objectCacheString, 4);
    try{
        var s = this.store[objectCacheString];
        if(!s){
            Z.debug("No value found in cache store - " + objectCacheString, 3);
            return null;
        }
        else{
            return JSON.parse(s);
        }
    }
    catch(e){
        Z.debug('Error parsing retrieved cache data', 1);
        Z.debug(objectCacheString, 2);
        Z.debug(this.store[objectCacheString], 2);
        return null;
    }
};

Zotero.Cache.prototype.expireCacheTag = function(tag){
    Z.debug("Zotero.Cache.expireCacheTag", 3);
    var registry = JSON.parse(this.store['_registry']);
    var store = this.store;
    J.each(registry, function(index, value){
        if(J.inArray(tag, value.cachetags) != (-1) ){
            Z.debug('tag ' + tag + ' found for item ' + value['id'] + ' : expiring', 4);
            delete store[value['id']];
            delete registry[value['id']];
        }
    });
};

Zotero.Cache.prototype.clear = function(){
    if(typeof(this.store.clear) == 'function'){
        this.store.clear();
    }
    else{
        this.store = {};
    }
};

Zotero.error = function(e){
    Z.debug("=====Zotero Error", 1);
    Z.debug(e, 1);
};

Zotero.ajaxRequest = function(url, type, options){
    Z.debug("Zotero.ajaxRequest ==== " + url, 3);
    var defaultOptions = {
        type: "GET",
        headers:{},
        cache:false,
        error: Zotero.ajax.errorCallback
    };
    
    var successCallback;
    var failureCallback;
    if(options && options.success){
        successCallback = options.success;
        delete options.success;
    }
    if(options && options.error){
        failureCallback = options.error;
        delete options.error;
    }
    
    var reqOptions = J.extend({}, defaultOptions, options);
    if(type){
        reqOptions.type = type;
    }
    
    if(Zotero.config.apiVersion){
        reqOptions.headers['Zotero-API-Version'] = Zotero.config.apiVersion;
    }
    
    var urlstring;
    if(typeof url === "object"){
        urlstring = Zotero.ajax.apiRequestString(url);
    }
    else if(typeof url === "string"){
        urlstring = url;
    }
    Z.debug("library.ajaxRequest urlstring " + urlstring, 3);
    var reqUrl = Zotero.ajax.proxyWrapper(urlstring, type);
    ajaxpromise = new Promise(function(resolve, reject){
        J.ajax(reqUrl, reqOptions)
        .then(function(data, textStatus, jqxhr){
            resolve({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
        }, function(jqxhr, textStatus, errorThrown){
            reject({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });
    });
    
    if(successCallback || failureCallback){
        ajaxpromise.then(successCallback, failureCallback);
    }
    
    Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.trigger = function(eventType, data, filter){
    if(filter){
        Z.debug("filter is not false");
        eventType += "_" + filter;
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    if(!data){
        data = {};
    }
    data.zeventful = true;
    if(data.triggeringElement === null || data.triggeringElement === undefined){
        data.triggeringElement = J("#eventful");
    }
    Zotero.debug("Triggering eventful " + eventType, 3);
    var e = J.Event(eventType, data);
    J("#eventful").trigger(e);
};

Zotero.listen = function(events, handler, data, filter){
    //append filter to event strings if it's specified
    if(filter){
        var eventsArray = events.split(" ");
        if(eventsArray.length > 0){
            for(var i = 0; i < eventsArray.length; i++){
                eventsArray[i] += "_" + filter;
            }
            events = eventsArray.join(" ");
        }
    }
    Z.debug("listening on " + events, 3);
    J("#eventful").on(events, null, data, handler);
};

var Z = Zotero;


/*
Zotero.ajax.error = function(event, request, settings, exception){
    //Zotero.ui.jsNotificationMessage("Error requesting " + settings.url, 'error');
    //J("#js-message-list").append("<li>Error requesting " + settings.url + "</li>");
    Z.debug("Exception: " + exception);
    //Z.exception = exception;
};
*/
/*
Zotero.ajax.errorCallback = function(jqxhr, textStatus, errorThrown){
    Z.debug("ajax error callback", 2);
    Z.debug('textStatus: ' + textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(errorThrown, 2);
    Z.debug(jqxhr, 2);
};
*/
Zotero.ajax.errorCallback = function(response){
    Z.debug("ajax error callback", 2);
    Z.debug('textStatus: ' + response.textStatus, 2);
    Z.debug('errorThrown: ', 2);
    Z.debug(response.errorThrown, 2);
    Z.debug(response.jqxhr, 2);
};

Zotero.ajax.error = Zotero.ajax.errorCallback;
Zotero.ajax.activeRequests = [];

/*
 * Requires {target:items|collections|tags, libraryType:user|group, libraryID:<>}
 */
Zotero.ajax.apiRequestUrl = function(params){
    Z.debug("Zotero.ajax.apiRequestUrl", 4);
    Z.debug(params, 4);
    J.each(params, function(key, val){
        //should probably figure out exactly why I'm doing this, is it just to make sure no hashes snuck in?
        //if so the new validation below takes care of that instead
        if(typeof val == 'string'){
            val = val.split('#', 1);
            params[key] = val[0];
        }
        
        //validate params based on patterns in Zotero.validate
        if(Zotero.validator.validate(val, key) === false){
            //warn on invalid parameter and drop from params that will be used
            Zotero.warn("API argument failed validation: " + key + " cannot be " + val);
            Zotero.warn(params);
            delete params[key];
        }
    });
    
    if(!params.target) throw new Error("No target defined for api request");
    if(!(params.libraryType == 'user' ||
        params.libraryType == 'group' ||
        params.libraryType === '')) {
        throw new Error("Unexpected libraryType for api request " + JSON.stringify(params));
    }
    if((params.libraryType) && !(params.libraryID)) {
        throw new ("No libraryID defined for api request");
    }
    
    var base = Zotero.config.baseApiUrl;
    var url;
    
    if(params.libraryType !== ''){
        url = base + '/' + params.libraryType + 's/' + params.libraryID;
        if(params.collectionKey){
            if(params.collectionKey == 'trash'){
                url += '/items/trash';
                return url;
            }
            else if(params.collectionKey.indexOf(',') !== -1){
                
            }
            else if(params.target != 'collections'){
                url += '/collections/' + params.collectionKey;
            }
        }
    }
    else{
        url = base;
    }
    
    switch(params.target){
        case 'items':
            url += '/items';
            break;
        case 'item':
            if(params.itemKey){
                url += '/items/' + params.itemKey;
            }
            else{
                url += '/items';
            }
            break;
        case 'collections':
            url += '/collections';
            break;
        case 'childCollections':
            url += '/collections';
        case 'collection':
            break;
        case 'tags':
            url += '/tags';
            break;
        case 'children':
            url += '/items/' + params.itemKey + '/children';
            break;
        case 'key':
            url = base + '/users/' + params.libraryID + '/keys/' + params.apiKey;
            break;
        case 'deleted':
            url += '/deleted';
            break;
        case 'userGroups':
            url = base + '/users/' + params.libraryID + '/groups';
            break;
        case 'settings':
            url += '/settings/' + (params.settingsKey || '');
            break;
        default:
            return false;
    }
    switch(params.targetModifier){
        case 'top':
            url += '/top';
            break;
        case 'file':
            url += '/file';
            break;
        case 'viewsnapshot':
            url += '/file/view';
            break;
    }
    //Z.debug("returning apiRequestUrl: " + url, 3);
    return url;
};

Zotero.ajax.apiQueryString = function(passedParams, useConfigKey){
    Z.debug("Zotero.ajax.apiQueryString", 4);
    Z.debug(passedParams, 4);
    if(useConfigKey === null || typeof useConfigKey === 'undefined'){
        useConfigKey = true;
    }
    
    J.each(passedParams, function(key, val){
        if(typeof val == 'string'){
            val = val.split('#', 1);
            passedParams[key] = val[0];
        }
    });
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'creatorSummary'){
        passedParams['order'] = 'creator';
    }
    if(passedParams.hasOwnProperty('order') && passedParams['order'] == 'year'){
        passedParams['order'] = 'date';
    }
    if(useConfigKey && Zotero.config.sessionAuth) {
        var sessionKey = Zotero.utils.readCookie("zotero_www_session_v2");
        passedParams['session'] = sessionKey;
    }
    else if(useConfigKey && Zotero.config.apiKey){
        passedParams['key'] = Zotero.config.apiKey;
    }
    
    //Z.debug()
    if(passedParams.hasOwnProperty('sort') && passedParams['sort'] == 'undefined' ){
        //alert('fixed a bad sort');
        passedParams['sort'] = 'asc';
    }
    
    Z.debug(passedParams, 4);
    
    var queryString = '?';
    var queryParamsArray = [];
    var queryParamOptions = ['start',
                             'limit',
                             'order',
                             'sort',
                             'content',
                             'format',
                             'q',
                             'fq',
                             'itemType',
                             'itemKey',
                             'collectionKey',
                             'searchKey',
                             'locale',
                             'tag',
                             'tagType',
                             'key',
                             'style',
                             'linkMode',
                             'linkwrap',
                             'session',
                             'newer'
                             ];
    queryParamOptions.sort();
    //build simple api query parameters object
    var queryParams = {};
    J.each(queryParamOptions, function(i, val){
        if(passedParams.hasOwnProperty(val) && (passedParams[val] !== '')){
            queryParams[val] = passedParams[val];
        }
    });
    
    //take out itemKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'items'){
        if(queryParams.hasOwnProperty('itemKey') && queryParams['itemKey'].indexOf(',') == -1){
            delete queryParams['itemKey'];
        }
    }
    
    //take out collectionKey if it is not a list
    if(passedParams.hasOwnProperty('target') && passedParams['target'] !== 'collections'){
        if(queryParams.hasOwnProperty('collectionKey') && queryParams['collectionKey'].indexOf(',') === -1){
            delete queryParams['collectionKey'];
        }
    }
    
    //add each of the found queryParams onto array
    J.each(queryParams, function(index, value){
        if(value instanceof Array){
            J.each(value, function(i, v){
                if(index == "tag" && v[0] == "-"){
                    v = "\\" + v;
                }
                queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(v));
            });
        }
        else{
            if(index == "tag" && value[0] == "-"){
                value = "\\" + value;
            }
            queryParamsArray.push(encodeURIComponent(index) + '=' + encodeURIComponent(value));
        }
    });
    
    //build query string by concatenating array
    queryString += queryParamsArray.join('&');
    //Z.debug("resulting queryString:" + queryString);
    return queryString;
};

Zotero.ajax.apiRequestString = function(config){
    return Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
};

Zotero.ajax.proxyWrapper = function(requestUrl, method){
    if(Zotero.config.proxy){
        if(!method){
            method = 'GET';
        }
        return Zotero.config.proxyPath + "?requestMethod=" + method + "&requestUrl=" + encodeURIComponent(requestUrl);
    }
    else{
        return requestUrl;
    }
};

Zotero.ajax.parseQueryString = function(query){
    
};

Zotero.ajax.webUrl = function(args){
    
};

Zotero.ajax.downloadBlob = function(url){
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        var blob;
        
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        
        xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
                Z.debug("downloadBlob Image retrieved. resolving", 3);
                resolve(xhr.response);
            }
            else {
                reject(xhr.response);
            }
        } );
        // Send XHR
        xhr.send();
    });
};

Zotero.Feed = function(data, response){
    Z.debug('Zotero.Feed', 3);
    this.title = '';
    this.id = '';
    this.totalResults = 0;
    this.apiVersion = null;
    this.links = {};
    this.lastPageStart = null;
    this.lastPage = null;
    this.currentPage = null;
    this.updated = null;
    
    if(typeof data !== 'undefined'){
        this.parseXmlFeed(data);
    }
    if(response){
        //keep track of relevant headers
        this.lastModifiedVersion = response.getResponseHeader("Last-Modified-Version");
        this.apiVersion = response.getResponseHeader("Zotero-API-Version");
        this.backoff = response.getResponseHeader("Backoff");
        this.retryAfter = response.getResponseHeader("Retry-After");
        this.contentType = response.getResponseHeader("Content-Type");
    }
};

Zotero.Feed.prototype.parseXmlFeed = function(data){
    var fel = J(data).find("feed");
    this.zoteroLastModifiedVersion = null;
    this.title = fel.children('title').first().text();
    this.id = fel.children('id').first().text();
    this.totalResults = fel.find('zapi\\:totalResults').first().text();
    if(this.totalResults === ''){
        this.totalResults = fel.find('totalResults').first().text();
    }
    var links = {};
    var lasthref = '';
    fel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href")
        };
        if(J(this).attr('rel') == 'last'){
            lasthref = J(this).attr('href');
        }
    });
    
    var selfhref = links['self'].href;
    this.lastPageStart = J.deparam.querystring(lasthref).start || 0;
    var limit = J.deparam.querystring(lasthref).limit || 50;
    var start = J.deparam.querystring(selfhref).start || 0;
    this.lastPage = (parseInt(this.lastPageStart, 10) / limit) + 1;
    this.currentPage = (parseInt(start, 10) / limit) + 1;
    
    this.links = links;
    
    this.updated = new Date();
    this.updated.setTime(Date.parse(fel.children("updated").first().text()));
    this.entries = fel.find('entry');
    return this;
};
Zotero.Library = function(type, libraryID, libraryUrlIdentifier, apiKey){
    Z.debug("Zotero.Library constructor", 3);
    Z.debug("Library Constructor: " + type + " " + libraryID + " ", 3);
    var library = this;
    Z.debug(libraryUrlIdentifier, 4);
    library.instance = "Zotero.Library";
    library.libraryVersion = 0;
    library.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    library._apiKey = apiKey || false;
    
    library.libraryBaseWebsiteUrl = Zotero.config.libraryPathString;
    if(type == 'group'){
        library.libraryBaseWebsiteUrl += 'groups/';
    }
    this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
    
    //object holders within this library, whether tied to a specific library or not
    library.items = new Zotero.Items();
    library.items.owningLibrary = library;
    library.itemKeys = [];
    library.collections = new Zotero.Collections();
    library.collections.libraryUrlIdentifier = library.libraryUrlIdentifier;
    library.collections.owningLibrary = library;
    library.tags = new Zotero.Tags();
    library.searches = new Zotero.Searches();
    library.searches.owningLibrary = library;
    library.groups = new Zotero.Groups();
    library.groups.owningLibrary = library;
    library.deleted = new Zotero.Deleted();
    library.deleted.owningLibrary = library;
    
    
    if(!type){
        //return early if library not specified
        return;
    }
    //attributes tying instance to a specific Zotero library
    library.type = type;
    library.libraryType = type;
    library.libraryID = libraryID;
    library.libraryString = Zotero.utils.libraryString(library.libraryType, library.libraryID);
    library.libraryUrlIdentifier = libraryUrlIdentifier;
    
    //initialize preferences object
    library.preferences = new Zotero.Preferences(Zotero.store, library.libraryString);
    
    //object to hold user aliases for displaying real names
    library.usernames = {};
    
    //initialize indexedDB if we're supposed to use it
    if(Zotero.config.useIndexedDB === true){
        Z.debug("Library Constructor: indexedDB init", 3);
        var idbLibrary = new Zotero.Idb.Library(library.libraryString);
        idbLibrary.owningLibrary = this;
        library.idbLibrary = idbLibrary;
        idbLibrary.init()
        .then(function(){
            Z.debug("Library Constructor: idbInitD Done", 3);
            if(Zotero.config.preloadCachedLibrary === true){
                Z.debug("Library Constructor: preloading cached library", 3);
                var cacheLoadD = library.loadIndexedDBCache();
                cacheLoadD.then(function(){
                    //TODO: any stuff that needs to execute only after cache is loaded
                    //possibly fire new events to cause display to refresh after load
                    Z.debug("Library Constructor: Library.items.itemsVersion: " + library.items.itemsVersion, 3);
                    Z.debug("Library Constructor: Library.collections.collectionsVersion: " + library.collections.collectionsVersion, 3);
                    Z.debug("Library Constructor: Library.tags.tagsVersion: " + library.tags.tagsVersion, 3);

                    Z.debug("Library Constructor: Triggering cachedDataLoaded", 3);
                    library.trigger('cachedDataLoaded');
                },
                function(err){
                    Z.debug("Error loading cached library", 1);
                    Z.debug(err, 1);
                    throw new Error("Error loading cached library");
                });
            }
            else {
                //trigger cachedDataLoaded since we are done with that step
                library.trigger('cachedDataLoaded');
            }
        },
        function(){
            Z.debug("Error initialized indexedDB. Promise rejected.", 1);
            throw new Error("Error initialized indexedDB. Promise rejected.");
        });
    }
    
    library.dirty = false;
    
    //set noop data-change callbacks
    library.tagsChanged = function(){};
    library.collectionsChanged = function(){};
    library.itemsChanged = function(){};
};

Zotero.Library.prototype.sortableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            /*'numChildren',*/
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.displayableColumns = ['title',
                                            'creator',
                                            'itemType',
                                            'date',
                                            'year',
                                            'publisher',
                                            'publicationTitle',
                                            'journalAbbreviation',
                                            'language',
                                            'accessDate',
                                            'libraryCatalog',
                                            'callNumber',
                                            'rights',
                                            'dateAdded',
                                            'dateModified',
                                            'numChildren',
                                            'addedBy'
                                            /*'modifiedBy'*/];

Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

//this does not handle accented characters correctly
Zotero.Library.prototype.sortByTitleCompare = function(a, b){
    //Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLocaleLowerCase() == b.title.toLocaleLowerCase()){
        return 0;
    }
    if(a.title.toLocaleLowerCase() < b.title.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Library.prototype.sortLower = function(a, b){
    if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
        return 0;
    }
    if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
        return -1;
    }
    return 1;
};

//Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Zotero.Library.prototype.ajaxRequest = function(url, type, options){
    Z.debug("Library.ajaxRequest", 3);
    var defaultOptions = {
        type: "GET",
        headers:{},
        cache:false,
    };
    
    var successCallback;
    var failureCallback;
    if(options && options.success){
        successCallback = options.success;
        delete options.success;
    }
    if(options && options.error){
        failureCallback = options.error;
        delete options.error;
    }
    
    var reqOptions = J.extend({}, defaultOptions, options);
    if(type){
        reqOptions.type = type;
    }
    
    if(Zotero.config.apiVersion){
        reqOptions.headers['Zotero-API-Version'] = Zotero.config.apiVersion;
    }
    
    var urlstring;
    if(typeof url === "object"){
        urlstring = Zotero.ajax.apiRequestString(url);
    }
    else if(typeof url === "string"){
        urlstring = url;
    }
    Z.debug("library.ajaxRequest urlstring " + urlstring, 3);
    var reqUrl = Zotero.ajax.proxyWrapper(urlstring, type);
    
    ajaxpromise = new Promise(function(resolve, reject){
        J.ajax(reqUrl, reqOptions)
        .then(function(data, textStatus, jqxhr){
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            resolve({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
        }, function(jqxhr, textStatus, errorThrown){
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            reject({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });
    });
    
    if(successCallback || failureCallback){
        ajaxpromise.then(successCallback, failureCallback);
    }
    
    Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

//Take an array of objects that specify Zotero API requests and perform them
//in sequence.
//return deferred that gets resolved when all requests have gone through.
//Update versions after each request, otherwise subsequent writes won't go through.
//or do we depend on specified callbacks to update versions if necessary?
//fail on error?
//request object must specify: url, method, body, headers, success callback, fail callback(?)
Zotero.Library.prototype.sequentialRequests = function(requests){
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var library = this;
    var requestPromises = [];
    var seqPromise = Promise.resolve();
    
    J.each(requests, function(index, requestObject){
        seqPromise = seqPromise.then(function(){
            var p = library.ajaxRequest(requestObject.url, requestObject.options.type, requestObject.options);
            requestPromises.push(p);
            return p;
        });
    });
    
    return seqPromise.then(function(){
        return requestPromises;
    });
}

Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return this.libraryBaseWebsiteUrl + '/' + pathVarsString;
};


Zotero.Library.prototype.synchronize = function(){
    //get updated group metadata if applicable
    //  (this is an individual library method, so only necessary if this is
    //  a group library and we want to keep info about it)
    //sync library data
    //  get updated collections versions newer than current library version
    //  get updated searches versions newer than current library version
    //  get updated item versions newer than current library version
    //
};

Zotero.Library.prototype.loadUpdatedItems = function(){
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the itemsVersion, which is likely
    //derived from the most recent version of any individual item we have.
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.items.itemsVersion;
    return Promise.resolve(library.updatedVersions("items", syncFromVersion))
    .then(function(response){
        Z.debug("itemVersions resolved", 3);
        var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("items Last-Modified-Version: " + updatedVersion, 3);
        Zotero.utils.updateSyncState(library.items, updatedVersion);
        
        var itemVersions = response.data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val){
            var item = library.items.getItem(key);
            if((!item) || (item.apiObj.itemKey != val)){
                itemKeys.push(key);
            }
        });
        return library.loadItemsFromKeys(itemKeys);
    }).then(function(response){
        Z.debug("loadItemsFromKeys resolved", 3);
        Zotero.utils.updateSyncedVersion(library.items, 'itemsVersion');
        
        //TODO: library needs its own state
        var displayParams = Zotero.state.getUrlVars();
        library.buildItemDisplayView(displayParams);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            var saveItemsD = library.idbLibrary.updateItems();
        }
    })
};

Zotero.Library.prototype.loadUpdatedCollections = function(){
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the collectionsVersion, which is likely
    //derived from the most recent version of any individual collection we have.
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.collections.collectionsVersion;
    //we need modified collectionKeys regardless, so load them
    return Promise.resolve(library.updatedVersions("collections", syncFromVersion))
    .then(function(response){
        Z.debug("collectionVersions finished", 3);
        var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Collections Last-Modified-Version: " + updatedVersion, 3);
        //start the syncState version tracking. This should be the earliest version throughout
        Zotero.utils.updateSyncState(library.collections, updatedVersion);
        
        var collectionVersions = response.data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val){
            var c = library.collections.getCollection(key);
            if((!c) || (c.apiObj.collectionVersion != val)){
                collectionKeys.push(key);
            }
        });
        if(collectionKeys.length === 0){
            Z.debug("No collectionKeys need updating. resolving", 3);
            return;
        }
        else {
            Z.debug("fetching collections by key", 3);
            return Promise.resolve(library.loadCollectionsFromKeys(collectionKeys))
            .then(function(){
                var collections = library.collections;
                collections.initSecondaryData();
                
                Z.debug("All updated collections loaded", 3);
                Zotero.utils.updateSyncedVersion(library.collections, 'collectionsVersion');
                //TODO: library needs its own state
                var displayParams = Zotero.state.getUrlVars();
                //save updated collections to cache
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
                //library.saveCachedCollections();
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    return library.idbLibrary.updateCollections();
                }
            });
        }
    })
    .then(function(){
        Z.debug("done getting collection data. requesting deleted data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(){
        Z.debug("got deleted collections data: removing local copies", 3);
        Z.debug(library.deleted);
        if(library.deleted.deletedData.collections && library.deleted.deletedData.collections.length > 0 ){
            library.collections.removeLocalCollections(library.deleted.deletedData.collections);
        }
    });
};

Zotero.Library.prototype.loadUpdatedTags = function(){
    Z.debug("Zotero.Library.loadUpdatedTags", 3);
    var library = this;
    Z.debug("tagsVersion: " + library.tags.tagsVersion, 3);
    return Promise.resolve(library.loadAllTags({newer:library.tags.tagsVersion}, false))
    .then(function(){
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(){
        if(library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0 ){
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        
        //save updated collections to IDB
        if(Zotero.config.useIndexedDB){
            Z.debug("saving updated tags to IDB", 3);
            var saveTagsD = library.idbLibrary.updateTags();
        }
    });
};

Zotero.Library.prototype.getDeleted = function(version) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var library = this;
    var urlconf = {target:'deleted',
                   libraryType:library.libraryType,
                   libraryID:library.libraryID,
                   newer:version
               };
    
    if(library.deleted.deletedVersion == version){
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(library.deleted.deletedData);
    }
    
    return library.ajaxRequest(urlconf)
    .then(function(response){
        Z.debug("got deleted response");
        library.deleted.deletedData = response.data;
        var responseModifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Deleted Last-Modified-Version:" + responseModifiedVersion, 3);
        library.deleted.deletedVersion = responseModifiedVersion;
        library.deleted.newerVersion = version;
    });
};

Zotero.Library.prototype.processDeletions = function(deletions){
    var library = this;
    //process deleted collections
    J.each(deletions.collections, function(ind, val){
        var localCollection = library.collections.getCollection(val);
        if(localCollection !== false){
            //still have object locally
            if(localCollection.synced === true){
                //our collection is not modified, so delete it as the server thinks we should
                library.collections.deleteCollection(val);
            }
            else {
                //TODO: conflict resolution
            }
        }
    });
    
    //process deleted items
    J.each(deletions.items, function(ind, val){
        var localItem = library.items.getItem(val);
        if(localItem !== false){
            //still have object locally
            if(localItem.synced === true){
                //our collection is not modified, so delete it as the server thinks we should
                library.items.deleteItem(val);
            }
        }
    });
    
};

//Get a full bibliography from the API for web based citating
Zotero.Library.prototype.loadFullBib = function(itemKeys, style){
    var library = this;
    var itemKeyString = itemKeys.join(',');
    var urlconfig = {
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKeyString,
        'format':'bib',
        'linkwrap':'1'
    };
    if(itemKeys.length == 1){
        urlconfig.target = 'item';
    }
    if(style){
        urlconfig['style'] = style;
    }
    
    var loadBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        return response.data;
    });
    
    return loadBibPromise;
};

//load bib for a single item from the API
Zotero.Library.prototype.loadItemBib = function(itemKey, style) {
    Z.debug("Zotero.Library.loadItemBib", 3);
    var library = this;
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
        'content':'bib'
    };
    if(style){
        urlconfig['style'] = style;
    }
    
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var itemBibPromise = library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultOb = J(response.data);
        var entry = J(response.data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.parseXmlItem(entry);
        var bibContent = item.bibContent;
        return bibContent;
    });
    
    return itemBibPromise;
};

//load library settings from Zotero API and return a promise that gets resolved with
//the Zotero.Preferences object for this library
Zotero.Library.prototype.loadSettings = function() {
    Z.debug("Zotero.Library.loadSettings", 3);
    var library = this;
    var urlconfig = {
        'target':'settings',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultObject;
        if(typeof response.data == 'string'){
            resultObject = JSON.parse(response.data);
        }
        else {
            resultObject = response.data;
        }
        //save the full settings object so we have it available if we need to write,
        //even if it has settings we don't use or know about
        library.preferences.setPref('settings', resultObject);
        
        //pull out the settings we know we care about so we can query them directly
        if(resultObject.tagColors){
            var tagColors = resultObject.tagColors.value;
            library.preferences.setPref('tagColors', tagColors);
            /*
            for(var i = 0; i < tagColors.length; i++){
                var t = library.tags.getTag(tagColors[i].name);
                if(t){
                    t.color = tagColors[i].color;
                }
            }
            */
        }
        
        library.trigger('settingsLoaded');
        return library.preferences;
    });
};

Zotero.Library.prototype.matchColoredTags = function(tags) {
    var library = this;
    var tagColorsSettings = library.preferences.getPref("tagColors");
    if(!tagColorsSettings) return [];
    
    var tagColorsMap = {};
    for(var i = 0; i < tagColorsSettings.length; i++){
        tagColorsMap[tagColorsSettings[i].name.toLowerCase()] = tagColorsSettings[i].color;
    }
    var resultTags = [];
    
    for(var i = 0; i < tags.length; i++){
        if(tagColorsMap.hasOwnProperty(tags[i]) ) {
            resultTags.push(tagColorsMap[tags[i]]);
        }
    }
    return resultTags;
},

Zotero.Library.prototype.fetchUserNames = function(userIDs){
    Z.debug("Zotero.Library.fetchUserNames", 3);
    var library = this;
    var reqUrl = Zotero.config.baseZoteroWebsiteUrl + '/api/useraliases?userID=' + userIDs.join(',');
    var usernamesPromise = new Promise(function(resolve, reject){
        J.getJSON(reqUrl, function(data, textStatus, jqXHR){
            J.each(data, function(userID, aliases){
                library.usernames[userID] = aliases;
            });
            resolve(data);
        });
    });
    
    return usernamesPromise;
};

/**
 * Duplicate existing Items from this library and save to foreignLibrary
 * with relationships indicating the ties. At time of writing, Zotero client
 * saves the relationship with either the destination group of two group
 * libraries or the personal library.
 * @param  {Zotero.Item[]} items
 * @param  {Zotero.Library} foreignLibrary
 * @return {Promise.Zotero.Item[]} - newly created items
 */
Zotero.Library.prototype.sendToLibrary = function(items, foreignLibrary){
    var foreignItems = [];
    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var newForeignItem = new Zotero.Item();
        newForeignItem.apiObj = J.extend({}, items[i].apiObj);
        //clear data that shouldn't be transferred:itemKey, collections
        delete newForeignItem.apiObj.itemKey;
        delete newForeignItem.apiObj.itemVersion;
        newForeignItem.apiObj.collections = [];
        
        newForeignItem.pristine = J.extend({}, newForeignItem.apiObj);
        newForeignItem.initSecondaryData();
        
        //set relationship to tie to old item
        if(!newForeignItem.apiObj.relations){
            newForeignItem.apiObj.relations = {};
        }
        newForeignItem.apiObj.relations['owl:sameAs'] = Zotero.url.relationUrl(item.owningLibrary.libraryType, item.owningLibrary.libraryID, item.itemKey);
        foreignItems.push(newForeignItem);
    }
    return foreignLibrary.items.writeItems(foreignItems);
};

/*METHODS FOR WORKING WITH THE ENTIRE LIBRARY -- NOT FOR GENERAL USE */

//sync pull:
//upload changed data
// get updatedVersions for collections
// get updatedVersions for searches
// get upatedVersions for items
// (sanity check versions we have for individual objects?)
// loadCollectionsFromKeys
// loadSearchesFromKeys
// loadItemsFromKeys
// process updated objects:
//      ...
// getDeletedData
// process deleted
// checkConcurrentUpdates (compare Last-Modified-Version from collections?newer request to one from /deleted request)

Zotero.Library.prototype.updatedVersions = function(target, version){
    Z.debug("Library.updatedVersions", 3);
    var library = this;
    if(typeof target === "undefined"){
        target = "items";
    }
    if(typeof version === "undefined" || (version === null) ){
        version = library.libraryVersion;
    }
    var urlconf = {
        target: target,
        format: 'versions',
        libraryType: library.libraryType,
        libraryID: library.libraryID,
        newer: version
    };
    return library.ajaxRequest(urlconf);
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var library = this;
    //var d = library.loadFromKeysParallel(keys, "items");
    return library.loadFromKeysSerial(keys, "items");
};

//keys is an array of collectionKeys from this library that we need to download
Zotero.Library.prototype.loadCollectionsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var library = this;
    //var d = library.loadFromKeysParallel(keys, "collections");
    return library.loadFromKeysSerial(keys, "collections");
};

//keys is an array of searchKeys from this library that we need to download
Zotero.Library.prototype.loadSeachesFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var library = this;
    //var d = library.loadFromKeysParallel(keys, "searches");
    return library.loadFromKeysSerial(keys, "searches");
};

Zotero.Library.prototype.loadFromKeysParallel = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeysParallel", 3);
    if(!objectType) objectType = 'items';
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var promises = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        var promise;
        switch (objectType) {
            case "items":
                promise = library.loadItemsSimple({
                    'target':'items',
                    'targetModifier':null,
                    'itemKey':keystring,
                    'limit':50
                } );
                break;
            case "collections":
                promise = library.loadCollectionsSimple({
                    'target':'collections',
                    'targetModifier':null,
                    'collectionKey':keystring,
                    'limit':50
                } );
                break;
            case "searches":
                promise = library.loadSearchesSimple({
                    'target':'searches',
                    'searchKey':keystring,
                    'limit':50
                });
                break;
        }
        promises.push(promise );
    });
    
    return Promise.all(promises);
};

Zotero.Library.prototype.loadFromKeysSerial = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeysSerial", 3);
    if(!objectType) objectType = 'items';
    var library = this;
    var keyslices = [];
    while(keys.length > 0){
        keyslices.push(keys.splice(0, 50));
    }
    
    var requestObjects = [];
    J.each(keyslices, function(ind, keyslice){
        var keystring = keyslice.join(',');
        switch (objectType) {
            case "items":
                requestObjects.push({
                    url: Zotero.ajax.apiRequestString({
                        'target':'items',
                        'targetModifier':null,
                        'itemKey':keystring,
                        'limit':50,
                        'content':'json',
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    }),
                    options: {
                        type: 'GET',
                        success: J.proxy(library.processLoadedItems, library)
                    },
                });
                break;
            case "collections":
                requestObjects.push({
                    url: Zotero.ajax.apiRequestString({
                        'target':'collections',
                        'targetModifier':null,
                        'collectionKey':keystring,
                        'limit':50,
                        'content':'json',
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    }),
                    options: {
                        type: 'GET',
                        success: J.proxy(library.processLoadedCollections, library)
                    },
                });
                break;
            case "searches":
                requestObjects.push({
                    url: Zotero.ajax.apiRequestString({
                        'target':'searches',
                        'targetModifier':null,
                        'searchKey':keystring,
                        'limit':50,
                        'content':'json',
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    }),
                    options: {
                        type: 'GET',
                        //success: J.proxy(library.processLoadedItems, library)
                    },
                });
                break;
        }
    });
    
    return library.sequentialRequests(requestObjects);
};

//publishes: displayedItemsUpdated
//assume we have up to date information about items in indexeddb.
//build a list of indexedDB filter requests to then intersect to get final result
Zotero.Library.prototype.buildItemDisplayView = function(params) {
    Z.debug("Zotero.Library.buildItemDisplayView", 3);
    Z.debug(params, 4);
    //start with list of all items if we don't have collectionKey
    //otherwise get the list of items in that collection
    var library = this;
    library.itemKeys = Object.keys(library.items.itemObjects);
    
    //short-circuit if we don't have an initialized IDB yet
    if(!library.idbLibrary.db){
        return false;
    }
        
    var filterPromises = [];
    
    var itemKeys;
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            filterPromises.push(library.idbLibrary.filterItems('deleted', 1));
            //filterPromises.push(library.idbLibrary.getOrderedItemKeys('title'));
        }
        else{
            filterPromises.push(library.idbLibrary.filterItems('collectionKeys', params.collectionKey));
        }
    }
    else {
        filterPromises.push(library.idbLibrary.getOrderedItemKeys('title'));
    }
    
    //filter by selected tags
    var selectedTags = params.tag || [];
    if(typeof selectedTags == 'string') selectedTags = [selectedTags];
    for(var i = 0; i < selectedTags.length; i++){
        Z.debug('adding selected tag filter:', 3)
        filterPromises.push(library.idbLibrary.filterItems('itemTagStrings', selectedTags[i]));
    }
    
    //TODO: filter by search term. 
    //(need full text array or to decide what we're actually searching on to implement this locally)
    
    //when all the filters have been applied, combine and sort
    return Promise.all(filterPromises)
    .then(function(results){
        for(var i = 0; i < results.length; i++){
            Z.debug("result from filterPromise: " + results[i].length, 3);
            Z.debug(results[i], 3);
        }
        var finalItemKeys = library.idbLibrary.intersectAll(results);
        itemsArray = library.items.getItems(finalItemKeys);
        
        Z.debug("All filters applied - Down to " + itemsArray.length + ' items displayed', 3);
        
        Z.debug("remove child items and, if not viewing trash, deleted items", 3);
        library.items.displayItemsArray = [];
        for(var i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].parentItemKey){
                continue;
            }
            
            if(params.collectionKey != 'trash' && itemsArray[i].apiObj.deleted){
                continue;
            }
            
            library.items.displayItemsArray.push(itemsArray[i]);
        }
        
        //sort displayedItemsArray by given or configured column
        var orderCol = params['order'] || 'title';
        var sort = params['sort'] || 'asc';
        Z.debug("Sorting by " + orderCol + " - " + sort, 3);
        
        library.items.displayItemsArray.sort(function(a, b){
            var aval = a.get(orderCol);
            var bval = b.get(orderCol);
            
            //Z.debug("comparing '" + aval + "' to '" + bval +"'");
            if(typeof aval == 'string'){
                return aval.localeCompare(bval);
            }
            else {
                return (aval - bval);
            }
        });
        
        if(sort == 'desc'){
            Z.debug("sort is desc - reversing array", 4);
            library.items.displayItemsArray.reverse();
        }
        
        //publish event signalling we're done
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        library.trigger("displayedItemsUpdated");
    });
};

Zotero.Library.prototype.trigger = function(eventType, data){
    var library = this;
    Zotero.trigger(eventType, data, library.libraryString);
}

Zotero.Library.prototype.listen = function(events, handler, data){
    var library = this;
    var filter = library.libraryString;
    Zotero.listen(events, handler, data, filter);
}
Zotero.Entry = function(){
    this.instance = "Zotero.Entry";
    this.version = 0;
};

Zotero.Entry.prototype.dumpEntry = function(){
    var entry = this;
    var dump = {};
    var dataProperties = [
        'version',
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        dump[dataProperties[i]] = entry[dataProperties[i]];
    }
    return dump;
};

Zotero.Entry.prototype.loadDumpEntry = function(dump){
    var dataProperties = [
        'version',
        'title',
        'author',
        'id',
        'published',
        'dateAdded',
        'updated',
        'dateModified',
        'links'
    ];
    for (var i = 0; i < dataProperties.length; i++) {
        this[dataProperties[i]] = dump[dataProperties[i]];
    }
    return this;
};

Zotero.Entry.prototype.dump = Zotero.Entry.prototype.dumpEntry;

Zotero.Entry.prototype.parseXmlEntry = function(eel){
    Z.debug("Zotero.Entry.parseXmlEntry", 4);
    var entry = this;
    entry.version = eel.children("zapi\\:version").text();
    entry.title = eel.children("title").text();
    
    entry.author = {};
    entry.author["name"] = eel.children("author").children("name").text();
    entry.author["uri"] = eel.children("author").children("uri").text();
    
    entry.id = eel.children('id').first().text();
    
    entry.published = eel.children("published").text();
    entry.dateAdded = entry.published;
    
    entry.updated = eel.children("updated").text();
    entry.dateModified = entry.updated;
    
    var links = {};
    eel.children("link").each(function(){
        var rel = J(this).attr("rel");
        links[rel] = {
            rel  : J(this).attr("rel"),
            type : J(this).attr("type"),
            href : J(this).attr("href"),
            length: J(this).attr('length')
        };
    });
    entry.links = links;
};

//associate Entry with a library so we can update it on the server
Zotero.Entry.prototype.associateWithLibrary = function(library){
    var entry = this;
    entry.libraryUrlIdentifier = library.libraryUrlIdentifier;
    entry.libraryType = library.libraryType;
    entry.libraryID = library.libraryID;
    entry.owningLibrary = library;
    return entry;
};
Zotero.Collections = function(feed){
    var collections = this;
    this.instance = "Zotero.Collections";
    this.collectionsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.collectionsArray = [];
    this.dirty = false;
    this.loaded = false;
    this.collectionObjects = {};
    
    if(typeof feed == 'undefined'){
        return;
    }
    else{
        this.addCollectionsFromFeed(feed);
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype.dump = function(){
    var dump = {};
    dump.instance = "Zotero.Collections";
    dump.collectionsVersion = this.collectionsVersion;
    dump.collectionsArray = [];
    for (var i = 0; i < this.collectionsArray.length; i++) {
        dump.collectionsArray.push(this.collectionsArray[i].dump());
    }
    
    dump.dirty = this.dirty;
    dump.loaded = this.loaded;
    return dump;
};

Zotero.Collections.prototype.loadDump = function(dump){
    var collections = this;
    collections.collectionsVersion = dump.collectionsVersion;
    collections.dirty = dump.dirty;
    collections.loaded = dump.loaded;
    
    for (var i = 0; i < dump.collectionsArray.length; i++) {
        var collection = new Zotero.Collection();
        collection.loadDump(dump.collectionsArray[i]);
        collections.addCollection(collection);
    }
    
    //populate the secondary data structures
    collections.initSecondaryData();
    return collections;
};

//build up secondary data necessary to rendering and easy operations but that
//depend on all collections already being present
Zotero.Collections.prototype.initSecondaryData = function(){
    Z.debug("Zotero.Collections.initSecondaryData", 3);
    var collections = this;
    
    //rebuild collectionsArray
    collections.collectionsArray = [];
    J.each(collections.collectionObjects, function(ind, collection){
        collections.collectionsArray.push(collection);
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    collections.nestCollections();
    collections.assignDepths(0, collections.collectionsArray);
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    Zotero.debug("Zotero.Collections.addCollection", 4);
    Zotero.debug(collection.collectionKey, 4);
    this.collectionsArray.push(collection);
    this.collectionObjects[collection.collectionKey] = collection;
    if(this.owningLibrary){
        collection.associateWithLibrary(this.owningLibrary);
    }
    
    return this;
};

Zotero.Collections.prototype.addCollectionsFromFeed = function(feed){
    var collections = this;
    var collectionsAdded = [];
    feed.entries.each(function(index, entry){
        var collection = new Zotero.Collection(J(entry) );
        collections.addCollection(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
};

Zotero.Collections.prototype.sortByTitleCompare = function(a, b){
    if(a.get('title').toLowerCase() == b.get('title').toLowerCase()){
        return 0;
    }
    if(a.get('title').toLowerCase() < b.get('title').toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Collections.prototype.assignDepths = function(depth, cArray){
    Z.debug("Zotero.Collections.assignDepths", 3);
    var collections = this;
    var insertchildren = function(depth, children){
        J.each(children, function(index, col){
            col.nestingDepth = depth;
            if(col.hasChildren){
                insertchildren((depth + 1), col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            collection.nestingDepth = 1;
            if(collection.hasChildren){
                insertchildren(2, collection.children);
            }
        }
    });
};

Zotero.Collections.prototype.nestedOrderingArray = function(){
    Z.debug("Zotero.Collections.nestedOrderingArray", 3);
    var collections = this;
    var nested = [];
    var insertchildren = function(a, children){
        J.each(children, function(index, col){
            a.push(col);
            if(col.hasChildren){
                insertchildren(a, col.children);
            }
        });
    };
    J.each(collections.collectionsArray, function(index, collection){
        if(collection.topLevel){
            nested.push(collection);
            if(collection.hasChildren){
                insertchildren(nested, collection.children);
            }
        }
    });
    Z.debug("Done with nestedOrderingArray", 3);
    return nested;
};

Zotero.Collections.prototype.getCollection = function(key){
    if(this.collectionObjects.hasOwnProperty(key)){
        return this.collectionObjects[key];
    }
    else{
        return false;
    }
};

Zotero.Collections.prototype.remoteDeleteCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollection(collectionKey);
};

Zotero.Collections.prototype.removeLocalCollection = function(collectionKey){
    var collections = this;
    return collections.removeLocalCollections([collectionKey]);
};

Zotero.Collections.prototype.removeLocalCollections = function(collectionKeys){
    var collections = this;
    //delete Collection from collectionObjects
    for(var i = 0; i < collectionKeys.length; i++){
        delete collections.collectionObjects[collectionKeys[i]];
    }
    
    //rebuild collectionsArray
    collections.initSecondaryData();
};

//reprocess all collections to add references to children inside their parents
Zotero.Collections.prototype.nestCollections = function(){
    var collections = this;
    //clear out all child references so we don't duplicate
    J.each(collections.collectionsArray, function(ind, collection){
        collection.children = [];
    });
    
    collections.collectionsArray.sort(collections.sortByTitleCompare);
    J.each(collections.collectionsArray, function(ind, collection){
        collection.nestCollection(collections.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(collectionsArray){
    Z.debug('Zotero.Collections.writeCollections', 3);
    var collections = this;
    var library = collections.owningLibrary;
    var returnCollections = [];
    var writeCollections = [];
    var i;
    
    var config = {
        'target':'collections',
        'libraryType':collections.owningLibrary.libraryType,
        'libraryID':collections.owningLibrary.libraryID,
        'content':'json'
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var writeChunks = [];
    var writeChunkCounter = 0;
    var rawChunkObjects = [];
    var chunkSize = 50;
    
    var collection;
    for(i = 0; i < collectionsArray.length; i++){
        collection = collectionsArray[i];
        var collectionKey = collection.get('collectionKey');
        if(!collectionKey) {
            var newCollectionKey = Zotero.utils.getKey();
            collection.set("collectionKey", newCollectionKey);
            collection.set("collectionVersion", 0);
        }
        
    }
    for(i = 0; i < collectionsArray.length; i = i + chunkSize){
        writeChunks.push(collectionsArray.slice(i, i+chunkSize));
    }
    
    for(i = 0; i < writeChunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < writeChunks[i].length; j++){
            rawChunkObjects[i].push(writeChunks[i][j].writeApiObj());
            Z.debug("Collection Write API Object: ");
            Z.debug(writeChunks[i][j].writeApiObj());
        }
    }
    
    //update collections with server response if successful
    var writeCollectionsSuccessCallback = function(response){
        Z.debug("writeCollections successCallback", 3);
        Z.debug(response, 3);
        Zotero.utils.updateObjectsFromWriteResponse(this.writeChunk, response.jqxhr);
        //save updated collections to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateCollections(this.writeChunk);
        }
        
        returnCollections = returnCollections.concat(this.writeChunk);
    };
    
    Z.debug("collections.collectionsVersion: " + collections.collectionsVersion, 3);
    Z.debug("collections.libraryVersion: " + collections.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            //returnCollections: returnCollections,
            library: library,
        };
        
        requestData = JSON.stringify({collections: rawChunkObjects[i]});
        requestObjects.push({
            url: requestUrl,
            options: {
                type: 'POST',
                data: requestData,
                processData: false,
                headers:{
                    //'If-Unmodified-Since-Version': collections.collectionsVersion,
                    'Content-Type': 'application/json'
                },
                success: J.proxy(writeCollectionsSuccessCallback, successContext),
            },
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(sequentialPromises){
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        Z.debug(returnCollections);
        Z.debug("adding returnCollections to library.collections");
        J.each(returnCollections, function(ind, collection){
            collections.addCollection(collection);
        });
        collections.initSecondaryData();
        return returnCollections;
    })
    .catch(function(err){
        Z.debug(err);
    });
};
Zotero.Items = function(feed){
    this.instance = "Zotero.Items";
    //represent items as array for ordering purposes
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayItemsArray = [];
    this.displayItemsUrl = '';
    this.itemObjects = {};
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    
    if(typeof feed != 'undefined'){
        this.addItemsFromFeed(feed);
    }
};

Zotero.Items.prototype.dump = function(){
    Z.debug("Zotero.Items.dump", 3);
    var items = this;
    var dump = {};
    dump.instance = "Zotero.Items.dump";
    dump.itemsVersion = this.itemsVersion;
    dump.itemsArray = [];
    J.each(items.itemObjects, function(key, val){
        Z.debug("dumping item " + key + " : " + val.itemKey, 3);
        dump.itemsArray.push(val.dump());
    });
    return dump;
};

Zotero.Items.prototype.loadDump = function(dump){
    Z.debug("-------------------------------Zotero.Items.loadDump", 3);
    Z.debug("dump.itemsVersion: " + dump.itemsVersion, 3);
    Z.debug("dump.itemsArray length: " + dump.itemsArray.length, 3);
    this.itemsVersion = dump.itemsVersion;
    var items = this;
    var itemKeys = [];
    for (var i = 0; i < dump.itemsArray.length; i++) {
        var item = new Zotero.Item();
        item.loadDump(dump.itemsArray[i]);
        items.addItem(item);
        itemKeys.push(item.itemKey);
    }
    
    if(items.owningLibrary){
        items.owningLibrary.itemKeys = itemKeys;
    }
    
    //add child itemKeys to parent items to make getChildren work locally
    var parentItem;
    J.each(items.itemObjects, function(ind, item){
        if(item.parentKey){
            parentItem = items.getItem(item.parentKey);
            if(parentItem !== false){
                parentItem.childItemKeys.push(item.itemKey);
            }
        }
    });
    //TODO: load secondary data structures
    //nothing to do here yet? display items array is separate - populated with itemKey request
    
    return this;
};

Zotero.Items.prototype.getItem = function(key){
    if(this.itemObjects.hasOwnProperty(key)){
        return this.itemObjects[key];
    }
    return false;
};

Zotero.Items.prototype.getItems = function(keys){
    var items = this;
    var gotItems = [];
    for(var i = 0; i < keys.length; i++){
        gotItems.push(items.getItem(keys[i]));
    }
    return gotItems;
};

Zotero.Items.prototype.loadDataObjects = function(itemsArray){
    //Z.debug("Zotero.Items.loadDataObjects", 3);
    var loadedItems = [];
    var libraryItems = this;
    J.each(itemsArray, function(index, dataObject){
        var itemKey = dataObject['itemKey'];
        var item = new Zotero.Item();
        item.loadObject(dataObject);
        libraryItems.itemObjects[itemKey] = item;
        loadedItems.push(item);
    });
    return loadedItems;
};

Zotero.Items.prototype.addItem = function(item){
    this.itemObjects[item.itemKey] = item;
    if(this.owningLibrary){
        item.associateWithLibrary(this.owningLibrary);
    }
    return this;
};

Zotero.Items.prototype.addItemsFromFeed = function(feed){
    var items = this;
    var itemsAdded = [];
    feed.entries.each(function(index, entry){
        var item = new Zotero.Item(J(entry) );
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

//return array of itemKeys that we don't have a copy of
Zotero.Items.prototype.keysNotInItems = function(keys){
    var notPresent = [];
    J.each(keys, function(ind, val){
        if(!this.itemObjects.hasOwnProperty(val)){
            notPresent.push(val);
        }
    });
    return notPresent;
};

//Remove item from local set if it has been marked as deleted by the server
Zotero.Items.prototype.remoteDeleteItem = function(key){
    var items = this;
    if(items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true){
        delete items.itemObjects[key];
        return true;
    }
    return false;
};

Zotero.Items.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Items.deleteItem", 3);
    var items = this;
    var item;
    
    if(!itemKey) return false;
    if(typeof itemKey == 'string'){
        item = items.getItem(itemKey);
    }
    else if(typeof itemKey == 'object' && itemKey.instance == 'Zotero.Item'){
        item = itemKey;
    }
    
    var config = {
        'target':'item',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
        'itemKey':item.itemKey
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    return Zotero.ajaxRequest(requestUrl, "DELETE",
        {processData: false,
         headers:{"If-Unmodified-Since-Version":item.itemVersion}
        }
    );
};

Zotero.Items.prototype.deleteItems = function(deleteItems, version){
    //TODO: split into multiple requests if necessary
    Z.debug("Zotero.Items.deleteItems", 3);
    var items = this;
    var deleteKeys = [];
    var i;
    if((!version) && (items.itemsVersion !== 0)){
        version = items.itemsVersion;
    }
    
    //make sure we're working with item keys, not items
    for(i = 0; i < deleteItems.length; i++){
        if(!deleteItems[i]) continue;
        if(typeof deleteItems[i] == 'string'){
            //entry is an itemKey string
            deleteKeys.push(deleteItems[i]);
        }
        else {
            //entry is a Zotero.Item
            deleteKeys.push(deleteItems[i].itemKey);
        }
    }
    
    //split keys into chunks of 50 per request
    var deleteChunks = [];
    var writeChunkCounter = 0;
    var chunkSize = 50;
    for(i = 0; i < deleteKeys.length; i = i + chunkSize){
        deleteChunks.push(deleteKeys.slice(i, i+chunkSize));
    }
    
    var deletePromise = Promise.resolve();
    
    J.each(deleteChunks, function(index, chunk){
        var deleteKeysString = chunk.join(',');
        var config = {'target':'items',
                      'libraryType':items.owningLibrary.libraryType,
                      'libraryID':items.owningLibrary.libraryID,
                      'itemKey': deleteKeysString};
        
        var headers = {'Content-Type': 'application/json'};
        
        headers['If-Unmodified-Since-Version'] = version;
        
        deletePromise.then(function(){
            return items.owningLibrary.ajaxRequest(config, 'DELETE',
                {processData: false,
                 headers:headers
                }
            );
        }).then(function(response){
            version = response.jqxhr.getResponseHeader("Last-Modified-Version");
            var deleteProgress = index / deleteChunks.length;
            Zotero.trigger("deleteProgress", {'progress': deleteProgress});
        });
    });
    /*
    deletePromise.catch(function(response){
        Z.debug("Failed to delete some items");
        Zotero.ajax.errorCallback(response);
    });
    */
    return deletePromise;
};

Zotero.Items.prototype.trashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 1);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.untrashItems = function(itemsArray){
    var items = this;
    var i;
    for(i = 0; i < itemsArray.length; i++){
        var item = itemsArray[i];
        item.set('deleted', 0);
    }
    return items.writeItems(itemsArray);
};

Zotero.Items.prototype.findItems = function(config){
    var items = this;
    var matchingItems = [];
    J.each(items.itemObjects, function(i, item){
        if(config.collectionKey && (J.inArray(config.collectionKey, item.apiObj.collections === -1) )){
            return;
        }
        matchingItems.push(items.itemObjects[i]);
    });
    return matchingItems;
};

//accept an array of 'Zotero.Item's
Zotero.Items.prototype.writeItems = function(itemsArray){
    var items = this;
    var library = items.owningLibrary;
    var returnItems = [];
    var writeItems = [];
    var i;
    
    //process the array of items, pulling out child notes/attachments to write
    //separately with correct parentItem set and assign generated itemKeys to
    //new items
    var item;
    for(i = 0; i < itemsArray.length; i++){
        item = itemsArray[i];
        //generate an itemKey if the item does not already have one
        var itemKey = item.get('itemKey');
        if(itemKey === "" || itemKey === null) {
            var newItemKey = Zotero.utils.getKey();
            item.set("itemKey", newItemKey);
            item.set("itemVersion", 0);
        }
        //items that already have item key always in first pass, as are their children
        writeItems.push(item);
        if(item.hasOwnProperty('notes') && item.notes.length > 0){
            for(var j = 0; j < item.notes.length; j++){
                item.notes[j].set('parentItem', item.get('itemKey'));
            }
            writeItems = writeItems.concat(item.notes);
        }
        if(item.hasOwnProperty('attachments') && item.attachments.length > 0){
            for(var k = 0; k < item.attachments.length; k++){
                item.attachments[k].set('parentItem', item.get('itemKey'));
            }
            writeItems = writeItems.concat(item.attachments);
        }
    }
    
    var config = {
        'target':'items',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
        'content':'json'
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    
    var writeChunks = [];
    var writeChunkCounter = 0;
    var rawChunkObjects = [];
    var chunkSize = 50;
    for(i = 0; i < writeItems.length; i = i + chunkSize){
        writeChunks.push(writeItems.slice(i, i+chunkSize));
    }
    
    for(i = 0; i < writeChunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < writeChunks[i].length; j++){
            rawChunkObjects[i].push(writeChunks[i][j].writeApiObj());
        }
    }
    
    //update item with server response if successful
    var writeItemsSuccessCallback = function(response){
        Z.debug("writeItem successCallback", 3);
        Z.debug(response, 3);
        Z.debug("successCode: " + response.jqxhr.status, 3);
        Zotero.utils.updateObjectsFromWriteResponse(this.writeChunk, response.jqxhr);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateItems(this.writeChunk);
        }
        
        this.returnItems = this.returnItems.concat(this.writeChunk);
        Zotero.trigger("itemsChanged", {library:this.library});
        Z.debug("done with writeItemsSuccessCallback", 3);
    };
    
    Z.debug("items.itemsVersion: " + items.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + items.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            returnItems: returnItems,
            library: library,
        };
        
        requestData = JSON.stringify({items: rawChunkObjects[i]});
        requestObjects.push({
            url: requestUrl,
            options: {
                type: 'POST',
                data: requestData,
                processData: false,
                headers:{
                    //'If-Unmodified-Since-Version': items.itemsVersion,
                    'Content-Type': 'application/json'
                },
                success: J.proxy(writeItemsSuccessCallback, successContext),
            },
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(sequentialPromises){
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return returnItems;
    });
};

Zotero.Items.prototype.writeNewUnsyncedItems = function(){
    var items = this;
    var library = items.owningLibrary;
    var urlConfig = {target:'items', libraryType:library.libraryType, libraryID:library.libraryID};
    var writeUrl = Zotero.ajax.apiRequestUrl(urlConfig) + Zotero.ajax.apiQueryString(urlConfig);
    var writeData = {};
    writeData.items = [];
    for(var i = 0; i < items.newUnsyncedItems.length; i++){
        writeData.items.push(items.newUnsyncedItems[i].apiObj);
    }
    
    //make request to api to write items
    return Zotero.ajaxRequest(writeUrl, 'POST', {data:writeData})
    .then(function(response){
        if(response.jqxhr.status !== 200){
            //request atomically failed, nothing went through
        }
        else {
            //request went through and was processed
            //must check response body to know if writes failed for any reason
            var updatedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
            if(typeof response.data !== 'object'){
                //unexpected response from server
            }
            var failedIndices = {};
            if(response.data.hasOwnProperty('success')){
                //add itemkeys to any successful creations
                J.each(response.data.success, function(key, val){
                    var index = parseInt(key, 10);
                    var objectKey = val;
                    var item = items.newUnsyncedItems[index];
                    
                    item.updateItemKey(objectKey);
                    item.itemVersion = updatedVersion;
                    item.synced = true;
                    items.addItem(item);
                });
            }
            if(response.data.hasOwnProperty('unchanged') ){
                J.each(response.data.unchanged, function(key, val){
                    
                });
            }
            if(response.data.hasOwnProperty('failed') ){
                J.each(response.data.failed, function(key, val){
                    failedIndices[key] = true;
                    Z.debug("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message, 1);
                });
            }
            
            //remove all but failed writes from newUnsyncedItems
            var newnewUnsyncedItems = [];
            J.each(items.newUnsyncedItems, function(i, v){
                if(failedIndices.hasOwnProperty(i)){
                    newnewUnsyncedItems.push(v);
                }
            });
            items.newUnsyncedItems = newnewUnsyncedItems;
        }
    });
};
Zotero.Tags = function(feed){
    this.instance = "Zotero.Tags";
    //represent collections as array for ordering purposes
    this.tagsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
    this.loaded = false;
    if(typeof feed != 'undefined'){
        this.addTagsFromFeed(feed);
    }
};

Zotero.Tags.prototype.dump = function(){
    var dump = {};
    dump.tagsVersion = this.tagsVersion;
    dump.tagsArray = [];
    for (var i = 0; i < this.tagsArray.length; i++) {
        dump.tagsArray.push(this.tagsArray[i].dump());
    }
    dump.displayTagsUrl = this.displayTagsUrl;
    return dump;
};

Zotero.Tags.prototype.loadDump = function(dump){
    this.tagsVersion = dump.tagsVersion;
    this.displayTagsUrl = dump.displayTagsUrl;
    for (var i = 0; i < dump.tagsArray.length; i++) {
        var tag = new Zotero.Tag();
        tag.loadDump(dump.tagsArray[i]);
        this.addTag(tag);
    }
    
    this.updateSecondaryData();
    return this;
};

Zotero.Tags.prototype.addTag = function(tag){
    this.tagObjects[tag.title] = tag;
    this.tagsArray.push(tag);
    if(this.owningLibrary){
        tag.associateWithLibrary(this.owningLibrary);
    }
};

Zotero.Tags.prototype.getTag = function(tagname){
    var tags = this;
    if(tags.tagObjects.hasOwnProperty(tagname)){
        return this.tagObjects[tagname];
    }
    return null;
};

Zotero.Tags.prototype.removeTag = function(tagname){
    var tags = this;
    delete tags.tagObjects[tagname];
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.removeTags = function(tagnames){
    var tags = this;
    J.each(tagnames, function(i, tagname){
        delete tags.tagObjects[tagname];
    });
    tags.updateSecondaryData();
};

Zotero.Tags.prototype.plainTagsList = function(tagsArray){
    Z.debug("Zotero.Tags.plainTagsList", 3);
    var plainList = [];
    J.each(tagsArray, function(index, element){
        plainList.push(element.title);
    });
    return plainList;
};

Zotero.Tags.prototype.clear = function(){
    Z.debug("Zotero.Tags.clear", 3);
    this.tagsVersion = 0;
    this.syncState.earliestVersion = null;
    this.syncState.latestVersion = null;
    this.displayTagsArray = [];
    this.displayTagsUrl = '';
    this.tagObjects = {};
    this.tagsArray = [];
};

Zotero.Tags.prototype.updateSecondaryData = function(){
    Z.debug("Zotero.Tags.updateSecondaryData", 3);
    var tags = this;
    tags.tagsArray = [];
    J.each(tags.tagObjects, function(key, val){
        tags.tagsArray.push(val);
    });
    tags.tagsArray.sort(Zotero.Library.prototype.sortByTitleCompare);
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.sortLower);
    tags.plainList = plainList;
};

Zotero.Tags.prototype.addTagsFromFeed = function(feed){
    Z.debug('Zotero.Tags.addTagsFromFeed', 3);
    var tags = this;
    var tagsAdded = [];
    feed.entries.each(function(index, entry){
        var tag = new Zotero.Tag(J(entry));
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
Zotero.Groups = function(feed){
    this.instance = 'Zotero.Groups';
    this.groupsArray = [];
};

Zotero.Groups.prototype.sortByTitleCompare = function(a, b){
    Z.debug("compare by key: " + a + " < " + b + " ?", 4);
    if(a.title.toLowerCase() == b.title.toLowerCase()){
        return 0;
    }
    if(a.title.toLowerCase() < b.title.toLowerCase()){
        return -1;
    }
    return 1;
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey){
    
};

Zotero.Groups.prototype.addGroupsFromFeed = function(groupsFeed){
    var groups = this;
    var groupsAdded = [];
    groupsFeed.entries.each(function(index, entry){
        var group = new Zotero.Group(J(entry) );
        groups.groupsArray.push(group);
        groupsAdded.push(group);
    });
    return groupsAdded;
};

Zotero.Groups.prototype.fetchUserGroups = function(userID, apikey){
    var groups = this;
    var aparams = {
        'target':'userGroups',
        'libraryType':'user',
        'libraryID': userID,
        'content':'json',
        'order':'title'
    };
    
    if(apikey){
        aparams['key'] = apikey;
    }
    else if(groups.owningLibrary) {
        aparams['key'] = groups.owningLibrary._apiKey;
    }
    
    return Zotero.ajaxRequest(aparams)
    .then(function(response){
        Z.debug('fetchUserGroups proxied callback', 3);
        var groupsfeed = new Zotero.Feed(response.data, response.jqxhr);
        fetchedGroups = groups.addGroupsFromFeed(groupsfeed);
        return fetchedGroups;
    });
};

Zotero.Searches = function(){
    this.instance = "Zotero.Searches";
    this.searchObjects = {};
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
};
Zotero.Deleted = function(data){
    this.instance = "Zotero.Deleted";
    if(typeof data === 'string'){
        this.deletedData = JSON.parse(data);
    }
    else {
        this.deletedData = data;
    }
    this.deletedVersion = null;
    this.newerVersion = null;
};
Zotero.Collection = function(entryEl){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.collectionVersion = 0;
    this.synced = false;
    this.pristine = null;
    this.apiObj = {
        'name': '',
        'collectionKey': '',
        'parentCollection': false,
        'collectionVersion': 0,
        'relations': {}
    };
    this.children = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlCollection(entryEl);
    }
};

Zotero.Collection.prototype = new Zotero.Entry();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.collectionKey = collectionKey;
    collection.apiObj.collectionKey = collectionKey;
    return collection;
};

Zotero.Collection.prototype.dump = function(){
    Zotero.debug("Zotero.Collection.dump", 4);
    var collection = this;
    var dump = collection.dumpEntry();
    var dumpProperties = [
        'apiObj',
        'pristine',
        'collectionKey',
        'collectionVersion',
        'synced',
        'numItems',
        'numCollections',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys',
    ];

    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = collection[dumpProperties[i]];
    }
    return dump;
};

Zotero.Collection.prototype.loadDump = function(dump){
    Zotero.debug("Zotero.Collection.loaddump", 4);
    var collection = this;
    collection.loadDumpEntry(dump);
    var dumpProperties = [
        'apiObj',
        'pristine',
        'collectionKey',
        'collectionVersion',
        'synced',
        'numItems',
        'numCollections',
        'topLevel',
        'websiteCollectionLink',
        'hasChildren',
        'itemKeys',
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        collection[dumpProperties[i]] = dump[dumpProperties[i]];
    }

    collection.initSecondaryData();
    return collection;
};

Zotero.Collection.prototype.parseXmlCollection = function(cel) {
    var collection = this;
    collection.parseXmlEntry(cel);
    
    collection.name = cel.find("title").text();
    collection.collectionKey = cel.find("zapi\\:key, key").text();
    collection.numItems = parseInt(cel.find("zapi\\:numItems, numItems").text(), 10);
    collection.numCollections = parseInt(cel.find("zapi\\:numCollections, numCollections").text(), 10);
    collection.dateAdded = collection.published;//cel.find("published").text();
    collection.dateModified = collection.updated;//cel.find("updated").text();
    
    collection.parentCollection = false;
    collection.topLevel = true;
    
    //parse the JSON content block
    //possibly we should test to make sure it is application/json or zotero json
    var contentEl = cel.find('content').first();
    if(contentEl){
        collection.pristine = JSON.parse(cel.find('content').first().text());
        collection.apiObj = JSON.parse(cel.find('content').first().text());
        
        collection.synced = true;
    }
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;

    collection['name'] = collection.apiObj['name'];
    collection['parentCollection'] = collection.apiObj['parentCollection'];
    if(collection['parentCollection']){
        collection.topLevel = false;
    }
    collection.collectionKey = collection.apiObj.collectionKey;
    collection.collectionVersion = collection.apiObj.collectionVersion;
    collection.relations = collection.apiObj.relations;
    
    if(Zotero.config.libraryPathString){
        collection.websiteCollectionLink = Zotero.config.libraryPathString + 
        '/collectionKey/' + collection.collectionKey;
    }
    else {
        collection.websiteCollectionLink = '';
    }
    collection.hasChildren = (collection.numCollections) ? true : false;
    
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    if(collection.parentCollection !== false){
        var parentKey = collection.get('parentCollection');
        if(typeof(collectionsObject[parentKey]) !== 'undefined'){
            var parentOb = collectionsObject[parentKey];
            parentOb.children.push(collection);
            parentOb.hasChildren = true;
            collection.topLevel = false;
            return true;
        }
    }
    return false;
};

Zotero.Collection.prototype.addItems = function(itemKeys){
    Z.debug('Zotero.Collection.addItems', 3);
    var collection = this;
    Z.debug(itemKeys, 3);
    var config = {
        'target':'items',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'content':'json'
    };
    var requestUrl = Zotero.ajax.apiRequestUrl(config) + Zotero.ajax.apiQueryString(config);
    var requestData = itemKeys.join(' ');
    
    return Zotero.ajaxRequest(requestUrl, 'POST',
        {data: requestData,
         processData: false
        }
    );
};

Zotero.Collection.prototype.getMemberItemKeys = function(){
    Z.debug('Zotero.Collection.getMemberItemKeys', 3);
    var collection = this;
    var config = {
        'target':'items',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'format':'keys'
    };
    
    return Zotero.ajaxRequest(config, 'GET', {processData: false} )
    .then(function(response){
        Z.debug('getMemberItemKeys proxied callback', 3);
        var result = response.data;
        var keys = J.trim(result).split(/[\s]+/);
        collection.itemKeys = keys;
        return keys;
    });
};

Zotero.Collection.prototype.removeItem = function(itemKey){
    var collection = this;
    var config = {
        'target':'item',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey,
        'itemKey':itemKey
    };
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         cache:false
        }
    );
};

Zotero.Collection.prototype.update = function(name, parentKey){
    var collection = this;
    if(!parentKey) parentKey = false;
    var config = {
        'target':'collection',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey
    };
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    return Zotero.ajaxRequest(config, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    );
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var writeObj = J.extend({}, collection.pristine, collection.apiObj);
    return writeObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        'target':'collection',
        'libraryType':collection.libraryType,
        'libraryID':collection.libraryID,
        'collectionKey':collection.collectionKey
    };
    
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         headers:{
            'If-Unmodified-Since-Version': collection.collectionVersion
         },
         cache:false
        }
    ).then(function(){
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.collectionKey);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.apiObj.name || collection.title;
        case 'collectionKey':
        case 'key':
            return collection.apiObj.collectionKey || collection.collectionKey;
        case 'collectionVersion':
        case 'version':
            return collection.collectionVersion;
        case 'parentCollection':
            return collection.apiObj.parentCollection;
    }
    
    if(key in collection.apiObj){
        return collection.apiObj[key];
    }
    else if(collection.hasOwnProperty(key)){
        return collection[key];
    }
    
    return null;
};

Zotero.Collection.prototype.set = function(key, val){
    var collection = this;
    if(key in collection.apiObj){
        
    }
    switch(key){
        case 'title':
        case 'name':
            collection.name = val;
            collection.apiObj['name'] = val;
            collection.title = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.collectionKey = val;
            collection.apiObj['collectionKey'] = val;
            break;
        case 'parentCollection':
            collection.parentCollection = val;
            collection.apiObj['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.collectionVersion = val;
            collection.apiObj['collectionVersion'] = val;
            break;
    }
    
    if(collection.hasOwnProperty(key)) {
        collection[key] = val;
    }
};
/*
 * TODO: several functions should not work unless we build a fresh item with a template
 * or parsed an item from the api with json content (things that depend on apiObj)
 * There should be a flag to note whether this is the case and throwing on attempts to
 * use these functions when it is not.
 */
Zotero.Item = function(entryEl){
    this.instance = "Zotero.Item";
    this.itemVersion = 0;
    this.itemKey = '';
    this.synced = false;
    this.apiObj = {};
    this.pristine = null;
    this.dataFields = {};
    this.childItemKeys = [];
    this.writeErrors = [];
    this.itemContentTypes = [];
    this.itemContentBlocks = {};
    this.notes = [];
    this.tagstrings = [];
    if(typeof entryEl != 'undefined'){
        this.parseXmlItem(entryEl);
    }
};

Zotero.Item.prototype = new Zotero.Entry();

Zotero.Item.prototype.dump = function(){
    var item = this;
    var dump = item.dumpEntry();
    var dumpProperties = [
        'apiObj',
        'pristine',
        'itemKey',
        'itemVersion',
        'synced',
        'creatorSummary',
        'year',
        'parentItemKey',
        'numChildren'
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = item[dumpProperties[i]];
    }
    //add tagstrings to dump for indexedDB searching purposes
    item.updateTagStrings();
    dump['tagstrings'] = item.tagstrings;
    return dump;
};

Zotero.Item.prototype.loadDump = function(dump){
    var item = this;
    item.loadDumpEntry(dump);
    var dumpProperties = [
        'apiObj',
        'pristine',
        'itemKey',
        'itemVersion',
        'synced',
        'creatorSummary',
        'year',
        'parentItemKey',
        'numChildren'
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        item[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    //TODO: load secondary data structures
    item.numTags = item.apiObj.tags.length;
    item.itemType = item.apiObj.itemType;
    item.initSecondaryData();

    return item;
};

Zotero.Item.prototype.parseXmlItem = function (iel) {
    var item = this;
    item.parseXmlEntry(iel);
    
    //parse entry metadata
    item.itemKey = iel.find("zapi\\:key, key").text();
    item.itemType = iel.find("zapi\\:itemType, itemType").text();
    item.creatorSummary = iel.find("zapi\\:creatorSummary, creatorSummary").text();
    item.year = iel.find("zapi\\:year, year").text();
    item.numChildren = parseInt(iel.find("zapi\\:numChildren, numChildren").text(), 10);
    item.numTags = parseInt(iel.find("zapi\\:numTags, numChildren").text(), 10);
    
    if(isNaN(item.numChildren)){
        item.numChildren = 0;
    }
    
    item.parentItemKey = false;
    
    //parse content block
    var contentEl = iel.children("content");
    //check for multi-content response
    var subcontents = iel.find("zapi\\:subcontent, subcontent");
    if(subcontents.size() > 0){
        for(var i = 0; i < subcontents.size(); i++){
            var sc = J(subcontents.get(i));
            item.parseContentBlock(sc);
        }
    }
    else{
        item.parseContentBlock(contentEl);
    }
};

/**
 * Parse a content or subcontent node based on its type
 * @param  {jQuery wrapped node} cel content or subcontent element
 */
Zotero.Item.prototype.parseContentBlock = function(contentEl){
    var item = this;
    var zapiType = contentEl.attr('zapi:type');
    var contentText = contentEl.text();
    item.itemContentTypes.push(zapiType);
    item.itemContentBlocks[zapiType] = contentText;
    
    switch(zapiType){
        case 'json':
            item.parseJsonItemContent(contentEl);
            break;
        case 'bib':
            item.bibContent = contentText;
            item.parsedBibContent = true;
            break;
        case 'html':
            item.parseXmlItemContent(contentEl);
            break;
    }
};

Zotero.Item.prototype.parseXmlItemContent = function (cel) {
    var item = this;
    var dataFields = {};
    cel.find("div > table").children("tr").each(function(){
        dataFields[J(this).attr("class")] = J(this).children("td").text();
    });
    item.dataFields = dataFields;
};

Zotero.Item.prototype.parseJsonItemContent = function (cel) {
    var item = this;
    if(typeof cel === "string"){
        item.apiObj = JSON.parse(cel);
        item.pristine = JSON.parse(cel);
    }
    else {
        item.apiObj = JSON.parse(cel.text());
        item.pristine = JSON.parse(cel.text());
    }
    
    item.initSecondaryData();
};

//populate property values derived from json content
Zotero.Item.prototype.initSecondaryData = function(){
    var item = this;
    
    item.itemVersion = item.apiObj.itemVersion;
    item.parentItemKey = item.apiObj.parentItem;
    
    if(item.apiObj.itemType == 'attachment'){
        item.mimeType = item.apiObj.contentType;
        item.translatedMimeType = Zotero.utils.translateMimeType(item.mimeType);
    }
    if('linkMode' in item.apiObj){
        item.linkMode = item.apiObj.linkMode;
    }
    
    item.creators = item.apiObj.creators;
    item.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
    
    item.synced = false;

    item.updateTagStrings();
};

Zotero.Item.prototype.updateTagStrings = function(){
    var item = this;
    var tagstrings = [];
    for (i = 0; i < item.apiObj.tags.length; i++) {
        tagstrings.push(item.apiObj.tags[i].tag);
    }
    item.tagstrings = tagstrings;
};

Zotero.Item.prototype.initEmpty = function(itemType, linkMode){
    var item = this;
    return item.getItemTemplate(itemType, linkMode)
    .then(function(template){
        item.initEmptyFromTemplate(template);
        return item;
    });
};

//special case note initialization to guarentee synchronous and simplify some uses
Zotero.Item.prototype.initEmptyNote = function(){
    var item = this;
    item.itemVersion = 0;
    var noteTemplate = {"itemType":"note","note":"","tags":[],"collections":[],"relations":{}};
    
    item.initEmptyFromTemplate(noteTemplate);
    
    return item;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(template){
    var item = this;
    item.itemVersion = 0;
    
    item.itemType = template.itemType;
    item.itemKey = '';
    item.pristine = J.extend({}, template);
    item.apiObj = template;
    
    item.initSecondaryData();
    return item;
};

Zotero.Item.prototype.updateObjectKey = function(objectKey){
    return this.updateItemKey(objectKey);
};

Zotero.Item.prototype.updateItemKey = function(itemKey){
    var item = this;
    item.itemKey = itemKey;
    item.apiObj.itemKey = itemKey;
    item.pristine.itemKey = itemKey;
    return item;
};

/*
 * Write updated information for the item to the api and potentiallyp
 * create new child notes (or attachments?) of this item
 */
Zotero.Item.prototype.writeItem = function(){
    var item = this;
    if(!item.owningLibrary){
        throw new Error("Item must be associated with a library");
    }
    return item.owningLibrary.items.writeItems([item]);
};

//get the JS object to be PUT/POSTed for write
Zotero.Item.prototype.writeApiObj = function(){
    var item = this;
    
    //remove any creators that have no names
    if(item.apiObj.creators){
        var newCreatorsArray = item.apiObj.creators.filter(function(c){
            if(c.name || c.firstName || c.lastName){
                return true;
            }
            return false;
        });
        item.apiObj.creators = newCreatorsArray;
    }
    
    //copy apiObj, extend with pristine to make sure required fields are present
    //and remove unwriteable fields(?)
    var writeApiObj = J.extend({}, item.pristine, item.apiObj);
    return writeApiObj;
};

Zotero.Item.prototype.createChildNotes = function(notes){
    var item = this;
    var childItems = [];
    var childItemPromises = [];
    var initDone = J.proxy(function(templateItem){
        childItems.push(templateItem);
    }, this);
    
    J.each(notes, function(ind, note){
        var childItem = new Zotero.Item();
        var p = childItem.initEmpty('note')
        .then(function(noteItem){
            noteItem.set('note', note.note);
            noteItem.set('parentItem', item.itemKey);
            childItems.push(noteItem);
        });
        childItemPromises.push(p);
    });
    
    return Promise.all(childItemPromises)
    .then(function(){
        return item.owningLibrary.writeItems(childItems);
    });
};

//TODO: implement
Zotero.Item.prototype.writePatch = function(){
    
};

Zotero.Item.prototype.getChildren = function(library){
    var item = this;
    Z.debug("Zotero.Item.getChildren", 3);
    return Promise.resolve()
    .then(function(){
        //short circuit if has item has no children
        if(!(item.numChildren)){//} || (this.parentItemKey !== false)){
            return [];
        }
        
        var config = {
            'target':'children',
            'libraryType':item.libraryType,
            'libraryID':item.libraryID,
            'itemKey':item.itemKey,
            'content':'json'
        };
        
        return Zotero.ajaxRequest(config)
        .then(function(response){
            Z.debug('getChildren proxied callback', 4);
            var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
            var items = library.items;
            var childItems = items.addItemsFromFeed(itemfeed);
            for (var i = childItems.length - 1; i >= 0; i--) {
                childItems[i].associateWithLibrary(library);
            }
            
            return childItems;
        });
    });
};

Zotero.Item.prototype.getItemTypes = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemTypes", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';

    var itemTypes = Zotero.cache.load({locale:locale, target:'itemTypes'});
    if(itemTypes){
        Z.debug("have itemTypes in localStorage", 3);
        Zotero.Item.prototype.itemTypes = itemTypes;//JSON.parse(Zotero.storage.localStorage['itemTypes']);
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var url = Zotero.config.baseApiUrl + '/itemTypes' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(url, 'GET'),
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 3);
                Z.debug(data, 4);
                Zotero.Item.prototype.itemTypes = data;
                Zotero.cache.save({locale:locale, target:'itemTypes'}, Zotero.Item.prototype.itemTypes);
            }
    );
};

Zotero.Item.prototype.getItemFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getItemFields", 3);
    if(!locale){
        locale = 'en-US';
    }
    locale = 'en-US';
    
    var itemFields = Zotero.cache.load({locale:locale, target:'itemFields'});
    if(itemFields){
        Z.debug("have itemFields in localStorage", 3);
        Zotero.Item.prototype.itemFields = itemFields;//JSON.parse(Zotero.storage.localStorage['itemFields']);
        J.each(Zotero.Item.prototype.itemFields, function(ind, val){
            Zotero.localizations.fieldMap[val.field] = val.localized;
        });
        return;
    }
    
    var query = Zotero.ajax.apiQueryString({locale:locale});
    var requestUrl = Zotero.config.baseApiUrl + '/itemFields' + query;
    J.getJSON(Zotero.ajax.proxyWrapper(requestUrl),
            {},
            function(data, textStatus, XMLHttpRequest){
                Z.debug("got itemTypes response", 4);
                Zotero.Item.prototype.itemFields = data;
                Zotero.cache.save({locale:locale, target:'itemFields'}, data);
                //Zotero.storage.localStorage['itemFields'] = JSON.stringify(data);
                J.each(Zotero.Item.prototype.itemFields, function(ind, val){
                    Zotero.localizations.fieldMap[val.field] = val.localized;
                });
            }
    );
};

Zotero.Item.prototype.getItemTemplate = function (itemType, linkMode) {
    Z.debug("Zotero.Item.prototype.getItemTemplate", 3);
    if(typeof itemType == 'undefined') itemType = 'document';
    if(itemType == 'attachment' && typeof linkMode == 'undefined'){
        throw new Error("attachment template requested with no linkMode");
    }
    if(typeof linkMode == "undefined"){
        linkMode = '';
    }
    
    var query = Zotero.ajax.apiQueryString({itemType:itemType, linkMode:linkMode});
    var requestUrl = Zotero.config.baseApiUrl + '/items/new' + query;
    
    var cacheConfig = {itemType:itemType, target:'itemTemplate'};
    var itemTemplate = Zotero.cache.load(cacheConfig);
    if(itemTemplate){
        Z.debug("have itemTemplate in localStorage", 3);
        var template = itemTemplate;// JSON.parse(Zotero.storage.localStorage[url]);
        return Promise.resolve(template);
    }
    
    return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
    .then(function(response){
        Z.debug("got itemTemplate response", 3);
        Zotero.cache.save(cacheConfig, response.data);
        return response.data;
    });
};

Zotero.Item.prototype.getUploadAuthorization = function(fileinfo){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    Z.debug("Zotero.Item.getUploadAuthorization", 3);
    var item = this;
    
    var config = {
        'target':'item',
        'targetModifier':'file',
        'libraryType':item.libraryType,
        'libraryID':item.libraryID,
        'itemKey':item.itemKey
    };
    var headers = {};
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    return Zotero.ajaxRequest(config, 'POST',
        {
            processData: true,
            data:fileinfo,
            headers:headers
        }
    );
};

Zotero.Item.prototype.registerUpload = function(uploadKey){
    Z.debug("Zotero.Item.registerUpload", 3);
    var item = this;
    var config = {
        'target':'item',
        'targetModifier':'file',
        'libraryType':item.libraryType,
        'libraryID':item.libraryID,
        'itemKey':item.itemKey
    };
    var headers = {};
    var oldmd5 = item.get('md5');
    if(oldmd5){
        headers['If-Match'] = oldmd5;
    }
    else{
        headers['If-None-Match'] = '*';
    }
    
    return Zotero.ajaxRequest(config, 'POST',
    {
        processData: true,
        data:{upload: uploadKey},
        headers: headers
    });
};

Zotero.Item.prototype.fullUpload = function(file){

};

Zotero.Item.prototype.creatorTypes = {};

Zotero.Item.prototype.getCreatorTypes = function (itemType) {
    Z.debug("Zotero.Item.prototype.getCreatorTypes: " + itemType, 3);
    if(!itemType){
        itemType = 'document';
    }
    
    //parse stored creatorTypes object if it exists
    //creatorTypes maps itemType to the possible creatorTypes
    var creatorTypes = Zotero.cache.load({target:'creatorTypes'});
    if(creatorTypes){
        Z.debug("have creatorTypes in localStorage", 3);
        Zotero.Item.prototype.creatorTypes = creatorTypes;//JSON.parse(Zotero.storage.localStorage['creatorTypes']);
    }
    
    if(Zotero.Item.prototype.creatorTypes[itemType]){
        Z.debug("creatorTypes of requested itemType available in localStorage", 3);
        Z.debug(Zotero.Item.prototype.creatorTypes, 4);
        return Promise.resolve(Zotero.Item.prototype.creatorTypes[itemType]);
    }
    else{
        Z.debug("sending request for creatorTypes", 3);
        var query = Zotero.ajax.apiQueryString({itemType:itemType});
        //TODO: this probably shouldn't be using baseApiUrl directly
        var requestUrl = Zotero.config.baseApiUrl + '/itemTypeCreatorTypes' + query;
        
        return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
        .then(function(response){
            Z.debug("got creatorTypes response", 4);
            Zotero.Item.prototype.creatorTypes[itemType] = response.data;
            //Zotero.storage.localStorage['creatorTypes'] = JSON.stringify(Zotero.Item.prototype.creatorTypes);
            Zotero.cache.save({target:'creatorTypes'}, Zotero.Item.prototype.creatorTypes);
            return Zotero.Item.prototype.creatorTypes[itemType];
        });
    }
};

Zotero.Item.prototype.getCreatorFields = function (locale) {
    Z.debug("Zotero.Item.prototype.getCreatorFields", 3);
    var creatorFields = Zotero.cache.load({target:'creatorFields'});
    if(creatorFields){
        Z.debug("have creatorFields in localStorage", 3);
        Zotero.Item.prototype.creatorFields = creatorFields;// JSON.parse(Zotero.storage.localStorage['creatorFields']);
        return Promise.resolve(creatorFields);
    }
    
    var requestUrl = Zotero.config.baseApiUrl + '/creatorFields';
    return Zotero.ajaxRequest(requestUrl, 'GET', {dataType:'json'})
    .then(function(response){
        Z.debug("got itemTypes response", 4);
        Zotero.Item.prototype.creatorFields = response.data;
        Zotero.cache.save({target:'creatorFields'}, response.data);
    });
};

//---Functions to manually add Zotero format data instead of fetching it from the API ---
//To be used first with cached data for offline, could also maybe be used for custom types
Zotero.Item.prototype.addItemTypes = function(itemTypes, locale){
    
};

Zotero.Item.prototype.addItemFields = function(itemType, itemFields){
    
};

Zotero.Item.prototype.addCreatorTypes = function(itemType, creatorTypes){
    
};

Zotero.Item.prototype.addCreatorFields = function(itemType, creatorFields){
    
};

Zotero.Item.prototype.addItemTemplates = function(templates){
    
};


Zotero.Item.prototype.itemTypeImageClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    if(item.itemType == 'attachment'){
        switch(item.linkMode){
            case 'imported_file':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentFile'];
            case 'imported_url':
                if(item.translatedMimeType == 'pdf'){
                    return item.itemTypeImageSrc['attachmentPdf'];
                }
                return item.itemTypeImageSrc['attachmentSnapshot'];
            case 'linked_file':
                return item.itemTypeImageSrc['attachmentLink'];
            case 'linked_url':
                return item.itemTypeImageSrc['attachmentWeblink'];
            default:
                return item.itemTypeImageSrc['attachment'];
        }
    }
    else {
        return item.itemType;
    }
};

Zotero.Item.prototype.get = function(key){
    var item = this;
    switch(key) {
        case 'title':
            return item.title;
        case 'creatorSummary':
            return item.creatorSummary;
        case 'year':
            return item.year;
    }
    
    if(key in item.apiObj){
        return item.apiObj[key];
    }
    else if(key in item.dataFields){
        return item.dataFields[key];
    }
    else if(item.hasOwnProperty(key)){
        return item[key];
    }
    
    return null;
};

Zotero.Item.prototype.set = function(key, val){
    var item = this;
    if(key in item.apiObj){
        item.apiObj[key] = val;
    }
    switch (key) {
        case "itemKey":
            item.itemKey = val;
            item.apiObj.itemKey = val;
            break;
        case "itemVersion":
            item.itemVersion = val;
            item.apiObj.itemVersion = val;
            break;
        case "title":
            item.title = val;
            break;
        case "itemType":
            item.itemType = val;
            //TODO: translate api object to new item type
            break;
        case "linkMode":
            break;
        case "deleted":
            item.apiObj.deleted = val;
            break;
        case "parentItem":
        case "parentItemKey":
            if( val === '' ){ val = false; }
            item.parentItemKey = val;
            item.apiObj.parentItem = val;
            break;
    }
    
//    item.synced = false;
    return item;
};

Zotero.Item.prototype.setParent = function(parentItemKey){
    var item = this;
    //pull out itemKey string if we were passed an item object
    if(typeof parentItemKey != 'string' &&
        parentItemKey.hasOwnProperty('instance') &&
        parentItemKey.instance == 'Zotero.Item'){
        parentItemKey = parentItemKey.itemKey;
    }
    item.set('parentItem', parentItemKey);
    return item;
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.hasOwnProperty('collectionKey')){
            collectionKey = collectionKey.collectionKey;
        }
    }
    if(J.inArray(collectionKey, item.apiObj.collections) === -1){
        item.apiObj.collections.push(collectionKey);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.hasOwnProperty('collectionKey')){
            collectionKey = collectionKey.collectionKey;
        }
    }
    var index = J.inArray(collectionKey, item.apiObj.collections);
    if(index != -1){
        item.apiObj.collections.splice(index, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(childItem, fileInfo, fileblob, progressCallback){
    /*
     * write child item so that it exists
     * get upload authorization for actual file
     * perform full upload
     */
    var item = this;
    
    if(!item.owningLibrary){
        return Promise.reject(new Error("Item must be associated with a library"));
    }

    //make sure childItem has parent set
    childItem.set('parentItem', item.itemKey);
    childItem.associateWithLibrary(item.owningLibrary);
    
    return childItem.writeItem()
    .then(function(response){
        //successful attachmentItemWrite
        item.numChildren++;
        return childItem.uploadFile(fileInfo, fileblob, progressCallback)
    }, function(response){
        //failure during attachmentItem write
        return {
            "message":"Failure during attachmentItem write.",
            "code": response.jqxhr.status,
            "serverMessage": response.jqxhr.responseText
        };
    });
};

Zotero.Item.prototype.uploadFile = function(fileInfo, fileblob, progressCallback){
    var item = this;
    
    var uploadAuthFileData = {
        md5:fileInfo.md5,
        filename: item.get('title'),
        filesize: fileInfo.filesize,
        mtime:fileInfo.mtime,
        contentType:fileInfo.contentType,
        params:1
    };
    if(fileInfo.contentType === ""){
        uploadAuthFileData.contentType = "application/octet-stream";
    }
    return item.getUploadAuthorization(uploadAuthFileData)
    .then(function(response){
        Z.debug("uploadAuth callback", 3);
        var upAuthOb;
        if(typeof response.data == "string"){upAuthOb = JSON.parse(data);}
        else{upAuthOb = response.data;}
        if(upAuthOb.exists == 1){
            return {'message':"File Exists"};
        }
        else{
            return new Promise(function(resolve, reject){
                var fullUpload = Zotero.file.uploadFile(upAuthOb, fileblob);
                fullUpload.onreadystatechange = J.proxy(function(e){
                    Z.debug("fullupload readyState: " + fullUpload.readyState, 3);
                    Z.debug("fullupload status: " + fullUpload.status, 3);
                    //if we know that CORS is allowed, check that the request is done and that it was successful
                    //otherwise just wait until it's finished and assume success
                    if(fullUpload.readyState == 4){
                        //Upload is done, whether successful or not
                        if(fullUpload.status == 201 || Zotero.config.CORSallowed === false){
                            //upload was successful and we know it, or upload is complete and we have no way of
                            //knowing if it was successful because of same origin policy, so we'll assume it was
                            item.registerUpload(upAuthOb.uploadKey)
                            .then(function(response){
                                resolve({'message': 'Upload Successful'});
                            },
                            function(response){
                                var failure = {'message': 'Failed registering upload.'};
                                if(response.jqxhr.status == 412){
                                    failure.code = 412;
                                    failure.serverMessage = response.jqxhr.responseText;
                                }
                                reject(failure);
                            });
                        }
                        else {
                            //we should be able to tell if upload was successful, and it was not
                            reject({
                                "message": "Failure uploading file.",
                                "code": jqxhr.status,
                                "serverMessage": jqxhr.responseText
                            });
                        }
                    }
                }, this);
                //pass on progress events to the progress callback if it was set
                fullUpload.upload.onprogress = function(e){
                    if(typeof progressCallback == 'function'){
                        progressCallback(e);
                    }
                };
            });
        }
    },
    function(response){
        //Failure during upload authorization
        return {
            "message":"Failure during upload authorization.",
            "code": response.jqxhr.status,
            "serverMessage": response.jqxhr.responseText
        };
    });
};

Zotero.Item.prototype.cslItem = function(){
    var zoteroItem = this;
    
    // don't return URL or accessed information for journal articles if a
    // pages field exists
    var itemType = zoteroItem.get("itemType");//Zotero_ItemTypes::getName($zoteroItem->itemTypeID);
    var cslType = zoteroItem.cslTypeMap.hasOwnProperty(itemType) ? zoteroItem.cslTypeMap[itemType] : false;
    if (!cslType) cslType = "article";
    var ignoreURL = ((zoteroItem.get("accessDate") || zoteroItem.get("url")) &&
            itemType in {"journalArticle":1, "newspaperArticle":1, "magazineArticle":1} &&
            zoteroItem.get("pages") &&
            zoteroItem.citePaperJournalArticleURL);
    
    cslItem = {'type': cslType};
    if(zoteroItem.owningLibrary){
        cslItem['id'] = zoteroItem.owningLibrary.libraryID + "/" + zoteroItem.get("itemKey");
    } else {
        cslItem['id'] = Zotero.utils.getKey();
    }
    
    // get all text variables (there must be a better way)
    // TODO: does citeproc-js permit short forms?
    J.each(zoteroItem.cslFieldMap, function(variable, fields){
        if (variable == "URL" && ignoreURL) return;
        J.each(fields, function(ind, field){
            var value = zoteroItem.get(field);
            if(value){
                //TODO: strip enclosing quotes? necessary when not pulling from DB?
                cslItem[variable] = value;
            }
        });
    });
    
    // separate name variables
    var creators = zoteroItem.get('creators');
    J.each(creators, function(ind, creator){
        var creatorType = creator['creatorType'];// isset(self::$zoteroNameMap[$creatorType]) ? self::$zoteroNameMap[$creatorType] : false;
        if (!creatorType) return;
        
        var nameObj;
        if(creator.hasOwnProperty("name")){
            nameObj = {'literal': creator['name']};
        }
        else {
            nameObj = {'family': creator['lastName'], 'given': creator['firstName']};
        }
        
        if (cslItem.hasOwnProperty(creatorType)) {
            cslItem[creatorType].push(nameObj);
        }
        else {
            cslItem[creatorType] = [nameObj];
        }
    });
    
    // get date variables
    J.each(zoteroItem.cslDateMap, function(key, val){
        var date = zoteroItem.get(val);
        if (date) {
            cslItem[key] = {"raw": date};
        }
    });
    
    return cslItem;
};
Zotero.Item.prototype.fieldMap = {
    "itemType"            : "Item Type",
    "title"               : "Title",
    "dateAdded"           : "Date Added",
    "dateModified"        : "Date Modified",
    "source"              : "Source",
    "notes"               : "Notes",
    "tags"                : "Tags",
    "attachments"         : "Attachments",
    "related"             : "Related",
    "url"                 : "URL",
    "rights"              : "Rights",
    "series"              : "Series",
    "volume"              : "Volume",
    "issue"               : "Issue",
    "edition"             : "Edition",
    "place"               : "Place",
    "publisher"           : "Publisher",
    "pages"               : "Pages",
    "ISBN"                : "ISBN",
    "publicationTitle"    : "Publication",
    "ISSN"                : "ISSN",
    "date"                : "Date",
    "year"                : "Year",
    "section"             : "Section",
    "callNumber"          : "Call Number",
    "archive"             : "Archive",
    "archiveLocation"     : "Loc. in Archive",
    "libraryCatalog"      : "Library Catalog",
    "distributor"         : "Distributor",
    "extra"               : "Extra",
    "journalAbbreviation" : "Journal Abbr",
    "DOI"                 : "DOI",
    "accessDate"          : "Accessed",
    "seriesTitle"         : "Series Title",
    "seriesText"          : "Series Text",
    "seriesNumber"        : "Series Number",
    "institution"         : "Institution",
    "reportType"          : "Report Type",
    "code"                : "Code",
    "session"             : "Session",
    "legislativeBody"     : "Legislative Body",
    "history"             : "History",
    "reporter"            : "Reporter",
    "court"               : "Court",
    "numberOfVolumes"     : "# of Volumes",
    "committee"           : "Committee",
    "assignee"            : "Assignee",
    "patentNumber"        : "Patent Number",
    "priorityNumbers"     : "Priority Numbers",
    "issueDate"           : "Issue Date",
    "references"          : "References",
    "legalStatus"         : "Legal Status",
    "codeNumber"          : "Code Number",
    "artworkMedium"       : "Medium",
    "number"              : "Number",
    "artworkSize"         : "Artwork Size",
    "repository"          : "Repository",
    "videoRecordingType"  : "Recording Type",
    "interviewMedium"     : "Medium",
    "letterType"          : "Type",
    "manuscriptType"      : "Type",
    "mapType"             : "Type",
    "scale"               : "Scale",
    "thesisType"          : "Type",
    "websiteType"         : "Website Type",
    "audioRecordingType"  : "Recording Type",
    "label"               : "Label",
    "presentationType"    : "Type",
    "meetingName"         : "Meeting Name",
    "studio"              : "Studio",
    "runningTime"         : "Running Time",
    "network"             : "Network",
    "postType"            : "Post Type",
    "audioFileType"       : "File Type",
    "version"             : "Version",
    "system"              : "System",
    "company"             : "Company",
    "conferenceName"      : "Conference Name",
    "encyclopediaTitle"   : "Encyclopedia Title",
    "dictionaryTitle"     : "Dictionary Title",
    "language"            : "Language",
    "programmingLanguage" : "Language",
    "university"          : "University",
    "abstractNote"        : "Abstract",
    "websiteTitle"        : "Website Title",
    "reportNumber"        : "Report Number",
    "billNumber"          : "Bill Number",
    "codeVolume"          : "Code Volume",
    "codePages"           : "Code Pages",
    "dateDecided"         : "Date Decided",
    "reporterVolume"      : "Reporter Volume",
    "firstPage"           : "First Page",
    "documentNumber"      : "Document Number",
    "dateEnacted"         : "Date Enacted",
    "publicLawNumber"     : "Public Law Number",
    "country"             : "Country",
    "applicationNumber"   : "Application Number",
    "forumTitle"          : "Forum/Listserv Title",
    "episodeNumber"       : "Episode Number",
    "blogTitle"           : "Blog Title",
    "caseName"            : "Case Name",
    "nameOfAct"           : "Name of Act",
    "subject"             : "Subject",
    "proceedingsTitle"    : "Proceedings Title",
    "bookTitle"           : "Book Title",
    "shortTitle"          : "Short Title",
    "docketNumber"        : "Docket Number",
    "numPages"            : "# of Pages",
    "note"                : "Note",
    "numChildren"         : "# of Children",
    "addedBy"             : "Added By",
    "creator"             : "Creator"
};

Zotero.localizations.fieldMap = Zotero.Item.prototype.fieldMap;

Zotero.Item.prototype.typeMap = {
    "note"                : "Note",
    "attachment"          : "Attachment",
    "book"                : "Book",
    "bookSection"         : "Book Section",
    "journalArticle"      : "Journal Article",
    "magazineArticle"     : "Magazine Article",
    "newspaperArticle"    : "Newspaper Article",
    "thesis"              : "Thesis",
    "letter"              : "Letter",
    "manuscript"          : "Manuscript",
    "interview"           : "Interview",
    "film"                : "Film",
    "artwork"             : "Artwork",
    "webpage"             : "Web Page",
    "report"              : "Report",
    "bill"                : "Bill",
    "case"                : "Case",
    "hearing"             : "Hearing",
    "patent"              : "Patent",
    "statute"             : "Statute",
    "email"               : "E-mail",
    "map"                 : "Map",
    "blogPost"            : "Blog Post",
    "instantMessage"      : "Instant Message",
    "forumPost"           : "Forum Post",
    "audioRecording"      : "Audio Recording",
    "presentation"        : "Presentation",
    "videoRecording"      : "Video Recording",
    "tvBroadcast"         : "TV Broadcast",
    "radioBroadcast"      : "Radio Broadcast",
    "podcast"             : "Podcast",
    "computerProgram"     : "Computer Program",
    "conferencePaper"     : "Conference Paper",
    "document"            : "Document",
    "encyclopediaArticle" : "Encyclopedia Article",
    "dictionaryEntry"     : "Dictionary Entry"
};

Zotero.localizations.typeMap = Zotero.Item.prototype.typeMap;

Zotero.Item.prototype.creatorMap = {
    "author"         : "Author",
    "contributor"    : "Contributor",
    "editor"         : "Editor",
    "translator"     : "Translator",
    "seriesEditor"   : "Series Editor",
    "interviewee"    : "Interview With",
    "interviewer"    : "Interviewer",
    "director"       : "Director",
    "scriptwriter"   : "Scriptwriter",
    "producer"       : "Producer",
    "castMember"     : "Cast Member",
    "sponsor"        : "Sponsor",
    "counsel"        : "Counsel",
    "inventor"       : "Inventor",
    "attorneyAgent"  : "Attorney/Agent",
    "recipient"      : "Recipient",
    "performer"      : "Performer",
    "composer"       : "Composer",
    "wordsBy"        : "Words By",
    "cartographer"   : "Cartographer",
    "programmer"     : "Programmer",
    "reviewedAuthor" : "Reviewed Author",
    "artist"         : "Artist",
    "commenter"      : "Commenter",
    "presenter"      : "Presenter",
    "guest"          : "Guest",
    "podcaster"      : "Podcaster"
};

Zotero.Item.prototype.hideFields = [
    "mimeType",
    "linkMode",
    "charset",
    "md5",
    "mtime",
    "itemVersion",
    "itemKey",
    "collections",
    "relations",
    "parentItem",
    "contentType",
    "filename",
    "tags"
];

Zotero.localizations.creatorMap = Zotero.Item.prototype.creatorMap;

Zotero.Item.prototype.itemTypeImageSrc = {
    "note"                : "note",
    "attachment"          : "attachment-pdf",
    "attachmentPdf"       : "attachment-pdf",
    "attachmentWeblink"   : "attachment-web-link",
    "attachmentSnapshot"  : "attachment-snapshot",
    "attachmentFile"      : "attachment-file",
    "attachmentLink"      : "attachment-link",
    "book"                : "book",
    "bookSection"         : "book_open",
    "journalArticle"      : "page_white_text",
    "magazineArticle"     : "layout",
    "newspaperArticle"    : "newspaper",
    "thesis"              : "report",
    "letter"              : "email_open",
    "manuscript"          : "script",
    "interview"           : "comments",
    "film"                : "film",
    "artwork"             : "picture",
    "webpage"             : "page",
    "report"              : "report",
    "bill"                : "page_white",
    "case"                : "page_white",
    "hearing"             : "page_white",
    "patent"              : "page_white",
    "statute"             : "page_white",
    "email"               : "email",
    "map"                 : "map",
    "blogPost"            : "layout",
    "instantMessage"      : "page_white",
    "forumPost"           : "page",
    "audioRecording"      : "ipod",
    "presentation"        : "page_white",
    "videoRecording"      : "film",
    "tvBroadcast"         : "television",
    "radioBroadcast"      : "transmit",
    "podcast"             : "ipod_cast",
    "computerProgram"     : "page_white_code",
    "conferencePaper"     : "treeitem-conferencePaper",
    "document"            : "page_white",
    "encyclopediaArticle" : "page_white",
    "dictionaryEntry"     : "page_white"
};

Zotero.Item.prototype.cslNameMap = {
    "author": "author",
    "editor": "editor",
    "bookAuthor": "container-author",
    "composer": "composer",
    "interviewer": "interviewer",
    "recipient": "recipient",
    "seriesEditor": "collection-editor",
    "translator": "translator"
};

Zotero.Item.prototype.cslFieldMap = {
    "title": ["title"],
    "container-title": ["publicationTitle",  "reporter", "code"], /* reporter and code should move to SQL mapping tables */
    "collection-title": ["seriesTitle", "series"],
    "collection-number": ["seriesNumber"],
    "publisher": ["publisher", "distributor"], /* distributor should move to SQL mapping tables */
    "publisher-place": ["place"],
    "authority": ["court"],
    "page": ["pages"],
    "volume": ["volume"],
    "issue": ["issue"],
    "number-of-volumes": ["numberOfVolumes"],
    "number-of-pages": ["numPages"],
    "edition": ["edition"],
    "version": ["version"],
    "section": ["section"],
    "genre": ["type", "artworkSize"], /* artworkSize should move to SQL mapping tables, or added as a CSL variable */
    "medium": ["medium", "system"],
    "archive": ["archive"],
    "archive_location": ["archiveLocation"],
    "event": ["meetingName", "conferenceName"], /* these should be mapped to the same base field in SQL mapping tables */
    "event-place": ["place"],
    "abstract": ["abstractNote"],
    "URL": ["url"],
    "DOI": ["DOI"],
    "ISBN": ["ISBN"],
    "call-number": ["callNumber"],
    "note": ["extra"],
    "number": ["number"],
    "references": ["history"],
    "shortTitle": ["shortTitle"],
    "journalAbbreviation": ["journalAbbreviation"],
    "language": ["language"]
};

Zotero.Item.prototype.cslDateMap = {
    "issued": "date",
    "accessed": "accessDate"
};

Zotero.Item.prototype.cslTypeMap = {
    'book': "book",
    'bookSection': "chapter",
    'journalArticle': "article-journal",
    'magazineArticle': "article-magazine",
    'newspaperArticle': "article-newspaper",
    'thesis': "thesis",
    'encyclopediaArticle': "entry-encyclopedia",
    'dictionaryEntry': "entry-dictionary",
    'conferencePaper': "paper-conference",
    'letter': "personal_communication",
    'manuscript': "manuscript",
    'interview': "interview",
    'film': "motion_picture",
    'artwork': "graphic",
    'webpage': "webpage",
    'report': "report",
    'bill': "bill",
    'case': "legal_case",
    'hearing': "bill",                // ??
    'patent': "patent",
    'statute': "bill",                // ??
    'email': "personal_communication",
    'map': "map",
    'blogPost': "webpage",
    'instantMessage': "personal_communication",
    'forumPost': "webpage",
    'audioRecording': "song",     // ??
    'presentation': "speech",
    'videoRecording': "motion_picture",
    'tvBroadcast': "broadcast",
    'radioBroadcast': "broadcast",
    'podcast': "song",            // ??
    'computerProgram': "book"     // ??
};

Zotero.Item.prototype.citePaperJournalArticleURL = false;
Zotero.Tag = function (entry) {
    this.instance = "Zotero.Tag";
    this.color = null;
    if(typeof entry != 'undefined'){
        this.parseXmlTag(entry);
    }
};

Zotero.Tag.prototype = new Zotero.Entry();

Zotero.Tag.prototype.dump = function(){
    var tag = this;
    var dump = tag.dumpEntry();
    var dumpProperties = [
        'numItems',
        'urlencodedtag',
        'tagVersion',
        'tagType',
        'tag',
    ];
    for (var i = 0; i < dumpProperties.length; i++) {
        dump[dumpProperties[i]] = tag[dumpProperties[i]];
    }
    return dump;
};

Zotero.Tag.prototype.loadDump = function(dump){
    var tag = this;
    tag.loadDumpEntry(dump);
    var dumpProperties = [
        'numItems',
        'urlencodedtag',
        'tagVersion',
        'tagType',
        'tag',
    ];
    
    for (var i = 0; i < dumpProperties.length; i++) {
        tag[dumpProperties[i]] = dump[dumpProperties[i]];
    }
    
    tag.initSecondaryData();
    return tag;
};

Zotero.Tag.prototype.initSecondaryData = function(){
    
};

Zotero.Tag.prototype.loadObject = function(ob){
    var tag = this;
    tag.title = ob.title;
    tag.author = ob.author;
    tag.tagID = ob.tagID;
    tag.published = ob.published;
    tag.updated = ob.updated;
    tag.links = ob.links;
    tag.numItems = ob.numItems;
    tag.items = ob.items;
    tag.tagType = ob.tagType;
    tag.modified = ob.modified;
    tag.added = ob.added;
    tag.key = ob.key;
    tag.tag = ob.tag;
};

Zotero.Tag.prototype.parseXmlTag = function (tel) {
    var tag = this;
    //Z.debug("Zotero.Tag.parseXmlTag", 3);
    //Z.debug(tel);
    tag.parseXmlEntry(tel);
    
    tag.numItems = tel.find('zapi\\:numItems, numItems').text();
    tag.urlencodedtag = encodeURIComponent(this.title);
    var contentEl = tel.find('content').first();
    tag.parseContentBlock(contentEl);
    //Z.debug("Done with Zotero.Tag.parseXmlTag");
};

Zotero.Tag.prototype.parseContentBlock = function(contentEl) {
    var tag = this;
    var contentType = contentEl.attr('type');
    var contentText = contentEl.text();
    
    switch(contentType){
        case 'application/json':
            tag.parseJsonContent(contentEl);
            break;
    }
};

Zotero.Tag.prototype.parseJsonContent = function(cel) {
    var tag = this;
    if(typeof cel === "string"){
        tag.apiObj = JSON.parse(cel);
        tag.pristine = JSON.parse(cel);
    }
    else {
        tag.apiObj = JSON.parse(cel.text());
        tag.pristine = JSON.parse(cel.text());
    }
    
    tag.tagType = tag.apiObj['type'];
    
    tag.initSecondaryData();
};

Zotero.Tag.prototype.getLinkParams = function () {
    var selectedTags = Zotero.ajax.getUrlVar('tag');
    if(!J.isArray(selectedTags)){
        selectedTags = [selectedTags];
    }
    
    var deparamed = Zotero.ajax.getUrlVars();
    var tagSelected = false;
    var selectedIndex = J.inArray(this.title, selectedTags);
    if(selectedIndex != (-1) ){
        tagSelected = true;
    }
    if(deparamed.hasOwnProperty('tag')){
        if(J.isArray(deparamed.tag)){
            if(!tagSelected) deparamed.tag.push(this.title);
            else{
                deparamed.tag.splice(selectedIndex, 1);
            }
        }
        else{
            if(!tagSelected) deparamed.tag = [deparamed.tag, this.title];
            else deparamed.tag = [];
        }
    }
    else{
        deparamed.tag = this.title;
    }
    
    this.linktagsparams = deparamed;
    return deparamed;
};
Zotero.Search = function(){
    this.instance = "Zotero.Search";
    this.searchObject = {};
};
Zotero.Group = function (entryEl) {
    var group = this;
    group.instance = "Zotero.Group";
    if(typeof entryEl != 'undefined'){
        this.parseXmlGroup(entryEl);
    }
};

Zotero.Group.prototype = new Zotero.Entry();

Zotero.Group.prototype.loadObject = function(ob){
    var group = this;
    group.title = ob.title;
    group.author = ob.author;
    group.tagID = ob.tagID;
    group.published = ob.published;
    group.updated = ob.updated;
    group.links = ob.links;
    group.numItems = ob.numItems;
    group.items = ob.items;
    group.tagType = ob.tagType;
    group.modified = ob.modified;
    group.added = ob.added;
    group.key = ob.key;
};

Zotero.Group.prototype.parseXmlGroup = function (gel) {
    var group = this;
    group.parseXmlEntry(gel);
    
    group.numItems = gel.find('zapi\\:numItems, numItems').text();
    
    //parse content block
    var contentEl = gel.children("content");
    //check for multi-content response
    var subcontents = gel.find("zapi\\:subcontent, subcontent");
    if(subcontents.size() > 0){
        for(var i = 0; i < subcontents.size(); i++){
            var sc = J(subcontents.get(i));
            group.parseContentBlock(sc);
        }
    }
    else{
        group.parseContentBlock(contentEl);
    }
    
    group.groupID = gel.find('zapi\\:groupID, groupID').text();
    group.numItems = gel.find('zapi\\:numItems, numItems').text();
    /*
    var groupEl = gel.find('zxfer\\:group, group');
    if(groupEl.length !== 0){
        group.groupID = groupEl.attr("id");
        group.ownerID = groupEl.attr("owner");
        group.groupType = groupEl.attr("type");
        group.groupName = groupEl.attr("name");
        group.libraryEditing = groupEl.attr("libraryEditing");
        group.libraryReading = groupEl.attr("libraryReading");
        group.fileEditing = groupEl.attr("fileEditing");
        group.description = groupEl.find('zxfer\\:description, description').text();
        group.memberIDs = groupEl.find('zxfer\\:members, members').text().split(" ");
        group.adminIDs = groupEl.find('zxfer\\:admins, admins').text().split(" ");
        group.itemIDs = groupEl.find('zxfer\\:items, items').text().split(" ");
    }
    */
};

Zotero.Group.prototype.parseContentBlock = function(contentEl){
    var group = this;
    var contentType = contentEl.attr('type');
    var contentText = contentEl.text();
    //group.groupContentBlocks[contentType] = contentText;
    
    switch(contentType){
        case 'json':
        case 'application/json':
            group.parseJsonGroupContent(contentEl);
            break;
    }
};

Zotero.Group.prototype.parseJsonGroupContent = function(cel){
    var group = this;
    group.apiObj = JSON.parse(cel.text());
    group.pristine = JSON.parse(cel.text());
    
    group.etag = cel.attr('etag');
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch(key) {
        case 'title':
            return group.title;
    }
    
    if(key in group.apiObj){
        return group.apiObj[key];
    }
    else if(group.hasOwnProperty(key)){
        return group[key];
    }
    
    return null;
};

Zotero.Group.prototype.isWritable = function(userID){
    var group = this;
    switch(true){
        case group.apiObj.owner == userID:
            return true;
        case (group.apiObj.admins && (group.apiObj.admins.indexOf(userID) != -1) ):
            return true;
        case ((group.apiObj.libraryEditing == 'members') &&
              (group.apiObj.members) &&
              (group.apiObj.members.indexOf(userID) != -1)):
            return true;
        default:
            return false;
    }
}

Zotero.Group.prototype.typeMap = {
    'Private': 'Private',
    'PublicOpen': 'Public, Open Membership',
    'PublicClosed': 'Public, Closed Membership'
};

Zotero.Group.prototype.accessMap = {
    'all'     : {'members' : 'Anyone can view, only members can edit',
                       'admins'  : 'Anyone can view, only admins can edit'},
    'members' : {'members' : 'Only members can view and edit',
                       'admins'  : 'Only members can view, only admins can edit'},
    'admins'  : {'members' : 'Only admins can view, only members can edit',
                       'admins'  : 'Only admins can view and edit'}
};

Zotero.User = function () {this.instance = "Zotero.User";};
Zotero.User.prototype = new Zotero.Entry();
Zotero.User.prototype.loadObject = function(ob){
    this.title = ob.title;
    this.author = ob.author;
    this.tagID = ob.tagID;
    this.published = ob.published;
    this.updated = ob.updated;
    this.links = ob.links;
    this.numItems = ob.numItems;
    this.items = ob.items;
    this.tagType = ob.tagType;
    this.modified = ob.modified;
    this.added = ob.added;
    this.key = ob.key;
};

Zotero.User.prototype.parseXmlUser = function (tel) {
    this.parseXmlEntry(tel);
    
    var tagEl = tel.find('content>tag');
    if(tagEl.length !== 0){
        this.tagKey = tagEl.attr('key');// find("zapi\\:itemID").text();
        this.libraryID = tagEl.attr("libraryID");
        this.tagName = tagEl.attr("name");
        this.dateAdded = tagEl.attr('dateAdded');
        this.dateModified = tagEl.attr('dateModified');
    }
    
};
Zotero.utils = {
    randomString:function(len, chars) {
        if (!chars) {
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        }
        if (!len) {
            len = 8;
        }
        var randomstring = '';
        for (var i=0; i<len; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    
    getKey: function() {
        var baseString = "23456789ABCDEFGHIJKMNPQRSTUVWXZ";
        return Zotero.utils.randomString(8, baseString);
    },
    
    //update items appropriately based on response to multi-write request
    //for success:
    //  update objectKey if item doesn't have one yet (newly created item)
    //  update itemVersion to response's Last-Modified-Version header
    //  mark as synced
    //for unchanged:
    //  don't need to do anything? itemVersion should remain the same?
    //  mark as synced if not already?
    //for failed:
    //  add the failure to the object under writeFailure
    //  don't mark as synced
    //  calling code should check for writeFailure after the written objects
    //  are returned
    updateObjectsFromWriteResponse: function(objectsArray, responsexhr){
        Z.debug("Zotero.utils.updateObjectsFromWriteResponse", 3);
        Z.debug("statusCode: " + responsexhr.status, 3);
        /*if(responsexhr.response !== 'json'){
            throw new Error("Expecing JSON response but got " + responsexhr.responseType);
        }*/
        Z.debug(responsexhr.responseText, 3);
        var data = JSON.parse(responsexhr.responseText);
        if(responsexhr.status == 200){
            var newLastModifiedVersion = responsexhr.getResponseHeader('Last-Modified-Version');
            Z.debug("newLastModifiedVersion: " + newLastModifiedVersion, 3);
            //make sure writes were actually successful and
            //update the itemKey for the parent
            if('success' in data){
                //update each successfully written item, possibly with new itemKeys
                J.each(data.success, function(ind, key){
                    var i = parseInt(ind, 10);
                    var object = objectsArray[i];
                    //throw error if objectKey mismatch
                    if(!object.hasOwnProperty('instance')){
                        throw new Error("unrecognized instance type on write object");
                    }
                    switch(object.instance){
                        case "Zotero.Item":
                            if(object.itemKey !== "" && object.itemKey !== key){
                                throw new Error("itemKey mismatch in multi-write response");
                            }
                            if(object.itemKey === ''){
                                if(object.hasOwnProperty('instance') && object.instance == "Zotero.Item"){
                                    object.updateItemKey(key);
                                }
                            }
                            object.set('itemVersion', newLastModifiedVersion);
                            object.synced = true;
                            object.writeFailure = false;
                            break;
                        case "Zotero.Collection":
                            if(object.collectionKey && object.collectionKey !== key){
                                throw new Error("collectionKey mismatch in multi-write response");
                            }
                            if(!object.collectionKey){
                                object.updateCollectionKey(key);
                            }
                            object.set('collectionVersion', newLastModifiedVersion);
                            object.synced = true;
                            object.writeFailure = false;
                            break;
                    }
                });
            }
            if('failed' in data){
                Z.debug("updating objects with failed writes", 3);
                J.each(data.failed, function(ind, failure){
                    Z.debug("failed write " + ind + " - " + failure, 3);
                    var i = parseInt(ind, 10);
                    var object = objectsArray[i];
                    object.writeFailure = failure;
                });
            }
        }
        else if(responsexhr.status == 204){
            //single item put response, this probably should never go to this function
            objectsArray[0].synced = true;
        }
    },
    
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace( " ", "_", "g");
        
        return slug;
    },
    
    prependAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.prependAutocomplete', 3);
        Z.debug("prepend match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.substr(0, plen).toLowerCase() == plower){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    matchAnyAutocomplete: function(pre, source){
        Z.debug('Zotero.utils.matchAnyAutocomplete', 3);
        Z.debug("matchAny match: " + pre);
        var satisfy;
        if(!source){
            Z.debug("source is not defined");
        }
        if(pre === ''){
            satisfy = source.slice(0);
            return satisfy;
        }
        var plen = pre.length;
        var plower = pre.toLowerCase();
        satisfy = J.map(source, function(n){
            if(n.toLowerCase().indexOf(plower) != -1){
                return n;
            }
            else{
                return null;
            }
        });
        return satisfy;
    },
    
    libraryString: function(type, libraryID){
        var lstring = '';
        if(type == 'user') lstring = 'u';
        else if(type == 'group') lstring = 'g';
        lstring += libraryID;
        return lstring;
    },
    
    parseLibString: function(libraryString){
        var type;
        var libraryID;
        if(libraryString.charAt(0) == 'u'){
            type = 'user';
        }
        else if(libraryString.charAt(0) == 'g'){
            type = 'group';
        }
        else{
            throw new Error("unexpected type character in libraryString");
        }
        libraryID = parseInt(libraryString.substring(1));
        return {libraryType:type, libraryID: libraryID};
    },
    
    //return true if retrieved more than lifetime minutes ago
    stale: function(retrievedDate, lifetime){
        var now = Date.now(); //current local time
        var elapsed = now.getTime() - retrievedDate.getTime();
        if((elapsed / 60000) > lifetime){
            return true;
        }
        return false;
    },
    
    entityify: function(str){
        var character = {
            '<' : '&lt;',
            '>' : '&gt;',
            '&' : '&amp;',
            '"' : '&quot;'
        };
        return str.replace(/[<>&"]/g, function(c) {
            return character[c];
        });
    },
    
    parseApiDate: function(datestr, date){
        //var parsems = Date.parse(datestr);
        
        var re = /([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)Z/;
        var matches = re.exec(datestr);
        if(matches === null){
            Z.debug("error parsing api date: " + datestr, 1);
            return null;
        }
        else{
            date = new Date(Date.UTC(matches[1], matches[2]-1, matches[3], matches[4], matches[5], matches[6]));
            return date;
        }
        
        return date;
    },
    
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    
    compareObs: function(ob1, ob2, checkVars){
        var loopOn = checkVars;
        var useIndex = false;
        var differences = [];

        if(checkVars === undefined){
            loopOn = ob1;
            useIndex = true;
        }
        
        J.each(loopOn, function(index, Val){
            var compindex = Val;
            if(useIndex) compindex = index;
            
            if(typeof(ob1[index]) == 'object'){
                if (Zotero.utils.compareObs(ob1[compindex], ob2[compindex]).length ) {
                    differences.push(compindex);
                }
                //case 'function':
                //    if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
            }
            else{
                if (ob1[compindex] != ob2[compindex]) {
                    differences.push(compindex);
                }
            }
        });
        return differences;
    },
    
    /**
     * Update syncState property on container to keep track of updates that occur during sync process.
     * Set earliestVersion to MIN(earliestVersion, version).
     * Set latestVersion to MAX(latestVersion, version).
     * This should be called with the modifiedVersion header for each response tied to this container
     * during a sync process.
     * @param  {Zotero.Container} container
     * @param  {int} version
     * @return {null}
     */
    updateSyncState: function(container, version) {
        Z.debug("updateSyncState: " + version, 3);
        if(!container.hasOwnProperty('syncState')){
            Z.debug("no syncState property");
            throw new Error("Attempt to update sync state of object with no syncState property");
        }
        if(container.syncState.earliestVersion === null){
            container.syncState.earliestVersion = version;
        }
        if(container.syncState.latestVersion === null){
            container.syncState.latestVersion = version;
        }
        if(version < container.syncState.earliestVersion){
            container.syncState.earliestVersion = version;
        }
        if(version > container.syncState.latestVersion){
            container.syncState.latestVersion = version;
        }
        Z.debug("done updating sync state", 3);
    },
    
    updateSyncedVersion: function(container, versionField) {
        if(container.syncState.earliestVersion !== null &&
            (container.syncState.earliestVersion == container.syncState.latestVersion) ){
            container[versionField] = container.syncState.latestVersion;
            container.synced = true;
        }
        else if(container.syncState.earliestVersion !== null) {
            container[versionField] = container.syncState.earliestVersion;
        }
    },
    /**
     * Translate common mimetypes to user friendly versions
     *
     * @param string $mimeType
     * @return string
     */
    translateMimeType: function(mimeType)
    {
        switch (mimeType) {
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
                return mimeType;
        }
    },

    /**
     * Get the permissions a key has for a library
     * if no key is passed use the currently set key for the library
     *
     * @param int|string $userID
     * @param string $key
     * @return array $keyPermissions
     */
    getKeyPermissions: function(userID, key) {
        if(!userID){
            return false;
        }
        
        if(!key){
            return false;
        }
        
        var urlconfig = {'target':'key', 'libraryType':'user', 'libraryID':userID, 'apiKey':key};
        var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
        
        return Zotero.ajaxRequest(requestUrl)
        .then(function(response){
            var keyNode = J(response.data).find('key');
            var keyObject = Zotero.utils.parseKey(keyNode);
            return keyObject;
        });
    },
    
    /**
     * Parse a key response into an array
     *
     * @param keyNode jQuery Dom collection from key response
     * @return array $keyPermissions
     */
    parseKey: function(keyNode){
        var key = [];
        var keyPerms = {"library":"0", "notes":"0", "write":"0", 'groups':{}};
        var accessEls = keyNode.find('access');
        accessEls.each(function(){
            var access = J(this);
            if(access.attr('library')){
                keyPerms['library'] = access.attr('library');
            }
            if(access.attr('notes')){
                keyPerms['notes'] = access.attr('notes');
            }
            if(access.attr('group')){
                var groupPermission = access.attr('write') == '1' ? 'write' : 'read';
                keyPerms['groups'][access.attr('group')] = groupPermission;
            }
            else if(access.attr('write')){
                keyPerms['write'] = access.attr('write');
            }
        });
        return keyPerms;
    }
    
};
Zotero.url.itemHref = function(item){
    var href = '';
    href += Zotero.config.libraryPathString + '/itemKey/' + item.itemKey;
    return href;
};

Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    if(item.links && item.links['enclosure']){
        var tail = item.links['enclosure']['href'].substr(-4, 4);
        if(tail == 'view'){
            //snapshot: redirect to view
            retString += '<a href="' + Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file/view' + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
            var enc = item.links['enclosure'];
            var filesize = parseInt(enc['length'], 10);
            var filesizeString = "" + filesize + " B";
            if(filesize > 1073741824){
                filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
            }
            else if(filesize > 1048576){
                filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
            }
            else if(filesize > 1024){
                filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
            }
            Z.debug(enctype, 3);
            retString += '<a href="' + Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file' + '">';
            if(enctype == 'undefined' || enctype === '' || typeof enctype == 'undefined'){
                retString += filesizeString + '</a>';
            }
            else{
                retString += enctype + ', ' + filesizeString + '</a>';
            }
            return retString;
        }
    }
    return retString;
};

Zotero.url.attachmentDownloadUrl = function(item){
    var retString = '';
    if(item.links && item.links['enclosure']){
        if(Zotero.config.directDownloads){
            retString = Zotero.config.baseZoteroWebsiteUrl + Zotero.config.nonparsedBaseUrl + '/' + item.itemKey + '/file';
            var tail = item.links['enclosure']['href'].substr(-4, 4);
            if(tail == 'view'){
                //snapshot: redirect to view
                retString += '/view';
            }
        }
        else {
            //we have a proxy for downloads at baseDownloadUrl so just pass an itemkey to that
            retString = Zotero.config.baseDownloadUrl + '?itemkey=' + item.itemKey;
        }
    }
    else if(item.linkMode == 2 || item.linkMode == 3){
        if(item.apiObj['url']){
            retString = item.apiObj['url'];
        }
    }
    return retString;
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.links['enclosure'].type);
    var enc = item.links['enclosure'];
    var filesizeString = '';
    if(enc['length']){
        var filesize = parseInt(enc['length'], 10);
        filesizeString = "" + filesize + " B";
        if(filesize > 1073741824){
            filesizeString = "" + (filesize / 1073741824).toFixed(1) + " GB";
        }
        else if(filesize > 1048576){
            filesizeString = "" + (filesize / 1048576).toFixed(1) + " MB";
        }
        else if(filesize > 1024){
            filesizeString = "" + (filesize / 1024).toFixed(1) + " KB";
        }
        return '(' + enctype + ', ' + filesizeString + ')';
    }
    else {
        return '(' + enctype + ')';
    }
};

Zotero.url.exportUrls = function(config){
    Z.debug("Zotero.url.exportUrls", 3);
    var exportUrls = {};
    var exportConfig = {};
    J.each(Zotero.config.exportFormats, function(index, format){
        exportConfig = J.extend(config, {'format':format});
        exportUrls[format] = Zotero.ajax.apiRequestUrl(exportConfig) + Zotero.ajax.apiQueryString({format:format, limit:'25'});
    });
    return exportUrls;
};

Zotero.url.snapshotViewLink = function(item){
    return Zotero.ajax.apiRequestUrl({
        'target':'item',
        'targetModifier':'viewsnapshot',
        'libraryType': item.owningLibrary.libraryType,
        'libraryID': item.owningLibrary.libraryID,
        'itemKey': item.itemKey
    });
};

Zotero.url.relationUrl = function(libraryType, libraryID, itemKey){
    return "http://zotero.org/" + libraryType + "s/" + libraryID + "/items/" + itemKey;
}
Zotero.file = {};

Zotero.file.getFileInfo = function(file, callback){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        throw new Error("FileReader not supported");
    }
    
    var fileInfo = {};
    var reader = new FileReader();
    reader.onload = function(e){
        Z.debug('Zotero.file.getFileInfo onloadFunc');
        var result = e.target.result;
        Zotero.debug(result);
        var spark = new SparkMD5();
        //fileInfo.md5 = MD5(result);
        spark.appendBinary(result);
        fileInfo.md5 = spark.end();
        Z.debug("md5:" + fileInfo.md5, 4);
        fileInfo.filename = file.name;
        fileInfo.filesize = file.size;
        fileInfo.mtime = Date.now();
        fileInfo.contentType = file.type;
        fileInfo.reader = reader;
        callback(fileInfo);
    };
    
    reader.readAsBinaryString(file);
};

Zotero.file.uploadFile = function(uploadInfo, file){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    formData.append('file', file);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    xhr.send(formData);
    return xhr;
    //While s3 does not allow CORS this XHR will not have the normal status
    //information, but will still fire readyStateChanges so you can tell
    //when the upload has finished (even if you can't tell if it was successful
    //from JS)
};

Zotero.Idb = {};

//Initialize an indexedDB for the specified library user or group + id
//returns a promise that is resolved with a Zotero.Idb.Library instance when successful
//and rejected onerror
Zotero.Idb.Library = function(libraryString){
    Z.debug("Zotero.Idb.Library", 3);
    Z.debug("Initializing Zotero IDB", 3);
    this.libraryString = libraryString;
    this.owningLibrary = null;
    this.initialized = false;
};

Zotero.Idb.Library.prototype.init = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        //Don't bother with the prefixed names because they should all be irrelevant by now
        //window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        var indexedDB = window.indexedDB;
        idbLibrary.indexedDB = indexedDB;
        
        // may need references to some window.IDB* objects:
        //window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        //window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
        // Now we can open our database
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 3);
        request.onerror = function(e){
            Zotero.debug("ERROR OPENING INDEXED DB", 1);
            reject();
        };
        
        var upgradeCallback = function(event){
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion, 3);
            var db = event.target.result;
            idbLibrary.db = db;
            
            if(oldVersion < 2){
                //delete old versions of object stores
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                Z.debug("Deleting old object stores", 3);
                if(db.objectStoreNames["items"]){
                    db.deleteObjectStore("items");
                }
                if(db.objectStoreNames["tags"]){
                    db.deleteObjectStore("tags");
                }
                if(db.objectStoreNames["collections"]){
                    db.deleteObjectStore("collections");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                
                // Create object stores to hold items, collections, and tags.
                // IDB keys are just the zotero object keys
                var itemStore = db.createObjectStore("items", { keyPath: "itemKey" });
                var collectionStore = db.createObjectStore("collections", { keyPath: "collectionKey" });
                var tagStore = db.createObjectStore("tags", { keyPath: "title" });
                var fileStore = db.createObjectStore("files");
                
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                
                // Create index to search/sort items by each attribute
                J.each(Zotero.Item.prototype.fieldMap, function(key, val){
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "apiObj." + key, { unique: false });
                });
                
                //itemKey index was created above with all other item fields
                //itemStore.createIndex("itemKey", "itemKey", { unique: false });
                
                //create multiEntry indices on item collectionKeys and tags
                itemStore.createIndex("collectionKeys", "apiObj.collections", {unique: false, multiEntry:true});
                //index on extra tagstrings array since tags are objects and we can't index them directly
                itemStore.createIndex("itemTagStrings", "tagstrings", {unique: false, multiEntry:true});
                //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
                //example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
                
                //itemStore.createIndex("itemType", "itemType", { unique: false });
                itemStore.createIndex("parentItemKey", "parentItemKey", { unique: false });
                itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
                itemStore.createIndex("deleted", "apiObj.deleted", { unique: false });
                
                collectionStore.createIndex("name", "name", { unique: false });
                collectionStore.createIndex("title", "title", { unique: false });
                collectionStore.createIndex("collectionKey", "collectionKey", { unique: false });
                collectionStore.createIndex("parentCollection", "parentCollection", { unique: false });
                collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                tagStore.createIndex("name", "name", { unique: false });
                tagStore.createIndex("title", "title", { unique: false });
                tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
            }
        };
        
        request.onupgradeneeded = upgradeCallback;
        
        request.onsuccess = function(){
            Z.debug("IDB success", 3);
            idbLibrary.db = request.result;
            idbLibrary.initialized = true;
            resolve(idbLibrary);
        };
    });
};

Zotero.Idb.Library.prototype.deleteDB = function(){
    var idbLibrary = this;
    idbLibrary.db.close();
    return new Promise(function(resolve, reject){
        var deleteRequest = idbLibrary.indexedDB.deleteDatabase("Zotero_" + idbLibrary.libraryString);
        deleteRequest.onerror = function(){
            Z.debug("Error deleting indexedDB", 1);
            reject();
        }
        deleteRequest.onsuccess = function(){
            Z.debug("Successfully deleted indexedDB", 1);
            resolve();
        }
    });
};

/**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"
*/
Zotero.Idb.Library.prototype.getObjectStore = function (store_name, mode) {
    var idbLibrary = this;
    var tx = idbLibrary.db.transaction(store_name, mode);
    return tx.objectStore(store_name);
};

Zotero.Idb.Library.prototype.clearObjectStore = function (store_name) {
    var idbLibrary = this;
    var store = getObjectStore(store_name, 'readwrite');
    return new Promise(function(resolve, reject){
        var req = store.clear();
        req.onsuccess = function(evt) {
            Z.debug("Store cleared", 3);
            resolve();
        };
        req.onerror = function (evt) {
            Z.debug("clearObjectStore:", evt.target.errorCode, 1);
            reject();
        };
    });
};

/**
* Add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.addItems = function(items){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Added Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.add(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

/**
* Update/add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.updateItems = function(items){
    Z.debug("Zotero.Idb.Library.updateItems", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!items){
            var library = idbLibrary.owningLibrary;
            var itemKeys = Object.keys(library.items.itemObjects);
            items = [];
            var item;
            for(var ik in itemKeys){
                item = library.items.getItem(itemKeys[ik]);
                if(item){
                    items.push(item);
                }
            }
        }
        
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Added/Updated Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.put(items[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

/**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/
Zotero.Idb.Library.prototype.removeItems = function(items){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["items"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Items transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Remove Items transaction failed.", 1);
            reject();
        };
        
        var itemStore = transaction.objectStore("items");
        var reqSuccess = function(event){
            Zotero.debug("Removed Item " + event.target.result, 4);
        };
        for (var i in items) {
            var request = itemStore.delete(items[i].itemKey);
            request.onsuccess = reqSuccess;
        }
    });
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getItem = function(itemKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("items").objectStore(["items"], "readonly").get(itemKey).onsuccess = success;
    });
};

/**
* Get all the items in this indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.getAllItems = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var items = [];
        var objectStore = idbLibrary.db.transaction(['items'], "readonly").objectStore('items');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            }
            else {
                Z.debug("resolving idb getAllItems with " + items.length + " items", 3);
                resolve(items);
            }
        };
    });
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    return new Promise(function(resolve, reject){
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        if(order == "desc"){
            cursorDirection = "prev";
        }
        
        var cursorRequest = index.openKeyCursor(null, cursorDirection);
        var itemKeys = [];
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

//filter the items in indexedDB by value in field
Zotero.Idb.Library.prototype.filterItems = function(field, value){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.filterItems " + field + " - " + value, 3);
    return new Promise(function(resolve, reject){
        var itemKeys = [];
        var objectStore = idbLibrary.db.transaction(['items'], 'readonly').objectStore('items');
        var index = objectStore.index(field);
        if(!index){
            throw new Error("Index for requested field '" + field + "'' not found");
        }
        
        var cursorDirection = "next";
        /*if(order == "desc"){
            cursorDirection = "prev";
        }*/
        
        var range = IDBKeyRange.only(value);
        var cursorRequest = index.openKeyCursor(range, cursorDirection);
        cursorRequest.onsuccess = J.proxy(function(event) {
            var cursor = event.target.result;
            if (cursor) {
                itemKeys.push(cursor.primaryKey);
                cursor.continue();
            }
            else {
                Z.debug("No more cursor: done. Resolving deferred.", 3);
                resolve(itemKeys);
            }
        }, this);
        
        cursorRequest.onfailure = J.proxy(function(event){
            reject();
        }, this);
    });
};

Zotero.Idb.Library.prototype.addCollections = function(collections){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Added Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.add(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateCollections = function(collections){
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!collections){
            collections = idbLibrary.owningLibrary.collections.collectionsArray;
        }
        
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Updated Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.put(collections[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["collections"], 'readwrite');
        
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Collections transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Collections transaction failed.", 1);
            reject();
        };
        
        var collectionStore = transaction.objectStore("collections");
        var reqSuccess = function(event){
            Zotero.debug("Removed Collection " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = collectionStore.delete(collections[i].collectionKey);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllCollections = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var collections = [];
        var objectStore = idbLibrary.db.transaction('collections').objectStore('collections');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                collections.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(collections);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addTags = function(tags){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["tags"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Add Tags transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Add Tags transaction failed.", 1);
            reject();
        };
        
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event){
            Zotero.debug("Added Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.add(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateTags = function(tags){
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        if(!tags){
            tags = idbLibrary.owningLibrary.tags.tagsArray;
        }
        
        var transaction = idbLibrary.db.transaction(["tags"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("Update Tags transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("Update Tags transaction failed.", 1);
            reject();
        };
        
        var tagStore = transaction.objectStore("tags");
        var reqSuccess = function(event){
            Zotero.debug("Updated Tag " + event.target.result, 4);
        };
        for (var i in tags) {
            var request = tagStore.put(tags[i].dump());
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllTags = function(){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var tags = [];
        var objectStore = idbLibrary.db.transaction(["tags"], "readonly").objectStore('tags');
        var index = objectStore.index("title");
        
        index.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                tags.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(tags);
            }
        };
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, file){
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("set file transaction failed.", 1);
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Set File" + event.target.result, 4);
        };
        var request = fileStore.put(file, key);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get item from indexedDB that has given itemKey
* @param {string} itemKey
*/
Zotero.Idb.Library.prototype.getFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.getFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = J.proxy(function(event){
            resolve(event.target.result);
        }, this);
        idbLibrary.db.transaction("items").objectStore(["files"], "readonly").get(itemKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.deleteFile = function(itemKey){
    Z.debug("Zotero.Idb.Library.deleteFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("delete file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.debug("delete file transaction failed.", 1);
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Deleted File" + event.target.result, 4);
        };
        var request = fileStore.delete(key);
        request.onsuccess = reqSuccess;
    });
};


//intersect two arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersect = function(ar1, ar2){
    var idbLibrary = this;
    var result = [];
    for(var i = 0; i < ar1.length; i++){
        if(ar2.indexOf(ar1[i]) !== -1){
            result.push(ar1[i]);
        }
    }
    return result;
};

//intersect an array of arrays of strings as an AND condition on index results
Zotero.Idb.Library.prototype.intersectAll = function(arrs) {
    var idbLibrary = this;
    var result = arrs[0];
    for(var i = 0; i < arrs.length - 1; i++){
        result = idbLibrary.intersect(result, arrs[i+1]);
    }
    return result;
};
//load a set of collections, following next links until the entire load is complete
/*
Zotero.Library.prototype.loadCollections = function(config){
    Z.debug("Zotero.Library.loadCollections", 3);
    var library = this;
    library.collections.loading = true;
    
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'collections',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'content':'json',
        limit:'100'
    }, config);
    
    if((library.collections.loaded) && (!library.collections.dirty)){
        Z.debug("already have correct collections loaded", 3);
        return Promise.resolve(library.collections);
    }
    
    if(library.collections.loaded && library.collections.dirty){
        library.collections.collectionsArray = [];
        library.collections.loaded = false;
    }
    
    return library.fetchCollections(urlconfig)
    .then(function(response){
        Z.debug('loadCollections proxied callback', 3);
        var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("1 Collections Last-Modified-Version: " + modifiedVersion, 3);
        Zotero.utils.updateSyncState(library.collections, modifiedVersion);
        
        var feed = new Zotero.Feed(response.data, response.jqxhr);
        feed.requestConfig = urlconfig;
        var collections = library.collections;
        var collectionsAdded = collections.addCollectionsFromFeed(feed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        
        Z.debug("done parsing collections feed.", 3);
        if(feed.links.hasOwnProperty('next')){
            Z.debug("has next link.", 3);
            var nextLink = feed.links.next;
            var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
            var newConfig = J.extend({}, config);
            newConfig.start = nextLinkConfig.start;
            newConfig.limit = nextLinkConfig.limit;
            var nextPromise = this.loadCollections(newConfig);
            nextPromise.then(function(collections){
                resolve(collections);
            });
        }
        else{
            Z.debug("no next in collections link", 3);
            collections.collectionsArray.sort(collections.sortByTitleCompare);
            //Nest collections as entries of parent collections
            J.each(collections.collectionsArray, function(index, obj) {
                if(obj.instance === "Zotero.Collection"){
                    if(obj.nestCollection(collections.collectionObjects)){
                        //Z.debug(obj.collectionKey + ":" + obj.title + " nested in parent.", 3);
                    }
                }
            });
            collections.assignDepths(0, collections.collectionsArray);
            
            Z.debug("resolving loadCollections deferred", 3);
            Zotero.utils.updateSyncedVersion(library.collections, 'collectionsVersion');
            Z.debug("New collectionsVersion: " + collections.syncState.earliestVersion, 3);
            collections.dirty = false;
            collections.loaded = true;
            //save collections to cache before resolving
            Z.debug("collections all loaded - saving to cache before resolving deferred", 3);
            Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
            //library.saveCachedCollections();
            Zotero.trigger("collectionsChanged", {library:library});
            resolve(collections);
        }
    });
};

//fetch a set of collections with a single request
Zotero.Library.prototype.fetchCollections = function(config){
    Z.debug("Zotero.Library.fetchCollections", 3);
    var library = this;
    if(!config){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'collections',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'content':'json',
        'limit':'100'
    }, config);
    
    return Zotero.ajaxRequest(urlconfig, 'GET');
};
*/
//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadCollectionsSimple = function(config){
    Z.debug("Zotero.Library.loadCollectionsSimple", 1);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'collections',
                         content: 'json',
                         libraryType: library.libraryType,
                         libraryID: library.libraryID
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var urlconfig = J.extend({}, defaultConfig, config);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        Z.debug('loadCollectionsSimple proxied callback', 1);
        var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
        collectionsfeed.requestConfig = urlconfig;
        //clear out display items
        var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
        for (var i = 0; i < collectionsAdded.length; i++) {
            collectionsAdded[i].associateWithLibrary(library);
        }
        return collectionsAdded;
    });
};

Zotero.Library.prototype.processLoadedCollections = function(response){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    var collectionsfeed = new Zotero.Feed(response.data, response.jqxhr);
    //clear out display items
    var collectionsAdded = library.collections.addCollectionsFromFeed(collectionsfeed);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    //update sync state
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.collections, modifiedVersion);
    
    Zotero.trigger("loadedCollectionsProcessed", {library:library, collectionsAdded:collectionsAdded});
}

//create+write a collection given a name and optional parentCollectionKey
Zotero.Library.prototype.addCollection = function(name, parentCollection){
    Z.debug("Zotero.Library.addCollection", 3);
    var library = this;
    
    var collection = new Zotero.Collection();
    collection.associateWithLibrary(library);
    collection.set('name', name);
    collection.set('parentCollection', parentCollection);
    
    return library.collections.writeCollections([collection]);
};

//make request for item keys and return jquery ajax promise
Zotero.Library.prototype.fetchItemKeys = function(config){
    Z.debug("Zotero.Library.fetchItemKeys", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    var urlconfig = J.extend(true, {
        'target':'items',
        'libraryType':this.libraryType,
        'libraryID':this.libraryID,
        'format':'keys'
    }, config);
    
    return library.ajaxRequest(urlconfig);
};

//get keys of all items marked for deletion
Zotero.Library.prototype.getTrashKeys = function(){
    Z.debug("Zotero.Library.getTrashKeys", 3);
    var library = this;
    var urlconfig = {
        'target': 'items',
        'libraryType': library.libraryType,
        'libraryID': library.libraryID,
        'format': 'keys',
        'collectionKey': 'trash',
    };
    
    return library.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.emptyTrash = function(){
    Z.debug("Zotero.Library.emptyTrash", 3);
    var library = this;
    return library.getTrashKeys()
    .then(function(response){
        Z.debug("got trashedItemKeys");
        var version = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("Version: " + version);
        var trashedItemKeys = response.data.split("\n");
        Z.debug(trashedItemKeys);
        return library.items.deleteItems(trashedItemKeys, version);
    });
};

Zotero.Library.prototype.loadItemKeys = function(config){
    Z.debug("Zotero.Library.loadItemKeys", 3);
    var library = this;
    return this.fetchItemKeys(config)
    .then(function(response){
        Z.debug('loadItemKeys proxied callback', 3);
        var keys = response.data.split(/[\s]+/);
        library.itemKeys = keys;
    });
};

Zotero.Library.prototype.loadItems = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    Z.debug(config);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
                         content: 'json',
                         order: Zotero.config.defaultSortColumn,
                         sort: Zotero.config.defaultSortOrder
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    var urlconfig = J.extend({
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    Z.debug('displayItemsUrl:' + this.items.displayItemsUrl, 4);
    Z.debug('requestUrl:' + requestUrl, 4);
    if((this.items.displayItemsUrl == requestUrl) && !(this.dirty)){
        return Promise.resolve({
            itemsArray:this.items.displayItemsArray,
            feed:this.items.displayItemsFeed,
            library:library
        });
    }
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItems proxied callback', 3);
        //var library = this;
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
        itemfeed.requestConfig = newConfig;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        Zotero.trigger("loadItemsDone", {library:library});
        Zotero.trigger("itemsChanged", {library:library});
        return {itemsArray:loadedItemsArray, feed:itemfeed, library:library};
    })
};

//added so the request is always completed rather than checking if it should be
//important for parallel requests that may load more than what we just want to see right now
Zotero.Library.prototype.loadItemsSimple = function(config){
    Z.debug("Zotero.Library.loadItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         content: 'json',
                        };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        'target':'items',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID
    }, newConfig);
    
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItemsSimple callback', 3);
        var jFeedOb = J(response.data);
        var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
        //itemfeed.requestConfig = newConfig;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromFeed(itemfeed);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        library.items.displayItemsArray = loadedItemsArray;
        library.items.displayItemsUrl = requestUrl;
        library.items.displayItemsFeed = itemfeed;
        library.dirty = false;
        Zotero.trigger("itemsChanged", {library:library});
        return {itemsArray:loadedItemsArray, feed:itemfeed, library:library};
    },
    function(response){
        Z.debug("loadItemsSimple Error");
    });
};

Zotero.Library.prototype.processLoadedItems = function(response){
    Z.debug('processLoadedItems', 3);
    var library = this;
    var jFeedOb = J(response.data);
    var itemfeed = new Zotero.Feed(response.data, response.jqxhr);
    var items = library.items;
    //clear out display items
    var loadedItemsArray = items.addItemsFromFeed(itemfeed);
    for (var i = 0; i < loadedItemsArray.length; i++) {
        loadedItemsArray[i].associateWithLibrary(library);
    }
    
    //update sync state
    var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    Zotero.utils.updateSyncState(library.items, modifiedVersion);
    
    Zotero.trigger("itemsChanged", {library:library, loadedItems:loadedItemsArray});
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    var library = this;
    if(!config){
        var config = {content:'json'};
    }
    
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
        'content':'json'
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        var resultOb = J(response.data);
        var entry = J(response.data).find("entry").eq(0);
        var item = new Zotero.Item();
        item.libraryType = library.libraryType;
        item.libraryID = library.libraryID;
        item.parseXmlItem(entry);
        item.owningLibrary = library;
        library.items.itemObjects[item.itemKey] = item;
        Zotero.trigger("itemsChanged", {library:library});
        return(item);
    },
    function(response){
        Z.debug("Error loading Item");
    });
};

Zotero.Library.prototype.trashItem = function(itemKey){
    var library = this;
    return library.items.trashItems([library.items.getItem(itemKey)]);
};

Zotero.Library.prototype.untrashItem = function(itemKey){
    Z.debug("Zotero.Library.untrashItem", 3);
    if(!itemKey) return false;
    
    var item = this.items.getItem(itemKey);
    item.apiObj.deleted = 0;
    return item.writeItem();
};

Zotero.Library.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Library.deleteItem", 3);
    var library = this;
    return library.items.deleteItem(itemKey);
};

Zotero.Library.prototype.deleteItems = function(itemKeys){
    Z.debug("Zotero.Library.deleteItems", 3);
    var library = this;
    return library.items.deleteItems(itemKeys);
};

Zotero.Library.prototype.addNote = function(itemKey, note){
    Z.debug('Zotero.Library.prototype.addNote', 3);
    var library = this;
    var config = {
        'target':'children',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey
    };
    
    var requestUrl = Zotero.ajax.apiRequestString(config);
    var item = this.items.getItem(itemKey);
    
    return library.ajaxRequest(requestUrl, "POST", {processData: false});
};

Zotero.Library.prototype.fetchGlobalItems = function(config){
    Z.debug("Zotero.Library.fetchGlobalItems", 3);
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         itemPage: 1,
                         limit: 25,
                         content: 'json'
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);
    
    var urlconfig = J.extend({'target':'items', 'libraryType': ''}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:'json'})
    .then(function(response){
        Z.debug('globalItems callback', 3);
        return(response.data);
    });
};

Zotero.Library.prototype.fetchGlobalItem = function(globalKey){
    Z.debug("Zotero.Library.fetchGlobalItem", 3);
    Z.debug(globalKey);
    var library = this;
    
    var defaultConfig = {target:'item'};
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig);
    var urlconfig = J.extend({
        'target':'item',
        'libraryType': '',
        'itemKey': globalKey
    }, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    
    return library.ajaxRequest(requestUrl, "GET", {dataType:"json"})
    .then(function(response){
        Z.debug('globalItem callback', 3);
        return(response.data);
    });
};
Zotero.Library.prototype.fetchTags = function(config){
    Z.debug("Zotero.Library.fetchTags", 3);
    var library = this;
    var defaultConfig = {
        target:'tags',
        order:'title',
        sort:'asc',
        limit: 100,
        content: 'json'
    };
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({
        'target':'tags',
        'libraryType':this.libraryType,
        'libraryID':this.libraryID
    }, newConfig);
    
    return Zotero.ajaxRequest(urlconfig);
};

Zotero.Library.prototype.loadTags = function(config){
    Z.debug("Zotero.Library.loadTags", 3);
    var library = this;
    
    if(typeof config == 'undefined'){
        config = {};
    }
    
    if(config.showAutomaticTags && config.collectionKey){
        delete config.collectionKey;
    }
    
    library.tags.displayTagsArray = [];
    return library.fetchTags(config)
    .then(function(response){
        Z.debug('loadTags proxied callback', 3);
        var modifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
        Z.debug("fetchTags Last-Modified-Version: " + modifiedVersion, 3);
        Zotero.utils.updateSyncState(library.tags, modifiedVersion);
        var tagsfeed = new Zotero.Feed(response.data, response.jqxhr);
        tagsfeed.requestConfig = config;
        var tags = library.tags;
        var addedTags = tags.addTagsFromFeed(tagsfeed);
        
        if(tagsfeed.links.hasOwnProperty('next')){
            library.tags.hasNextLink = true;
            library.tags.nextLink = tagsfeed.links['next'];
        }
        else{
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        
        library.trigger("tagsChanged", {library:library});
        return library.tags;
    });
};


Zotero.Library.prototype.loadAllTags = function(config, checkCached){
    Z.debug("Zotero.Library.loadAllTags", 3);
    Z.debug(config);
    var library = this;
    if(typeof checkCached == 'undefined'){
        checkCached = true; //default to using the cache
    }
    if(typeof config == 'undefined'){
        config = {};
    }
    
    var defaultConfig = {target:'tags',
                         content: 'json',
                         order:'title',
                         sort:'asc',
                         limit: 100,
                         libraryType:library.libraryType,
                         libraryID:library.libraryID
                     };
    
    //Build config object that should be displayed next and compare to currently displayed
    var newConfig = J.extend({}, defaultConfig, config);
    var urlconfig = J.extend({}, newConfig);
    var requestUrl = Zotero.ajax.apiRequestString(urlconfig);
    var tags = library.tags;
    
    //check if already loaded tags are okay to use
    var loadedConfig = J.extend({}, defaultConfig, tags.loadedConfig);
    var loadedConfigRequestUrl = tags.loadedRequestUrl;
    Z.debug("requestUrl: " + requestUrl, 4);
    Z.debug('loadedConfigRequestUrl: ' + loadedConfigRequestUrl, 4);
    return new Promise(function(resolve, reject){
        var continueLoadingCallback = function(tags){
            Z.debug("loadAllTags continueLoadingCallback", 3);
            var plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
            plainList.sort(Zotero.Library.prototype.sortLower);
            tags.plainList = plainList;
            
            Z.debug("done parsing one tags feed - checking for more.", 3);
            
            if(tags.hasNextLink){
                Z.debug("still has next link.", 3);
                tags.tagsArray.sort(library.sortByTitleCompare);
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.sortLower);
                tags.plainList = plainList;
                
                var nextLink = tags.nextLink;
                var nextLinkConfig = J.deparam(J.param.querystring(nextLink.href));
                var newConfig = J.extend({}, config);
                newConfig.start = nextLinkConfig.start;
                newConfig.limit = nextLinkConfig.limit;
                return library.loadTags(newConfig).then(continueLoadingCallback);
            }
            else{
                Z.debug("no next in tags link", 3);
                Zotero.utils.updateSyncedVersion(tags, 'tagsVersion');
                tags.tagsArray.sort(library.sortByTitleCompare);
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.sortLower);
                tags.plainList = plainList;
                Z.debug("resolving loadTags deferred", 3);
                library.tagsLoaded = true;
                library.tags.loaded = true;
                tags.loadedConfig = config;
                tags.loadedRequestUrl = requestUrl;
                
                //update all tags with tagsVersion
                for (var i = 0; i < library.tags.tagsArray.length; i++) {
                    tags.tagsArray[i].tagVersion = tags.tagsVersion;
                }
                
                library.trigger("tagsChanged", {library:library});
                return tags;
            }
        };
        
        resolve( library.loadTags(urlconfig)
        .then(continueLoadingCallback))
    });
};

//download templates for every itemType
Zotero.Library.prototype.loadItemTemplates = function(){
    
};

//download possible creatorTypes for every itemType
Zotero.Library.prototype.loadCreatorTypes = function(){
    
};

//store a single binary file for offline use using Filestorage shim
Zotero.Library.prototype.saveFileOffline = function(item){
    try{
    Z.debug("Zotero.Library.saveFileOffline", 3);
    var library = this;
    var deferred = new J.Deferred();
    
    if(library.filestorage === false){
        return false;
    }
    var enclosureUrl;
    var mimetype;
    if(item.links && item.links['enclosure']){
        enclosureUrl = item.links.enclosure.href;
        mimetype = item.links.enclosure.type;
    }
    else{
        return false;
    }
    
    var reqUrl = enclosureUrl + Zotero.ajax.apiQueryString({});
    
    Z.debug("reqUrl:" + reqUrl, 3);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', Zotero.ajax.proxyWrapper(reqUrl, 'GET'), true);
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
        try{
        if (this.status == 200) {
            Z.debug("Success downloading");
            var blob = this.response;
            //Zotero.temp.fileDataUrl = Util.fileToObjectURL(blob);
            //Zotero.temp.fileUrl = Util.fileToObjectURL(blob);
            library.filestorage.filer.write('/' + item.itemKey, {data:blob, type: mimetype}, J.proxy(function(fileEntry, fileWriter){
                try{
                Z.debug("Success writing file");
                Z.debug("Saved file for item " + item.itemKey + ' for offline use');
                Z.debug("Saving file object somewhere in Zotero namespace:");
                library.filestorage.filer.open(fileEntry, J.proxy(function(file){
                    try{
                    Z.debug("reading back filesystem stored file into object url");
                    //we could return an objectUrl here, but I think that would keep it in memory when we don't necessarily need it
                    //Zotero.temp.fileUrlAfter = Util.fileToObjectURL(file);
                    deferred.resolve(true);
                    }
                    catch(e){
                        Z.debug("Caught in filer.open");
                        Z.debug(e);
                    }
                }, this) );
                }
                catch(e){
                    Z.debug("Caught in filer.write");
                    Z.debug(e);
                }
            }, this) );
        }
        }
        catch(e){
            Z.debug("Caught inside binary xhr onload");
            Z.debug(e);
        }
    };
    xhr.send();
    
    /*
    var downloadDeferred = J.get(Zotero.ajax.proxyWrapper(reqUrl, 'GET'), J.proxy(function(data, textStatus, jqXHR){
        //Z.debug(data);
        Zotero.temp.fileDataUrl = Util.strToDataURL(data, mimetype);
        library.filestorage.filer.write('/' + item.itemKey, {data:data, type: mimetype}, J.proxy(function(fileEntry, fileWriter){
            Z.debug("Success");
            Z.debug("Saved file for item " + item.itemKey + ' for offline use');
            Z.debug("Saving file object somewhere in Zotero namespace:");
            library.filestorage.filer.open(fileEntry, J.proxy(function(file){
                Zotero.temp.fileUrl = Util.fileToObjectURL(file);
            }, this) );
        }, this) );
    }, this) );
     */
        return deferred;
    }
    catch(e){
        Z.debug("Caught in Z.Library.saveFileOffline");
        Z.debug(e);
    }
};

//save a set of files offline, identified by itemkeys
Zotero.Library.prototype.saveFileSetOffline = function(itemKeys){
    Z.debug("Zotero.Library.saveFileSetOffline", 3);
    var library = this;
    var ds = [];
    var deferred = new J.Deferred();
    var item;
    var childItemKeys = [];
    var checkedKeys = {};
    
    J.each(itemKeys, function(ind, itemKey){
        if(checkedKeys.hasOwnProperty(itemKey)){
            return;
        }
        else{
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if(item && item.links && item.links['enclosure']){
            ds.push(library.saveFileOffline(item));
        }
        if(item.numChildren){
            J.each(item.childItemKeys, function(ind, val){
                childItemKeys.push(val);
            });
        }
    });
    
    J.each(childItemKeys, function(ind, itemKey){
        if(checkedKeys.hasOwnProperty(itemKey)){
            return;
        }
        else{
            checkedKeys[itemKey] = 1;
        }
        item = library.items.getItem(itemKey);
        if(item && item.links && item.links['enclosure']){
            ds.push(library.saveFileOffline(item));
        }
    });
    
    J.when.apply(null, ds).then(J.proxy(function(){
        var d = library.filestorage.listOfflineFiles();
        d.then(J.proxy(function(localItemKeys){
            deferred.resolve();
        }, this) );
    }));
    
    return deferred;
};

//store all files from a collection for offline use
//this probably doesn't do anything right now since child items are not part of a collection?
Zotero.Library.prototype.saveCollectionFilesOffline = function(collectionKey){
    Zotero.debug("Zotero.Library.saveCollectionFilesOffline " + collectionKey, 3);
    var library = this;
    var collection = library.collections.getCollection(collectionKey);
    var itemKeys = collection.itemKeys;
    var d = Zotero.Library.prototype.saveFileSetOffline(itemKeys);
    return d;
};

//load objects from indexedDB
Zotero.Library.prototype.loadIndexedDBCache = function(){
    Zotero.debug("Zotero.Library.loadIndexedDBCache", 3);
    
    var library = this;
    
    var itemsPromise = library.idbLibrary.getAllItems();
    var collectionsPromise = library.idbLibrary.getAllCollections();
    var tagsPromise = library.idbLibrary.getAllTags();
    
    itemsPromise.then(function(itemsArray){
        Z.debug("loadIndexedDBCache itemsD done", 3);
        //create itemsDump from array of item objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Items.dump";
        dump.itemsVersion = 0;
        dump.itemsArray = itemsArray;
        for(var i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].itemVersion > latestVersion){
                latestVersion = itemsArray[i].itemVersion;
            }
        }
        dump.itemsVersion = latestVersion;
        library.items.loadDump(dump);
        //TODO: add itemsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    
    collectionsPromise.then(function(collectionsArray){
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        //create collectionsDump from array of collection objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.collectionsVersion = 0;
        dump.collectionsArray = collectionsArray;
        for(var i = 0; i < collectionsArray.length; i++){
            if(collectionsArray[i].collectionVersion > latestVersion){
                latestVersion = collectionsArray[i].collectionVersion;
            }
        }
        dump.collectionsVersion = latestVersion;
        library.collections.loadDump(dump);

        //TODO: add collectionsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.collections.loaded = true;
    });
    
    tagsPromise.then(function(tagsArray){
        //create tagsDump from array of tag objects
        var latestVersion = 0;
        var dump = {};
        dump.instance = "Zotero.Collections.dump";
        dump.tagsVersion = 0;
        dump.tagsArray = tagsArray;
        for(var i = 0; i < tagsArray.length; i++){
            if(tagsArray[i].tagVersion > latestVersion){
                latestVersion = tagsArray[i].tagVersion;
            }
        }
        dump.tagsVersion = latestVersion;
        library.tags.loadDump(dump);

        //TODO: add tagsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.tags.loaded = true;
    });
    
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([itemsPromise, collectionsPromise, tagsPromise]);
};

Zotero.Library.prototype.saveIndexedDB = function(){
    var library = this;
    
    var saveItemsPromise = library.idbLibrary.updateItems(library.items.itemsArray);
    var saveCollectionsPromise = library.idbLibrary.updateCollections(library.collections.collectionsArray);
    var saveTagsPromise = library.idbLibrary.updateTags(library.tags.tagsArray);
    
    //resolve the overall deferred when all the child deferreds are finished
    return Promise.all([saveItemsPromise, saveCollectionsPromise, saveTagsPromise])
};

//load items we currently have saved in the cache back into this library instance
Zotero.Library.prototype.loadCachedItems = function(){
    Zotero.debug("Zotero.Library.loadCachedItems", 3);
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    var itemsDump = Zotero.cache.load(cacheConfig);
    if(itemsDump !== null){
        Zotero.debug("Items dump present in cache - loading items", 3);
        library.items.loadDump(itemsDump);
        library.items.loaded = true;
        return true;
    }
    else{
        return false;
    }
};

//save items we currently have stored in the library into the cache
Zotero.Library.prototype.saveCachedItems = function(){
    //test to see if we have items in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allitems'};
    Zotero.cache.save(cacheConfig, library.items.dump());
    return;
};

//load collections we previously stored in the cache back into this library instance
Zotero.Library.prototype.loadCachedCollections = function(){
    Z.debug("Zotero.Library.loadCachedCollections", 3);
    //test to see if we have collections in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    var collectionsDump = Zotero.cache.load(cacheConfig);
    if(collectionsDump !== null){
        Z.debug("Collections dump present in cache - loading collections", 4);
        library.collections.loadDump(collectionsDump);
        library.collections.loaded = true;
        return true;
    }
    else{
        return false;
    }
};

//save collections we currently have stored in the library into the cache
Zotero.Library.prototype.saveCachedCollections = function(){
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'allcollections'};
    Zotero.cache.save(cacheConfig, library.collections.dump());
    return;
};

Zotero.Library.prototype.loadCachedTags = function(){
    //test to see if we have tagss in cache - TODO:expire or force-reload faster than session storage
    var library = this;
    var cacheConfig = {libraryType:this.libraryType, libraryID:this.libraryID, target:'alltags'};
    var tagsDump = Zotero.cache.load(cacheConfig);
    if(tagsDump !== null){
        Z.debug("Tags dump present in cache - loading", 3);
        library.tags.loadDump(tagsDump);
        library.tags.loaded = true;
        Zotero.trigger("tagsChanged", {library:library});
        return true;
    }
    else{
        return false;
    }
};

Zotero.Library.prototype.saveCachedTags = function(){
    var library = this;
    var cacheConfig = {libraryType:library.libraryType, libraryID:library.libraryID, target:'alltags'};
    Zotero.cache.save(cacheConfig, library.tags.dump());
    return;
};
Zotero.Preferences = function(store, idString) {
    this.store = store;
    this.idString = idString;
    this.preferencesObject = {};
    this.defaults = {
        debug_level: 3, //lower level is higher priority
        debug_log: true,
        debug_mock: false,
        listDisplayedFields: ['title', 'creator', 'dateModified'],
        showAutomaticTags: false,//tagType:1 is automatic, tagType:0 was added by user
        itemsPerPage: 25,
        order: 'title',
        title: 'asc'
    };
    this.load();
};

Zotero.Preferences.prototype.setPref = function(key, value) {
    var preferences = this;
    preferences.preferencesObject[key] = value;
    preferences.persist();
};

Zotero.Preferences.prototype.setPrefs = function(newPrefs) {
    var preferences = this;
    if(typeof(newPrefs) != "object") {
        throw new Error("Preferences must be an object");
    }
    preferences.preferencesObject = newPrefs;
    preferences.persist();
};

Zotero.Preferences.prototype.getPref = function(key){
    var preferences = this;
    if(preferences.preferencesObject[key]){
        return preferences.preferencesObject[key];
    }
    else if(preferences.defaults[key]){
        return preferences.defaults[key];
    }
    else {
        return null;
    }
};

Zotero.Preferences.prototype.getPrefs = function(){
    var preferences = this;
    return preferences.preferencesObject;
};

Zotero.Preferences.prototype.persist = function(){
    var preferences = this;
    var storageString = 'preferences_' + preferences.idString;
    preferences.store[storageString] = JSON.stringify(preferences.preferencesObject);
};

Zotero.Preferences.prototype.load = function(){
    var preferences = this;
    var storageString = 'preferences_' + preferences.idString;
    var storageObjectString = preferences.store[storageString];
    if(!storageObjectString){
        preferences.preferencesObject = {};
    }
    else {
        preferences.preferencesObject = JSON.parse(storageObjectString);
    }
};
