/** Awesome New Tab Page
  *   antp.co
  *   Copyright 2011-2012 Michael Hart (h4r7.me)
  * Want to make it even more awesome?
  *   github.antp.co
  *
  * Licensed under GPL v3:
  *   http://www.gnu.org/licenses/gpl-3.0.txt
  *   Further Restrictions:
  *     To make use of or modify the below code in any way:
  *     - You agree to leave this copyright and license notice intact without
  *       modification; and
  *     - You agree to mark your modified versions as modified from the original
  *       version; and
  *     - You agree not to misrepresent the origin of this material or your
  *       relationship with the authors of this project or the project itself.
***/


// Utility Functions
  var util = util || {};

  util.toArray = function(list) {
    return Array.prototype.slice.call(list || [], 0);
  };

// localStorage shortcuts
  var store = {
    // store.set("key", "obj")
    set: function(key, obj) {
      return localStorage.setItem(
        key,
        JSON.stringify(obj)
      );
    },
    // store.get("key")
    get: function(key) {
      return JSON.parse(
        localStorage.getItem(key)
      );
    }
  }

// Variables that are relatively static

  var stock_widgets = {
    webstore: {
      where: [2,3],
      size: [1,1],
      type: "app",
      isApp: true,
      enabled: true,
      name: "Chrome Web Store",
      color: "rgba(0, 16, 186, 1)",
      id: "webstore",
      stock: true,
      img: "app.webstore.png",
      simg: "app.webstore.png",
      appLaunchUrl: "https://chrome.google.com/webstore?utm_source=webstore-app&utm_medium=awesome-new-tab-page"
    },
    tutorial: {
      where: [0,0],
      size: [2,2],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Tutorial",
      id: "tutorial",
      path: "widgets/tutorial/widget.tutorial.html"
    },
    clock: {
      where: [1,3],
      size: [1,1],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Clock",
      id: "clock",
      path: "widgets/clock/widget.clock.html"
    },
    notepad: {
      where: [2,2],
      size: [1,1],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Notepad",
      id: "notepad",
      path: "widgets/notepad/widget.notepad.html"
    },
    google: {
      where: [0,2],
      size: [1,2],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Google",
      id: "google",
      path: "widgets/google/widget.google.html"
    },
    amazoninstantvideo: {
      where: [2,1],
      size: [1,1],
      type: "app",
      isApp: true,
      enabled: false,
      stock: true,
      name: "Amazon Instant Video",
      name_show: false,
      color: "rgba(255, 51, 0,  1)",
      img: "/widgets/amazoninstantvideo/widget.aiv.png",
      simg: "/widgets/amazoninstantvideo/widget.aiv.png",
      appLaunchUrl: "http://www.amazon.com/Instant-Video/b?ie=UTF8&tag=sntp-20&node=2858778011",
      id: "amazoninstantvideo"
    },
    amazon: {
      where: [1,2],
      size: [1,1],
      type: "app",
      isApp: true,
      stock: true,
      name: "Amazon",
      name_show: false,
      color: "rgba(168, 84, 0,  1)",
      img: "/widgets/amazon/widget.amazon.png",
      simg: "/widgets/amazon/widget.amazon.png",
      appLaunchUrl: "http://www.amazon.com/?tag=sntp-20",
      id: "amazon"
    },
    facebook: {
      where: [0,4],
      size: [1,1],
      type: "app",
      isApp: true,
      stock: true,
      name: "Facebook",
      name_show: false,
      color: "rgba(19, 54, 131,  1)",
      img: "/widgets/facebook/widget.facebook.png",
      simg: "/widgets/facebook/widget.facebook.png",
      appLaunchUrl: "http://www.facebook.com/",
      id: "facebook"
    },
    twitter: {
      where: [1,4],
      size: [1,1],
      type: "app",
      isApp: true,
      stock: true,
      name: "Twitter",
      name_show: false,
      color: "rgba(51, 204, 255,  1)",
      img: "/widgets/twitter/widget.twitter.png",
      simg: "/widgets/twitter/widget.twitter.png",
      appLaunchUrl: "http://www.twitter.com/",
      id: "twitter"
    },
    tv: {
      where: [2,0],
      size: [1,1],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Hulu / Netflix",
      id: "tv",
      path: "widgets/tv/widget.tv.html"
    },
    tabs: {
      id: "tabs",
      isApp: false,
      name: "Tab Manager",
      path: "widgets/tabs/tabs.html",
      poke: 2,
      resize: true,
      size: [1,1],
      type: "iframe",
      v2: {
        min_height: 1,
        min_width : 1,
        max_height: 3,
        max_width : 3
      },
      where: [2,4]
    }
  };

  var palette =
    [
      "rgba(51,   153,  51,    1)",
      "rgba(229,  20,   0,     1)",
      "rgba(27,   161,  226,   1)",
      "rgba(240,  150,  9,     1)",
      "rgba(230,  113,  184,   1)",
      "rgba(153,  102,  0,     1)",
      "rgba(139,  207,  38,    1)",
      "rgba(255,  0,    151,   1)",
      "rgba(162,  0,    225,   1)",
      "rgba(0,    171,  169,   1)"
    ];

  var gradient = ", -webkit-gradient( linear, right bottom, left top, color-stop(1, rgba(255, 255, 255, .04)), color-stop(0, rgba(255, 255, 255, 0.35)) )";
  var amazon_regex = new RegExp("amazon\.(com|cn|co\.uk|at|fr|de|it|co\.jp|es)[/]{0,1}[\?]{0,1}");

  // For Google Analytics
  var _gaq = _gaq || [];

