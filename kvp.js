/* key-value-pointer v0.7.0, (c) 2015 Steen Klingberg. License: MIT */
!function(t,e){"function"==typeof define&&define.amd?define(e):"undefined"!=typeof module?module.exports=e():t.keyValuePointer=e()}(this,function(){function t(t,e){var n,o,i=!1;if("string"==typeof t&&(t=JSON.parse(t)),"object"==typeof t){if("string"==typeof e)n=e.split("/");else{if(!Array.isArray(e))return;n=e}return o=t,n.forEach(function(t){i||(t=t.replace("~1","/").replace("~0","~"),""!==t&&("undefined"==typeof o[t]?(i=!0,o=void 0):o=o[t]))}),o}}function e(t){return t.substr(t.lastIndexOf("/")+1)}function n(t){return t.substr(0,t.lastIndexOf("/"))}function o(i){function r(t,e,n,i){var f,u,s,p,a=[];for(u=0;u<t.length;u++){p=t[u];for(f in p){var y=n+"/"+u;if(s=e.call(c,{key:f,value:p[f],pointer:l[y]+"/"+f,level:n})){if(!i)return p[f];i.insert(l[y]+"/"+f,p[f]),s=!1}else"object"==typeof p[f]&&null!==p[f]&&(l[n+1+"/"+a.length]=l[y]+"/"+f,a.push(p[f]));if(c.done)break}}return a.length>0?r(a,e,n+1,i):i?o(i.collection[0]):c.collection[0]}var c=function(){},l={"0/0":""};return"string"==typeof i&&(i=JSON.parse(i)),"object"==typeof i&&null!==i?c.collection=[i]:c.collection=[void 0],c.apply=function(t){return t.call(c),this},c.query=function(e,n){if("function"==typeof e)return n=e,r(this.collection,n,0);var o=t(this.collection[0],e);return"object"==typeof o?(l["0/0"]=e,r([o],n,0)):void 0},c.filter=function(e,n){if("function"==typeof e)return n=e,r(this.collection,n,0,o({}));"function"!=typeof n&&(n=function(){return!0});var i=t(this.collection[0],e);return"object"==typeof i?(l["0/0"]=e,r([i],n,0,o({}))):void 0},c.select=function(e){return t(this.collection[0],e)},c.replace=function(e,n){var o=e.split("/"),i=o.pop(),r=t(this.collection[0],o);return"object"==typeof r?(t(this.collection[0],o)[i]=n,!0):!1},c.remove=function(e){var n=e.split("/"),o=n.pop(),i=t(this.collection[0],n);return"object"==typeof i&&i[o]?(delete i[o],!0):!1},c.insert=function(e,n){var o,r=e.split("/"),c=!1,l=this.collection[0],f=[];return r.forEach(function(e,u){f.push(e),o=t(i,f),o?l=o:u<r.length-1?(/\d+/.test(r[u+1])?l[e]=[]:l[e]={},l=l[e]):(l[e]=n,c=!0)}),c},c.getObject=function(){return this.collection[0]},c.getJSON=function(){return JSON.stringify(this.collection[0])},c.basename=e,c.dirname=n,c}return o.basename=e,o.dirname=n,o});