/*
 * jQuery BBQ: Back Button & Query Library - v1.3pre - 8/26/2010
 * http://benalman.com/projects/jquery-bbq-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,r){var h,n=Array.prototype.slice,t=decodeURIComponent,a=$.param,j,c,m,y,b=$.bbq=$.bbq||{},s,x,k,e=$.event.special,d="hashchange",B="querystring",F="fragment",z="elemUrlAttr",l="href",w="src",p=/^.*\?|#.*$/g,u,H,g,i,C,E={};function G(I){return typeof I==="string"}function D(J){var I=n.call(arguments,1);return function(){return J.apply(this,I.concat(n.call(arguments)))}}function o(I){return I.replace(H,"$2")}function q(I){return I.replace(/(?:^[^?#]*\?([^#]*).*$)?.*/,"$1")}function f(K,P,I,L,J){var R,O,N,Q,M;if(L!==h){N=I.match(K?H:/^([^#?]*)\??([^#]*)(#?.*)/);M=N[3]||"";if(J===2&&G(L)){O=L.replace(K?u:p,"")}else{Q=m(N[2]);L=G(L)?m[K?F:B](L):L;O=J===2?L:J===1?$.extend({},L,Q):$.extend({},Q,L);O=j(O);if(K){O=O.replace(g,t)}}R=N[1]+(K?C:O||!N[1]?"?":"")+O+M}else{R=P(I!==h?I:location.href)}return R}a[B]=D(f,0,q);a[F]=c=D(f,1,o);a.sorted=j=function(J,K){var I=[],L={};$.each(a(J,K).split("&"),function(P,M){var O=M.replace(/(?:%5B|=).*$/,""),N=L[O];if(!N){N=L[O]=[];I.push(O)}N.push(M)});return $.map(I.sort(),function(M){return L[M]}).join("&")};c.noEscape=function(J){J=J||"";var I=$.map(J.split(""),encodeURIComponent);g=new RegExp(I.join("|"),"g")};c.noEscape(",/");c.ajaxCrawlable=function(I){if(I!==h){if(I){u=/^.*(?:#!|#)/;H=/^([^#]*)(?:#!|#)?(.*)$/;C="#!"}else{u=/^.*#/;H=/^([^#]*)#?(.*)$/;C="#"}i=!!I}return i};c.ajaxCrawlable(0);$.deparam=m=function(L,I){var K={},J={"true":!0,"false":!1,"null":null};$.each(L.replace(/\+/g," ").split("&"),function(O,T){var N=T.split("="),S=t(N[0]),M,R=K,P=0,U=S.split("]["),Q=U.length-1;if(/\[/.test(U[0])&&/\]$/.test(U[Q])){U[Q]=U[Q].replace(/\]$/,"");U=U.shift().split("[").concat(U);Q=U.length-1}else{Q=0}if(N.length===2){M=t(N[1]);if(I){M=M&&!isNaN(M)?+M:M==="undefined"?h:J[M]!==h?J[M]:M}if(Q){for(;P<=Q;P++){S=U[P]===""?R.length:U[P];R=R[S]=P<Q?R[S]||(U[P+1]&&isNaN(U[P+1])?{}:[]):M}}else{if($.isArray(K[S])){K[S].push(M)}else{if(K[S]!==h){K[S]=[K[S],M]}else{K[S]=M}}}}else{if(S){K[S]=I?h:""}}});return K};function A(K,I,J){if(I===h||typeof I==="boolean"){J=I;I=a[K?F:B]()}else{I=G(I)?I.replace(K?u:p,""):I}return m(I,J)}m[B]=D(A,0);m[F]=y=D(A,1);$[z]||($[z]=function(I){return $.extend(E,I)})({a:l,base:l,iframe:w,img:w,input:w,form:"action",link:l,script:w});k=$[z];function v(L,J,K,I){if(!G(K)&&typeof K!=="object"){I=K;K=J;J=h}return this.each(function(){var O=$(this),M=J||k()[(this.nodeName||"").toLowerCase()]||"",N=M&&O.attr(M)||"";O.attr(M,a[L](N,K,I))})}$.fn[B]=D(v,B);$.fn[F]=D(v,F);b.pushState=s=function(L,I){if(G(L)&&/^#/.test(L)&&I===h){I=2}var K=L!==h,J=c(location.href,K?L:{},K?I:2);location.href=J};b.getState=x=function(I,J){return I===h||typeof I==="boolean"?y(I):y(J)[I]};b.removeState=function(I){var J={};if(I!==h){J=x();$.each($.isArray(I)?I:arguments,function(L,K){delete J[K]})}s(J,2)};e[d]=$.extend(e[d],{add:function(I){var K;function J(M){var L=M[F]=c();M.getState=function(N,O){return N===h||typeof N==="boolean"?m(L,N):m(L,O)[N]};K.apply(this,arguments)}if($.isFunction(I)){K=I;return J}else{K=I.handler;I.handler=J}}})})(jQuery,this);
!function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)"exports"===i[l]?k.push(g={}):k.push(b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/cast",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.cast=b}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:(c[a]=b,void 0)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a="Promise"in window&&"cast"in window.Promise&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var a;return new window.Promise(function(b){a=b}),f(a)}();a||(window.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./cast","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h,i){"use strict";function j(a){if(!w(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof j))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],k(a,this)}function k(a,b){function c(a){p(b,a)}function d(a){r(b,a)}try{a(c,d)}catch(e){d(e)}}function l(a,b,c,d){var e,f,g,h,i=w(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;o(b,e)||(i&&g?p(b,e):h?r(b,f):a===F?p(b,e):a===G&&r(b,e))}function m(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+F]=c,e[f+G]=d}function n(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],l(b,c,d,f);a._subscribers=null}function o(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(v(b)&&(d=b.then,w(d)))return d.call(b,function(d){return c?!0:(c=!0,b!==d?p(a,d):q(a,d),void 0)},function(b){return c?!0:(c=!0,r(a,b),void 0)}),!0}catch(e){return c?!0:(r(a,e),!0)}return!1}function p(a,b){a===b?q(a,b):o(a,b)||q(a,b)}function q(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(s,a))}function r(a,b){a._state===D&&(a._state=E,a._detail=b,u.async(t,a))}function s(a){n(a,a._state=F)}function t(a){n(a,a._state=G)}var u=a.config,v=(a.configure,b.objectOrFunction),w=b.isFunction,x=(b.now,c.cast),y=d.all,z=e.race,A=f.resolve,B=g.reject,C=h.asap;u.async=C;var D=void 0,E=0,F=1,G=2;j.prototype={constructor:j,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;u.async(function(){l(c._state,d,e[c._state-1],c._detail)})}else m(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},j.all=y,j.cast=x,j.race=z,j.resolve=A,j.reject=B,i.Promise=j}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}();(function(a){if(typeof exports==="object"){module.exports=a()}else{if(typeof define==="function"&&define.amd){define(a)}else{var c;try{c=window}catch(b){c=self}c.SparkMD5=a()}}}(function(c){var e=function(s,r){return(s+r)&4294967295},n=function(z,v,u,r,y,w){v=e(e(v,z),e(r,w));return e((v<<y)|(v>>>(32-y)),u)},a=function(v,u,A,z,r,y,w){return n((u&A)|((~u)&z),v,u,r,y,w)},k=function(v,u,A,z,r,y,w){return n((u&z)|(A&(~z)),v,u,r,y,w)},f=function(v,u,A,z,r,y,w){return n(u^A^z,v,u,r,y,w)},p=function(v,u,A,z,r,y,w){return n(A^(u|(~z)),v,u,r,y,w)},d=function(s,u){var t=s[0],r=s[1],w=s[2],v=s[3];t=a(t,r,w,v,u[0],7,-680876936);v=a(v,t,r,w,u[1],12,-389564586);w=a(w,v,t,r,u[2],17,606105819);r=a(r,w,v,t,u[3],22,-1044525330);t=a(t,r,w,v,u[4],7,-176418897);v=a(v,t,r,w,u[5],12,1200080426);w=a(w,v,t,r,u[6],17,-1473231341);r=a(r,w,v,t,u[7],22,-45705983);t=a(t,r,w,v,u[8],7,1770035416);v=a(v,t,r,w,u[9],12,-1958414417);w=a(w,v,t,r,u[10],17,-42063);r=a(r,w,v,t,u[11],22,-1990404162);t=a(t,r,w,v,u[12],7,1804603682);v=a(v,t,r,w,u[13],12,-40341101);w=a(w,v,t,r,u[14],17,-1502002290);r=a(r,w,v,t,u[15],22,1236535329);t=k(t,r,w,v,u[1],5,-165796510);v=k(v,t,r,w,u[6],9,-1069501632);w=k(w,v,t,r,u[11],14,643717713);r=k(r,w,v,t,u[0],20,-373897302);t=k(t,r,w,v,u[5],5,-701558691);v=k(v,t,r,w,u[10],9,38016083);w=k(w,v,t,r,u[15],14,-660478335);r=k(r,w,v,t,u[4],20,-405537848);t=k(t,r,w,v,u[9],5,568446438);v=k(v,t,r,w,u[14],9,-1019803690);w=k(w,v,t,r,u[3],14,-187363961);r=k(r,w,v,t,u[8],20,1163531501);t=k(t,r,w,v,u[13],5,-1444681467);v=k(v,t,r,w,u[2],9,-51403784);w=k(w,v,t,r,u[7],14,1735328473);r=k(r,w,v,t,u[12],20,-1926607734);t=f(t,r,w,v,u[5],4,-378558);v=f(v,t,r,w,u[8],11,-2022574463);w=f(w,v,t,r,u[11],16,1839030562);r=f(r,w,v,t,u[14],23,-35309556);t=f(t,r,w,v,u[1],4,-1530992060);v=f(v,t,r,w,u[4],11,1272893353);w=f(w,v,t,r,u[7],16,-155497632);r=f(r,w,v,t,u[10],23,-1094730640);t=f(t,r,w,v,u[13],4,681279174);v=f(v,t,r,w,u[0],11,-358537222);w=f(w,v,t,r,u[3],16,-722521979);r=f(r,w,v,t,u[6],23,76029189);t=f(t,r,w,v,u[9],4,-640364487);v=f(v,t,r,w,u[12],11,-421815835);w=f(w,v,t,r,u[15],16,530742520);r=f(r,w,v,t,u[2],23,-995338651);t=p(t,r,w,v,u[0],6,-198630844);v=p(v,t,r,w,u[7],10,1126891415);w=p(w,v,t,r,u[14],15,-1416354905);r=p(r,w,v,t,u[5],21,-57434055);t=p(t,r,w,v,u[12],6,1700485571);v=p(v,t,r,w,u[3],10,-1894986606);w=p(w,v,t,r,u[10],15,-1051523);r=p(r,w,v,t,u[1],21,-2054922799);t=p(t,r,w,v,u[8],6,1873313359);v=p(v,t,r,w,u[15],10,-30611744);w=p(w,v,t,r,u[6],15,-1560198380);r=p(r,w,v,t,u[13],21,1309151649);t=p(t,r,w,v,u[4],6,-145523070);v=p(v,t,r,w,u[11],10,-1120210379);w=p(w,v,t,r,u[2],15,718787259);r=p(r,w,v,t,u[9],21,-343485551);s[0]=e(t,s[0]);s[1]=e(r,s[1]);s[2]=e(w,s[2]);s[3]=e(v,s[3])},q=function(t){var u=[],r;for(r=0;r<64;r+=4){u[r>>2]=t.charCodeAt(r)+(t.charCodeAt(r+1)<<8)+(t.charCodeAt(r+2)<<16)+(t.charCodeAt(r+3)<<24)}return u},m=function(r){var t=[],s;for(s=0;s<64;s+=4){t[s>>2]=r[s]+(r[s+1]<<8)+(r[s+2]<<16)+(r[s+3]<<24)}return t},l=function(A){var u=A.length,r=[1732584193,-271733879,-1732584194,271733878],w,t,z,x,y,v;for(w=64;w<=u;w+=64){d(r,q(A.substring(w-64,w)))}A=A.substring(w-64);t=A.length;z=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(w=0;w<t;w+=1){z[w>>2]|=A.charCodeAt(w)<<((w%4)<<3)}z[w>>2]|=128<<((w%4)<<3);if(w>55){d(r,z);for(w=0;w<16;w+=1){z[w]=0}}x=u*8;x=x.toString(16).match(/(.*?)(.{0,8})$/);y=parseInt(x[2],16);v=parseInt(x[1],16)||0;z[14]=y;z[15]=v;d(r,z);return r},o=function(z){var t=z.length,r=[1732584193,-271733879,-1732584194,271733878],v,s,y,w,x,u;for(v=64;v<=t;v+=64){d(r,m(z.subarray(v-64,v)))}z=(v-64)<t?z.subarray(v-64):new Uint8Array(0);s=z.length;y=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(v=0;v<s;v+=1){y[v>>2]|=z[v]<<((v%4)<<3)}y[v>>2]|=128<<((v%4)<<3);if(v>55){d(r,y);for(v=0;v<16;v+=1){y[v]=0}}w=t*8;w=w.toString(16).match(/(.*?)(.{0,8})$/);x=parseInt(w[2],16);u=parseInt(w[1],16)||0;y[14]=x;y[15]=u;d(r,y);return r},j=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],h=function(u){var t="",r;for(r=0;r<4;r+=1){t+=j[(u>>(r*8+4))&15]+j[(u>>(r*8))&15]}return t},b=function(r){var s;for(s=0;s<r.length;s+=1){r[s]=h(r[s])}return r.join("")},i=function(r){return b(l(r))},g=function(){this.reset()};if(i("hello")!=="5d41402abc4b2a76b9719d911017c592"){e=function(r,u){var t=(r&65535)+(u&65535),s=(r>>16)+(u>>16)+(t>>16);return(s<<16)|(t&65535)}}g.prototype.append=function(r){if(/[\u0080-\uFFFF]/.test(r)){r=unescape(encodeURIComponent(r))}this.appendBinary(r);return this};g.prototype.appendBinary=function(t){this._buff+=t;this._length+=t.length;var s=this._buff.length,r;for(r=64;r<=s;r+=64){d(this._state,q(this._buff.substring(r-64,r)))}this._buff=this._buff.substr(r-64);return this};g.prototype.end=function(t){var w=this._buff,v=w.length,u,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],r;for(u=0;u<v;u+=1){s[u>>2]|=w.charCodeAt(u)<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.prototype._finish=function(s,w){var u=w,t,v,r;s[u>>2]|=128<<((u%4)<<3);if(u>55){d(this._state,s);for(u=0;u<16;u+=1){s[u]=0}}t=this._length*8;t=t.toString(16).match(/(.*?)(.{0,8})$/);v=parseInt(t[2],16);r=parseInt(t[1],16)||0;s[14]=v;s[15]=r;d(this._state,s)};g.prototype.reset=function(){this._buff="";this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.prototype.destroy=function(){delete this._state;delete this._buff;delete this._length};g.hash=function(t,r){if(/[\u0080-\uFFFF]/.test(t)){t=unescape(encodeURIComponent(t))}var s=l(t);return !!r?s:b(s)};g.hashBinary=function(s,r){var t=l(s);return !!r?t:b(t)};g.ArrayBuffer=function(){this.reset()};g.ArrayBuffer.prototype.append=function(r){var u=this._concatArrayBuffer(this._buff,r),t=u.length,s;this._length+=r.byteLength;for(s=64;s<=t;s+=64){d(this._state,m(u.subarray(s-64,s)))}this._buff=(s-64)<t?u.subarray(s-64):new Uint8Array(0);return this};g.ArrayBuffer.prototype.end=function(t){var w=this._buff,v=w.length,s=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],u,r;for(u=0;u<v;u+=1){s[u>>2]|=w[u]<<((u%4)<<3)}this._finish(s,v);r=!!t?this._state:b(this._state);this.reset();return r};g.ArrayBuffer.prototype._finish=g.prototype._finish;g.ArrayBuffer.prototype.reset=function(){this._buff=new Uint8Array(0);this._length=0;this._state=[1732584193,-271733879,-1732584194,271733878];return this};g.ArrayBuffer.prototype.destroy=g.prototype.destroy;g.ArrayBuffer.prototype._concatArrayBuffer=function(u,s){var t=u.length,r=new Uint8Array(t+s.byteLength);r.set(u);r.set(new Uint8Array(s),t);return r};g.ArrayBuffer.hash=function(r,s){var t=o(new Uint8Array(r));return !!s?t:b(t)};return g}));
/*! IndexedDBShim - v0.1.2 - 2013-07-11 */
"use strict";var idbModules={};(function(e){function t(e,t,n,o){n.target=t,"function"==typeof t[e]&&t[e].apply(t,[n]),"function"==typeof o&&o()}function n(t,n,o){var i=new DOMException.constructor(0,n);throw i.name=t,i.message=n,e.DEBUG&&(console.log(t,n,o,i),console.trace&&console.trace()),i}var o=function(){this.length=0,this._items=[],Object.defineProperty&&Object.defineProperty(this,"_items",{enumerable:!1})};if(o.prototype={contains:function(e){return-1!==this._items.indexOf(e)},item:function(e){return this._items[e]},indexOf:function(e){return this._items.indexOf(e)},push:function(e){this._items.push(e),this.length+=1;for(var t=0;this._items.length>t;t++)this[t]=this._items[t]},splice:function(){this._items.splice.apply(this._items,arguments),this.length=this._items.length;for(var e in this)e===parseInt(e,10)+""&&delete this[e];for(e=0;this._items.length>e;e++)this[e]=this._items[e]}},Object.defineProperty)for(var i in{indexOf:!1,push:!1,splice:!1})Object.defineProperty(o.prototype,i,{enumerable:!1});e.util={throwDOMException:n,callback:t,quote:function(e){return"'"+e+"'"},StringList:o}})(idbModules),function(idbModules){var Sca=function(){return{decycle:function(object,callback){function checkForCompletion(){0===queuedObjects.length&&returnCallback(derezObj)}function readBlobAsDataURL(e,t){var n=new FileReader;n.onloadend=function(e){var n=e.target.result,o="blob";updateEncodedBlob(n,t,o)},n.readAsDataURL(e)}function updateEncodedBlob(dataURL,path,blobtype){var encoded=queuedObjects.indexOf(path);path=path.replace("$","derezObj"),eval(path+'.$enc="'+dataURL+'"'),eval(path+'.$type="'+blobtype+'"'),queuedObjects.splice(encoded,1),checkForCompletion()}function derez(e,t){var n,o,i;if(!("object"!=typeof e||null===e||e instanceof Boolean||e instanceof Date||e instanceof Number||e instanceof RegExp||e instanceof Blob||e instanceof String)){for(n=0;objects.length>n;n+=1)if(objects[n]===e)return{$ref:paths[n]};if(objects.push(e),paths.push(t),"[object Array]"===Object.prototype.toString.apply(e))for(i=[],n=0;e.length>n;n+=1)i[n]=derez(e[n],t+"["+n+"]");else{i={};for(o in e)Object.prototype.hasOwnProperty.call(e,o)&&(i[o]=derez(e[o],t+"["+JSON.stringify(o)+"]"))}return i}return e instanceof Blob?(queuedObjects.push(t),readBlobAsDataURL(e,t)):e instanceof Boolean?e={$type:"bool",$enc:""+e}:e instanceof Date?e={$type:"date",$enc:e.getTime()}:e instanceof Number?e={$type:"num",$enc:""+e}:e instanceof RegExp&&(e={$type:"regex",$enc:""+e}),e}var objects=[],paths=[],queuedObjects=[],returnCallback=callback,derezObj=derez(object,"$");checkForCompletion()},retrocycle:function retrocycle($){function dataURLToBlob(e){var t,n,o,i=";base64,";if(-1===e.indexOf(i))return n=e.split(","),t=n[0].split(":")[1],o=n[1],new Blob([o],{type:t});n=e.split(i),t=n[0].split(":")[1],o=window.atob(n[1]);for(var r=o.length,a=new Uint8Array(r),s=0;r>s;++s)a[s]=o.charCodeAt(s);return new Blob([a.buffer],{type:t})}function rez(value){var i,item,name,path;if(value&&"object"==typeof value)if("[object Array]"===Object.prototype.toString.apply(value))for(i=0;value.length>i;i+=1)item=value[i],item&&"object"==typeof item&&(path=item.$ref,value[i]="string"==typeof path&&px.test(path)?eval(path):rez(item));else if(void 0!==value.$type)switch(value.$type){case"blob":case"file":value=dataURLToBlob(value.$enc);break;case"bool":value=Boolean("true"===value.$enc);break;case"date":value=new Date(value.$enc);break;case"num":value=Number(value.$enc);break;case"regex":value=eval(value.$enc)}else for(name in value)"object"==typeof value[name]&&(item=value[name],item&&(path=item.$ref,value[name]="string"==typeof path&&px.test(path)?eval(path):rez(item)));return value}var px=/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;return rez($),$},encode:function(e,t){function n(e){t(JSON.stringify(e))}this.decycle(e,n)},decode:function(e){return this.retrocycle(JSON.parse(e))}}}();idbModules.Sca=Sca}(idbModules),function(e){var t=["","number","string","boolean","object","undefined"],n=function(){return{encode:function(e){return t.indexOf(typeof e)+"-"+JSON.stringify(e)},decode:function(e){return e===void 0?void 0:JSON.parse(e.substring(2))}}},o={number:n("number"),"boolean":n(),object:n(),string:{encode:function(e){return t.indexOf("string")+"-"+e},decode:function(e){return""+e.substring(2)}},undefined:{encode:function(){return t.indexOf("undefined")+"-undefined"},decode:function(){return void 0}}},i=function(){return{encode:function(e){return o[typeof e].encode(e)},decode:function(e){return o[t[e.substring(0,1)]].decode(e)}}}();e.Key=i}(idbModules),function(e){var t=function(e,t){return{type:e,debug:t,bubbles:!1,cancelable:!1,eventPhase:0,timeStamp:new Date}};e.Event=t}(idbModules),function(e){var t=function(){this.onsuccess=this.onerror=this.result=this.error=this.source=this.transaction=null,this.readyState="pending"},n=function(){this.onblocked=this.onupgradeneeded=null};n.prototype=t,e.IDBRequest=t,e.IDBOpenRequest=n}(idbModules),function(e,t){var n=function(e,t,n,o){this.lower=e,this.upper=t,this.lowerOpen=n,this.upperOpen=o};n.only=function(e){return new n(e,e,!0,!0)},n.lowerBound=function(e,o){return new n(e,t,o,t)},n.upperBound=function(e){return new n(t,e,t,open)},n.bound=function(e,t,o,i){return new n(e,t,o,i)},e.IDBKeyRange=n}(idbModules),function(e,t){function n(n,o,i,r,a,s){this.__range=n,this.source=this.__idbObjectStore=i,this.__req=r,this.key=t,this.direction=o,this.__keyColumnName=a,this.__valueColumnName=s,this.source.transaction.__active||e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."),this.__offset=-1,this.__lastKeyContinued=t,this["continue"]()}n.prototype.__find=function(n,o,i,r){var a=this,s=["SELECT * FROM ",e.util.quote(a.__idbObjectStore.name)],u=[];s.push("WHERE ",a.__keyColumnName," NOT NULL"),a.__range&&(a.__range.lower||a.__range.upper)&&(s.push("AND"),a.__range.lower&&(s.push(a.__keyColumnName+(a.__range.lowerOpen?" >":" >= ")+" ?"),u.push(e.Key.encode(a.__range.lower))),a.__range.lower&&a.__range.upper&&s.push("AND"),a.__range.upper&&(s.push(a.__keyColumnName+(a.__range.upperOpen?" < ":" <= ")+" ?"),u.push(e.Key.encode(a.__range.upper)))),n!==t&&(a.__lastKeyContinued=n,a.__offset=0),a.__lastKeyContinued!==t&&(s.push("AND "+a.__keyColumnName+" >= ?"),u.push(e.Key.encode(a.__lastKeyContinued))),s.push("ORDER BY ",a.__keyColumnName),s.push("LIMIT 1 OFFSET "+a.__offset),e.DEBUG&&console.log(s.join(" "),u),o.executeSql(s.join(" "),u,function(n,o){if(1===o.rows.length){var r=e.Key.decode(o.rows.item(0)[a.__keyColumnName]),s="value"===a.__valueColumnName?e.Sca.decode(o.rows.item(0)[a.__valueColumnName]):e.Key.decode(o.rows.item(0)[a.__valueColumnName]);i(r,s)}else e.DEBUG&&console.log("Reached end of cursors"),i(t,t)},function(t,n){e.DEBUG&&console.log("Could not execute Cursor.continue"),r(n)})},n.prototype["continue"]=function(e){var n=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){n.__offset++,n.__find(e,o,function(e,o){n.key=e,n.value=o,r(n.key!==t?n:t,n.__req)},function(e){a(e)})})},n.prototype.advance=function(n){0>=n&&e.util.throwDOMException("Type Error - Count is invalid - 0 or negative",n);var o=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,i,r,a){o.__offset+=n,o.__find(t,e,function(e,n){o.key=e,o.value=n,r(o.key!==t?o:t,o.__req)},function(e){a(e)})})},n.prototype.update=function(n){var o=this,i=this.__idbObjectStore.transaction.__createRequest(function(){});return e.Sca.encode(n,function(n){this.__idbObjectStore.__pushToQueue(i,function(i,r,a,s){o.__find(t,i,function(t){var r="UPDATE "+e.util.quote(o.__idbObjectStore.name)+" SET value = ? WHERE key = ?";e.DEBUG&&console.log(r,n,t),i.executeSql(r,[e.Sca.encode(n),e.Key.encode(t)],function(e,n){1===n.rowsAffected?a(t):s("No rowns with key found"+t)},function(e,t){s(t)})},function(e){s(e)})})}),i},n.prototype["delete"]=function(){var n=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){n.__find(t,o,function(i){var s="DELETE FROM  "+e.util.quote(n.__idbObjectStore.name)+" WHERE key = ?";e.DEBUG&&console.log(s,i),o.executeSql(s,[e.Key.encode(i)],function(e,n){1===n.rowsAffected?r(t):a("No rowns with key found"+i)},function(e,t){a(t)})},function(e){a(e)})})},e.IDBCursor=n}(idbModules),function(idbModules,undefined){function IDBIndex(e,t){this.indexName=this.name=e,this.__idbObjectStore=this.objectStore=this.source=t;var n=t.__storeProps&&t.__storeProps.indexList;n&&(n=JSON.parse(n)),this.keyPath=n&&n[e]&&n[e].keyPath||e,["multiEntry","unique"].forEach(function(t){this[t]=!!(n&&n[e]&&n[e].optionalParams&&n[e].optionalParams[t])},this)}IDBIndex.prototype.__createIndex=function(indexName,keyPath,optionalParameters){var me=this,transaction=me.__idbObjectStore.transaction;transaction.__addToTransactionQueue(function(tx,args,success,failure){me.__idbObjectStore.__getStoreProps(tx,function(){function error(){idbModules.util.throwDOMException(0,"Could not create new index",arguments)}2!==transaction.mode&&idbModules.util.throwDOMException(0,"Invalid State error, not a version transaction",me.transaction);var idxList=JSON.parse(me.__idbObjectStore.__storeProps.indexList);idxList[indexName]!==undefined&&idbModules.util.throwDOMException(0,"Index already exists on store",idxList);var columnName=indexName;idxList[indexName]={columnName:columnName,keyPath:keyPath,optionalParams:optionalParameters},me.__idbObjectStore.__storeProps.indexList=JSON.stringify(idxList);var sql=["ALTER TABLE",idbModules.util.quote(me.__idbObjectStore.name),"ADD",columnName,"BLOB"].join(" ");idbModules.DEBUG&&console.log(sql),tx.executeSql(sql,[],function(tx,data){tx.executeSql("SELECT * FROM "+idbModules.util.quote(me.__idbObjectStore.name),[],function(tx,data){(function initIndexForRow(i){if(data.rows.length>i)try{var value=idbModules.Sca.decode(data.rows.item(i).value),indexKey=eval("value['"+keyPath+"']");tx.executeSql("UPDATE "+idbModules.util.quote(me.__idbObjectStore.name)+" set "+columnName+" = ? where key = ?",[idbModules.Key.encode(indexKey),data.rows.item(i).key],function(){initIndexForRow(i+1)},error)}catch(e){initIndexForRow(i+1)}else idbModules.DEBUG&&console.log("Updating the indexes in table",me.__idbObjectStore.__storeProps),tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?",[me.__idbObjectStore.__storeProps.indexList,me.__idbObjectStore.name],function(){me.__idbObjectStore.__setReadyState("createIndex",!0),success(me)},error)})(0)},error)},error)},"createObjectStore")})},IDBIndex.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"value"),n},IDBIndex.prototype.openKeyCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"key"),n},IDBIndex.prototype.__fetchIndexData=function(e,t){var n=this;return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o,i,r,a){var s=["SELECT * FROM ",idbModules.util.quote(n.__idbObjectStore.name)," WHERE",n.indexName,"NOT NULL"],u=[];e!==undefined&&(s.push("AND",n.indexName," = ?"),u.push(idbModules.Key.encode(e))),idbModules.DEBUG&&console.log("Trying to fetch data for Index",s.join(" "),u),o.executeSql(s.join(" "),u,function(e,n){var o;o="count"==typeof t?n.rows.length:0===n.rows.length?undefined:"key"===t?idbModules.Key.decode(n.rows.item(0).key):idbModules.Sca.decode(n.rows.item(0).value),r(o)},a)})},IDBIndex.prototype.get=function(e){return this.__fetchIndexData(e,"value")},IDBIndex.prototype.getKey=function(e){return this.__fetchIndexData(e,"key")},IDBIndex.prototype.count=function(e){return this.__fetchIndexData(e,"count")},idbModules.IDBIndex=IDBIndex}(idbModules),function(idbModules){var IDBObjectStore=function(e,t,n){this.name=e,this.transaction=t,this.__ready={},this.__setReadyState("createObjectStore",n===void 0?!0:n),this.indexNames=new idbModules.util.StringList};IDBObjectStore.prototype.__setReadyState=function(e,t){this.__ready[e]=t},IDBObjectStore.prototype.__waitForReady=function(e,t){var n=!0;if(t!==void 0)n=this.__ready[t]===void 0?!0:this.__ready[t];else for(var o in this.__ready)this.__ready[o]||(n=!1);if(n)e();else{idbModules.DEBUG&&console.log("Waiting for to be ready",t);var i=this;window.setTimeout(function(){i.__waitForReady(e,t)},100)}},IDBObjectStore.prototype.__getStoreProps=function(e,t,n){var o=this;this.__waitForReady(function(){o.__storeProps?(idbModules.DEBUG&&console.log("Store properties - cached",o.__storeProps),t(o.__storeProps)):e.executeSql("SELECT * FROM __sys__ where name = ?",[o.name],function(e,n){1!==n.rows.length?t():(o.__storeProps={name:n.rows.item(0).name,indexList:n.rows.item(0).indexList,autoInc:n.rows.item(0).autoInc,keyPath:n.rows.item(0).keyPath},idbModules.DEBUG&&console.log("Store properties",o.__storeProps),t(o.__storeProps))},function(){t()})},n)},IDBObjectStore.prototype.__deriveKey=function(tx,value,key,callback){function getNextAutoIncKey(){tx.executeSql("SELECT * FROM sqlite_sequence where name like ?",[me.name],function(e,t){1!==t.rows.length?callback(0):callback(t.rows.item(0).seq)},function(e,t){idbModules.util.throwDOMException(0,"Data Error - Could not get the auto increment value for key",t)})}var me=this;me.__getStoreProps(tx,function(props){if(props||idbModules.util.throwDOMException(0,"Data Error - Could not locate defination for this table",props),props.keyPath)if(key!==void 0&&idbModules.util.throwDOMException(0,"Data Error - The object store uses in-line keys and the key parameter was provided",props),value)try{var primaryKey=eval("value['"+props.keyPath+"']");primaryKey?callback(primaryKey):"true"===props.autoInc?getNextAutoIncKey():idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath")}catch(e){idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath",e)}else idbModules.util.throwDOMException(0,"Data Error - KeyPath was specified, but value was not");else key!==void 0?callback(key):"false"===props.autoInc?idbModules.util.throwDOMException(0,"Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ",props):getNextAutoIncKey()})},IDBObjectStore.prototype.__insertData=function(tx,value,primaryKey,success,error){var paramMap={};primaryKey!==void 0&&(paramMap.key=idbModules.Key.encode(primaryKey));var indexes=JSON.parse(this.__storeProps.indexList);for(var key in indexes)try{paramMap[indexes[key].columnName]=idbModules.Key.encode(eval("value['"+indexes[key].keyPath+"']"))}catch(e){error(e)}var sqlStart=["INSERT INTO ",idbModules.util.quote(this.name),"("],sqlEnd=[" VALUES ("],sqlValues=[];for(key in paramMap)sqlStart.push(key+","),sqlEnd.push("?,"),sqlValues.push(paramMap[key]);sqlStart.push("value )"),sqlEnd.push("?)"),sqlValues.push(value);var sql=sqlStart.join(" ")+sqlEnd.join(" ");idbModules.DEBUG&&console.log("SQL for adding",sql,sqlValues),tx.executeSql(sql,sqlValues,function(){success(primaryKey)},function(e,t){error(t)})},IDBObjectStore.prototype.add=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(i){n.transaction.__pushToQueue(o,function(o,r,a,s){n.__deriveKey(o,e,t,function(e){n.__insertData(o,i,e,a,s)})})}),o},IDBObjectStore.prototype.put=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(i){n.transaction.__pushToQueue(o,function(o,r,a,s){n.__deriveKey(o,e,t,function(e){var t="DELETE FROM "+idbModules.util.quote(n.name)+" where key = ?";o.executeSql(t,[idbModules.Key.encode(e)],function(t,o){idbModules.DEBUG&&console.log("Did the row with the",e,"exist? ",o.rowsAffected),n.__insertData(t,i,e,a,s)},function(e,t){s(t)})})})}),o},IDBObjectStore.prototype.get=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("SELECT * FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Fetched data",t);try{if(0===t.rows.length)return i();i(idbModules.Sca.decode(t.rows.item(0).value))}catch(n){idbModules.DEBUG&&console.log(n),i(void 0)}},function(e,t){r(t)})})})},IDBObjectStore.prototype["delete"]=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("DELETE FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Deleted from database",t.rowsAffected),i()},function(e,t){r(t)})})})},IDBObjectStore.prototype.clear=function(){var e=this;return e.transaction.__addToTransactionQueue(function(t,n,o,i){e.__waitForReady(function(){t.executeSql("DELETE FROM "+idbModules.util.quote(e.name),[],function(e,t){idbModules.DEBUG&&console.log("Cleared all records from database",t.rowsAffected),o()},function(e,t){i(t)})})})},IDBObjectStore.prototype.count=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,i,r){t.__waitForReady(function(){var o="SELECT * FROM "+idbModules.util.quote(t.name)+(e!==void 0?" WHERE key = ?":""),a=[];e!==void 0&&a.push(idbModules.Key.encode(e)),n.executeSql(o,a,function(e,t){i(t.rows.length)},function(e,t){r(t)})})})},IDBObjectStore.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this,n,"key","value"),n},IDBObjectStore.prototype.index=function(e){var t=new idbModules.IDBIndex(e,this);return t},IDBObjectStore.prototype.createIndex=function(e,t,n){var o=this;n=n||{},o.__setReadyState("createIndex",!1);var i=new idbModules.IDBIndex(e,o);return o.__waitForReady(function(){i.__createIndex(e,t,n)},"createObjectStore"),o.indexNames.push(e),i},IDBObjectStore.prototype.deleteIndex=function(e){var t=new idbModules.IDBIndex(e,this,!1);return t.__deleteIndex(e),t},idbModules.IDBObjectStore=IDBObjectStore}(idbModules),function(e){var t=0,n=1,o=2,i=function(o,i,r){if("number"==typeof i)this.mode=i,2!==i&&e.DEBUG&&console.log("Mode should be a string, but was specified as ",i);else if("string"==typeof i)switch(i){case"readwrite":this.mode=n;break;case"readonly":this.mode=t;break;default:this.mode=t}this.storeNames="string"==typeof o?[o]:o;for(var a=0;this.storeNames.length>a;a++)r.objectStoreNames.contains(this.storeNames[a])||e.util.throwDOMException(0,"The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",this.storeNames[a]);this.__active=!0,this.__running=!1,this.__requests=[],this.__aborted=!1,this.db=r,this.error=null,this.onabort=this.onerror=this.oncomplete=null};i.prototype.__executeRequests=function(){if(this.__running&&this.mode!==o)return e.DEBUG&&console.log("Looks like the request set is already running",this.mode),void 0;this.__running=!0;var t=this;window.setTimeout(function(){2===t.mode||t.__active||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",t.__active),t.db.__db.transaction(function(n){function o(t,n){n&&(a.req=n),a.req.readyState="done",a.req.result=t,delete a.req.error;var o=e.Event("success");e.util.callback("onsuccess",a.req,o),s++,r()}function i(){a.req.readyState="done",a.req.error="DOMError";var t=e.Event("error",arguments);e.util.callback("onerror",a.req,t),s++,r()}function r(){return s>=t.__requests.length?(t.__active=!1,t.__requests=[],void 0):(a=t.__requests[s],a.op(n,a.args,o,i),void 0)}t.__tx=n;var a=null,s=0;try{r()}catch(u){e.DEBUG&&console.log("An exception occured in transaction",arguments),"function"==typeof t.onerror&&t.onerror()}},function(){e.DEBUG&&console.log("An error in transaction",arguments),"function"==typeof t.onerror&&t.onerror()},function(){e.DEBUG&&console.log("Transaction completed",arguments),"function"==typeof t.oncomplete&&t.oncomplete()})},1)},i.prototype.__addToTransactionQueue=function(t,n){this.__active||this.mode===o||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished.",this.__mode);var i=this.__createRequest();return this.__pushToQueue(i,t,n),i},i.prototype.__createRequest=function(){var t=new e.IDBRequest;return t.source=this.db,t},i.prototype.__pushToQueue=function(e,t,n){this.__requests.push({op:t,args:n,req:e}),this.__executeRequests()},i.prototype.objectStore=function(t){return new e.IDBObjectStore(t,this)},i.prototype.abort=function(){!this.__active&&e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",this.__active)},i.prototype.READ_ONLY=0,i.prototype.READ_WRITE=1,i.prototype.VERSION_CHANGE=2,e.IDBTransaction=i}(idbModules),function(e){var t=function(t,n,o,i){this.__db=t,this.version=o,this.__storeProperties=i,this.objectStoreNames=new e.util.StringList;for(var r=0;i.rows.length>r;r++)this.objectStoreNames.push(i.rows.item(r).name);this.name=n,this.onabort=this.onerror=this.onversionchange=null};t.prototype.createObjectStore=function(t,n){var o=this;n=n||{},n.keyPath=n.keyPath||null;var i=new e.IDBObjectStore(t,o.__versionTransaction,!1),r=o.__versionTransaction;return r.__addToTransactionQueue(function(r,a,s){function u(){e.util.throwDOMException(0,"Could not create new object store",arguments)}o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction);var c=["CREATE TABLE",e.util.quote(t),"(key BLOB",n.autoIncrement?", inc INTEGER PRIMARY KEY AUTOINCREMENT":"PRIMARY KEY",", value BLOB)"].join(" ");e.DEBUG&&console.log(c),r.executeSql(c,[],function(e){e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)",[t,n.keyPath,n.autoIncrement?!0:!1,"{}"],function(){i.__setReadyState("createObjectStore",!0),s(i)},u)},u)}),o.objectStoreNames.push(t),i},t.prototype.deleteObjectStore=function(t){var n=function(){e.util.throwDOMException(0,"Could not delete ObjectStore",arguments)},o=this;!o.objectStoreNames.contains(t)&&n("Object Store does not exist"),o.objectStoreNames.splice(o.objectStoreNames.indexOf(t),1);var i=o.__versionTransaction;i.__addToTransactionQueue(function(){o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction),o.__db.transaction(function(o){o.executeSql("SELECT * FROM __sys__ where name = ?",[t],function(o,i){i.rows.length>0&&o.executeSql("DROP TABLE "+e.util.quote(t),[],function(){o.executeSql("DELETE FROM __sys__ WHERE name = ?",[t],function(){},n)},n)})})})},t.prototype.close=function(){},t.prototype.transaction=function(t,n){var o=new e.IDBTransaction(t,n||1,this);return o},e.IDBDatabase=t}(idbModules),function(e){var t=4194304;if(window.openDatabase){var n=window.openDatabase("__sysdb__",1,"System Database",t);n.transaction(function(t){t.executeSql("SELECT * FROM dbVersions",[],function(){},function(){n.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);",[],function(){},function(){e.util.throwDOMException("Could not create table __sysdb__ to save DB versions")})})})},function(){e.DEBUG&&console.log("Error in sysdb transaction - when selecting from dbVersions",arguments)});var o={open:function(o,i){function r(){if(!u){var t=e.Event("error",arguments);s.readyState="done",s.error="DOMError",e.util.callback("onerror",s,t),u=!0}}function a(a){var u=window.openDatabase(o,1,o,t);s.readyState="done",i===void 0&&(i=a||1),(0>=i||a>i)&&e.util.throwDOMException(0,"An attempt was made to open a database using a lower version than the existing version.",i),u.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)",[],function(){t.executeSql("SELECT * FROM __sys__",[],function(t,c){var d=e.Event("success");s.source=s.result=new e.IDBDatabase(u,o,i,c),i>a?n.transaction(function(t){t.executeSql("UPDATE dbVersions set version = ? where name = ?",[i,o],function(){var t=e.Event("upgradeneeded");t.oldVersion=a,t.newVersion=i,s.transaction=s.result.__versionTransaction=new e.IDBTransaction([],2,s.source),e.util.callback("onupgradeneeded",s,t,function(){var t=e.Event("success");e.util.callback("onsuccess",s,t)})},r)},r):e.util.callback("onsuccess",s,d)},r)},r)},r)}var s=new e.IDBOpenRequest,u=!1;return n.transaction(function(e){e.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(e,t){0===t.rows.length?e.executeSql("INSERT INTO dbVersions VALUES (?,?)",[o,i||1],function(){a(0)},r):a(t.rows.item(0).version)},r)},r),s},deleteDatabase:function(o){function i(t){if(!s){a.readyState="done",a.error="DOMError";var n=e.Event("error");n.message=t,n.debug=arguments,e.util.callback("onerror",a,n),s=!0}}function r(){n.transaction(function(t){t.executeSql("DELETE FROM dbVersions where name = ? ",[o],function(){a.result=void 0;var t=e.Event("success");t.newVersion=null,t.oldVersion=u,e.util.callback("onsuccess",a,t)},i)},i)}var a=new e.IDBOpenRequest,s=!1,u=null;return n.transaction(function(n){n.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(n,s){if(0===s.rows.length){a.result=void 0;var c=e.Event("success");return c.newVersion=null,c.oldVersion=u,e.util.callback("onsuccess",a,c),void 0}u=s.rows.item(0).version;var d=window.openDatabase(o,1,o,t);d.transaction(function(t){t.executeSql("SELECT * FROM __sys__",[],function(t,n){var o=n.rows;(function a(n){n>=o.length?t.executeSql("DROP TABLE __sys__",[],function(){r()},i):t.executeSql("DROP TABLE "+e.util.quote(o.item(n).name),[],function(){a(n+1)},function(){a(n+1)})})(0)},function(){r()})},i)})},i),a},cmp:function(t,n){return e.Key.encode(t)>e.Key.encode(n)?1:t===n?0:-1}};e.shimIndexedDB=o}}(idbModules),function(e,t){e.openDatabase!==void 0&&(e.shimIndexedDB=t.shimIndexedDB,e.shimIndexedDB&&(e.shimIndexedDB.__useShim=function(){e.indexedDB=t.shimIndexedDB,e.IDBDatabase=t.IDBDatabase,e.IDBTransaction=t.IDBTransaction,e.IDBCursor=t.IDBCursor,e.IDBKeyRange=t.IDBKeyRange},e.shimIndexedDB.__debug=function(e){t.DEBUG=e})),e.indexedDB=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.oIndexedDB||e.msIndexedDB,e.indexedDB===void 0&&e.openDatabase!==void 0?e.shimIndexedDB.__useShim():(e.IDBDatabase=e.IDBDatabase||e.webkitIDBDatabase,e.IDBTransaction=e.IDBTransaction||e.webkitIDBTransaction,e.IDBCursor=e.IDBCursor||e.webkitIDBCursor,e.IDBKeyRange=e.IDBKeyRange||e.webkitIDBKeyRange,e.IDBTransaction||(e.IDBTransaction={}),e.IDBTransaction.READ_ONLY=e.IDBTransaction.READ_ONLY||"readonly",e.IDBTransaction.READ_WRITE=e.IDBTransaction.READ_WRITE||"readwrite")}(window,idbModules);
//@ sourceMappingURL=http://nparashuram.com/IndexedDBShim/dist/IndexedDBShim.min.map//'use strict';
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
             debugLogEndpoint: '',
             storeDebug: true,
             directDownloads: true,
             proxyPath: '/proxyrequest',
             ignoreLoggedInStatus: false,
             storePrefsRemote: true,
             preferUrlItem: true,
             sessionAuth: false,
             proxy: false,
             apiKey: '',
             ajax: 1,
             apiVersion: 3,
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
                'start': 0
            }
    },
    
    debug: function(debugstring, level){
        var prefLevel = 3;
        if(Zotero.config.storeDebug){
            if(level <= prefLevel){
                Zotero.debugstring += "DEBUG:" + debugstring + "\n";
            }
        }
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
        if(Zotero.config.storeDebug){
            Zotero.debugstring += "WARN:" + warnstring + "\n";
        }
        if(typeof console == 'undefined' || typeof console.warn == 'undefined'){
            this.debug(warnstring);
        }
        else{
            console.warn(warnstring);
        }
    },
    
    error: function(errorstring){
        if(Zotero.config.storeDebug){
            Zotero.debugstring += "ERROR:" + errorstring + "\n";
        }
        if(typeof console == 'undefined' || typeof console.error == 'undefined'){
            this.debug(errorstring);
        }
        else{
            console.error(errorstring);
        }
    },

    submitDebugLog: function(){
        response = J.post(Zotero.config.debugLogEndpoint, {'debug_string': Zotero.debugstring}, function(data){
            if(data.logID) {
                alert("ZoteroWWW debug logID:" + data.logID);
            } else if (data.error) {
                alert("Error submitting ZoteroWWW debug log:" + data.error);
            }
        });
    },
    
    catchPromiseError: function(err){
        Zotero.error(err);
    },
    
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
            'include': /^((html|json|bib|none|bibtex|bookmarks|coins|csljson|mods|refer|rdf_bibliontology|rdf_dc|ris|tei|wikipedia),?)+$/,
            'q': /^.*$/,
            'fq': /^\S*$/,
            'itemType': /^\S*$/,
            'locale': /^\S*$/,
            'tag': /^.*$/,
            'tagType': /^(0|1)$/,
            'key': /^\S*/,
            'format': /^(json|atom|bib|keys|versions|bibtex|bookmarks|mods|refer|rdf_bibliontology|rdf_dc|rdf_zotero|ris|wikipedia)$/,
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
            Z.warn("No value found in cache store - " + objectCacheString, 3);
            return null;
        }
        else{
            return JSON.parse(s);
        }
    }
    catch(e){
        Z.error('Error parsing retrieved cache data: ' + objectCacheString + ' : ' + s);
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

Zotero.ajaxRequest = function(url, type, options){
    Z.debug("Zotero.ajaxRequest ==== " + url, 3);
    if(!type){
        type = 'GET';
    }
    if(!options){
        options = {};
    }
    var requestObject = {
        url: url,
        type: type,
    };
    requestObject = J.extend({}, requestObject, options);
    Z.debug(requestObject, 3);
    return Zotero.net.queueRequest(requestObject);
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
    Z.error(response);
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
        var sessionKey = Zotero.utils.readCookie(Zotero.config.sessionCookieName);
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
                             'newer',
                             'since'
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

Zotero.ApiObject = function(){
    this.instance = "Zotero.ApiObject";
    this.version = 0;
};

//associate Entry with a library so we can update it on the server
Zotero.ApiObject.prototype.associateWithLibrary = function(library){
    var apiObject = this;
    apiObject.owningLibrary = library;
    if(typeof this.apiObj.library == "object"){
        this.apiObj.library.type = library.type;
        this.apiObj.library.id = library.libraryID;
    }
    return apiObject;
};

Zotero.ApiObject.prototype.fieldComparer = function(attr){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[attr], b.apiObj.data[attr]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[attr].toLowerCase() == b.apiObj.data[attr].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[attr].toLowerCase() < b.apiObj.data[attr].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};
Zotero.ApiResponse = function(response) {
    Z.debug("Zotero.ApiResponse", 3);
    this.totalResults = 0;
    this.apiVersion = null;
    this.lastModifiedVersion = 0;
    this.linkHeader = '';
    this.links = {};
    
    if(response){
        if(!response.isError){
            this.isError = false;
        } else {
            this.isError = true;
        }
        this.data = response.data;
        //this.jqxhr = response.jqxhr;
        this.parseResponse(response);
    }
}

Zotero.ApiResponse.prototype.parseResponse = function(response){
    Z.debug("parseResponse");
    var apiResponse = this;
    apiResponse.jqxhr = response.jqxhr;
    apiResponse.status = response.jqxhr.status;
    //keep track of relevant headers
    apiResponse.lastModifiedVersion = response.jqxhr.getResponseHeader("Last-Modified-Version");
    apiResponse.apiVersion = response.jqxhr.getResponseHeader("Zotero-API-Version");
    apiResponse.backoff = response.jqxhr.getResponseHeader("Backoff");
    apiResponse.retryAfter = response.jqxhr.getResponseHeader("Retry-After");
    apiResponse.contentType = response.jqxhr.getResponseHeader("Content-Type");
    apiResponse.linkHeader = response.jqxhr.getResponseHeader("Link");
    apiResponse.totalResults = response.jqxhr.getResponseHeader("Total-Results");
    if(apiResponse.backoff){
        apiResponse.backoff = parseInt(apiResponse.backoff, 10);
    }
    if(apiResponse.retryAfter){
        apiResponse.retryAfter = parseInt(apiResponse.retryAfter, 10);
    }
    //TODO: parse link header into individual links
    Z.debug("parse link header");
    Z.debug(apiResponse.linkHeader);
    if(apiResponse.linkHeader){
        var links = apiResponse.linkHeader.split(',');
        var parsedLinks = {};
        var linkRegex = /^<([^>]+)>; rel="([^\"]*)"$/
        for(var i = 0; i < links.length; i++){
            var matches = linkRegex.exec(links[i].trim());
            if(matches[2]){
                parsedLinks[matches[2]] = matches[1];
            }
        }
        apiResponse.parsedLinks = parsedLinks;
    }
    Z.debug("done parsing response");
}/*
 * Make concurrent and sequential network requests, respecting backoff/retry-after
 * headers, and keeping concurrent requests below a certain limit.
 * 
 * Push onto the queue individual or arrays of requestConfig objects
 * If there is room for requests and we are not currently backing off:
 *   start a sequential series, or individual request
 * When any request or set of requests finishes, we preprocess the response,
 * looking for backoff/retry-after to obey, and putting sequential responses
 * into an array. We then trigger the next waiting request.
 * 
 */

Zotero.Net = function(){
    this.deferredQueue = [];
    this.numRunning = 0;
    this.numConcurrent = 1;
    this.backingOff = false;
};

Zotero.Net.prototype.queueDeferred = function(){
    var net = this;
    var d = new J.Deferred();
    net.deferredQueue.push(d);
    return Promise.resolve(d);
};

Zotero.Net.prototype.queueRequest = function(requestObject){
    Z.debug("Zotero.Net.queueRequest", 3);
    var net = this;
    var resultPromise;
    
    if(J.isArray(requestObject)){
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running sequential after queued deferred resolved", 4);
            return net.runSequential(requestObject);
        }).then(function(response){
            Z.debug("runSequential done", 3);
            net.queuedRequestDone();
            return response;
        });
    }
    else {
        resultPromise = net.queueDeferred().then(function(){
            Z.debug("running concurrent after queued deferred resolved", 4);
            return net.runConcurrent(requestObject);
        }).then(function(response){
            Z.debug("done with queuedRequest");
            net.queuedRequestDone();
            return response;
        });
    }
    
    net.runNext();
    return resultPromise.catch(function(error){
        Z.error("Error before leaving Zotero.Net");
        Z.error(error);
    });
};

