window.PuiTheme=window.PuiTheme||{};(function(a,b){a.InPageNavigation=function(c){var d=this;d._initInPageNavigation(c)};b.extend(a.InPageNavigation,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.InPageNavigation._getInstance(d);if(typeof c==="undefined"){c=new a.InPageNavigation(f);a.InPageNavigation._setInstance(c,d)}c.init(e)},_getInstance:function(c){if(typeof c==="undefined"){c=a.InPageNavigation._defaultInstance}return a.InPageNavigation._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.InPageNavigation._defaultInstance}a.InPageNavigation._instances[d]=c}});b.extend(a.InPageNavigation.prototype,{_defaults:{selectors:{inPageNavScope:".pui-has-in-page-navigation",inPageNavMenu:".pui-js-inpage-navigation",inPageNavNavigationLinks:"ul,ol",inPageNavLink:"ul > li > a,ol > li > a",inPageNavToTopLink:".pui-js-inpage-nav-link-top",inPageNavInclude:"[data-inpage-nav-include]"},cssClasses:{inPageNavToTopLinkClass:"html-c-inpage-nav-link-top pui-js-inpage-nav-link-top"},identificators:{inPageNavIdPrefix:"inpagenav"},dataAttr:{inPageNavAttrNavigationInclude:"inpage-nav-include",inPageNavAttrNavigationCaption:"inpage-nav-caption",inPageNavAttrToTopCaption:"inpage-nav-to-top-caption"}},_options:{},_eventNamespace:".InPageNavigation",_initScope:function(){var e=this;var c=e._options;var d=c.selectors;var f=b(d.inPageNavScope);f.each(function(i,j){var g=i;var h=b(j);e._initAnchors(g,h);e._bindScrollEvents(h)})},_initAnchors:function(u,q){var d=this;var h=d._options;var m=h.selectors;var x=h.cssClasses;var r=h.identificators;var l=h.dataAttr;var j=q.find(m.inPageNavInclude);var g=q.find(m.inPageNavMenu);var z=g.find(m.inPageNavNavigationLinks);var s=j.length;var k=u+1;g.attr("id",r.inPageNavIdPrefix+"-"+k);z.empty();for(var w=0;w<s;w++){var t=j.eq(w);var e=t.data(l.inPageNavAttrNavigationInclude)===true;if(e){var n=t.text();var f=t.data(l.inPageNavAttrNavigationCaption);var o=t.data(l.inPageNavAttrToTopCaption);var p=w+1;var c=f?f:n;var y=o?o:"&#10514;";var A=b('<li><a href="#'+r.inPageNavIdPrefix+"-"+k+"-"+p+'">'+c+"</a></li>");z.append(A);t.attr("id",r.inPageNavIdPrefix+"-"+k+"-"+p);var v=b('<a href="#'+r.inPageNavIdPrefix+"-"+k+'" class="'+x.inPageNavToTopLinkClass+'">'+y+"</a>");v.insertAfter(t)}}},_bindScrollEvents:function(){var e=this;var c=e._options;var d=c.selectors;var i=b(d.inPageNavMenu);var h=i.find(d.inPageNavLink);var f=b(d.inPageNavToTopLink);function g(k){var j=b(k);a.ScrollHelper.scrollToView(j)}b(window).off("popstate"+e._eventNamespace).on("popstate"+e._eventNamespace,function(k){var j=false;if(k.originalEvent){j=k.originalEvent.state}if(!j||j.type!=="inPageNavMenuAnchor"){return}g(j.targetSelector)});h.off("click"+e._eventNamespace).on("click"+e._eventNamespace,function(j){j.preventDefault();g(this.hash);window.history.pushState({type:"inPageNavMenuAnchor",targetSelector:this.hash},"",this.hash)});f.off("click"+e._eventNamespace).on("click"+e._eventNamespace,function(j){j.preventDefault();g(this.hash);window.history.pushState({type:"inPageNavMenuAnchor",targetSelector:this.hash},"",this.hash)})},_initInPageNavigation:function(c){var d=this;d._options=b.extend(true,{},d._defaults,c||{})},init:function(c){var d=this;var e=b(c);d._initScope(e)}})})(window.PuiTheme,jQuery);(function(a,b){b(document).ready(function(){var c={selectors:{inPageNavScope:".pui-m-tariffs",inPageNavMenu:".pui-c-submenu",inPageNavToTopLink:".pui-link-top",inPageNavInclude:"[data-tarnav]"},cssClasses:{inPageNavToTopLinkClass:"pui-link-top"},identificators:{inPageNavIdPrefix:"tariff"},dataAttr:{inPageNavAttrNavigationInclude:"tarnav",inPageNavAttrNavigationCaption:"tarnav-caption",inPageNavAttrToTopCaption:"tarnav-backtotop-caption"}};if(typeof a.InPageNavigation!=="undefined"){a.InPageNavigation.initWidget();a.InPageNavigation.initWidget(c,b(document),"tariffs")}})})(window.PuiTheme,jQuery);