window.PuiTheme=window.PuiTheme||{};(function(a,b){a.ScrollToCta=function(c){var d=this;d._options=b.extend({},d._defaults,c||{})};b.extend(a.ScrollToCta,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.ScrollToCta._getInstance(d);if(typeof c==="undefined"){c=new a.ScrollToCta(f);a.ScrollToCta._setInstance(c,d)}c.init(e)},_getInstance:function(c){if(typeof c==="undefined"){c=a.ScrollToCta._defaultInstance}return a.ScrollToCta._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.ScrollToCta._defaultInstance}a.ScrollToCta._instances[d]=c}});b.extend(a.ScrollToCta.prototype,{_defaults:{selectors:{component:".html-is-button.html-is-linked-to-cta"}},_options:{},_eventNamespace:".ScrollToCta",_clickButtonScrollToCta:function(){var e=this;var c=e._options;var d=c.selectors;var f=b(d.component);f.off("click"+e._eventNamespace).on("click"+e._eventNamespace,function(g){g.stopPropagation();g.preventDefault();b(document).trigger("puiCtaToScrollViewport");e._trackButtonClick(g.target)})},_trackButtonClick:function(d){var c={action:"iWantToApply"};if(typeof window.measure==="function"){window.measure(c)}},init:function(){var c=this;c._clickButtonScrollToCta()}})})(window.PuiTheme,jQuery);(function(a,b){b(document).ready(function(){if(typeof a.ScrollToCta!=="undefined"){a.ScrollToCta.initWidget()}})})(window.PuiTheme,jQuery);