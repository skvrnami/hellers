window.Npw=window.Npw||{};(function(a,b,c){a.ChatStatusType=function(e,d){this.code=e;this.cssClasses=d};a.ChatStatusTypes={HIDDEN:new a.ChatStatusType("HIDDEN","npw-c-chat npw-is-hidden"),DISABLED:new a.ChatStatusType("DISABLED","npw-c-chat"),ENABLED:new a.ChatStatusType("ENABLED","npw-c-chat npw-is-online"),RUNNING:new a.ChatStatusType("RUNNING","npw-c-chat npw-is-online npw-is-started"),FINISHED:new a.ChatStatusType("FINISHED","npw-c-chat npw-is-online npw-is-ended"),EMAIL_SENT:new a.ChatStatusType("EMAIL_SENT","npw-c-chat npw-is-online npw-is-ended npw-is-email-sent"),fromCode:function(d){return a.Utils.getPropertyByName(a.ChatStatusTypes,d,a.ChatStatusTypes.DISABLED)}};a.WindowStatusType=function(g,d,f,e){this.code=g;this.draggable=d;this.resizable=f;this.cssClasses=e};a.WindowStatusTypes={EXPANDED:new a.WindowStatusType("EXPANDED",true,true,"npw-is-expanded"),COLLAPSED:new a.WindowStatusType("COLLAPSED",false,false,""),fromCode:function(d){return a.Utils.getPropertyByName(a.WindowStatusTypes,d,a.WindowStatusTypes.COLLAPSED)}};a.HelpStatusType=function(e,d){this.code=e;this.cssClasses=d};a.HelpStatusTypes={VISIBLE:new a.HelpStatusType("VISIBLE","npw-is-help"),HIDDEN:new a.HelpStatusType("HIDDEN","")};a.MessageType=function(e,d){this.code=e;this.cssClasses=d};a.MessageTypes={OUTGOING:new a.MessageType("OUTGOING","npw-message npw-is-outgoing"),INCOMING_OPERATOR:new a.MessageType("INCOMING_OPERATOR","npw-message npw-is-incoming"),INCOMING_WARNING:new a.MessageType("INCOMING_WARNING",""),INCOMING_GOODBYE:new a.MessageType("INCOMING_GOODBYE",""),fromCode:function(d){return a.Utils.getPropertyByName(a.MessageTypes,d,a.MessageTypes.INCOMING_OPERATOR)}}}(Npw.ChatKeeper=Npw.ChatKeeper||{},jQuery));