Zotero.Net.prototype.runConcurrent = function(requestObject){
    Z.debug("Zotero.Net.runConcurrent", 3);
    return this.ajaxRequest(requestObject).then(function(response){
        Z.debug("done with runConcurrent request");
        return response;
    });
};

//run the set of requests serially
//chaining each request onto the .then of the previous one, after
//adding the previous response to a responses array that will be
//returned via promise to the caller when all requests are complete
Zotero.Net.prototype.runSequential = function(requestObjects){
    Z.debug("Zotero.Net.runSequential", 3);
    var net = this;
    var responses = [];
    var seqPromise = Promise.resolve();
    
    for(var i = 0; i < requestObjects.length; i++){
        var requestObject = requestObjects[i];
        seqPromise = seqPromise.then(function(){
            var p = net.ajaxRequest(requestObject)
            .then(function(response){
                Z.debug('pushing sequential response into result array');
                responses.push(response);
            });
            return p;
        });
    };
    
    return seqPromise.then(function(){
        Z.debug("done with sequential aggregator promise - returning responses");
        return responses;
    });
};

//when one concurrent call, or a sequential series finishes, subtract it from the running
//count and run the next if there is something waiting to be run
Zotero.Net.prototype.individualRequestDone = function(response){
    Z.debug("Zotero.Net.individualRequestDone", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we need to back off before making more requests
    var wait = net.checkDelay(response);
    if(wait > 0){
        waitms = wait * 1000;
        net.backingOff = true;
        var waitExpiration = Date.now() + waitms;
        if(waitExpiration > net.waitingExpires){
            net.waitingExpires = waitExpiration;
        }
        window.setTimeout(net.runNext, waitms);
    }
    
    return response;
};

Zotero.Net.prototype.queuedRequestDone = function(response){
    Z.debug('queuedRequestDone', 3);
    var net = this;
    net.numRunning--;
    net.runNext();
    return response;
};

Zotero.Net.prototype.runNext = function(){
    Z.debug("Zotero.Net.runNext", 3);
    var net = this;
    var nowms = Date.now();
    
    //check if we're backing off and need to remain backing off,
    //or if we should now continue
    if(net.backingOff && (net.waitingExpires > (nowms - 100)) ){
        Z.debug("currently backing off", 3);
        var waitms = net.waitingExpires - nowms;
        window.setTimeout(net.runNext, waitms);
        return;
    }
    else if(net.backingOff && (net.waitingExpires <= (nowms - 100))){
        net.backingOff = false;
    }
    
    //continue making requests up to the concurrent limit
    Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. "
        + net.deferredQueue.length + " queued.", 3);
    while((net.deferredQueue.length > 0) && (net.numRunning < net.numConcurrent)){
        net.numRunning++;
        var nextD = net.deferredQueue.shift();
        nextD.resolve();
        Z.debug(net.numRunning + "/" + net.numConcurrent + " Running. "
            + net.deferredQueue.length + " queued.", 3);
    }
};

