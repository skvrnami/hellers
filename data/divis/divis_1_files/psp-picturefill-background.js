(function(b){var a=function(c){return c.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")};b.picturefillBackgroundOptions={selector:"pui-picturefill-background"};b.picturefillBackground=function(){var s=b.document.getElementsByClassName(b.picturefillBackgroundOptions.selector);for(var k=0,q=s.length;k<q;k++){var o=s[k].getElementsByClassName(b.picturefillBackgroundOptions.selector);if(o.length>0){continue}var d=s[k].getElementsByTagName("span");var n=[];for(var g=0,l=d.length;g<l;g++){var c=d[g].getAttribute("data-src");var e=d[g].getAttribute("data-media");var p=d[g].getAttribute("data-bg-color");if(c&&(!e||(b.matchMedia&&b.matchMedia(e).matches))){var r={source:c,bg:p};n.push(r)}}if(n.length){var m=n.pop();c=m.source;var h=m.bg;var f=new RegExp(a(c));if(!f.test(s[k].style.backgroundImage)){s[k].style.backgroundImage="url('"+c+"')";s[k].style.backgroundColor=h}}}};if(b.addEventListener){b.addEventListener("load",b.picturefillBackground,false);b.addEventListener("resize",b.picturefillBackground,false);b.addEventListener("DOMContentLoaded",function(){b.picturefillBackground();b.removeEventListener("load",b.picturefillBackground,false)},false)}else{if(b.attachEvent){b.attachEvent("onload",b.picturefillBackground)}}}(this));