// the semi-colon at the start is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
// Init Namespaces
window.PuiTheme = window.PuiTheme || {};

(function (ns, $) {
    "use strict";

    /**
     * Tutorials
     *
     * Dependencies: jQuery
     *
     * @param options {JSON} widget configuration options
     *
     * @constructor
     */
    ns.Tutorials = function (options) {
        var module = this;

        module._options = $.extend(true, {}, module._defaults, options || {});
        module._options.$scope = $(module._options.selectors.scope);
    };

    /**
     * Widget static init methods
     */
    $.extend(ns.Tutorials, {
        _instances: {},
        _defaultInstance: '_default',

        /**
         * Initializes the widget.
         * If an instance with the given name does not exist, creates an instance with the given configuration.
         * Executes the widget initialization on the specified DOM fragment.
         *
         * @param options {JSON} widget configuration options
         * @param fragment {String|jQuery|DOMElement} the DOM fragment selector, jQuery object or DOM element
         * @param instanceName {String?} the widget instance identifier
         */
        initWidget: function (options, fragment, instanceName) {
            var instance = ns.Tutorials._getInstance(instanceName);

            if (typeof instance === "undefined") {
                instance = new ns.Tutorials(options);
                ns.Tutorials._setInstance(instance, instanceName);
            }

            instance._init(fragment);
            return instance;
        },
        /**
         * Returns the widget instance object.
         * May return undefined if not yet initialized.
         *
         * @param instanceName {String?} the widget instance identifier
         * @return {undefined|PuiTheme.Tutorials} widget instance
         * @private
         */
        _getInstance: function (instanceName) {
            if (typeof instanceName === "undefined") {
                instanceName = ns.Tutorials._defaultInstance;
            }

            return ns.Tutorials._instances[instanceName];
        },

        /**
         * Stores the widget instance object.
         *
         * @param instance {PuiTheme.Tutorials} the widget instance
         * @param instanceName {String?} the widget instance identifier
         * @private
         */
        _setInstance: function (instance, instanceName) {
            if (typeof instanceName === "undefined") {
                instanceName = ns.Tutorials._defaultInstance;
            }

            ns.Tutorials._instances[instanceName] = instance;
        }
    });

    $.extend(ns.Tutorials.prototype, {
        _defaults: {
            selectors: {
                scope: '.pui-m-tutorials',
                tutorialPreview: '.html-b-tutorials-preview',
                tutorialContent: '.html-b-tutorials-content',
                tutorialList: '.html-b-tutorial-list',
                tutorialItem: '.html-b-tutorial-item',
                imagePreview: '.html-preview',
                previewContainer: '.html-b-preview',
                accordion: '.html-c-accordion',
                accordionItem: '.html-b-accordion-item',
                video: '.html-c-video',
                videoElement: '.html-video',
                videoError: '.html-b-error',
                videoErrorMessage: '.pui-js-video-error-message',
                videoUnsupported: '.html-b-unsupported',
                videoUnsupportedMessage: '.pui-js-video-unsupported-message'
            },
            classes: {
                active: 'html-is-active',
                hidden: 'html-is-hidden',
                disabled: 'html-is-disabled',
                expanded: 'html-is-expanded',
                collapsed: 'html-is-collapsed',
                dynamic: 'html-is-dynamic',
                initialized: 'html-is-initialized',
                videoHasError: 'html-has-error'
            },
            dataAttributes: {
                tutorialType: 'tutorial-type',
                tutorialStepType: 'step-type',
                tutorialStepDuration: 'step-duration',
                tutorialStepStartDelay: 'step-start-delay',
                tutorialStepIndex: 'tutorial-step-index',
                videoId: 'video-id',
                videoTimestamp: 'video-timestamp',
                tutorial: 'tutorial',
                step: 'step'
            },
            tutorialsData: {
                tutorialKey: 'tutorial',
                stepKey: 'step'
            },
            tutorialTypes: {
                loop: 'loop',
                once: 'repeat-once',
                static: 'static'
            },
            defaultStepDuration: 8000,
            defaultStepStartDelay: 0,
            defaultStepType: 'plain'
        },
        _videoEventNamespace: '.VideoHtml',
        _tutorialTimer: null,
        _tutorialsData: null,
        _eventNamespace: '.htmlTutorials',
        _options: {}, // constructed in ns.Tutorials

        /**
         * Initializes tutorial module
         *
         * @private
         */
        _init: function (fragment) {
            var module = this;

            var $fragment = $(fragment);

            module._initTutorials($fragment);
            module._initTutorialItems($fragment);
            module._watchAccordions($fragment);
        },
        /**
         * Initializes all tutorials in given scope
         *
         * @private
         */
        _initTutorials: function ($fragment) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var classes = options.classes;
            var $accordionItem = $(selectors.accordionItem, $fragment);
            var $scope = $($accordionItem.get(0));
            var $tutorialList = $(selectors.tutorialList, $fragment);

            $accordionItem.each(function (index, accordionItem) {
                var $tutorial = $(accordionItem).find($tutorialList);
                var $items = $tutorial.children(selectors.tutorialItem);

                $tutorial.addClass(classes.initialized);

                if (module._isTutorialDynamic($tutorial)) {
                    $tutorial.addClass(classes.dynamic);
                }

                $items.removeClass(classes.active);

                if (accordionItem.classList.contains(classes.expanded)) {
                    $scope = $($accordionItem.get(index));
                }
            });

            if ($accordionItem.hasClass(classes.expanded)) {
                module._startTutorial($scope, 0);
            }
        },

        /**
         * Checks whether tutorial is dynamic
         *
         * @param $tutorial
         * @returns {boolean}
         * @private
         */
        _isTutorialDynamic: function ($tutorial) {
            var module = this;
            var options = module._options;
            var dataAttributes = options.dataAttributes;
            var tutorialTypes = options.tutorialTypes;
            var tutorialType = ($tutorial.data(dataAttributes.tutorialType));

            return (tutorialType === tutorialTypes.loop || tutorialType === tutorialTypes.once);
        },

        /**
         * Get section key in tutorials data
         *
         * @private
         */
        _getTutorialsDataTutorialKey: function (sectionNumber) {
            var module = this;
            var options = module._options;
            var tutorialsData = options.tutorialsData;

            return tutorialsData.tutorialKey + '-' + sectionNumber;
        },
        /**
         * Get step key in tutorials data
         *
         * @private
         */
        _getTutorialsDataStepKey: function (stepNumber) {
            var module = this;
            var options = module._options;
            var tutorialsData = options.tutorialsData;

            return tutorialsData.stepKey + '-' + stepNumber;
        },
        /**
         * Bind tutorial item events
         *
         * @private
         */
        _initTutorialItemEvents: function ($tutorialItem, $section, $fragment) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var classes = options.classes;
            var dataAttributes = options.dataAttributes;

            $tutorialItem
                .off('click' + module._eventNamespace)
                .on('click' + module._eventNamespace, function () {
                    var $eventSource = $(this);
                    if (!$eventSource.hasClass(classes.disabled)) {
                        var stepIndex = $eventSource.data(dataAttributes.tutorialStepIndex);
                        module._resetTutorial($fragment);
                        module._startTutorial($section.closest(selectors.accordionItem), stepIndex);
                    }
                });
        },
        _startInitialVideoPreload: function () {
            var module = this;

            //=== CYCLE THROUGH SECTIONS
            for (var sectionKey in module._tutorialsData) {
                //=== CYCLE THROUGH TUTORIAL ITEMS
                for (var tutorialItemKey in module._tutorialsData[sectionKey]) {
                    var tutorialItem = module._tutorialsData[sectionKey][tutorialItemKey];
                    var stepType = tutorialItem.stepType;

                    if (stepType === 'video') {
                        var videoId = tutorialItem.stepVideoId;
                        var videoIndex = tutorialItem.stepVideoIndex;
                        var videoSelector = '#' + videoId;
                        var $videoObject = $(videoSelector);

                        // preload first video from each section
                        if (videoIndex < 1) {
                            $videoObject.trigger("startPreload" + module._videoEventNamespace, {});
                        }
                    }
                }
            }
        },
        /**
         * Init video events
         *
         * @private
         */
        _initVideoEvents: function ($videoObject) {
            var module = this;
            var options = module._options;
            var dataAttributes = options.dataAttributes;

            $videoObject
                .off('canPlayThroughEvent' + module._videoEventNamespace)
                .on('canPlayThroughEvent' + module._videoEventNamespace, function (event, eventData) {
                    var sectionKey = eventData.data[dataAttributes.tutorial];
                    var tutorialItemKey = eventData.data[dataAttributes.step];

                    module._tutorialsData[sectionKey][tutorialItemKey].stepVideoCanPlayThrough = true;
                })
                .off('preloadEvent' + module._videoEventNamespace)
                .on('preloadEvent' + module._videoEventNamespace, function (event, eventData) {

                    var sectionKey = eventData.data[dataAttributes.tutorial];
                    var tutorialItemKey = eventData.data[dataAttributes.step];
                    var preload = eventData.preload;

                    module._tutorialsData[sectionKey][tutorialItemKey].stepVideoPreload = preload;
                })
                .off('errorEvent' + module._videoEventNamespace)
                .on('errorEvent' + module._videoEventNamespace, function (event, eventData) {
                    var sectionKey = eventData.data[dataAttributes.tutorial];
                    var tutorialItemKey = eventData.data[dataAttributes.step];

                    module._tutorialsData[sectionKey][tutorialItemKey].error = true;
                });
        },
        /**
         * Init all tutorial items and its parts
         *
         * @private
         */
        _initTutorialItems: function ($fragment) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var dataAttributes = options.dataAttributes;

            var $tutorialList = $(selectors.tutorialList, $fragment);

            var tutorialId = $fragment[0].id;

            //=== CYCLE THROUGH SECTIONS
            $tutorialList.each(function (index, tutorialSection) {
                var $section = $(tutorialSection);
                var sectionNumber = index + 1;
                var sectionKey = module._getTutorialsDataTutorialKey(sectionNumber);

                if (module._tutorialsData === null) {
                    module._tutorialsData = {};
                }

                // create tutorials data structure
                module._tutorialsData[sectionKey] = {};

                if (module._isTutorialDynamic($section)) {
                    var $tutorialItems = $(selectors.tutorialItem, $section);

                    //=== CYCLE THROUGH TUTORIAL ITEMS
                    $tutorialItems.each(function (index, tutorialItem) {
                        var $tutorialItem = $(tutorialItem);
                        var stepNumber = index + 1;
                        var tutorialItemKey = module._getTutorialsDataStepKey(stepNumber);
                        var stepType = $tutorialItem.data(dataAttributes.tutorialStepType) || options.defaultStepType;
                        var stepDuration = $tutorialItem.data(dataAttributes.tutorialStepDuration) || options.defaultStepDuration;
                        var stepStartDelay = $tutorialItem.data(dataAttributes.tutorialStepStartDelay) || options.defaultStepStartDelay;

                        // create tutorials data structure
                        module._tutorialsData[sectionKey][tutorialItemKey] = {
                            stepType: stepType,
                            stepDuration: stepDuration,
                            stepStartDelay: stepStartDelay
                        };

                        // set index to data
                        $tutorialItem.data(dataAttributes.tutorialStepIndex, index);

                        if (stepType === 'video') {
                            //=== INIT VIDEO INSIDE STEP
                            var $previewContainer = $tutorialItem.find(selectors.previewContainer);
                            var $videoObject = $(selectors.video, $previewContainer);
                            var $videoElement = $(selectors.videoElement, $videoObject);
                            var videoId;

                            // TODO MBU: can there be multiple tutorials on page? If yes, tutorial ID must be required.
                            //  right now, tutorials are not scoped at all - selectors etc.
                            // it will be added to video id to make it unique
                            // add id
                            videoId = tutorialId + '-video-' + sectionKey + '-' + tutorialItemKey;
                            $videoObject.attr('id', videoId);

                            // TODO MBU: consider passing this data as data only and not attr, will require change in video as well
                            // add data attributes
                            $videoObject.attr('data-' + dataAttributes.tutorial, sectionKey);
                            $videoObject.attr('data-' + dataAttributes.step, tutorialItemKey);

                            // add properties
                            var videoPreload = $videoElement.attr('preload');

                            if (!videoPreload) {
                                videoPreload = 'auto';
                            }

                            // create error message inside video from template
                            var errorWrapper = "<div class='html-b-error'></div>";
                            var $errorContent = $(selectors.videoErrorMessage);

                            $videoObject.prepend(errorWrapper);

                            var $error = $videoObject.find(selectors.videoError);
                            $error.prepend($errorContent.html());

                            // create unsupported message inside video from template
                            var unsupportedWrapper = "<div class='html-b-unsupported'></div>";
                            var $unsupportedContent = $(selectors.videoUnsupportedMessage);

                            $videoElement.append(unsupportedWrapper);

                            var $unsupported = $videoObject.find(selectors.videoUnsupported);
                            $unsupported.prepend($unsupportedContent.html());

                            // add video specific properties to tutorials data
                            module._tutorialsData[sectionKey][tutorialItemKey].stepVideoId = videoId;
                            module._tutorialsData[sectionKey][tutorialItemKey].stepVideoPreload = videoPreload;
                            module._tutorialsData[sectionKey][tutorialItemKey].stepVideoCanPlayThrough = false;

                            // init component
                            var PuiTheme = window.PuiTheme || {};
                            PuiTheme.VideoHtml.initWidget({}, $videoObject);

                            // init video events
                            module._initVideoEvents($videoObject);
                        } else if (stepType === 'image') {
                            //=== INIT IMAGE INSIDE STEP
                            // The step with the image requires no other actions. The condition is for the purpose of documentation.
                        }

                        // bind tutorialItemsEvents
                        module._initTutorialItemEvents($tutorialItem, $section, $fragment);

                    })
                }
            });

            module._enhanceTutorialsData();
            module._startInitialVideoPreload();
        },
        /**
         * Enhances module._tutorialsData with useful data
         *
         * @private
         */
        _enhanceTutorialsData: function () {
            var module = this;

            var tutorialItemVideoIndexLast = null;
            var tutorialItemStopTimeLast = null;

            var sectionNumber = 1;
            //=== CYCLE THROUGH SECTIONS
            for (var sectionKey in module._tutorialsData) {

                var sectionId = module._getTutorialsDataTutorialKey(sectionNumber);
                var tutorialItemNumber = 1;

                //=== CYCLE THROUGH TUTORIAL ITEMS
                for (var tutorialItemKey in module._tutorialsData[sectionKey]) {
                    var tutorialItem = module._tutorialsData[sectionKey][tutorialItemKey];
                    var tutorialItemKey = module._getTutorialsDataStepKey(tutorialItemNumber);

                    // create tutorialItemStartTime
                    if (tutorialItemStopTimeLast === null) {
                        tutorialItemStopTimeLast = tutorialItemStopTimeLast + tutorialItem.stepDuration;
                        module._tutorialsData[sectionId][tutorialItemKey].stepStartTime = 0;
                    } else {
                        module._tutorialsData[sectionId][tutorialItemKey].stepStartTime = tutorialItemStopTimeLast;
                        tutorialItemStopTimeLast = tutorialItemStopTimeLast + tutorialItem.stepDuration;
                    }

                    // create video tutorial item number
                    if (tutorialItem.stepType === 'video' && tutorialItemVideoIndexLast === null) {
                        module._tutorialsData[sectionId][tutorialItemKey].stepVideoIndex = 0;
                        tutorialItemVideoIndexLast = 0;
                    } else if (tutorialItem.stepType === 'video') {
                        tutorialItemVideoIndexLast += 1;
                        module._tutorialsData[sectionId][tutorialItemKey].stepVideoIndex = tutorialItemVideoIndexLast;
                    }

                    tutorialItemNumber++;
                }

                tutorialItemStopTimeLast = null;
                tutorialItemVideoIndexLast = null;
                sectionNumber++;
            }
        },

        /**
         * Watching all changes in Accordion items via MutationObserver
         *
         * @private
         */
        _watchAccordions: function ($fragment) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var classes = options.classes;
            var $targets = $(selectors.accordion, $fragment);
            var $scope;

            function callback(mutationRecord) {
                for (var i = 0; i < mutationRecord.length; i++) {
                    // Check if a Accordion item is opened
                    if (mutationRecord[i].target.classList.contains(classes.expanded)) {
                        $scope = $(mutationRecord[i].target);
                        module._resetTutorial($fragment);
                        module._startTutorial($scope, 0);
                        break;
                    } else if (mutationRecord[i].target.classList.contains(classes.collapsed) && mutationRecord[i].oldValue.match(classes.expanded)) {
                        // Check if opened Accordion item is now collapsed
                        module._resetTutorial($fragment);
                        $scope = $(mutationRecord[i].target);
                        var videoContainers = $targets.find($scope);
                        var $videos = videoContainers.find(selectors.video);

                        // trigger stop on closing the accordion item, stop only currently playing video
                        if ($videos) {
                            $videos.each(function (index, video) {
                                var $video = $(video);
                                var videoElement = $video.find(selectors.videoElement)[0];
                                var playing = module._isVideoPlaying(videoElement);

                                if (playing) {
                                    $video.trigger("stop" + module._videoEventNamespace, {});
                                }
                            });
                        }
                    }
                }
            }

            var observer = new MutationObserver(callback);
            var config = {
                // Configuration of the observer
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ['class'],
                childList: true,
                subtree: true
            };

            for (var targetIndex = 0; targetIndex < $targets.length; targetIndex++) {
                // Pass in the target node, as well as the observer options
                observer.observe($targets[targetIndex], config);
            }
        },

        /**
         * Running tutorial in selected scope
         *
         * @param $scope
         * @param startIndex
         * @private
         */
        _startTutorial: function ($scope, startIndex) {
            var module = this;
            var options = module._options;
            var classes = options.classes;
            var selectors = options.selectors;
            var dataAttributes = options.dataAttributes;

            var $fragment = $scope.closest(selectors.scope);
            var $tutorialPreview = $(selectors.tutorialPreview, $fragment);

            var $previewBlockImage = $(selectors.imagePreview, $tutorialPreview);

            var $tutorialList = $(selectors.tutorialList, $scope);
            var tutorialType = ($tutorialList.data(dataAttributes.tutorialType));

            // Check tutorial type
            if (module._isTutorialDynamic($tutorialList)) {
                var $videoObjects = $(selectors.video, $tutorialList);

                // trigger preload on rest of the videos, that haven't been preloaded yet
                if ($videoObjects) {
                    $videoObjects.trigger("startPreload" + module._videoEventNamespace, {});
                }

                if (typeof (startIndex) === "undefined") {
                    startIndex = 0;
                }

                $previewBlockImage.addClass(classes.hidden);

                module._activateTutorialItem($scope, startIndex, tutorialType);
            }
        },

        /**
         * Rotate item in running tutorial
         *
         * @param $scope
         * @param index
         * @param tutorialType
         * @private
         */
        _activateTutorialItem: function ($scope, index, tutorialType) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var classes = options.classes;
            var dataAttributes = options.dataAttributes;
            var tutorialTypes = options.tutorialTypes;

            var $fragment = $scope.closest(selectors.scope);
            var $tutorialList = $(selectors.tutorialList, $scope);
            var tutorialsItemCount = $tutorialList.children(selectors.tutorialItem).length;
            var $tutorialPreview = $(selectors.tutorialPreview, $fragment);
            var previewOffsetTop = $scope.offset().top - $scope.parent().offset().top;
            var $tutorialItem = $tutorialList.find(selectors.tutorialItem).eq(index);
            var stepDuration = $tutorialItem.data(dataAttributes.tutorialStepDuration) || options.defaultStepDuration;
            var stepStartDelay = $tutorialItem.data(dataAttributes.tutorialStepStartDelay) || options.defaultStepStartDelay;
            var stepType = $tutorialItem.data(dataAttributes.tutorialStepType) || options.defaultStepType;

            var $previewContainer = $tutorialItem.find(selectors.previewContainer);
            var $videoObject = $(selectors.video, $previewContainer);

            $tutorialPreview.css("min-height", module._getPreviewHeight($tutorialItem));
            $tutorialPreview.css("margin-top", previewOffsetTop);
            $tutorialItem.addClass(classes.active);

            var videoEnded = false;
            var stepDurationEnded = false;

            if (stepType === 'video') {
                var videoElement = $(selectors.videoElement, $videoObject)[0];
                var playing = module._isVideoPlaying(videoElement);

                $videoObject.trigger("stop" + module._videoEventNamespace, {});
                setTimeout(function() {
                    if (!playing) {
                        $videoObject.trigger("play" + module._videoEventNamespace, {});
                    } else {
                        $videoObject.trigger("play" + module._videoEventNamespace, {timestamp: 0});
                    }
                }, stepStartDelay);

                $videoObject
                    .off('endedEvent' + module._videoEventNamespace)
                    .on('endedEvent' + module._videoEventNamespace, function (event, eventData) {
                        videoEnded = true;

                        if (stepDurationEnded) {
                            if (tutorialType === tutorialTypes.loop || (tutorialType === tutorialTypes.once && index < tutorialsItemCount)) {
                                $tutorialItem.removeClass(classes.active);
                                module._activateTutorialItem($scope, index % tutorialsItemCount, tutorialType);
                            }
                        }
                    });
            }

            module._tutorialTimer = setTimeout(function () {
                index++;
                stepDurationEnded = true;
                // TODO: MKe - implement skipping of disabled items
                if (tutorialType === tutorialTypes.loop || (tutorialType === tutorialTypes.once && index < tutorialsItemCount)) {
                    if (stepType === 'video' && videoEnded || $videoObject.hasClass(classes.videoHasError)) {
                        $tutorialItem.removeClass(classes.active);
                        module._activateTutorialItem($scope, index % tutorialsItemCount, tutorialType);
                    } else if (stepType !== 'video') {
                        $tutorialItem.removeClass(classes.active);
                        module._activateTutorialItem($scope, index % tutorialsItemCount, tutorialType);
                    }
                }
            }, stepStartDelay + stepDuration)
        },

        /**
         * Resets all tutorials, clears timeout, repositions preview image
         *
         * @private
         */
        _resetTutorial: function ($fragment) {
            var module = this;
            clearTimeout(module._tutorialTimer);

            var options = module._options;
            var selectors = options.selectors;
            var classes = options.classes;
            var $tutorialList = $(selectors.tutorialList, $fragment);

            var $tutorialPreview = $(selectors.tutorialPreview, $fragment);
            var $previewBlockImage = $(selectors.imagePreview, selectors.tutorialPreview);

            $previewBlockImage.removeClass(classes.hidden);
            $tutorialPreview.css("margin-top", "");
            $tutorialPreview.css("min-height", "");

            $tutorialList.each(function (index, tutorialSection) {
                var $tutorials = $(tutorialSection);
                var $tutorialSteps = $tutorials.children(selectors.tutorialStep);

                $tutorialSteps.removeClass(classes.active);
            });
        },

        /**
         * Returns whether video is playing or not
         *
         * @private
         */
        _isVideoPlaying: function (videoElement) {
            return !!(videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended && videoElement.readyState > 2);
        },
        /**
         * Check height from image in tutorial item
         *
         * @param $item
         * @private
         */
        _getPreviewHeight: function ($item) {
            var module = this;
            var options = module._options;
            var selectors = options.selectors;
            var $tutorialPreview = $(selectors.imagePreview, $item);

            return parseInt($tutorialPreview.attr("height"));
        }
    });
})(window.PuiTheme, jQuery);