Zotero.Net.prototype.checkDelay = function(response){
    Z.debug('Zotero.Net.checkDelay');
    Z.debug(response);
    var net = this;
    var wait = 0;
    if(J.isArray(response)){
        for(var i = 0; i < response.length; i++){
            iwait = net.checkDelay(response[i]);
            if(iwait > wait){
                wait = iwait;
            }
        }
    }
    else {
        if(response.status == 429){
            wait = response.retryAfter;
        }
        else if(response.backoff){
            wait = response.backoff;
        }
    }
    return wait;
};

Zotero.Net.prototype.ajaxRequest = function(requestConfig){
    Z.debug("Zotero.Net.ajaxRequest", 3);
    var net = this;
    var defaultConfig = {
        type:'GET',
        headers:{
            'Zotero-API-Version': Zotero.config.apiVersion,
            'Content-Type': 'application/json',
        },
        success: function(response){
            return response;
        },
        error: function(response){
            Z.error("ajaxRequest rejected:" + response.jqxhr.statusCode() + " - " + response.jqxhr.responseText);
            return response;
        },
        //cache:false
    };
    var headers = J.extend({}, defaultConfig.headers, requestConfig.headers);
    var config = J.extend({}, defaultConfig, requestConfig);
    config.headers = headers;
    if(typeof config.url == 'object'){
        config.url = Zotero.ajax.apiRequestString(config.url);
    }
    config.url = Zotero.ajax.proxyWrapper(config.url, config.type);
    
    if(!config.url){
        throw "No url specified in Zotero.Net.ajaxRequest";
    }
    //rename success/error callbacks so J.ajax does not actually use them
    //and we can use them as es6 promise result functions with expected
    //single value arguments
    config.zsuccess = config.success;
    config.zerror = config.error;
    delete config.success;
    delete config.error;
    
    ajaxpromise = new Promise(function(resolve, reject){
        J.ajax(config)
        .then(function(data, textStatus, jqxhr){
            Z.debug("library.ajaxRequest jqxhr resolved. resolving Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                data: data,
                textStatus: textStatus
            });
            resolve(r);
        }, function(jqxhr, textStatus, errorThrown){
            Z.debug("library.ajaxRequest jqxhr rejected. rejecting Promise", 3);
            var r = new Zotero.ApiResponse({
                jqxhr: jqxhr,
                textStatus: textStatus,
                errorThrown: errorThrown,
                isError: true,
            });
            reject(r);
        });
    })
    .then(J.proxy(net.individualRequestDone, net))
    .then(function(response){
        //now that we're done handling, reject
        if(response.isError){
            Z.error("re-throwing ApiResponse that was a rejection");
            throw response;
        }
        return response;
    })
    .then(config.zsuccess, config.zerror);
    
    //Zotero.ajax.activeRequests.push(ajaxpromise);
    return ajaxpromise;
};

