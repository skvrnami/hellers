window.Theme=window.Theme||{};window.PuiTheme=window.PuiTheme||{};window.Theme.Events=window.Theme.Events||{};window.PuiTheme.EventsCommon=window.PuiTheme.EventsCommon||{};window.PuiTheme.EventDomReady=window.PuiTheme.EventDomReady||{};(function(a,b){a.Common={trigger:function(c,d){b(document).trigger(c,d)},subscribe:function(c,e,d){b(document).on(c,e,d)},unsubscribe:function(c){b(document).off(c)}};a.DomReady={_eventName:"pdpDomReady",subscribe:function(f,g,e){var d=this;if(typeof f!=="string"){console.log("Unable to bind "+d._eventName+" DomReady event - namespace is not a String");return false}var c=d._eventName+"."+f;if(typeof e!=="function"){console.log("Unable to bind "+c+" DomReady event - handler is not a Function");return false}a.Common.subscribe(c,g,e)},unsubscribe:function(e){var d=this;if(typeof e!=="string"){console.log("Unable to unbind "+d._eventName+" DomReady event - namespace is not a String");return false}var c=d._eventName+"."+e;a.Common.unsubscribe(c)},trigger:function(e){var d=this;var c=d._eventName;if(typeof e==="undefined"){e=document}a.Common.trigger(c,e)}};b(document).ready(function(){a.DomReady.trigger(document)})})(window.Theme.Events,jQuery);window.PuiTheme.EventsCommon=window.Theme.Events.Common;window.PuiTheme.EventDomReady=window.Theme.Events.DomReady;