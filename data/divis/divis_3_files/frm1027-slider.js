window.PuiTheme=window.PuiTheme||{};(function(a,b){a.SliderHtml=function(c){var d=this;d._options=b.extend({},d._defaults,c||{})};b.extend(a.SliderHtml,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.SliderHtml._getInstance(d);if(typeof c==="undefined"){c=new a.SliderHtml(f);a.SliderHtml._setInstance(c,d)}c.init(e)},_getInstance:function(c){if(typeof c==="undefined"){c=a.SliderHtml._defaultInstance}return a.SliderHtml._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.SliderHtml._defaultInstance}a.SliderHtml._instances[d]=c}});b.extend(a.SliderHtml.prototype,{_defaults:{selectors:{html:"html",component:".html-c-slider",handle:".html-handle"},cssClasses:{disabled:"html-is-disabled",uiSlider:"ui-slider",uiHandle:"ui-slider-handle"}},_attributes:{},_data:{valueMin:"value-min",valueMax:"value-max",valueCurrent:"value-current",stepLength:"step-length",range:"range"},_options:{},_eventNamespace:".sliderHtml",_initSliders:function(i){var g=this;var d=g._options;var f=d.selectors;var e=d.cssClasses;var h=g._data;var c=b(f.component,i);c.each(function(k,l){var j=b(l);g._prepareForJQueryUISlider(j);var m={disabled:j.hasClass(e.disabled),min:j.data(h.valueMin),max:j.data(h.valueMax),value:j.data(h.valueCurrent),step:j.data(h.stepLength),range:j.data(h.range)};j.slider(m)})},_prepareForJQueryUISlider:function(c){var g=this;var d=g._options;var f=d.selectors;var e=d.cssClasses;c.addClass(e.uiSlider);c.find(f.handle).addClass(e.uiHandle)},init:function(c){var d=this;var e=b(c);d._initSliders(e)}})})(window.PuiTheme,jQuery);