Zotero.net = new Zotero.Net();
/**
 * A user or group Zotero library. This is generally the top level object
 * through which interactions should happen. It houses containers for
 * Zotero API objects (collections, items, etc) and handles making requests
 * with particular API credentials, as well as storing data locally.
 * @param {string} type                 type of library, 'user' or 'group'
 * @param {int} libraryID            ID of the library
 * @param {string} libraryUrlIdentifier identifier used in urls, could be library id or user/group slug
 * @param {string} apiKey               key to use for API requests
 */
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
    library._apiKey = apiKey || '';
    
    if(Zotero.config.librarySettings){
        library.libraryBaseWebsiteUrl = Zotero.config.librarySettings.libraryPathString;
    }
    else{
        library.libraryBaseWebsiteUrl = Zotero.config.baseWebsiteUrl;
        if(type == 'group'){
            library.libraryBaseWebsiteUrl += 'groups/';
        }
        if(libraryUrlIdentifier){
            this.libraryBaseWebsiteUrl += libraryUrlIdentifier + '/items';
        } else {
            Z.warn("no libraryUrlIdentifier specified");
        }
    }
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
        Z.warn("No type specified for library");
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
                    Z.error("Error loading cached library");
                    Z.error(err);
                    throw new Error("Error loading cached library");
                });
            }
            else {
                //trigger cachedDataLoaded since we are done with that step
                library.trigger('cachedDataLoaded');
            }
        },
        function(){
            //can't use indexedDB. Set to false in config and trigger error to notify user
            Zotero.config.useIndexedDB = false;
            library.trigger("indexedDBError");
            library.trigger('cachedDataLoaded');
            Z.error("Error initializing indexedDB. Promise rejected.");
            throw new Error("Error initializing indexedDB. Promise rejected.");
        });
    }
    
    library.dirty = false;
    
    //set noop data-change callbacks
    library.tagsChanged = function(){};
    library.collectionsChanged = function(){};
    library.itemsChanged = function(){};
};
/**
 * Items columns for which sorting is supported
 * @type {Array}
 */
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
/**
 * Columns that can be displayed in an items table UI
 * @type {Array}
 */
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
/**
 * Items columns that only apply to group libraries
 * @type {Array}
 */
Zotero.Library.prototype.groupOnlyColumns = ['addedBy'
                                             /*'modifiedBy'*/];

/**
 * Sort function that converts strings to locale lower case before comparing,
 * however this is still not particularly effective at getting correct localized
 * sorting in modern browsers due to browser implementations being poor. What we
 * really want here is to strip diacritics first.
 * @param  {string} a [description]
 * @param  {string} b [description]
 * @return {int}   [description]
 */
Zotero.Library.prototype.comparer = function(){
    if(window.Intl){
        return new window.Intl.Collator().compare;
    } else {
        return function(a, b){
            if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
                return 0;
            }
            if(a.toLocaleLowerCase() < b.toLocaleLowerCase()){
                return -1;
            }
            return 1;
        };
    }
};

//Zotero library wrapper around jQuery ajax that returns a jQuery promise
//@url String url to request or object for input to apiRequestUrl and query string
//@type request method
//@options jquery options that are not the default for Zotero requests
Zotero.Library.prototype.ajaxRequest = function(url, type, options){
    Z.debug("Library.ajaxRequest", 3);
    if(!type){
        type = 'GET';
    }
    if(!options){
        options = {};
    }
    var requestObject = {
        url: url,
        type: type,
    };
    requestObject = J.extend({}, requestObject, options);
    Z.debug(requestObject, 3);
    return Zotero.net.queueRequest(requestObject);
};

//Take an array of objects that specify Zotero API requests and perform them
//in sequence.
//return deferred that gets resolved when all requests have gone through.
//Update versions after each request, otherwise subsequent writes won't go through.
//or do we depend on specified callbacks to update versions if necessary?
//fail on error?
//request object must specify: url, method, body, headers, success callback, fail callback(?)

/**
 * Take an array of objects that specify Zotero API requests and perform them
 * in sequence. Return a promise that gets resolved when all requests have
 * gone through.
 * @param  {[] Objects} requests Array of objects specifying requests to be made
 * @return {Promise}          Promise that resolves/rejects along with requests
 */
Zotero.Library.prototype.sequentialRequests = function(requests){
    Z.debug("Zotero.Library.sequentialRequests", 3);
    var library = this;
    return Zotero.net.queueRequest(requests);
}

/**
 * Generate a website url based on a dictionary of variables and the configured
 * libraryBaseWebsiteUrl
 * @param  {Object} urlvars Dictionary of key/value variables
 * @return {string}         website url
 */
