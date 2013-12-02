TCMI - Tacky Christmas Music Interface
======================================

The TCMI is a tacky christmas music interface for your website.

Whether it's the music or the interface which is tacky is a decision for the
reader.


Overview
--------

Christmas is a time of joy, and what better way to spread joy than to force
your website visitors to listen to Christmas music?

TCMI adds a simple interface to your page, plays MP3 or OGG files at your
visitors, and 



Adding TCMI to your site
------------------------

1. Upload the files in this repository to somewhere on your website. These
   examples assume you'll put it at `/tcmi` (but it can go anywhere)

2. Upload your collection of christmas music - each file must be there twice,
   in `.mp3` and `.ogg` format.
   * TCMI assume you'll put it at `/tcmi/tracks`, but this can be changed by
     setting `path` in `TCMI_conf` (see [Configuring TCMI](#configuring-tcmi)
     below).
   * Bear in mind you're responsible for any licensing issues
   * An excellent set of tacky christmas music can be downloaded from
     http://radiac.net/projects/tcmi/
   * Top ffmpeg tip: to convert MP3 files to OGG, try:
     ``ffmpeg -i "mytrack.mp3" -acodec libvorbis "mytrack.ogg"``

3. Now just load the code and CSS in the `head` of each page, and configure it
- see [Configuring TCMI](#configuring-tcmi) below

Example:

    <head>
        ...
        <script src="/js/jquery-1.10.2.min.js"></script>
        ...
        <link rel="stylesheet" href="tcmi/tcmi.css" type="text/css" />
        <script src="/tcmi/tcmi.min.js"></script>
        <script>
            window.TCMI_conf = {
                // See configuration options below
            }
        </script>
        ...
    </head>


* TCMI requires jQuery, so if your site doesn't already use that you'll need
  to get it from http://jquery.com/download/
* If you want the classic TCMI 1.0 look, use `tcmi-classic.css` instead of
  `tcmi.css`.
* If you want to interact with TCMI from your own code, you can access it on
  `window.TCMI`. See the [Internals section](#internals) below to see what you
  can do.


Configuring TCMI
----------------

You configure TCMI by setting the global variable `TCMI_conf`. In the example
above, this was set directly in the head; it can of course go anywhere in your
site's JavaScript, as long as it is set before the DOM ready event fires.

Options:

`path`

* Path to directory containing tracks
* Must finish in a `/`
* Default: `/tcmi/tracks/`


`tracks`

* Array of track tuples, [filename, title]
* This must be set otherwise TCMI will raise an error
* Default: `[]`


`singlePage`

* Boolean. If `true`, keep the site on a single page
* This will hijack clicks on `<a>` tags, to load same-domain pages without
  changing the page. This lets your music play continuously while your visitor
  is on your site.
* This will have no effect on form submissions - they will make your music
  restart.
* Set this to `false` if you don't want TCMI to interfere with links.
* Default: `true`


`autoplay`

* Boolean. If `true`, the music will start playing as soon as the page loads.
  It is highly recommended that you help your visitors get into the Christmas
  spirit by setting this to true.
* Default: `true`


`onBuild`

* Callback if you want to customise the elements in the TCMI interface.
* Passed no arguments. See the [Internals section](#internals) below to see
  what you can do.
* Default: `null`


`onPage`

* Callback at the start of a page request when `singlePage == true`.
* Passed a single argument, the `href` of the page being requested.
* You could set this if you want to replace page content with a loading spinner
  - just make sure to hide it and re-display the old content in `onError`.
* Default: `null`


`onError`

* Callback to display errors
* Passed a single argument, the error message as a string.
* Default: `function (msg) { alert(msg); }`


Example configuration:

    window.TCMI_conf = {
        path: '/static/tcmi/tracks/',
        tracks: [
            ["deckhall", "Deck The Halls"],
            ["jinglebells", "Jingle Bells"]
        ],
        singlePage: false,
        onError: myErrorHandler
    };


Internals
---------

This is for advanced users who want to harness the true power of the TCMI.

TCMI will initialise when the DOM is ready. At that point, it is accessible
on ``window.TCMI``

Attributes you may find useful:
* `play()` - resume after a pause, or play the first track
* `pause()` - pause play
* `next()` - play the next track
* `load()` - load and play the current track
* `track` - the index of the current track
* All configuration options are available as attributes, ie `path`, `tracks` etc

For example, if you want to have a pause button somewhere else on your page:

    $(function () {
        $('.myPauseButton').click(function (e) {
            window.TCMI.pause();
        });
    });

If you're writing an `onBuild` function, the interface elements are also
available as attributes - they are all jQuery objects:
* `$con` - container
* `$logo` - logo link to TCMI
* `$play` - the play button
* `$pause` - the pause button
* `$sel` - the select element


Credits
-------

The icons for the modern TCMI design are based on Entypo by Daniel Bruce,
http://www.entypo.com/
