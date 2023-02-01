window.PuiTheme=window.PuiTheme||{};(function(a,b){a.Overlays=function(c){var d=this;d._options=b.extend(true,{},d._defaults,c||{})};b.extend(a.Overlays,{_instances:{},_defaultInstance:"_default",initWidget:function(f,e,d){var c=a.Overlays._getInstance(d);if(typeof c==="undefined"){c=new a.Overlays(f);a.Overlays._setInstance(c,d);c.init(b(e),d)}},_getInstance:function(c){if(typeof c==="undefined"){c=a.Overlays._defaultInstance}return a.Overlays._instances[c]},_setInstance:function(c,d){if(typeof d==="undefined"){d=a.Overlays._defaultInstance}a.Overlays._instances[d]=c},open:function(c){var d=this;d._instances[c]._showOverlay()},close:function(c,e){var d=this;d._instances[c]._hideOverlay();if(typeof e!=="undefined"){d._instances[c]._callMeasure(e)}},closeAll:function(){var d=this;if(d._instances!==undefined){for(var c in d._instances){d._instances[c]._hideOverlay()}}}});b.extend(a.Overlays.prototype,{_defaults:{storageNamespace:"overlays",defaultOverlayId:"default-overlay-id",selectors:{overlayBoxes:".html-c-overlay",closeButton:".html-button-close"},classes:{isActive:"html-is-active",isInactive:"html-is-inactive"},dataAttr:{overlayId:"overlay-id"},callbackFunc:undefined,$element:undefined,instanceName:undefined,lastFocusedElement:undefined,tracking:{enableTracking:false,trackingDataCustom:{},trackingClosingMethodHeaderButton:"overlayClosingMethodHeaderButton",trackingClosingMethodEscapeKey:"overlayClosingMethodEscapeKey",trackingClosingMethodOutsideClick:"overlayClosingMethodOutsideClick",trackingErrorType:"overlayDisplayError",trackingOverlayFailed:"overlayFailed",trackingOverlayDisplayed:"overlayDisplayed",trackingOverlayCancelled:"overlayCancelled"},eventNamespace:".overlays"},_options:{},init:function(d,c){var e=this;e._options.$element=d;e._options.instanceName=c;e._bindCloseOverlay()},_bindCloseOverlay:function(){var e=this;var g=e._options.$element;var c=e._options.instanceName;var d={instanceName:c};var f=b(e._options.selectors.closeButton,g);f.off("click"+e._options.eventNamespace).on("click"+e._options.eventNamespace,d,function(i){a.Overlays.close(i.data.instanceName);var h=b.extend(true,{},e._options.tracking.trackingDataCustom);h.action=e._options.tracking.trackingOverlayCancelled;h.closingMethod=e._options.tracking.trackingClosingMethodHeaderButton;e._callMeasure(h)});b(document).off("keydown"+e._options.eventNamespace).on("keydown"+e._options.eventNamespace,function(i){if(i.keyCode===27){a.Overlays.closeAll();var h=b.extend(true,{},e._options.tracking.trackingDataCustom);h.action=e._options.tracking.trackingOverlayCancelled;h.closingMethod=e._options.tracking.trackingClosingMethodEscapeKey;e._callMeasure(h)}});g.off("click"+e._options.eventNamespace).on("click"+e._options.eventNamespace,d,function(i){if(i.target===this){a.Overlays.close(i.data.instanceName);var h=b.extend(true,{},e._options.tracking.trackingDataCustom);h.action=e._options.tracking.trackingOverlayCancelled;h.closingMethod=e._options.tracking.trackingClosingMethodOutsideClick;e._callMeasure(h)}})},getInstanceName:function(){var c=this;return c._options.instanceName},getInstanceElement:function(){var c=this;return c._options.$element},_showOverlay:function(){var d=this;var e=d._options.$element;e.removeClass(d._options.classes.isInactive);e.addClass(d._options.classes.isActive);d._options.lastFocusedElement=document.activeElement;var c=b.extend(true,{},d._options.tracking.trackingDataCustom);if(b("#"+d._options.instanceName).length===0){c.action=d._options.tracking.trackingOverlayFailed;c.errorType=[d._options.tracking.trackingErrorType];d._callMeasure(c)}else{c.action=d._options.tracking.trackingOverlayDisplayed;d._callMeasure(c)}},_hideOverlay:function(){var d=this;var f=d._options.$element;if(f.hasClass(d._options.classes.isActive)){f.removeClass(d._options.classes.isActive);f.addClass(d._options.classes.isInactive);var e=d._options.callbackFunc;if(typeof e==="function"){e(d)}}var c=d._options.lastFocusedElement;if(c){c.focus()}},_callMeasure:function(e){var c=this;if(c._options.tracking.enableTracking&&typeof window.measure==="function"){try{window.measure(e)}catch(d){console.warn("Error while calling 'measure': "+d)}}}})})(window.PuiTheme,jQuery);(function(a,b){if(typeof a.Overlays!=="undefined"){a.Overlays.initWidget()}})(window.PuiTheme,jQuery);