Zotero.Library.prototype.websiteUrl = function(urlvars){
    Z.debug("Zotero.library.websiteUrl", 3);
    Z.debug(urlvars, 4);
    var library = this;
    
    var urlVarsArray = [];
    J.each(urlvars, function(index, value){
        if(value === '') return;
        urlVarsArray.push(index + '/' + value);
    });
    urlVarsArray.sort();
    Z.debug(urlVarsArray, 4);
    var pathVarsString = urlVarsArray.join('/');
    
    return library.libraryBaseWebsiteUrl + '/' + pathVarsString;
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

/**
 * Make and process API requests to update the local library items based on the
 * versions we have locally. When the promise is resolved, we should have up to
 * date items in this library's items container, as well as saved to indexedDB
 * if configured to use it.
 * @return {Promise} Promise
 */
Zotero.Library.prototype.loadUpdatedItems = function(){
    Z.debug("Zotero.Library.loadUpdatedItems", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the itemsVersion, which is likely
    //derived from the most recent version of any individual item we have.
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.items.itemsVersion;
    return Promise.resolve(library.updatedVersions("items", syncFromVersion))
    .then(function(response){
        Z.debug("itemVersions resolved", 3);
        Z.debug("items Last-Modified-Version: " + response.lastModifiedVersion, 3);
        library.items.updateSyncState(response.lastModifiedVersion);
        
        var itemVersions = response.data;
        library.itemVersions = itemVersions;
        var itemKeys = [];
        J.each(itemVersions, function(key, val){
            var item = library.items.getItem(key);
            if((!item) || (item.apiObj.key != val)){
                itemKeys.push(key);
            }
        });
        return library.loadItemsFromKeys(itemKeys);
    }).then(function(responses){
        Z.debug("loadItemsFromKeys resolved", 3);
        library.items.updateSyncedVersion();
        
        //TODO: library needs its own state
        var displayParams = Zotero.state.getUrlVars();
        library.buildItemDisplayView(displayParams);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            var saveItemsD = library.idbLibrary.updateItems(library.items.objectArray);
        }
    });
};

Zotero.Library.prototype.loadUpdatedCollections = function(){
    Z.debug("Zotero.Library.loadUpdatedCollections", 3);
    var library = this;
    //sync from the libraryVersion if it exists, otherwise use the collectionsVersion, which is likely
    //derived from the most recent version of any individual collection we have.
    Z.debug('library.collections.collectionsVersion:' + library.collections.collectionsVersion);
    var syncFromVersion = library.libraryVersion ? library.libraryVersion : library.collections.collectionsVersion;
    //we need modified collectionKeys regardless, so load them
    return library.updatedVersions("collections", syncFromVersion)
    .then(function(response){
        Z.debug("collectionVersions finished", 3);
        Z.debug("Collections Last-Modified-Version: " + response.lastModifiedVersion, 3);
        //start the syncState version tracking. This should be the earliest version throughout
        library.collections.updateSyncState(response.lastModifiedVersion);
        
        var collectionVersions = response.data;
        library.collectionVersions = collectionVersions;
        var collectionKeys = [];
        J.each(collectionVersions, function(key, val){
            var c = library.collections.getCollection(key);
            if((!c) || (c.apiObj.version != val)){
                collectionKeys.push(key);
            }
        });
        if(collectionKeys.length === 0){
            Z.debug("No collectionKeys need updating. resolving", 3);
            return response;
        }
        else {
            Z.debug("fetching collections by key", 3);
            return library.loadCollectionsFromKeys(collectionKeys)
            .then(function(){
                var collections = library.collections;
                collections.initSecondaryData();
                
                Z.debug("All updated collections loaded", 3);
                library.collections.updateSyncedVersion();
                //TODO: library needs its own state
                var displayParams = Zotero.state.getUrlVars();
                //save updated collections to cache
                Z.debug("loadUpdatedCollections complete - saving collections to cache before resolving", 3);
                Z.debug("collectionsVersion: " + library.collections.collectionsVersion, 3);
                //library.saveCachedCollections();
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    return library.idbLibrary.updateCollections(collections.collectionsArray);
                }
            });
        }
    })
    .then(function(){
        Z.debug("done getting collection data. requesting deleted data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
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
    return Promise.resolve(library.loadAllTags({since:library.tags.tagsVersion}))
    .then(function(){
        Z.debug("done getting tags, request deleted tags data", 3);
        return library.getDeleted(library.libraryVersion);
    })
    .then(function(response){
        Z.debug("got deleted tags data")
        if(library.deleted.deletedData.tags && library.deleted.deletedData.tags.length > 0 ){
            library.tags.removeTags(library.deleted.deletedData.tags);
        }
        //save updated tags to IDB
        if(Zotero.config.useIndexedDB){
            Z.debug("saving updated tags to IDB", 3);
            var saveTagsD = library.idbLibrary.updateTags(library.tags.tagsArray);
        }
    });
};

Zotero.Library.prototype.getDeleted = function(version) {
    Z.debug("Zotero.Library.getDeleted", 3);
    var library = this;
    var urlconf = {target:'deleted',
                   libraryType:library.libraryType,
                   libraryID:library.libraryID,
                   since:version
               };
    
    //if there is already a request working, create a new promise to resolve
    //when the actual request finishes
    if(library.deleted.pending){
        Z.debug("getDeleted resolving with previously pending promise");
        return Promise.resolve(library.deleted.pendingPromise);
    }
    
    //don't fetch again if version we'd be requesting is between
    //deleted.newer and delete.deleted versions, just use that one
    Z.debug("version:" + version);
    Z.debug('sinceVersion:' + library.deleted.sinceVersion);
    Z.debug('untilVersion:' + library.deleted.untilVersion);
    
    if(library.deleted.untilVersion &&
        version >= library.deleted.sinceVersion /*&&
        version < library.deleted.untilVersion*/){
        Z.debug("deletedVersion matches requested: immediately resolving");
        return Promise.resolve(library.deleted.deletedData);
    }
    
    library.deleted.pending = true;
    library.deleted.pendingPromise = library.ajaxRequest(urlconf)
    .then(function(response){
        Z.debug("got deleted response");
        library.deleted.deletedData = response.data;
        Z.debug("Deleted Last-Modified-Version:" + response.lastModifiedVersion, 3);
        library.deleted.untilVersion = response.lastModifiedVersion;
        library.deleted.sinceVersion = version;
    }).then(function(response){
        Z.debug("cleaning up deleted pending");
        library.deleted.pending = false;
        library.deleted.pendingPromise = false;
    });
    
    return library.deleted.pendingPromise;
};

Zotero.Library.prototype.processDeletions = function(deletions){
    var library = this;
    //process deleted collections
    library.collections.processDeletions(deletions.collections);
    //process deleted items
    library.items.processDeletions(deletions.items);
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
        var item = new Zotero.Item(response.data);
        var bibContent = item.apiObj.bib;
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
        var transferData = item.emptyJsonItem();
        transferData.data = J.extend({}, items[i].apiObj.data);
        //clear data that shouldn't be transferred:itemKey, collections
        transferData.data.key = '';
        transferData.data.version = 0;
        transferData.data.collections = [];
        delete transferData.data.dateModified;
        delete transferData.data.dateAdded;
        
        var newForeignItem = new Zotero.Item(transferData);
        
        newForeignItem.pristine = J.extend({}, newForeignItem.apiObj);
        newForeignItem.initSecondaryData();
        
        //set relationship to tie to old item
        if(!newForeignItem.apiObj.data.relations){
            newForeignItem.apiObj.data.relations = {};
        }
        newForeignItem.apiObj.data.relations['owl:sameAs'] = Zotero.url.relationUrl(item.owningLibrary.libraryType, item.owningLibrary.libraryID, item.key);
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
        since: version
    };
    return library.ajaxRequest(urlconf);
};

//Download and save information about every item in the library
//keys is an array of itemKeys from this library that we need to download
Zotero.Library.prototype.loadItemsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadItemsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "items");
};

//keys is an array of collectionKeys from this library that we need to download
Zotero.Library.prototype.loadCollectionsFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadCollectionsFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "collections");
};

//keys is an array of searchKeys from this library that we need to download
Zotero.Library.prototype.loadSeachesFromKeys = function(keys){
    Zotero.debug("Zotero.Library.loadSearchesFromKeys", 3);
    var library = this;
    return library.loadFromKeys(keys, "searches");
};

