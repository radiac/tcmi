(function () {
    /** Only initialise:
            if this is the first load
            if Audio is supported
            if jQuery is available
    */
    if (!!window.TCMI || !window.Audio || !window.jQuery) {
        return;
    }
    
    // Defaults
    var $ = window.jQuery,
        defaults = {
            // Path to tracks
            path: '/tcmi/tracks/',
            
            // Array of track tuples, [filename, title]
            tracks: [],
            
            // Index of first track to play
            firstTrack: 0,
            
            // Keep the site on a single page.
            // Hijacks clicks on <a> tags, to load same-domain pages without
            // changing the page.
            // Set this to false if your site already does this
            singlePage: true,
            
            // String, RegExp or function to match if a link should be hijacked
            // Set to null to allow all
            // A negative response will make the link load normally
            singleFilter: new RegExp('(/|(^|/)[^\\.]+|\\.html?|\\.php)($|\\?)'),
            
            // Reverse of singleFilter
            // Set to null to allow all
            // A positive response will make the link load normally
            singleExclude: null,
            
            // Auto play the first track
            autoPlay: true,
            
            // Callback to customise the TCMI elements
            onBuild: null,
            
            // Callback at the start of a page request (when singlePage==true)
            // Arguments:
            //      href    URL of page being loaded
            onPage: null,
            
            // Callback to display errors
            // Arguments:
            //      msg     String message
            onError: function (msg) { alert(msg); }
        }
    ;
    
    /** TCMI class
    */
    var TCMI = function () {
        // Load config
        var config = window.TCMI_conf || {},
            thisTCMI = this
        ;
        for (var key in defaults) {
            this[key] = config[key] !== undefined ? config[key] : defaults[key];
        }
        
        // Track list must be defined
        if (this.tracks.length === 0) {
            this.onError('No TCMI tracks defined');
        }
        
        // First track must be valid
        this.firstTrack = Math.min(this.firstTrack, this.tracks.length-1);
        
        // Initialise
        this.build();
        this.render();
        this.audio = new Audio();
        $(this.audio)
            .bind('ended', function (e) {
                thisTCMI.next();
            })
            .bind('error', function (e) {
                var err = e.target.error,
                    msg
                ;
                if (err.code === err.MEDIA_ERR_NETWORK ||
                    err.code === err.MEDIA_ERR_SRC_NOT_SUPPORTED
                ) {
                    msg = 'file could not be found';
                } else if (err.code === err.MEDIA_ERR_DECODE) {
                    msg = 'your browser cannot play it';
                } else {
                    msg = 'unknown error ' + err.code;
                }
                thisTCMI.onError('Error playing music: ' + msg);
            })
        ;
        this.filetype = (
            !!this.audio.canPlayType &&
            this.audio.canPlayType('audio/ogg; codecs="vorbis"') !== ""
        ) ? '.ogg' : '.mp3';
        
        if (this.autoPlay) {
            this.load();
        }
        
        // Manage page history
        if (this.singlePage) {
            $(window).bind('popstate', function (e) {
                thisTCMI.openPage(e.originalEvent.state.href, true);
            });
        }
    };
    TCMI.prototype = $.extend(TCMI.prototype, {
        $con:   null,
        track:  null,
        build: function() {
            // Build container and elements
            var $con = this.$con = $('<div id="tcmi"/>'),
                $logo = this.$logo = $('<a href="http://radiac.net/projects/tcmi/" class="tcmi_logo">TCMI</a>').appendTo($con),
                $play = this.$play = $('<button class="tcmi_play"/>').text('Play').appendTo($con),
                $pause = this.$pause = $('<button class="tcmi_pause"/>').text('Pause').hide().appendTo($con),
                $sel = this.$sel = $('<select class="tcmi_select"/>').appendTo($con),
                i, len=this.tracks.length, $opt
            ;
            for (i=0; i<len; i++) {
                $opt = $('<option/>')
                    .attr('value', i)
                    .text(this.tracks[i][1])
                    .appendTo($sel)
                ;
            }
            $sel.val(this.firstTrack);
            
            // Allow user to customise the build
            if (this.onBuild) {
                this.onBuild();
            }
            
            // Bind events
            var thisTCMI = this;
            $sel.change(function (e) {
                thisTCMI.track = $sel.val();
                thisTCMI.load();
            });
            $play.click(function (e) {
                thisTCMI.play();
            });
            $pause.click(function (e) {
                thisTCMI.pause();
            });
        },
            
        render: function() {
            // Add container to body
            this.$con.appendTo('body');
            
            // Bind clicks
            if (!this.singlePage) {
                return;
            }
            var thisTCMI = this,
                domain = window.location.protocol + '//' + window.location.host + '/'
            ;
            $('a').click(function (e) {
                // Ignore if not an href link, or an external href
                if (!this.href || this.href.indexOf(domain) === -1) {
                    return;
                }
                
                // Only allow urls which match singleFilter
                // Naieve test suits our purpose
                if (typeof(thisTCMI.singleFilter) == "function") {
                    if (!thisTCMI.singleFilter(this.href)) {
                        return;
                    }
                } else if (thisTCMI.singleFilter !== null) {
                    if (!this.href.match(thisTCMI.singleFilter)) {
                        return;
                    }
                }
                
                // Exclude urls which match singleExclude
                if (typeof(thisTCMI.singleExclude) == "function") {
                    if (thisTCMI.singleExclude(this.href)) {
                        return;
                    }
                } else if (thisTCMI.singleExclude !== null) {
                    if (this.href.match(thisTCMI.singleExclude)) {
                        return;
                    }
                }
                
                // Hijack the click so we can load
                e.preventDefault();
                thisTCMI.openPage(this.href);
            });
        },
        openPage: function (href, isPopstate) {
            var thisTCMI = this;
            if (this.onPage) {
                this.onPage(href);
            }
            
            $('body').load(href, function (response, status, xhr) {
                if (status == 'error') {
                    thisTCMI.onError('Could not load page: ' + xhr.status + " " + xhr.statusText);
                    return;
                }
                
                // Log history
                if (!isPopstate) {
                    window.history.pushState({href: href}, "", href);
                }
                
                // Re-render TCMI bar
                thisTCMI.render();
            });
        },
        _load: function () {
            if (this.track === null) {
                this.track = this.firstTrack;
            }
            this.audio.setAttribute(
                'src',
                this.path + this.tracks[this.track][0] + this.filetype
            );
            this.audio.load();
        },
        load: function () {
            this._load();
            this.play();
        },
        next: function () {
            this.track++;
            if (this.track >= this.tracks.length) {
                this.track = 0;
            }
            this.load();
        },
        play: function () {
            // Load if autoPlay is off
            if (this.track === null) {
                this._load();
            }
            this.audio.play();
            this.$con.addClass('playing');
            this.$play.hide();
            this.$pause.show();
        },
        pause: function () {
            this.audio.pause();
            this.$con.removeClass('playing');
            this.$play.show();
            this.$pause.hide();
        }
    });
    
    // Initialise TCMI once when page is ready
    $(function () {
        if (!!window.TCMI) {
            return;
        }
        window.TCMI = new TCMI();
    });
})();
