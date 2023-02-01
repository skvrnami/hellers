window.PuiTheme=window.PuiTheme||{};(function(a,b){a.NewsSticker=function(c){var d=this;d._options=b.extend({},d._defaults,c||{})};b.extend(a.NewsSticker,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.NewsSticker._getInstance(d);if(typeof c==="undefined"){c=new a.NewsSticker(f);a.NewsSticker._setInstance(c,d)}c.init(e)},_getInstance:function(c){if(typeof c==="undefined"){c=a.NewsSticker._defaultInstance}return a.NewsSticker._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.NewsSticker._defaultInstance}a.NewsSticker._instances[d]=c}});b.extend(a.NewsSticker.prototype,{_defaults:{selectors:{componentWrapper:".portlet-asset-publisher",component:".html-c-news-hp",resourcesWrapper:".pui-js-resource-messages",resourcesSection:".pui-js-resource-messages-news",newsComponent:".html-c-news-hp",newsItem:".html-news-item"},classes:{useSticker:"pui-js-sticker-on",stickerApplied:"pui-js-sticker-set",hasStickerOnNews:"html-has-sticker",hasStickerVisible:"html-has-sticker-visible"},dataAttributes:{stickerLabel:"stickerLabel"},htmlElements:{sticker:'<div class="html-c-sticker"></div>'}},_options:{},_eventNamespace:".NewsSticker",init:function(d){var e=this;var c=e._options;var f=window.hasOwnProperty("IntersectionObserver");e._setStickerMessage();c.$publisherInstances=e._getPublisherInstances(d);if(f){c.observer=e._initIntersectionObserver()}e._initNewsInstances(c.$publisherInstances,f)},_initIntersectionObserver:function(){var d=this;var c={root:null,rootMargin:"0px",threshold:0.5};return new IntersectionObserver(function(e){d._observerCallback(d,e)},c)},_observerCallback:function(f,c){var d=f._options;var e=d.classes;c.forEach(function(h){if(h.isIntersecting){var g=b(h.target).parent(e.newsComponent);g.addClass(e.hasStickerVisible)}})},_startObserving:function(e){var d=this;var c=d._options;c.observer.observe(e)},_setStickerMessage:function(){var e=this;var c=e._options;var d=c.selectors;var f=c.dataAttributes;var g=b(d.resourcesWrapper+" "+d.resourcesSection);c.stickerMessage=g.data(f.stickerLabel)},_getPublisherInstances:function(d){var f=this;var c=f._options;var e=c.selectors;var g;if(typeof d==="undefined"){g=b("body")}else{g=b(d)}return b(e.componentWrapper,g)},_initNewsInstances:function(c,h){var g=this;var d=g._options;var f=d.selectors;var e=d.classes;if(c.length>0&&typeof d.stickerMessage!=="undefined"){c.each(function(){var i=b(this);if(!i.hasClass(e.stickerApplied)){var k=b(f.newsItem,i).first();if(k.length>0){i.addClass(e.stickerApplied);var j=b(f.newsComponent,i);j.addClass(e.hasStickerOnNews);g._initNewsItem(k,h)}}})}},_initNewsItem:function(g,h){var f=this;var d=f._options;var e=d.classes;if(h){f._startObserving(g[0])}else{var c=g.parent(e.newsComponent);c.addClass(e.hasStickerVisible)}f._addStickerToElements(g)},_addStickerToElements:function(f){var e=this;var d=e._options;var c=b(d.htmlElements.sticker);c.text(d.stickerMessage);f.prepend(c)}})})(window.PuiTheme,jQuery);(function(a,b){b(document).ready(function(){if(typeof a.NewsSticker!=="undefined"){a.NewsSticker.initWidget()}})})(window.PuiTheme,jQuery);