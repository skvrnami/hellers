window.PuiTheme=window.PuiTheme||{};(function(a,b,c){a.BranchesCustomSearchSupport=function(d){var e=this;e.options=b.extend({},e._defaults,d||{});e._init()};b.extend(a.BranchesCustomSearchSupport,{init:function(e){var d=new a.BranchesCustomSearchSupport(e);a.BranchesCustomSearchSupport.instance=d;return d},getInstance:function(){return a.BranchesCustomSearchSupport.instance}});b.extend(a.BranchesCustomSearchSupport.prototype,{_defaults:{selector:{targetElement:".html-b-business-places-search-form"},eventNamespace:".branchCustomForm",defaultSearchValues:{center:{lng:15.511385320312474,lat:50.20228229177917},zoom:11,types:["mitBranchEra","mitPost","mitATM","mitCashBack"],branch:"",product:"",postLevel:"",place:"",mode:"MAP"}},_init:function(d){var e=this;e.options=b.extend({},e._defaults,d||{});e._scanDocument()},_scanDocument:function(){var f=this;var d=f.options;var e=b(d.selector.targetElement);e.each(function(){var i=b(this);var g;if(i.is("form")){g="action"}else{if(i.is("a")){g="href"}else{return}}var h=i.attr(g);if(i.is("form")){i.off("submit"+d.eventNamespace).on("submit"+d.eventNamespace,function(k){var l=f._getTargetUrl(i,h);i.attr(g,l);window.location.href=l;return false})}else{if(i.is("a")){var j=f._getTargetUrl(i,h);i.attr(g,j)}}})},_createJson:function(e){var h=this;var d={};var f=e.data();b.each(f,function(j,k){var l=j.replace(/^om/,"");l=l.charAt(0).toLowerCase()+l.substring(1);d[l]=k});var i={};var g=b("[data-om-field-name]",e).filter(":input").not(":disabled,input:radio:not(:checked),input:checkbox:not(:checked)");g.each(function(){var m=b(this);var l=m.data("omFieldName");var k;if(b.inArray(l,["types"])>-1){k=[];var j=g.filter('[data-om-field-name="'+l+'"]:checked');j.each(function(n,q){var o=b(q);var p=h._parseValue(o.val());k=k.concat(p)})}else{k=h._parseValue(m.val())}i[l]=k});d=b.extend({},h.options.defaultSearchValues,d,i);d.product=encodeURIComponent(d.product);d.query=d.place;return d},_parseValue:function(e){if(/^[\{\[]/.test(e)){try{e=b.parseJSON(e)}catch(d){}}return e},_getTargetUrl:function(k,j){var e=this;var l=e._createJson(k);var d=j;var i=d.indexOf("#");if(i>-1){var h=d.substring(d.indexOf("#")+1);h=decodeURI(h);var f=null;try{f=JSON.parse(h)}catch(g){}d=d.substring(0,d.indexOf("#"));if(b.isPlainObject(f)){l=b.extend({},f,l)}}d+="#"+encodeURI(JSON.stringify(l));return d}})})(window.PuiTheme,jQuery);