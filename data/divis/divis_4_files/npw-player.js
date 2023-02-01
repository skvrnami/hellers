/**
 * NPW Player
 *
 * Player component for hosted video files and YouTube videos
 * Uses jQuery, jwPlayer, YouTube iFrame API
 *
 * Dependencies: jQuery, jwPlayer, YouTube iFrame API
 *
 * @version 1.0
 */

/**
 * the semi-colon at the start is a safety net against concatenated
 * scripts and/or other plugins which may not be closed properly.
 */
;

/**
 * JS namespace init
 * @type {{}|*}
 */
window.PuiTheme = window.PuiTheme || {};

(function (ns, $) {

    "use strict";

    // this API key has to be changed in production!!! - youtube npw player is deprecated
    var APIKey = "AIzaSyDutq-60ZOY5typyDJek-V7xoeYpTE6i-4";
    // Youtube API v3 request URLs
    var videoRequest = "https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet&id=";
    var playlistRequest = "https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet&playlistId=";

    // store youtube players in array
    ns.players = [];

    // Prototype/liferay path definition
    // resourcepath is used for resources
    //
    var isLiferay = typeof (Liferay) !== 'undefined';
    var resourcePath = '../../';
    var jwplayerBase = resourcePath + "js/lib/pdp/jwplayer/";
    if (isLiferay) {
        resourcePath = Liferay.ThemeDisplay.getPathThemeRoot() + "/";
        jwplayerBase = Liferay.ThemeDisplay.getPathJavaScript()+"/pdp/jwplayer/";
    }

    var defaultSettings = [];
    // Default settings for PSP context
    defaultSettings["psp"] = {
        context: "psp",
        skin: {
            name: 'npw-seven'
        },
        width: 770,
        height: 433,
        // Empty image
        logo: resourcePath + "jwplayer/logo-video.png",
        // set exact jwplayer path in case of minification of JS
        base: jwplayerBase
    };

    // Default settings used from NPW
    defaultSettings[undefined] = $.extend(this, defaultSettings["psp"]);

    // General npwplayer component, including both youtube and jwplayer
    $.fn.npwplayer = function (options) {
        var settings = $.extend({
            type: null,
            image: null,
            video: null,
            playlist: [],
            skin: {
                name: null
            },
            caption: "",
            perexHeading: null,
            perexText: null,
            logo: null,
            context: null,
            width: null,
            height: null,
            loader: null
        }, defaultSettings[options.context], options);
        var playerEl = $(this);
        var playerWrapper = playerEl.parent();
        var playerId = playerEl.attr("id");
        var isPSP = settings.context === "psp";
        var isNPWPB = settings.context === "npwpb";
        var isJWPlaylist = typeof settings.playlist !== "undefined" && settings.playlist.length > 1;
        var isYTPlaylist = typeof settings.playlist !== "undefined" && settings.playlist instanceof Array && settings.playlist.length > 1;
        var isYTPlaylistHosted = typeof settings.playlist !== "undefined" && !(settings.playlist instanceof Array) && settings.playlist.length > 11;
        var isPlaylist = isJWPlaylist || isYTPlaylist || isYTPlaylistHosted;
        var hasLoader = settings.loader === true;
        // build DOM player elements
        createDOMPlayer();
        switch(settings.type) {
            // jwplayer
            case "jwplayer":
                jwPlayerSetup();
                break;
            // youtube init
            case "youtube":
                console.warn("Youtube option has been deprecated, using JWplayer instead");
                jwPlayerSetup();
                // youtubeSetup(); JKR: This option is deprecated
                break;
            // default is jwplayer
            default:
                jwPlayerSetup();
                break;
        }

        function jwPlayerSetup() {
            var setup = {};
            // playlist
            if (isJWPlaylist) {
                // check for youtube and set skin (PSP only - differs only in playback icon)
                if (isYoutube(settings.playlist[0].file) && isPSP) {
                    settings.skin.name = "npw-seven";
                }
                setup = {
                    file: settings.video,
                    playlist: settings.playlist,
                    image: settings.image,
                    skin: {
                        name: settings.skin.name
                    },
                    logo: {
                        file: settings.logo
                    },
                    base: settings.base,
                    displaytitle: false
                };
            }
            // single video
            else {
                // check for youtube and set skin (PSP only)
                if (isYoutube(settings.video) && isPSP) {
                    settings.skin.name = "npw-seven";
                }
                setup = {
                    file: settings.video,
                    image: settings.image,
                    skin: {
                        name: settings.skin.name
                    },
                    logo: {
                        file: settings.logo
                    },
                    base: settings.base,
                    displaytitle: false
                };
            }
            // jwplayer init
            jwplayer(playerId).setup(setup)
                // load first video headline from playlist
                .onReady(function () {
                    var playerWidth = settings.width;
                    // flash object overlay hack + jwplayer container redefinition for caption text show/hide
                    if (this.renderingMode === "flash") {
                        this.container.setAttribute("wmode", "transparent");
                        this.container = this.container.parentNode;
                    }
                    if (this.getPlaylist() !== null) {
                        var index = 0;
                        var currentHeadline = this.getPlaylistItem(index).description;
                        $(this.container).prev().children(".npw-video-caption").text(currentHeadline);
                    }
                    this.resize(playerWidth, settings.height);
                    //remove loader
                    if (hasLoader) {
                        playerWrapper.removeClass("npw-player-loader");
                    }
                })
                // load video headlines from playlist
                .onPlay(function () {
                    if (this.getPlaylist() !== null) {
                        var index = this.getPlaylistIndex();
                        var currentHeadline = this.getPlaylistItem(index).description;
                        $(this.container).prev().hide();
                        $(this.container).prev().children(".npw-video-caption").text(currentHeadline);
                    }
                    // Hide video caption
                    playerWrapper.find('.npw-video-caption-wrapper').hide();
                })
                // hide headline on pause
                .onPause(function () {
                    $(this.container).prev().show();
                })
                // show headline when video is done playing
                .onComplete(function () {
                    $(this.container).prev().show();
                    // Show video caption
                    playerWrapper.find('.npw-video-caption-wrapper').show();
                });
        }

        function youtubeSetup() {
            // Load youtube API when Youtube video is called
            initYtApi();
            var player = {
                playerId: playerId,
                setup: {}
            };
            //playlist
            if (isYTPlaylist || isYTPlaylistHosted) {
                player.setup = {
                    playlist: settings.playlist,
                    width: settings.width,
                    height: settings.height
                };
            }
            else {
                player.setup = {
                    videoId: settings.video,
                    width: settings.width,
                    height: settings.height
                };
            }
            // yotube player store in array
            ns.players.push(player);
        }

        function isYoutube(link) {
            var isYoutube = jwplayer.utils.isYouTube(link);
            return isYoutube;
        }

        // build player DOM elements
        function createDOMPlayer() {
            // loader option enabled?
            if (hasLoader) {
                playerWrapper.addClass("npw-player-loader");
            }
            var sectionWidth = settings.width;
            var caption = "<div class='npw-video-caption-wrapper'><div class='npw-video-caption'>"+settings.caption+"</div></div>";
            var sectionWrapper = "<section></section>";
            playerEl.wrap(sectionWrapper);
            $(caption).insertBefore(playerEl);
            // appearance for NPWPB player
            if (isNPWPB) {
                var perexHeading = "<div class='npw-video-perex'><h2>"+settings.perexHeading+"</h2>";
                var perexText = "<p>"+settings.perexText+"</p>";
                if (settings.perexHeading !== null) {
                    $(perexHeading).insertBefore(playerEl.parent("section"));
                    $(perexText).insertAfter(playerEl);
                }
            }
            else {

                // Re-type perexText param null to empty string
                if (settings.perexText === null) {
                    settings.perexText = '';
                }

                // Re-type Heading param null to empty string
                if (settings.perexHeading === null) {
                    settings.perexHeading = '';
                }

                var perex = "<div class='npw-video-perex'><h2>" + settings.perexHeading + "</h2><p>" + settings.perexText + "</p></div>";
                var perexHeading = "<div class='npw-video-perex'><h2>"+settings.perexHeading+"</h2>";
                var perexText = "<div class='npw-video-perex'><p>"+settings.perexText+"</p></div>";


                 // If perexHeading and perexText no empty string show perex
                if (settings.perexHeading !== '' && settings.perexText !== '') {
                    $(perex).insertBefore(playerEl.parent("section"));
                    return false;
                }

                 // If perexHeading or perexText no empty string show perexHeading or perexText
                if (settings.perexHeading !== '') {
                    $(perexHeading).insertBefore(playerEl.parent("section"));
                } else if (settings.perexText !== '') {
                    $(perexText).insertBefore(playerEl.parent("section"));
                }
            }

            if (isPlaylist) {
                playerEl.parent().parent(".npw-player").addClass("npw-player-playlist");
            }
            playerEl.parent("section").css({
                "width": sectionWidth,
                "height": settings.height
            });
        }
    };

    // Deprecated
    // YouTube video player library
    $.fn.ytplayer = function (optionsYT) {

        //default setings
        var settingsYT = $.extend({
            videoId: null,
            width: null,
            height: null,
            // "showinfo=0" - hide header
            // "rel=0" - hide related videos at the end of video
            // "autohide=1" - hides the progress bar and player controls after a few seconds
            playerVars: {
                autohide: 1,
                showinfo: 0,
                rel: 0
            },
            playlist: [],
            loader: null
        }, optionsYT);
        var player;
        var playerWrapper = $(this).parent();
        var md = document.getElementById($(this).attr("id"));
        var isYTPlaylist = typeof settingsYT.playlist !== "undefined" && settingsYT.playlist instanceof Array && settingsYT.playlist.length > 1;
        var isPlaylistHosted = typeof settingsYT.playlist !== "undefined" && !(settingsYT.playlist instanceof Array) && settingsYT.playlist.length > 11;
        var hasLoader = settings.loader === true;
        $(this).wrap("<div class='npw-yt-wrapper'><div class='npw-yt-player'></div></div>");
        player = new YT.Player(md, {
            height: settingsYT.height,
            width: settingsYT.width,
            videoId: settingsYT.videoId,
            playerVars: {
                "autohide": settingsYT.playerVars.autohide,
                "showinfo": settingsYT.playerVars.showinfo,
                "rel": settingsYT.playerVars.rel
            },
            events: {
                "onStateChange": onPlayerStateChange,
                "onReady": onPlayerReady
            }
        });

        // show, hide, change video heading text
        function onPlayerStateChange(event) {
            var el = event.target;
            var elHeading = el.getIframe().parentNode.parentNode.previousElementSibling;
            if (elHeading !== null) {
                if ((el.getPlayerState() === 1) || (el.getPlayerState() === 3)) {
                    elHeading.style.display = "none";
                    if (isYTPlaylist || isPlaylistHosted) {
                        var currentHeadline = el.getVideoData().title;
                        elHeading.children[0].innerHTML = currentHeadline;
                    }
                }
                else {
                    elHeading.style.display = "block";
                }
            }
        }

        // youtube player initialized
        function onPlayerReady(event) {
            var el = event.target;
            // remove title (tooltip) attribute on iframe
            el.getIframe().removeAttribute("title");
            // in case of playlist settings, create playlist (from video list or youtube hosted)
            if (isYTPlaylist) {
                createYouTubeList(el, el.getIframe().parentNode.parentNode, settingsYT.playlist);
            }
            else if (isPlaylistHosted) {
                createYouTubeListHosted(el, el.getIframe().parentNode.parentNode, settingsYT.playlist);
            }
            //remove loader
            if (hasLoader) {
                playerWrapper.removeClass("npw-player-loader");
            }
        }

        // write playlist to DOM, bind click event
        function createListNodes(player, element, items, idList) {
            var elHeading = player.getIframe().parentNode.parentNode.previousElementSibling.children[0];
            $.each(idList, function(index, id) {
                var listNode = document.createElement("LI");
                var itemImg = document.createElement("DIV");
                var textWrapper = document.createElement("DIV");
                var itemTitle = document.createElement("DIV");
                var itemDescription = document.createElement("DIV");
                listNode.classList.add("npw-yt-item");
                listNode.setAttribute("data-video-id", items[id].id);
                itemImg.classList.add("npw-yt-item-img");
                itemImg.style.backgroundImage = "url('" + items[id].img + "')";
                textWrapper.classList.add("npw-yt-text-wrapper");
                itemTitle.classList.add("npw-yt-item-title");
                itemTitle.innerHTML = items[id].title;
                itemDescription.classList.add("npw-yt-item-description");
                itemDescription.innerHTML = items[id].description;
                listNode.appendChild(itemImg);
                listNode.appendChild(textWrapper);
                textWrapper.appendChild(itemTitle);
                textWrapper.appendChild(itemDescription);
                element.appendChild(listNode);
                listNode.onclick = function () {
                    player.loadVideoById(this.getAttribute("data-video-id"));
                    $(element).children().removeClass("active");
                    this.classList.add("active");
                };
            });
            // load first video and its headline
            $(element).children().first().addClass("active");
            player.cueVideoById(idList[0]);
            if (isYTPlaylist || isPlaylistHosted) {
                var firstHeadline = items[idList[0]].title;
                elHeading.innerHTML = firstHeadline;
            }
        }

        // youtube list made of multiple video IDs
        function createYouTubeList(player, target, videoList) {
            var elPlaylist = document.createElement("UL");
            elPlaylist.classList.add("npw-yt-list");
            elPlaylist.style.height = settingsYT.height + "px";
            target.appendChild(elPlaylist);
            var index = 0;
            var ytData = [];
            var globalData;
            // placeholder array with IDs as keys (for correct order of videos - AJAX will load them asynchronously)
            for (var i = 0, l = videoList.length; i < l; i++) {
                ytData[videoList[i]] = {
                    id: videoList[i],
                    img: null,
                    title: null,
                    description: null
                };
                $.when(
                    $.getJSON(videoRequest + videoList[i] + "&key=" + APIKey, function () {
                    }).done(function (data) {
                        globalData = data;
                    })
                ).then(function () {
                        index++;
                        // title, description, thumbnail, img loaded from youtube - pushed to placeholder array
                        if (globalData.items.length === 0) {
                            // cannot find the video, end function
                            return;
                        }
                        // assign youtube data to array
                        var videoData = globalData.items[0];
                        var title = videoData.snippet.title;
                        var description = videoData.snippet.description;
                        var img = videoData.snippet.thumbnails.default.url;
                        var id = videoData.id;
                        ytData[id].title = title;
                        ytData[id].description = description;
                        ytData[id].img = img;
                        if (videoList.length === index) {
                            createListNodes(player, elPlaylist, ytData, videoList);
                        }
                    });
            }
        }

        // youtube list made of one playlist ID
        function createYouTubeListHosted(player, target, listId) {
            var elPlaylist = document.createElement("UL");
            elPlaylist.classList.add("npw-yt-list");
            target.appendChild(elPlaylist);
            var videoList = [];
            var ytData = [];
            var globalData;
            $.when(
                $.getJSON(playlistRequest + listId + "&key=" + APIKey, function () {
                }).done(function (data) {
                    globalData = data;
                })
            ).then(function () {
                    // playlist videos (title, description, thumbnail, img, ID) loaded from youtube
                    var listData = globalData.items;
                    $.each(listData, function(index, video) {
                        ytData[video.snippet.resourceId.videoId] = {
                            id: video.snippet.resourceId.videoId,
                            img: video.snippet.thumbnails.default.url,
                            title: video.snippet.title,
                            description: video.snippet.description
                        };
                        videoList[index] = video.snippet.resourceId.videoId;
                    });
                    createListNodes(player, elPlaylist, ytData, videoList);
                });
        }

    };

    function initYtApi() {
        // Init YT API
        if (typeof(YT) === "undefined" || typeof(YT.Player) === "undefined") {
            $.getScript("https://www.youtube.com/iframe_api")
                .fail(function() {
                    // fallback for not loading the script...
                })
                .done(function() {
                    // Yotube API callback, every youtube player is intialized within this API function
                    window.onYouTubeIframeAPIReady = function() {
                        jQuery.each(window.PuiTheme.players, function (key, player) {
                            jQuery("#"+player.playerId).ytplayer(player.setup);
                        });
                    };
                });
        } else {
            jQuery.each(window.PuiTheme.players, function (key, player) {
                jQuery("#"+player.playerId).ytplayer(player.setup);
            });
        }
    }
})(window.PuiTheme, jQuery);