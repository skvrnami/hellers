window.PuiTheme=window.PuiTheme||{};(function(a,b){a.CustomScroll=function(c){var d=this;d._options=b.extend({},d._defaults,c||{})};b.extend(a.CustomScroll,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.ScrollToCta._getInstance(d);if(typeof c==="undefined"){c=new a.CustomScroll(f);a.CustomScroll._setInstance(c,d)}c.init(e)},_getInstance:function(c){if(typeof c==="undefined"){c=a.CustomScroll._defaultInstance}return a.CustomScroll._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.CustomScroll._defaultInstance}a.CustomScroll._instances[d]=c}});b.extend(a.CustomScroll.prototype,{_defaults:{selectors:{component:".html-is-linked-to-custom",componentHeading:".html-c-heading",componentStickyMenu:".html-c-sticky-menu"}},_options:{},_eventNamespace:".CustomScroll",_clickButtonCustomScroll:function(){var e=this;var c=e._options;var d=c.selectors;var f=b(d.component);f.off("click"+e._eventNamespace).on("click"+e._eventNamespace,function(h){h.stopPropagation();h.preventDefault();var g=b(b(this).attr("href"));if(g.length!==0){a.ScrollHelper.scrollToView(g);e._trackButtonClick(h.target)}})},_trackButtonClick:function(e){var c=b(e).parents(this._options.selectors.componentHeading).length>0||b(e).parents(this._options.selectors.componentStickyMenu).length>0;var d={action:c?"iWantToApply":"anchorClick"};if(!c){d.anchorText=b(e).text()}if(typeof window.measure==="function"){window.measure(d)}},init:function(){var c=this;c._clickButtonCustomScroll()}})})(window.PuiTheme,jQuery);(function(a,b){b(document).ready(function(){if(typeof a.CustomScroll!=="undefined"){a.CustomScroll.initWidget()}})})(window.PuiTheme,jQuery);