// Check if there are stored widgets
if( localStorage.getItem("widgets") === null ) {
  // If not, use stock widgets

  // Remove disabled widgets
  var _stock_widgets = {};
  for ( var w in stock_widgets ) {
    if ( stock_widgets[w].enabled !== false ) {
      _stock_widgets[w] = stock_widgets[w];
    }
  }

  store.set("widgets", _stock_widgets );
}

// display messages to be displayed on page refresh
var msg = localStorage.msg;
if (msg) {
  msg = JSON.parse(msg);
  setTimeout(function() {
    $.jGrowl(msg.message, { header: msg.title });
  }, 500);
  localStorage.removeItem("msg");
}

// Load widget settings
var widgets = JSON.parse(localStorage.getItem("widgets"));

var extensions;
// Get all installed extensions and apps
chrome.management.getAll( function(data) {
  extensions = data;
});

// Reload page
function reload() {
  window.location.reload( true );
}

// Save changes to the widgets variable in localStorage & optionally refresh
function localStorageSync(refresh) {
  localStorage.setItem("widgets", JSON.stringify( widgets ));

  if(refresh === true) {
    $(window).trigger("antp-widgets");
  }
}

// Generate a GUID-style string, such as "96b78e42-df07-b6a1-50d1-e8848fa5f788"
function new_guid() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// Function to merge all of the properties from one object into another
// Object.merge(object, object)
if (typeof Object.merge !== "function") {
  Object.merge = function (o1, o2) {
    for(var i in o2) { o1[i] = o2[i]; }
    return o1;
  };
}

function _e(_eNum) {
  console.log("Error #"+_eNum);
  _gaq.push(['_trackEvent', 'Error', _eNum]);
}

/* URL Handler :: Start */

  var url_handler = false;
  $(document).on("mousedown", ".url", function(e) {

    var url = $(this).attr("data-url");

    if ( url && typeof(url) === "string" && url !== "" ) {
      url_handler = url;
    } else {
      url_handler = false;
    }

    $(this).attr("href", url);

    if ( ( e.which === 2 )
    ||   ( e.ctrlKey === true && e.which !== 3 ) ) {
      $(this).attr("href", null);
    }
  });

  $(document).on("mouseup", document, function(e) {
    url_handler = false;
  });

  $(document).on("mouseup", ".url", function(e) {

    // Ctrl + Click = Open in new tab
    if ( e.which !== 3 && e.ctrlKey === true ) {
      e.which = 2;
    }

    var url = $(this).attr("data-url");

    if ( url && typeof(url) === "string" && url !== ""
    &&   url_handler && url_handler === url ) {

      // Update Amazon.com URLs to TLD of user-preference
      if( url.match(amazon_regex)
      &&   localStorage["amazon-locale"] !== null
      &&   localStorage["amazon-locale"] !== ""
      &&   typeof(localStorage["amazon-locale"]) !== "undefined" ) {
        if ( url.match("Instant-Video") === null ) {
          url = "http://www." + localStorage["amazon-locale"] + "/?tag=sntp-20";
        } else {
          url = "http://www.amazon.com/Instant-Video/b?ie=UTF8&tag=sntp-20&node=2858778011"
        }
      }

      if ( e.shiftKey !== true ) {
        if ( e.which === 1 ) {
          if ( $(this).attr("onleftclick") === "pin" ) {
            chrome.tabs.getCurrent(function(tab) {
              chrome.tabs.create({ url: (url), pinned: true });
              chrome.tabs.remove( tab.id );
            });
          } else if ($(this).attr("onleftclick") === "newtab") {
            $(this).attr("href", "#");
            chrome.tabs.create({ url: (url), active: false });
          } else if ( url.match(/^(http:|https:|chrome-extension:)/) ) {
            window.location = url;
          } else {
            // Left click, open a new one and close the current one
            chrome.tabs.getCurrent(function(tab) {
              chrome.tabs.create({ url: (url) });
              chrome.tabs.remove( tab.id );
            });
          }
        } else if ( e.which === 2 ) {
          chrome.tabs.create({ url: (url), active: false });
        }
      }
    }
    else if ((!url || url === "") && ($(this).closest(".app").attr("type") == "app" || $(this).closest(".app").attr("type") == "packaged_app")) {
      if (e.which == 1 || e.which == 2) {
        var app = $(this).closest(".app");
        if (app.length > 0)
          chrome.management.launchApp(app.attr("id"));

        if (e.which == 1)
          chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove([tab.id]);
          });
      }
    }

    $(this).delay(100).queue(function() {
      $(this).attr("href", url);
    });

    url_handler = false;
  });

  /* URL Handler :: End */