Zotero.Library.prototype.loadFromKeys = function(keys, objectType){
    Zotero.debug("Zotero.Library.loadFromKeys", 3);
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
                    url: {
                        'target':'items',
                        'targetModifier':null,
                        'itemKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedItems, library),
                });
                break;
            case "collections":
                requestObjects.push({
                    url: {
                        'target':'collections',
                        'targetModifier':null,
                        'collectionKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    success: J.proxy(library.processLoadedCollections, library),
                });
                break;
            case "searches":
                requestObjects.push({
                    url: {
                        'target':'searches',
                        'targetModifier':null,
                        'searchKey':keystring,
                        'limit':50,
                        'libraryType':library.libraryType,
                        'libraryID':library.libraryID,
                    },
                    type: 'GET',
                    //success: J.proxy(library.processLoadedSearches, library)
                });
                break;
        }
    });
    
    var promises = [];
    for(var i = 0; i < requestObjects.length; i++){
        promises.push(Zotero.net.queueRequest(requestObjects[i]));
    }
    return Promise.all(promises);
    /*
    return Zotero.net.queueRequest(requestObjects);
    */
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
    //short-circuit if we don't have an initialized IDB yet
    if(!library.idbLibrary.db){
        return Promise.resolve([]);
    }
    
    var itemKeys;
    var filterPromises = [];
    if(params.collectionKey){
        if(params.collectionKey == 'trash'){
            filterPromises.push(library.idbLibrary.filterItems('deleted', 1));
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
        Z.debug('adding selected tag filter', 3)
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
        var displayItemsArray = [];
        for(var i = 0; i < itemsArray.length; i++){
            if(itemsArray[i].apiObj.data.parentItem){
                continue;
            }
            
            if(params.collectionKey != 'trash' && itemsArray[i].apiObj.deleted){
                continue;
            }
            
            displayItemsArray.push(itemsArray[i]);
        }
        
        //sort displayedItemsArray by given or configured column
        var orderCol = params['order'] || 'title';
        var sort = params['sort'] || 'asc';
        Z.debug("Sorting by " + orderCol + " - " + sort, 3);
        
        var comparer = Zotero.Library.prototype.comparer();
        
        displayItemsArray.sort(function(a, b){
            var aval = a.get(orderCol);
            var bval = b.get(orderCol);
            
            return comparer(aval, bval);
        });
        
        if(sort == 'desc'){
            Z.debug("sort is desc - reversing array", 4);
            displayItemsArray.reverse();
        }
        
        //publish event signalling we're done
        Z.debug("triggering publishing displayedItemsUpdated", 3);
        library.trigger("displayedItemsUpdated");
        return displayItemsArray;
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
Zotero.Container = function(){
    
};

Zotero.Container.prototype.initSecondaryData = function(){
    
};

Zotero.Container.prototype.addObject = function(object){
    Zotero.debug("Zotero.Container.addObject", 4);
    var container = this;
    container.objectArray.push(object);
    container.objectMap[object.key] = object;
    if(container.owningLibrary){
        object.associateWithLibrary(container.owningLibrary);
    }
    
    return container;
};

Zotero.Container.prototype.fieldComparer = function(field){
    if(window.Intl){
        var collator = new window.Intl.Collator();
        return function(a, b){
            return collator.compare(a.apiObj.data[field], b.apiObj.data[field]);
        };
    } else {
        return function(a, b){
            if(a.apiObj.data[field].toLowerCase() == b.apiObj.data[field].toLowerCase()){
                return 0;
            }
            if(a.apiObj.data[field].toLowerCase() < b.apiObj.data[field].toLowerCase()){
                return -1;
            }
            return 1;
        };
    }
}

Zotero.Container.prototype.getObject = function(key){
    var container = this;
    if(container.objectMap.hasOwnProperty(key)){
        return container.objectMap[key];
    }
    else{
        return false;
    }
};

Zotero.Container.prototype.getObjects = function(keys){
    var container = this;
    var objects = [];
    var object;
    for(var i = 0; i < keys.length; i++){
        object = container.getObject(keys[i]);
        if(object){
            objects.push(object);
        }
    }
    return objects;
};

Zotero.Container.prototype.removeObject = function(key){
    if(container.objectMap.hasOwnProperty(key)){
        delete container.objectmap[key];
        container.initSecondaryData();
    }
};

Zotero.Container.prototype.removeObjects = function(keys){
    var container = this;
    //delete Objects from objectMap;
    for(var i = 0; i < keys.length; i++){
        delete container.objectMap[keys[i]];
    }
    
    //rebuild array
    container.initSecondaryData();
};

Zotero.Container.prototype.writeObjects = function(objects){
    //TODO:implement
};

//generate keys for objects about to be written if they are new
Zotero.Container.prototype.assignKeys = function(objectsArray){
    var object;
    for(i = 0; i < objectsArray.length; i++){
        object = objectsArray[i];
        var key = object.get('key');
        if(!key) {
            var newObjectKey = Zotero.utils.getKey();
            object.set("key", newObjectKey);
            object.set("version", 0);
        }
    }
    return objectsArray;
};

//split an array of objects into chunks to write over multiple api requests
Zotero.Container.prototype.chunkObjectsArray = function(objectsArray){
    var chunkSize = 50;
    var writeChunks = [];
    
    for(i = 0; i < objectsArray.length; i = i + chunkSize){
        writeChunks.push(objectsArray.slice(i, i+chunkSize));
    }
    
    return writeChunks;
};

Zotero.Container.prototype.rawChunks = function(chunks){
    var rawChunkObjects = [];
    
    for(i = 0; i < chunks.length; i++){
        rawChunkObjects[i] = [];
        for(var j = 0; j < chunks[i].length; j++){
            rawChunkObjects[i].push(chunks[i][j].writeApiObj());
        }
    }
    return rawChunkObjects;
};

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
Zotero.Container.prototype.updateSyncState = function(version) {
    var container = this;
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
};

Zotero.Container.prototype.updateSyncedVersion = function(versionField) {
    var container = this;
    if(container.syncState.earliestVersion !== null &&
        (container.syncState.earliestVersion == container.syncState.latestVersion) ){
        container.version = container.syncState.latestVersion;
        container.synced = true;
    }
    else if(container.syncState.earliestVersion !== null) {
        container.version = container.syncState.earliestVersion;
    }
};

Zotero.Container.prototype.processDeletions = function(deletedKeys) {
    var container = this;
    for(var i = 0; i < deletedKeys.length; i++){
        var localObject = container.get(deletedKeys[i]);
        if(localObject !== false){
            //still have object locally
            if(localObject.synced === true){
                //our object is not modified, so delete it as the server thinks we should
                container.removeObjects([deletedKeys[i]]);
            }
            else {
                //TODO: conflict resolution
            }
        }
    }
};

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
Zotero.Container.prototype.updateObjectsFromWriteResponse = function(objectsArray, response){
    Z.debug("Zotero.Container.updateObjectsFromWriteResponse", 3);
    Z.debug("statusCode: " + response.status, 3);
    var data = response.data;
    if(response.status == 200){
        Z.debug("newLastModifiedVersion: " + response.lastModifiedVersion, 3);
        //make sure writes were actually successful and
        //update the itemKey for the parent
        if(data.hasOwnProperty('success')){
            //update each successfully written item, possibly with new itemKeys
            J.each(data.success, function(ind, key){
                var i = parseInt(ind, 10);
                var object = objectsArray[i];
                //throw error if objectKey mismatch
                if(object.key !== "" && object.key !== key){
                    throw new Error("object key mismatch in multi-write response");
                }
                if(object.key === ''){
                    object.updateObjectKey(key);
                }
                object.set('version', response.lastModifiedVersion);
                object.synced = true;
                object.writeFailure = false;
            });
        }
        if(data.hasOwnProperty('failed')){
            Z.debug("updating objects with failed writes", 3);
            J.each(data.failed, function(ind, failure){
                Z.error("failed write " + ind + " - " + failure);
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
};

//return the key as a string when passed an argument that 
//could be either a string key or an object with a key property
Zotero.Container.prototype.extractKey = function(object){
    if(typeof object == 'string'){
        return object;
    }
    return object.get('key');
};
Zotero.Collections = function(jsonBody){
    var collections = this;
    this.instance = "Zotero.Collections";
    this.version = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.collectionObjects = {};
    this.collectionsArray = [];
    this.objectMap = this.collectionObjects;
    this.objectArray = this.collectionsArray;
    this.dirty = false;
    this.loaded = false;
    
    if(jsonBody){
        this.addCollectionsFromJson(jsonBody)
        this.initSecondaryData();
    }
};

Zotero.Collections.prototype = new Zotero.Container();
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
    
    collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));
    collections.nestCollections();
    collections.assignDepths(0, collections.collectionsArray);
};

//take Collection XML and insert a Collection object
Zotero.Collections.prototype.addCollection = function(collection){
    this.addObject(collection);
    return this;
};

Zotero.Collections.prototype.addCollectionsFromJson = function(jsonBody){
    Z.debug("addCollectionsFromJson");
    Z.debug(jsonBody);
    var collections = this;
    var collectionsAdded = [];
    J.each(jsonBody, function(ind, collectionObj) {
        var collection = new Zotero.Collection(collectionObj);
        collections.addObject(collection);
        collectionsAdded.push(collection);
    });
    return collectionsAdded;
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
    return this.getObject(key);
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
    
    collections.collectionsArray.sort(Zotero.ApiObject.prototype.fieldComparer('name'));
    J.each(collections.collectionsArray, function(ind, collection){
        collection.nestCollection(collections.collectionObjects);
    });
};

Zotero.Collections.prototype.writeCollections = function(collectionsArray){
    Z.debug('Zotero.Collections.writeCollections', 3);
    var collections = this;
    var library = collections.owningLibrary;
    var writeCollections = [];
    var i;
    
    var config = {
        'target':'collections',
        'libraryType':collections.owningLibrary.libraryType,
        'libraryID':collections.owningLibrary.libraryID
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    //add collectionKeys to collections if they don't exist yet
    for(var i = 0; i < collectionsArray.length; i++){
        var collection = collectionsArray[i];
        //generate a collectionKey if the collection does not already have one
        var collectionKey = collection.get('key');
        if(collectionKey === "" || collectionKey === null) {
            var newCollectionKey = Zotero.utils.getKey();
            collection.set("key", newCollectionKey);
            collection.set("version", 0);
        }
    }

    var writeChunks = collections.chunkObjectsArray(collectionsArray);
    var rawChunkObjects = collections.rawChunks(writeChunks);
    //update collections with server response if successful
    var writeCollectionsSuccessCallback = function(response){
        Z.debug("writeCollections successCallback", 3);
        //pull vars out of this context so they're accessible in J.each context
        var library = this.library;
        var writeChunk = this.writeChunk;
        library.collections.updateObjectsFromWriteResponse(this.writeChunk, response);
        //save updated collections to collections
        for(var i = 0; i < writeChunk.length; i++){
            var collection = writeChunk[i];
            if(collection.synced && (!collection.writeFailure)) {
                library.collections.addCollection(collection);
                //save updated collections to IDB
                if(Zotero.config.useIndexedDB){
                    Z.debug("updating indexedDB collections");
                    library.idbLibrary.updateCollections(writeChunk);
                }
            }
        }
        response.returnCollections = writeChunk;
        return response;
    };
    
    Z.debug("collections.version: " + collections.version, 3);
    Z.debug("collections.libraryVersion: " + collections.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            library: library,
        };
        
        requestData = JSON.stringify(rawChunkObjects[i]);
        requestObjects.push({
            url: requestUrl,
            type: 'POST',
            data: requestData,
            processData: false,
            headers:{
                //'If-Unmodified-Since-Version': collections.version,
                //'Content-Type': 'application/json'
            },
            success: J.proxy(writeCollectionsSuccessCallback, successContext),
        });
    }

    return library.sequentialRequests(requestObjects)
    .then(function(responses){
        Z.debug("Done with writeCollections sequentialRequests promise", 3);
        collections.initSecondaryData();
        
        J.each(responses, function(ind, response){
            if(response.isError || (response.data.hasOwnProperty('failed') && Object.keys(response.data.failed).length > 0) ){
                throw new Error("failure when writing collections");
            }
        });
        return responses;
    })
    .catch(function(err){
        Z.error(err);
        //rethrow so widget doesn't report success
        throw(err);
    });
};
Zotero.Items = function(jsonBody){
    this.instance = "Zotero.Items";
    //represent items as array for ordering purposes
    this.itemsVersion = 0;
    this.syncState = {
        earliestVersion: null,
        latestVersion: null
    };
    this.itemObjects = {};
    this.objectMap = this.itemObjects;
    this.objectArray = [];
    this.unsyncedItemKeys = [];
    this.newUnsyncedItems = [];
    
    if(jsonBody){
        this.addItemsFromJson(jsonBody)
    }
};

Zotero.Items.prototype = new Zotero.Container();

Zotero.Items.prototype.getItem = function(key){
    return this.getObject(key);
};

Zotero.Items.prototype.getItems = function(keys){
    return this.getObjects(keys);
};

Zotero.Items.prototype.addItem = function(item){
    this.addObject(item);
    return this;
};

Zotero.Items.prototype.addItemsFromJson = function(jsonBody){
    Z.debug("addItemsFromJson", 3);
    var items = this;
    var parsedItemJson = jsonBody;
    var itemsAdded = [];
    J.each(parsedItemJson, function(index, itemObj) {
        var item = new Zotero.Item(itemObj);
        items.addItem(item);
        itemsAdded.push(item);
    });
    return itemsAdded;
};

//Remove item from local set if it has been marked as deleted by the server
Zotero.Items.prototype.removeLocalItem = function(key){
    return this.removeObject(key);
    /*
    var items = this;
    if(items.itemObjects.hasOwnProperty(key) && items.itemObjects[key].synced === true){
        delete items.itemObjects[key];
        return true;
    }
    return false;
    */
};

Zotero.Items.prototype.removeLocalItems = function(keys){
    return this.removeObjects(keys);
};

Zotero.Items.prototype.deleteItem = function(itemKey){
    Z.debug("Zotero.Items.deleteItem", 3);
    var items = this;
    var item;
    
    if(!itemKey) return false;
    itemKey = items.extractKey(itemKey);
    item = items.getItem(itemKey);
    
    var urlconfig = {
        'target':'item',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var requestConfig = {
        url: Zotero.ajax.apiRequestString(config),
        type: 'DELETE',
        headers:{"If-Unmodified-Since-Version":item.get('version')},
    }
    
    return Zotero.net.ajaxRequest(requestConfig);
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
    var key;
    for(i = 0; i < deleteItems.length; i++){
        if(!deleteItems[i]) continue;
        key = items.extractKey(deleteItems[i]);
        if(key){
            deleteKeys.push(key)
        }
    }
    
    //split keys into chunks of 50 per request
    var deleteChunks = items.chunkObjectsArray(deleteKeys);
    /*
    var successCallback = function(response){
        var deleteProgress = index / deleteChunks.length;
        Zotero.trigger("deleteProgress", {'progress': deleteProgress});
        return response;
    };
    */
    var requestObjects = [];
    for(var i = 0; i < deleteChunks.length; i++){
        var deleteKeysString = deleteChunks[i].join(',');
        var urlconfig = {'target':'items',
                      'libraryType':items.owningLibrary.libraryType,
                      'libraryID':items.owningLibrary.libraryID,
                      'itemKey': deleteKeysString};
        //headers['If-Unmodified-Since-Version'] = version;
        
        var requestConfig = {
            url: urlconfig,
            type: 'DELETE',
        }
        requestObjects.push(requestConfig);
    }
    
    return Zotero.net.queueRequest(requestObjects);
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

//take an array of items and extract children into their own items
//for writing
Zotero.Items.prototype.atomizeItems = function(itemsArray){
    //process the array of items, pulling out child notes/attachments to write
    //separately with correct parentItem set and assign generated itemKeys to
    //new items
    var writeItems = [];
    var item;
    for(var i = 0; i < itemsArray.length; i++){
        item = itemsArray[i];
        //generate an itemKey if the item does not already have one
        var itemKey = item.get('key');
        if(itemKey === "" || itemKey === null) {
            var newItemKey = Zotero.utils.getKey();
            item.set("key", newItemKey);
            item.set("version", 0);
        }
        //items that already have item key always in first pass, as are their children
        writeItems.push(item);
        if(item.hasOwnProperty('notes') && item.notes.length > 0){
            for(var j = 0; j < item.notes.length; j++){
                item.notes[j].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.notes);
        }
        if(item.hasOwnProperty('attachments') && item.attachments.length > 0){
            for(var k = 0; k < item.attachments.length; k++){
                item.attachments[k].set('parentItem', item.get('key'));
            }
            writeItems = writeItems.concat(item.attachments);
        }
    }
    return writeItems;
};

//accept an array of 'Zotero.Item's
Zotero.Items.prototype.writeItems = function(itemsArray){
    var items = this;
    var library = items.owningLibrary;
    var i;
    var writeItems = items.atomizeItems(itemsArray);
    
    var config = {
        'target':'items',
        'libraryType':items.owningLibrary.libraryType,
        'libraryID':items.owningLibrary.libraryID,
    };
    var requestUrl = Zotero.ajax.apiRequestString(config);
    
    var writeChunks = items.chunkObjectsArray(writeItems);
    var rawChunkObjects = items.rawChunks(writeChunks);
    
    //update item with server response if successful
    var writeItemsSuccessCallback = function(response){
        Z.debug("writeItem successCallback", 3);
        items.updateObjectsFromWriteResponse(this.writeChunk, response);
        //save updated items to IDB
        if(Zotero.config.useIndexedDB){
            this.library.idbLibrary.updateItems(this.writeChunk);
        }
        
        Zotero.trigger("itemsChanged", {library:this.library});
        response.returnItems = this.writeChunk;
        return response;
    };
    
    Z.debug("items.itemsVersion: " + items.itemsVersion, 3);
    Z.debug("items.libraryVersion: " + items.libraryVersion, 3);
    
    var requestObjects = [];
    for(i = 0; i < writeChunks.length; i++){
        var successContext = {
            writeChunk: writeChunks[i],
            library: library,
        };
        
        requestData = JSON.stringify(rawChunkObjects[i]);
        requestObjects.push({
            url: requestUrl,
            type: 'POST',
            data: requestData,
            processData: false,
            success: J.proxy(writeItemsSuccessCallback, successContext),
        });
    }
    
    return library.sequentialRequests(requestObjects)
    .then(function(responses){
        Z.debug("Done with writeItems sequentialRequests promise", 3);
        return responses;
    });
};

/*
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
                    item.version = updatedVersion;
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
                    Z.error("ItemWrite failed: " + val.key + " : http " + val.code + " : " + val.message, 1);
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
*/Zotero.Tags = function(jsonBody){
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
    if(jsonBody){
        this.addTagsFromJson(jsonBody);
    }
};

Zotero.Tags.prototype = new Zotero.Container();

Zotero.Tags.prototype.addTag = function(tag){
    var tags = this;
    tags.tagObjects[tag.apiObj.tag] = tag;
    tags.tagsArray.push(tag);
    if(tags.owningLibrary){
        tag.associateWithLibrary(tags.owningLibrary);
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
    J.each(tagsArray, function(index, tag){
        plainList.push(tag.apiObj.tag);
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
    tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
    var plainList = tags.plainTagsList(tags.tagsArray);
    plainList.sort(Zotero.Library.prototype.comparer());
    tags.plainList = plainList;
};

Zotero.Tags.prototype.updateTagsVersion = function(tagsVersion) {
    var tags = this;
    J.each(tags.tagObjects, function(key, tag) {
        tag.version = tagsVersion;
    });
};

Zotero.Tags.prototype.addTagsFromJson = function(jsonBody){
    Z.debug('Zotero.Tags.addTagsFromJson', 3);
    var tags = this;
    var tagsAdded = [];
    J.each(jsonBody, function(index, tagObj){
        var tag = new Zotero.Tag(tagObj);
        tags.addTag(tag);
        tagsAdded.push(tag);
    });
    return tagsAdded;
};
Zotero.Groups = function(jsonBody){
    this.instance = 'Zotero.Groups';
    this.groupsArray = [];
};

Zotero.Groups.prototype.fetchGroup = function(groupID, apikey){
    
};

Zotero.Groups.prototype.addGroupsFromJson = function(jsonBody){
    var groups = this;
    var groupsAdded = [];
    J.each(jsonBody, function(index, groupObj){
        Z.debug(groupObj);
        var group = new Zotero.Group(groupObj);
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
        fetchedGroups = groups.addGroupsFromJson(response.data);
        response.fetchedGroups = fetchedGroups;
        return response;
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
    this.untilVersion = null;
    this.sinceVersion = null;
    this.waitingPromises = [];
    this.pending = false;
};

//create, save referece, and return a Promise that will be resolved
//the next time we finish a deleted request
Zotero.Deleted.prototype.addWaiter = function(){
    
}
Zotero.Collection = function(collectionObj){
    this.instance = "Zotero.Collection";
    this.libraryUrlIdentifier = '';
    this.itemKeys = false;
    this.key = '';
    this.version = 0;
    this.synced = false;
    this.pristineData = null;
    this.apiObj = {
        'key': '',
        'version': 0,
        'library':{},
        'links':{},
        'meta':{},
        'data':{
            'key': '',
            'version': 0,
            'name': '',
            'parentCollection': false,
            'relations':{}
        },
    };
    this.children = [];
    this.topLevel = true;
    if(collectionObj){
        this.parseJsonCollection(collectionObj);
    }
};

Zotero.Collection.prototype = new Zotero.ApiObject();
Zotero.Collection.prototype.instance = "Zotero.Collection";

Zotero.Collection.prototype.updateObjectKey = function(collectionKey){
    this.updateCollectionKey(collectionKey);
}

Zotero.Collection.prototype.updateCollectionKey = function(collectionKey){
    var collection = this;
    collection.key = collectionKey;
    collection.apiObj.key = collectionKey;
    collection.apiObj.data.key = collectionKey;
    return collection;
};

Zotero.Collection.prototype.parseJsonCollection = function(apiObj) {
    Z.debug("parseJsonCollection", 4);
    var collection = this;
    collection.key = apiObj.key;
    collection.version = apiObj.version;
    collection.apiObj = J.extend({}, apiObj);
    collection.pristineData = J.extend({}, apiObj.data);

    collection.parentCollection = false;
    collection.topLevel = true;
    collection.synced = true;
    collection.initSecondaryData();
};

Zotero.Collection.prototype.initSecondaryData = function() {
    var collection = this;
    
    if(collection.apiObj.data['parentCollection']){
        collection.topLevel = false;
    } else {
        collection.topLevel = true;
    }
    
    if(Zotero.config.libraryPathString){
        collection.websiteCollectionLink = Zotero.config.libraryPathString + 
        '/collectionKey/' + collection.apiObj.key;
    }
    else {
        collection.websiteCollectionLink = '';
    }
    collection.hasChildren = (collection.apiObj.meta.numCollections) ? true : false;
    
};

Zotero.Collection.prototype.nestCollection = function(collectionsObject) {
    Z.debug("Zotero.Collection.nestCollection", 4);
    var collection = this;
    var parentCollectionKey = collection.get('parentCollection');
    if(parentCollectionKey !== false){
        if(collectionsObject.hasOwnProperty(parentCollectionKey)) {
            var parentOb = collectionsObject[parentCollectionKey];
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
    var config = {
        'target':'items',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key,
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
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    var writeObject = collection.writeApiObj();
    var requestData = JSON.stringify(writeObject);
    
    return Zotero.ajaxRequest(config, 'PUT',
        {data: requestData,
         processData: false,
         headers:{
             'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    );
};

Zotero.Collection.prototype.writeApiObj = function(){
    var collection = this;
    var writeObj = J.extend({}, collection.pristineData, collection.apiObj.data);
    return writeObj;
};

Zotero.Collection.prototype.remove = function(){
    Z.debug("Zotero.Collection.delete", 3);
    var collection = this;
    var owningLibrary = collection.owningLibrary;
    var config = {
        'target':'collection',
        'libraryType':collection.apiObj.library.type,
        'libraryID':collection.apiObj.library.id,
        'collectionKey':collection.key
    };
    
    return Zotero.ajaxRequest(config, 'DELETE',
        {processData: false,
         headers:{
            'If-Unmodified-Since-Version': collection.version
         },
         cache:false
        }
    ).then(function(){
        Z.debug("done deleting collection. remove local copy.", 3);
        owningLibrary.collections.removeLocalCollection(collection.key);
        owningLibrary.trigger("libraryCollectionsUpdated");
    });
};

Zotero.Collection.prototype.get = function(key){
    var collection = this;
    switch(key) {
        case 'title':
        case 'name':
            return collection.apiObj.data.name;
        case 'collectionKey':
        case 'key':
            return collection.apiObj.key || collection.key;
        case 'collectionVersion':
        case 'version':
            return collection.apiObj.version;
        case 'parentCollection':
            return collection.apiObj.data.parentCollection;
    }
    
    if(key in collection.apiObj.data){
        return collection.apiObj.data[key];
    }
    else if(collection.apiObj.meta.hasOwnProperty(key)){
        return collection.apiObj.meta[key];
    }
    else if(collection.hasOwnProperty(key)){
        return collection[key];
    }
    
    return null;
};

Zotero.Collection.prototype.set = function(key, val){
    var collection = this;
    if(key in collection.apiObj.data){
        collection.apiObj.data[key] = val;
    }
    switch(key){
        case 'title':
        case 'name':
            collection.apiObj.data['name'] = val;
            break;
        case 'collectionKey':
        case 'key':
            collection.key = val;
            collection.apiObj.key = val;
            collection.apiObj.data.key = val;
            break;
        case 'parentCollection':
            collection.apiObj.data['parentCollection'] = val;
            break;
        case 'collectionVersion':
        case 'version':
            collection.version = val;
            collection.apiObj.version = val;
            collection.apiObj.data.version = val;
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
Zotero.Item = function(itemObj){
    this.instance = "Zotero.Item";
    this.version = 0;
    this.key = '';
    this.synced = false;
    this.apiObj = {};
    this.pristineData = null;
    this.childItemKeys = [];
    this.writeErrors = [];
    this.notes = [];
    if(itemObj){
        this.parseJsonItem(itemObj);
    } else {
        this.parseJsonItem(this.emptyJsonItem());
    }
    this.initSecondaryData();
};

Zotero.Item.prototype = new Zotero.ApiObject();

Zotero.Item.prototype.parseJsonItem = function (apiObj) {
    var item = this;
    item.version = apiObj.version;
    item.key = apiObj.key;
    item.apiObj = J.extend({}, apiObj);
    item.pristineData = J.extend({}, apiObj.data);
    if(!item.apiObj._supplement){
        item.apiObj._supplement = {};
    }
};

Zotero.Item.prototype.emptyJsonItem = function(){
    return {
        key: '',
        version: 0,
        library:{},
        links:{},
        data: {
            key:'',
            version:0,
            title:'',
            creators:[],
            collections:[],
            tags:[],
            relations:{},
        },
        meta: {},
        _supplement: {},
    };
};

//populate property values derived from json content
Zotero.Item.prototype.initSecondaryData = function(){
    var item = this;
    
    item.version = item.apiObj.version;
    
    if(item.apiObj.data.itemType == 'attachment'){
        item.mimeType = item.apiObj.data.contentType;
        item.translatedMimeType = Zotero.utils.translateMimeType(item.mimeType);
    }
    if('linkMode' in item.apiObj){
        item.linkMode = item.apiObj.data.linkMode;
    }
    
    item.attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
    
    if(item.apiObj.meta.parsedDate){
        item.parsedDate = new Date(item.apiObj.meta.parsedDate);
    } else {
        item.parsedDate = false;
    }
    
    item.synced = false;

    item.updateTagStrings();
};

Zotero.Item.prototype.updateTagStrings = function(){
    var item = this;
    var tagstrings = [];
    for (i = 0; i < item.apiObj.data.tags.length; i++) {
        tagstrings.push(item.apiObj.data.tags[i].tag);
    }
    item.apiObj._supplement.tagstrings = tagstrings;
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
    item.version = 0;
    var noteTemplate = {"itemType":"note","note":"","tags":[],"collections":[],"relations":{}};
    
    item.initEmptyFromTemplate(noteTemplate);
    
    return item;
};

Zotero.Item.prototype.initEmptyFromTemplate = function(template){
    var item = this;
    item.version = 0;
    
    item.key = '';
    item.pristineData = J.extend({}, template);
    item.apiObj = {
        key: '',
        version: 0,
        library: {},
        links: {},
        data: template,
        meta: {},
        _supplement: {},
    };
    
    item.initSecondaryData();
    return item;
};

Zotero.Item.prototype.isSnapshot = function(){
    var item = this;
    if(item.apiObj.links['enclosure']){
        var ftype = item.apiObj.links['enclosure'].type;
        if(!item.apiObj.links['enclosure']['length'] && ftype == 'text/html'){
            return true;
        }
    }
    return false;
};

Zotero.Item.prototype.updateObjectKey = function(objectKey){
    return this.updateItemKey(objectKey);
};

Zotero.Item.prototype.updateItemKey = function(itemKey){
    var item = this;
    item.key = itemKey;
    item.apiObj.key = itemKey;
    item.apiObj.data.key = itemKey;
    item.pristineData.key = itemKey;
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
    if(item.apiObj.data.creators){
        var newCreatorsArray = item.apiObj.data.creators.filter(function(c){
            if(c.name || c.firstName || c.lastName){
                return true;
            }
            return false;
        });
        item.apiObj.data.creators = newCreatorsArray;
    }
    
    //copy apiObj, extend with pristine to make sure required fields are present
    //and remove unwriteable fields(?)
    var writeApiObj = J.extend({}, item.pristineData, item.apiObj.data);
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
            noteItem.set('parentItem', item.key);
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
    Z.debug("Zotero.Item.getChildren");
    var item = this;
    return Promise.resolve()
    .then(function(){
        //short circuit if has item has no children
        if(!item.apiObj.meta.numChildren){
            return [];
        }
        
        var config = {
            'target':'children',
            'libraryType':item.apiObj.library.type,
            'libraryID':item.apiObj.library.id,
            'itemKey':item.key
        };
        
        return Zotero.ajaxRequest(config)
        .then(function(response){
            Z.debug('getChildren proxied callback', 4);
            var items = library.items;
            var childItems = items.addItemsFromJson(response.data);
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
        'libraryType':item.owningLibrary.type,
        'libraryID':item.owningLibrary.libraryID,
        'itemKey':item.key
    };
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
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
        'libraryType':item.owningLibrary.type,
        'libraryID':item.owningLibrary.libraryID,
        'itemKey':item.key
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
    if(item.apiObj.data.itemType == 'attachment'){
        switch(item.apiObj.data.linkMode){
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
        return item.apiObj.data.itemType;
    }
};

Zotero.Item.prototype.itemTypeIconClass = function(){
    //linkModes: imported_file,imported_url,linked_file,linked_url
    var item = this;
    var defaultIcon = 'fa-file-text-o';
    switch(item.apiObj.data.itemType){
        case 'attachment':
            switch(item.apiObj.data.linkMode){
                case 'imported_file':
                    if(item.translatedMimeType == 'pdf'){
                        return 'fa-file-pdf-o';
                    }
                    return 'glyphicons file'
                case 'imported_url':
                    if(item.translatedMimeType == 'pdf'){
                        return 'fa-file-pdf-o';
                    }
                    return 'glyphicons file';
                case 'linked_file':
                    return 'glyphicons link';
                    //return item.itemTypeImageSrc['attachmentLink'];
                case 'linked_url':
                    return 'glyphicons link';
                    //return item.itemTypeImageSrc['attachmentWeblink'];
                default:
                    return 'glyphicons paperclip';
                    //return item.itemTypeImageSrc['attachment'];
            }
        case 'artwork':
            return 'glyphicons picture';
        case 'audioRecording':
            return 'glyphicons microphone';
        case 'bill':
            return defaultIcon;
        case 'blogPost':
            return 'glyphicons blog';
        case 'book':
            return 'glyphicons book';
        case 'bookSection':
            return 'glyphicons book_open';
        case 'case':
            return defaultIcon;
        case 'computerProgram':
            return 'glyphicons floppy_disk';
        case 'conferencePaper':
            return defaultIcon;
        case 'dictionaryEntry':
            return 'glyphicons translate';
        case 'document':
            return 'glyphicons file';
        case 'email':
            return 'glyphicons envelope';
        case 'encyclopediaArticle':
            return 'glyphicons bookmark';
        case 'film':
            return 'glyphicons film';
        case 'forumPost':
            return 'glyphicons bullhorn';
        case 'hearing':
            return 'fa-gavel';
        case 'instantMessage':
            return 'fa-comment-o';
        case 'interview':
            return 'fa-comments-o';
        case 'journalArticle':
            return 'fa-file-text-o';
        case 'letter':
            return 'glyphicons message_full';
        case 'magazineArticle':
            return defaultIcon;
        case 'manuscript':
            return 'glyphicons pen';
        case 'map':
            return 'glyphicons google_maps';
        case 'newspaperArticle':
            return 'fa-newspaper-o';
        case 'note':
            return 'glyphicons notes noteyellow';
        case 'patent':
            return 'glyphicons lightbulb';
        case 'podcast':
            return 'glyphicons ipod';
        case 'presentation':
            return 'glyphicons keynote';
        case 'radioBroadcast':
            return 'glyphicons wifi_alt';
        case 'report':
            return 'glyphicons notes_2';
        case 'statue':
            return 'glyphicons bank';
        case 'thesis':
            return 'fa-graduation-cap';
        case 'tvBroadcast':
            return 'glyphicons display';
        case 'videoRecording':
            return 'glyphicons facetime_video';
        case 'webpage':
            return 'glyphicons embed_close';
        default:
            return 'glyphicons file';
    }
};

Zotero.Item.prototype.get = function(key){
    var item = this;
    switch(key) {
        case 'title':
            var title = '';
            if(item.apiObj.data.itemType == 'note'){
                return item.noteTitle(item.apiObj.data.note);
            } else {
                return item.apiObj.data.title;
            }
            if(title == ''){
                return '[Untitled]';
            }
            return title;
        case 'creatorSummary':
        case 'creator':
            if(typeof item.apiObj.meta.creatorSummary !== "undefined"){
                return item.apiObj.meta.creatorSummary;
            }
            else {
                return '';
            }
        case 'year':
            if(item.parsedDate) {
                return item.parsedDate.getFullYear();
            }
            else {
                return '';
            }
    }
    
    if(key in item.apiObj.data){
        return item.apiObj.data[key];
    }
    else if(key in item.apiObj.meta){
        return item.apiObj.meta[key];
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
    if(key in item.apiObj.data){
        item.apiObj.data[key] = val;
    }
    if(key in item.apiObj.meta){
        item.apiObj.meta[key] = val;
    }
    
    switch (key) {
        case "itemKey":
        case "key":
            item.key = val;
            item.apiObj.data.key = val;
            break;
        case "itemVersion":
        case "version":
            item.version = val;
            item.apiObj.data.version = val;
            break;
        case "itemType":
            item.itemType = val;
            //TODO: translate api object to new item type
            break;
        case "linkMode":
            break;
        case "deleted":
            item.apiObj.data.deleted = val;
            break;
        case "parentItem":
            if( val === '' ){ val = false; }
            item.apiObj.data.parentItem = val;
            break;
    }
    
//    item.synced = false;
    return item;
};

Zotero.Item.prototype.noteTitle = function(note){
    var len = 120;
    var notetext = J(note).text();
    var firstNewline = notetext.indexOf("\n");
    if(firstNewline < len){
        return notetext.substr(0, firstNewline);
    }
    else {
        return notetext.substr(0, len);
    }
};

Zotero.Item.prototype.setParent = function(parentItemKey){
    var item = this;
    //pull out itemKey string if we were passed an item object
    if(typeof parentItemKey != 'string' &&
        parentItemKey.hasOwnProperty('instance') &&
        parentItemKey.instance == 'Zotero.Item'){
        parentItemKey = parentItemKey.key;
    }
    item.set('parentItem', parentItemKey);
    return item;
};

Zotero.Item.prototype.addToCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.instance == 'Zotero.Collection'){
            collectionKey = collectionKey.key;
        }
    }
    if(J.inArray(collectionKey, item.apiObj.data.collections) === -1){
        item.apiObj.data.collections.push(collectionKey);
    }
    return;
};

Zotero.Item.prototype.removeFromCollection = function(collectionKey){
    var item = this;
    //take out the collection key if we're passed a collection object instead
    if(typeof collectionKey != 'string'){
        if(collectionKey.instance == 'Zotero.Collection'){
            collectionKey = collectionKey.key;
        }
    }
    var index = J.inArray(collectionKey, item.apiObj.data.collections);
    if(index != -1){
        item.apiObj.data.collections.splice(index, 1);
    }
    return;
};

Zotero.Item.prototype.uploadChildAttachment = function(childItem, fileInfo, progressCallback){
    /*
     * write child item so that it exists
     * get upload authorization for actual file
     * perform full upload
     */
    var item = this;
    Z.debug("uploadChildAttachment", 3);
    if(!item.owningLibrary){
        return Promise.reject(new Error("Item must be associated with a library"));
    }

    //make sure childItem has parent set
    childItem.set('parentItem', item.key);
    childItem.associateWithLibrary(item.owningLibrary);
    
    return childItem.writeItem()
    .then(function(response){
        //successful attachmentItemWrite
        item.numChildren++;
        return childItem.uploadFile(fileInfo, progressCallback)
    }, function(response){
        //failure during attachmentItem write
        throw {
            "message":"Failure during attachmentItem write.",
            "code": response.status,
            "serverMessage": response.rawResponse.responseText,
            "response": response
        };
    });
};

Zotero.Item.prototype.uploadFile = function(fileInfo, progressCallback){
    var item = this;
    Z.debug("Zotero.Item.uploadFile", 3);
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
            //TODO: add progress
            return Zotero.file.uploadFile(upAuthOb, fileInfo)
            .then(function(){
                //upload was successful: register it
                return item.registerUpload(upAuthOb.uploadKey)
                .then(function(response){
                    return {'message': 'Upload Successful'};
                });
            });
        }
    }).catch(function(response){
        Z.debug("Failure caught during upload", 3);
        Z.debug(response, 3);
        throw {
            "message":"Failure during upload.",
            "code": response.status,
            "serverMessage": response.rawResponse.responseText,
            'response': response
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
        cslItem['id'] = zoteroItem.apiObj.library.id + "/" + zoteroItem.get("key");
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
    "versionNumber"       : "Version Number",
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
    "version",
    "key",
    "collections",
    "relations",
    "parentItem",
    "contentType",
    "filename",
    "tags"
];

Zotero.Item.prototype.noEditFields = [
    "accessDate",
    "modified",
    "filename",
    "dateAdded",
    "dateModified"
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
    "versionNumber": ["version"],
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
Zotero.Search = function(){
    this.instance = "Zotero.Search";
    this.searchObject = {};
};
Zotero.Group = function (groupObj) {
    var group = this;
    group.instance = "Zotero.Group";
    if(groupObj){
        this.parseJsonGroup(groupObj);
    }
};

Zotero.Group.prototype = new Zotero.ApiObject();

Zotero.Group.prototype.parseJsonGroup = function(groupObj) {
    var group = this;
    group.apiObj = groupObj;
};

Zotero.Group.prototype.get = function(key) {
    var group = this;
    switch(key) {
        case 'title':
        case 'name':
            return group.apiObj.data.name;
    }
    
    if(key in group.apiObj){
        return group.apiObj[key];
    }
    if(key in group.apiObj.data){
        return group.apiObj.data[key];
    }
    if(key in group.apiObj.meta){
        return group.apiObj.meta[key];
    }
    if(group.hasOwnProperty(key)){
        return group[key];
    }
    
    return null;
};

Zotero.Group.prototype.isWritable = function(userID){
    var group = this;
    switch(true){
        case group.get('owner') == userID:
            return true;
        case (group.apiObj.data.admins && (group.apiObj.data.admins.indexOf(userID) != -1) ):
            return true;
        case ((group.apiObj.data.libraryEditing == 'members') &&
              (group.apiObj.data.members) &&
              (group.apiObj.data.members.indexOf(userID) != -1)):
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
Zotero.User.prototype = new Zotero.ApiObject();
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
    
    slugify: function(name){
        var slug = J.trim(name);
        slug = slug.toLowerCase();
        slug = slug.replace( /[^a-z0-9 ._-]/g , "");
        slug = slug.replace(/\s/g, "_");
        
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
            Z.error("error parsing api date: " + datestr);
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
// Url.js - construct certain urls and links locally that may depend on the
// current website's routing scheme etc. Not necessarily pointing to zotero.org
// - href for a particular item's local representation
// - link with appropriate text, to download file or view framed snapshot
// - href for file download/view, depending on whether config says to download
// directly from the api, or to proxy it
// - displayable string describing the attachment file (attachmentFileDetails)
// - list of urls for supported export formats
// 

//locally construct a url for the item on the current website
Zotero.url.itemHref = function(item){
    var href = '';
    href += Zotero.config.libraryPathString + '/itemKey/' + item.key;
    return href;
};

//construct a download link for an item's enclosure file that takes into
//account size and whether the file is a snapshot
Zotero.url.attachmentDownloadLink = function(item){
    var retString = '';
    var downloadUrl = item.attachmentDownloadUrl;
    var contentType = item.get('contentType');
    
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(!item.apiObj.links['enclosure']['length'] && item.isSnapshot()){
            //snapshot: redirect to view
            retString += '<a href="' + downloadUrl + '">' + 'View Snapshot</a>';
        }
        else{
            //file: offer download
            var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
            var enc = item.apiObj.links['enclosure'];
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
            retString += '<a href="' + downloadUrl + '">';
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
    if(item.apiObj.links && item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            //we have a proxy for downloads at baseDownloadUrl so just pass an itemkey to that
            return Zotero.url.wwwDownloadUrl(item);
        }
        else {
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    return false;
};

Zotero.url.apiDownloadUrl = function(item){
    if(item.apiObj.links['enclosure']){
        return item.apiObj.links['enclosure']['href'];
    }
    return false;
};

Zotero.url.wwwDownloadUrl = function(item){
    var urlString = '';
    if(item.apiObj.links['enclosure']){
        if(Zotero.config.proxyDownloads){
            return Zotero.config.baseDownloadUrl + "?itemkey=" + item.get('key');
        }
        else{
            return Zotero.url.apiDownloadUrl(item);
        }
    }
    else {
        return false;
    }
};

Zotero.url.attachmentFileDetails = function(item){
    //file: offer download
    if(!item.apiObj.links['enclosure']) return '';
    var enctype = Zotero.utils.translateMimeType(item.apiObj.links['enclosure'].type);
    var enc = item.apiObj.links['enclosure'];
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

Zotero.url.relationUrl = function(libraryType, libraryID, itemKey){
    return "http://zotero.org/" + libraryType + "s/" + libraryID + "/items/" + itemKey;
}
Zotero.file = {};

Zotero.file.getFileInfo = function(file){
    //fileInfo: md5, filename, filesize, mtime, zip, contentType, charset
    if(typeof FileReader != 'function'){
        return Promise.reject(new Error("FileReader not supported"));
    }
    
    return new Promise(function(resolve, reject){
        var fileInfo = {};
        var reader = new FileReader();
        reader.onload = function(e){
            Z.debug('Zotero.file.getFileInfo onloadFunc', 3);
            var result = e.target.result;
            Zotero.debug(result, 3);
            fileInfo.md5 = SparkMD5.ArrayBuffer.hash(result);
            fileInfo.filename = file.name;
            fileInfo.filesize = file.size;
            fileInfo.mtime = Date.now();
            fileInfo.contentType = file.type;
            //fileInfo.reader = reader;
            fileInfo.filedata = result;
            resolve(fileInfo);
        };
        
        reader.readAsArrayBuffer(file);
    });
};

Zotero.file.uploadFile = function(uploadInfo, fileInfo){
    Z.debug("Zotero.file.uploadFile", 3);
    Z.debug(uploadInfo, 4);
    
    var formData = new FormData();
    J.each(uploadInfo.params, function(index, val){
        formData.append(index, val);
    });
    
    var blobData = new Blob([fileInfo.filedata], {type : fileInfo.contentType});
    formData.append('file', blobData);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadInfo.url, true);
    
    return new Promise(function(resolve, reject){
        xhr.onload = function(evt){
            Z.debug('uploadFile onload event', 3);
            if(this.status == 201){
                Z.debug("successful upload - 201", 3);
                resolve();
            }
            else {
                Z.error('uploadFile failed - ' + xhr.status);
                reject({
                    "message": "Failure uploading file.",
                    "code": xhr.status,
                    "serverMessage": xhr.responseText
                });
            }
        };
        
        xhr.onprogress = function(evt){
            Z.debug('progress event');
            Z.debug(evt);
        };
        xhr.send(formData);
    });
    
    //If CORS is not enabled on s3 this XHR will not have the normal status
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
        
        // Now we can open our database
        Z.debug("requesting indexedDb from browser", 3);
        var db;
        var request = indexedDB.open("Zotero_" + idbLibrary.libraryString, 4);
        request.onerror = function(e){
            Zotero.error("ERROR OPENING INDEXED DB");
            reject();
        };
        
        var upgradeCallback = function(event){
            Z.debug("Zotero.Idb onupgradeneeded or onsuccess", 3);
            var oldVersion = event.oldVersion;
            Z.debug("oldVersion: " + event.oldVersion, 3);
            var db = event.target.result;
            idbLibrary.db = db;
            
            if(oldVersion < 4){
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
                if(db.objectStoreNames["files"]){
                    db.deleteObjectStore("files");
                }
                if(db.objectStoreNames["versions"]){
                    db.deleteObjectStore("versions");
                }
                Z.debug("Existing object store names:", 3);
                Z.debug(JSON.stringify(db.objectStoreNames), 3);
                
                // Create object stores to hold items, collections, and tags.
                // IDB keys are just the zotero object keys
                var itemStore = db.createObjectStore("items", { keyPath: "key" });
                var collectionStore = db.createObjectStore("collections", { keyPath: "key" });
                var tagStore = db.createObjectStore("tags", { keyPath: "tag" });
                var fileStore = db.createObjectStore("files");
                var versionStore = db.createObjectStore("versions");
                
                Z.debug("itemStore index names:", 3);
                Z.debug(JSON.stringify(itemStore.indexNames), 3);
                Z.debug("collectionStore index names:", 3);
                Z.debug(JSON.stringify(collectionStore.indexNames), 3);
                Z.debug("tagStore index names:", 3);
                Z.debug(JSON.stringify(tagStore.indexNames), 3);
                
                // Create index to search/sort items by each attribute
                J.each(Zotero.Item.prototype.fieldMap, function(key, val){
                    Z.debug("Creating index on " + key, 3);
                    itemStore.createIndex(key, "data." + key, { unique: false });
                });
                
                //itemKey index was created above with all other item fields
                //itemStore.createIndex("itemKey", "itemKey", { unique: false });
                
                //create multiEntry indices on item collectionKeys and tags
                itemStore.createIndex("collectionKeys", "data.collections", {unique: false, multiEntry:true});
                //index on extra tagstrings array since tags are objects and we can't index them directly
                itemStore.createIndex("itemTagStrings", "_supplement.tagstrings", {unique: false, multiEntry:true});
                //example filter for tag: Zotero.Idb.filterItems("itemTagStrings", "Unread");
                //example filter collection: Zotero.Idb.filterItems("collectionKeys", "<collectionKey>");
                
                //itemStore.createIndex("itemType", "itemType", { unique: false });
                itemStore.createIndex("parentItemKey", "data.parentItem", { unique: false });
                itemStore.createIndex("libraryKey", "libraryKey", { unique: false });
                itemStore.createIndex("deleted", "data.deleted", { unique: false });
                
                collectionStore.createIndex("name", "data.name", { unique: false });
                collectionStore.createIndex("key", "key", { unique: false });
                collectionStore.createIndex("parentCollection", "data.parentCollection", { unique: false });
                //collectionStore.createIndex("libraryKey", "libraryKey", { unique: false });
                
                tagStore.createIndex("tag", "tag", { unique: false });
                //tagStore.createIndex("libraryKey", "libraryKey", { unique: false });
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
            Z.error("Error deleting indexedDB");
            reject();
        }
        deleteRequest.onsuccess = function(){
            Z.debug("Successfully deleted indexedDB", 2);
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
            Z.error("clearObjectStore:", evt.target.errorCode);
            reject();
        };
    });
};

/**
* Add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.addItems = function(items){
    return this.addObjects(items, 'item');
};

/**
* Update/add array of items to indexedDB
* @param {array} items
*/
Zotero.Idb.Library.prototype.updateItems = function(items){
    return this.updateObjects(items, 'item');
};

/**
* Remove array of items to indexedDB. Just references itemKey and does no other checks that items match
* @param {array} items
*/
Zotero.Idb.Library.prototype.removeItems = function(items){
    return this.removeObjects(items, 'item');
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
    return this.getAllObjects('item');
};

Zotero.Idb.Library.prototype.getOrderedItemKeys = function(field, order){
    var idbLibrary = this;
    Z.debug("Zotero.Idb.getOrderedItemKeys", 3);
    Z.debug("" + field + " " + order, 3);
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

Zotero.Idb.Library.prototype.inferType = function(object){
    if(!object){
        return false;
    }
    if(!object.instance){
        return false;
    }
    switch(object.instance){
        case 'Zotero.Item':
            return 'item';
        case 'Zotero.Collection':
            return 'collection';
        case 'Zotero.Tag':
            return 'tag';
        default:
            return false;
    }
};

Zotero.Idb.Library.prototype.getTransactionAndStore = function(type, access){
    var idbLibrary = this;
    var transaction;
    var objectStore;
    switch(type){
        case 'item':
            transaction = idbLibrary.db.transaction(['items'], access);
            objectStore = transaction.objectStore('items');
            break;
        case 'collection':
            transaction = idbLibrary.db.transaction(['collections'], access);
            objectStore = transaction.objectStore('collections');
            break;
        case 'tag':
            transaction = idbLibrary.db.transaction(['tags'], access);
            objectStore = transaction.objectStore('tags');
            break;
        default:
            return Promise.reject();
    }
    return [transaction, objectStore];
};

Zotero.Idb.Library.prototype.addObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.addObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Add Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Add Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Added Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.add(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.updateObjects = function(objects, type){
    Z.debug("Zotero.Idb.Library.updateObjects", 3);
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Update Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Update Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Updated Object " + event.target.result, 4);
        };
        for (var i in objects) {
            var request = objectStore.put(objects[i].apiObj);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.removeObjects = function(objects, type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    var TS = idbLibrary.getTransactionAndStore(type, 'readwrite')
    var transaction = TS[0];
    var objectStore = TS[1];
    
    return new Promise(function(resolve, reject){
        transaction.oncomplete = function(event){
            Zotero.debug("Remove Objects transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("Remove Objects transaction failed.");
            reject();
        };
        
        var reqSuccess = function(event){
            Zotero.debug("Removed Object " + event.target.result, 4);
        };
        for (var i in collections) {
            var request = objectStore.delete(objects[i].key);
            request.onsuccess = reqSuccess;
        }
    });
};

Zotero.Idb.Library.prototype.getAllObjects = function(type){
    var idbLibrary = this;
    if(!type){
        type = idbLibrary.inferType(objects[0]);
    }
    return new Promise(function(resolve, reject){
        var objects = [];
        var objectStore = idbLibrary.db.transaction(type + 's').objectStore(type + 's');
        
        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                objects.push(cursor.value);
                cursor.continue();
            }
            else {
                resolve(objects);
            }
        };
    });
};

Zotero.Idb.Library.prototype.addCollections = function(collections){
    return this.addObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.updateCollections = function(collections){
    Z.debug("Zotero.Idb.Library.updateCollections", 3);
    return this.updateObjects(collections, 'collection');
};

/**
* Get collection from indexedDB that has given collectionKey
* @param {string} collectionKey
*/
Zotero.Idb.Library.prototype.getCollection = function(collectionKey){
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            resolve(event.target.result);
        };
        idbLibrary.db.transaction("collections").objectStore(["collections"], "readonly").get(collectionKey).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.removeCollections = function(collections){
    Z.debug("Zotero.Idb.Library.removeCollections", 3);
    return this.removeObjects(collections, 'collection');
};

Zotero.Idb.Library.prototype.getAllCollections = function(){
    Z.debug('Zotero.Idb.Library.getAllCollections', 3);
    return this.getAllObjects('collection');
};

Zotero.Idb.Library.prototype.addTags = function(tags){
    return this.addObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.updateTags = function(tags){
    Z.debug("Zotero.Idb.Library.updateTags", 3);
    return this.updateObjects(tags, 'tag');
};

Zotero.Idb.Library.prototype.getAllTags = function(){
    Z.debug('getAllTags', 3);
    return this.getAllObjects('tag');
};

Zotero.Idb.Library.prototype.setVersion = function(type, version){
    Z.debug("Zotero.Idb.Library.setVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["versions"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set version transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set version transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("versions");
        var reqSuccess = function(event){
            Zotero.debug("Set Version" + event.target.result, 3);
        };
        var request = fileStore.put(version, type);
        request.onsuccess = reqSuccess;
    });
};

/**
* Get version data from indexedDB
* @param {string} type
*/
Zotero.Idb.Library.prototype.getVersion = function(type){
    Z.debug("Zotero.Idb.Library.getVersion", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var success = function(event){
            Z.debug("done getting version");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["versions"], "readonly").objectStore("versions").get(type).onsuccess = success;
    });
};

Zotero.Idb.Library.prototype.setFile = function(itemKey, fileData){
    Z.debug("Zotero.Idb.Library.setFile", 3);
    var idbLibrary = this;
    return new Promise(function(resolve, reject){
        var transaction = idbLibrary.db.transaction(["files"], "readwrite");
        
        transaction.oncomplete = function(event){
            Zotero.debug("set file transaction completed.", 3);
            resolve();
        };
        
        transaction.onerror = function(event){
            Zotero.error("set file transaction failed.");
            reject();
        };
        
        var fileStore = transaction.objectStore("files");
        var reqSuccess = function(event){
            Zotero.debug("Set File" + event.target.result, 3);
        };
        var request = fileStore.put(fileData, itemKey);
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
        var success = function(event){
            Z.debug("done getting file");
            resolve(event.target.result);
        };
        idbLibrary.db.transaction(["files"], "readonly").objectStore("files").get(itemKey).onsuccess = success;
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
            Zotero.error("delete file transaction failed.");
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
Zotero.Library.prototype.processLoadedCollections = function(response){
    Z.debug('processLoadedCollections', 3);
    var library = this;
    
    //clear out display items
    Z.debug("adding collections to library.collections");
    var collectionsAdded = library.collections.addCollectionsFromJson(response.data);
    for (var i = 0; i < collectionsAdded.length; i++) {
        collectionsAdded[i].associateWithLibrary(library);
    }
    //update sync state
    library.collections.updateSyncState(response.lastModifiedVersion);
    
    Zotero.trigger("loadedCollectionsProcessed", {library:library, collectionsAdded:collectionsAdded});
    return response;
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
        var trashedItemKeys = response.data.split("\n");
        return library.items.deleteItems(trashedItemKeys, response.lastModifiedVersion);
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
    var library = this;
    if(!config){
        config = {};
    }
    
    var defaultConfig = {target:'items',
                         targetModifier: 'top',
                         itemPage: 1,
                         limit: 25,
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
    
    return library.ajaxRequest(requestUrl)
    .then(function(response){
        Z.debug('loadItems proxied callback', 3);
        //var library = this;
        var items = library.items;
        //clear out display items
        var loadedItemsArray = items.addItemsFromJson(response.data);
        for (var i = 0; i < loadedItemsArray.length; i++) {
            loadedItemsArray[i].associateWithLibrary(library);
        }
        
        response.loadedItems = loadedItemsArray;
        Zotero.trigger("itemsChanged", {library:library});
        return response;
    })
};

Zotero.Library.prototype.processLoadedItems = function(response){
    Z.debug('processLoadedItems', 3);
    var library = this;
    var items = library.items;
    //clear out display items
    var loadedItemsArray = items.addItemsFromJson(response.data);
    for (var i = 0; i < loadedItemsArray.length; i++) {
        loadedItemsArray[i].associateWithLibrary(library);
    }
    
    //update sync state
    library.items.updateSyncState(response.lastModifiedVersion);
    
    Zotero.trigger("itemsChanged", {library:library, loadedItems:loadedItemsArray});
    return response;
};

Zotero.Library.prototype.loadItem = function(itemKey) {
    Z.debug("Zotero.Library.loadItem", 3);
    var library = this;
    if(!config){
        var config = {};
    }
    
    var urlconfig = {
        'target':'item',
        'libraryType':library.libraryType,
        'libraryID':library.libraryID,
        'itemKey':itemKey,
    };
    
    return library.ajaxRequest(urlconfig)
    .then(function(response){
        Z.debug("Got loadItem response");
        var item = new Zotero.Item(response.data);
        Z.debug(item);
        item.owningLibrary = library;
        library.items.itemObjects[item.key] = item;
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
        limit: 100
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
        library.tags.updateSyncState(response.lastModifiedVersion);
        var addedTags = library.tags.addTagsFromJson(response.data);
        
        if(response.parsedLinks.hasOwnProperty('next')){
            library.tags.hasNextLink = true;
            library.tags.nextLink = response.parsedLinks['next'];
        }
        else{
            library.tags.hasNextLink = false;
            library.tags.nextLink = null;
        }
        library.trigger("tagsChanged", {library:library});
        return library.tags;
    });
};


Zotero.Library.prototype.loadAllTags = function(config){
    Z.debug("Zotero.Library.loadAllTags", 3);
    var library = this;
    if(typeof config == 'undefined'){
        config = {};
    }
    
    var defaultConfig = {target:'tags',
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
            plainList.sort(Zotero.Library.prototype.comparer());
            tags.plainList = plainList;
            
            if(tags.hasNextLink){
                Z.debug("still has next link.", 3);
                tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.comparer());
                tags.plainList = plainList;
                
                var nextLink = tags.nextLink;
                var nextLinkConfig = J.deparam(J.param.querystring(nextLink));
                var newConfig = J.extend({}, config);
                newConfig.start = nextLinkConfig.start;
                newConfig.limit = nextLinkConfig.limit;
                return library.loadTags(newConfig).then(continueLoadingCallback);
            }
            else{
                Z.debug("no next in tags link", 3);
                tags.updateSyncedVersion();
                tags.tagsArray.sort(Zotero.Tag.prototype.tagComparer());
                plainList = Zotero.Tags.prototype.plainTagsList(tags.tagsArray);
                plainList.sort(Zotero.Library.prototype.comparer());
                tags.plainList = plainList;
                Z.debug("resolving loadTags deferred", 3);
                library.tagsLoaded = true;
                library.tags.loaded = true;
                tags.loadedConfig = config;
                tags.loadedRequestUrl = requestUrl;
                
                //update all tags with tagsVersion
                for (var i = 0; i < library.tags.tagsArray.length; i++) {
                    tags.tagsArray[i].apiObj.version = tags.tagsVersion;
                }
                
                library.trigger("tagsChanged", {library:library});
                return tags;
            }
        };
        
        resolve( library.loadTags(urlconfig)
        .then(continueLoadingCallback))
    });
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
        var latestItemVersion = 0;
        for(var i = 0; i < itemsArray.length; i++){
            var item = new Zotero.Item(itemsArray[i]);
            library.items.addItem(item);
            if(item.version > latestItemVersion){
                latestItemVersion = item.version;
            }
        }
        library.items.itemsVersion = latestItemVersion;
        
        //TODO: add itemsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.items.loaded = true;
        Z.debug("Done loading indexedDB items promise into library", 3);
    });
    
    collectionsPromise.then(function(collectionsArray){
        Z.debug("loadIndexedDBCache collectionsD done", 3);
        //create collectionsDump from array of collection objects
        var latestCollectionVersion = 0;
        for(var i = 0; i < collectionsArray.length; i++){
            var collection = new Zotero.Collection(collectionsArray[i]);
            library.collections.addCollection(collection);
            if(collection.version > latestCollectionVersion){
                latestCollectionVersion = collection.version;
            }
        }
        library.collections.collectionsVersion = latestCollectionVersion;
        
        //TODO: add collectionsVersion as last version in any of these items?
        //or store it somewhere else for indexedDB cache purposes
        library.collections.initSecondaryData();
        library.collections.loaded = true;
    });
    
    tagsPromise.then(function(tagsArray){
        Z.debug("loadIndexedDBCache tagsD done", 3);
        Z.debug(tagsArray);
        //create tagsDump from array of tag objects
        var latestVersion = 0;
        var tagsVersion = 0;
        for(var i = 0; i < tagsArray.length; i++){
            var tag = new Zotero.Tag(tagsArray[i]);
            library.tags.addTag(tag);
            if(tagsArray[i].version > latestVersion){
                latestVersion = tagsArray[i].version;
            }
        }
        tagsVersion = latestVersion;
        library.tags.tagsVersion = tagsVersion;

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
};Zotero.Preferences = function(store, idString) {
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
