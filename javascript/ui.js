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


/* START :: Windows */

  $(document).ready(function($) {
    $(".ui-2.container").center();

    $(window).bind('resize scroll', function() {
      $(".ui-2.container").center();
    });

    setTimeout(function(){
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    }, 2000);
  });

  $(".close,.ui-2.x").live("click", closeButton);

  function closeButton(exclude) {

    if ( exclude && typeof(exclude) === "string" ) {
      $("body > .ui-2,#recently-closed-tabs-menu")
        .not(exclude)
        .hide();
    } else {
      $("body > .ui-2,#recently-closed-tabs-menu").hide();
    }

    window.location.hash = "";
    hscroll = true;
  }

  var options_init = true;
  $("#config-button, .ui-2.config").live("click", function(){
    _gaq.push([ '_trackEvent', 'Window', "Config" ]);

    closeButton(".ui-2#config");
    $(".ui-2#config").toggle();
  });

  $("#app-drawer-button").live("click", function(){
    _gaq.push([ '_trackEvent', 'Window', "Apps" ]);

    closeButton(".ui-2#apps");
    $(".ui-2#apps").toggle();
  });

  $("#widget-drawer-button").live("click", function(){
    _gaq.push([ '_trackEvent', 'Window', "Widgets" ]);

    closeButton(".ui-2#widgets");
    $(".ui-2#widgets").toggle();
  });


  $("#logo-button,.ui-2.logo").live("click", function(){
    _gaq.push([ '_trackEvent', 'Window', "About" ]);

    closeButton(".ui-2#about");
    $(".ui-2#about").toggle();

    if(options_init === true) {
      options_init = false;

      (function() {
        var s = document.createElement('script'), t = document.getElementsByTagName('script')[0];
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://api.flattr.com/js/0.6/load.js?mode=auto';
        t.parentNode.insertBefore(s, t);
      })();

      (function() {
        var twitterScriptTag = document.createElement('script');
        twitterScriptTag.type = 'text/javascript';
        twitterScriptTag.async = true;
        twitterScriptTag.src = 'https://platform.twitter.com/widgets.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(twitterScriptTag, s);
      })();
    }
  });

  $(".ui-2 .drawer-app-uninstall").live("click", function(e){
    var to_delete = null;
    var to_delete_name = null;
    to_delete = $(this).parent();
    to_delete_name = $(to_delete).find(".drawer-app-name").html();

    var r=confirm("Are you sure you want to uninstall " + to_delete_name + "?");
    if (r==true) {
      chrome.management.uninstall($(to_delete).attr("id"), reload() );
    }

    return false;
  });

  /* END :: Windows */

/* START :: Top Left Buttons */

  function moveLeftButtons() {
    if ( localStorage.getItem("hideLeftButtons") === "yes" &&
      localStorage.getItem("lock") !== "false" ) {
      $(".side-button").css("left", "-50px");
      $("#widget-holder,#grid-holder").css("left", "0px");
    }
    if ( localStorage.getItem("hideLeftButtons") === "yes") {
      $("#hideLeftButtons").attr('checked', 'checked');
    }
    if ( localStorage.getItem("hideLeftButtons") !== "yes" ) {
      $(".side-button").css("left", "0px");
      $("#widget-holder,#grid-holder").css("left", "27px");
    }
  }

  $(document).ready(function($) {
    moveLeftButtons();
  });

  $("#hideLeftButtons").live("click", function(){
    if ($(this).is(':checked')) {
      localStorage.setItem("hideLeftButtons", "yes");
      moveLeftButtons();
    } else {
      localStorage.setItem("hideLeftButtons", "no");
      moveLeftButtons();
    }
  });

  $("#top-buttons").live({
    mouseenter: function() {
      if ( localStorage.getItem("hideLeftButtons") === "yes" ) {

        $(".side-button").css("left", "0px");
        $("#widget-holder,#grid-holder").css("left", "27px");
      }

    },
    mouseleave: function() {
      if ( localStorage.getItem("hideLeftButtons") === "yes"
        && localStorage.getItem("lock") === "true" ) {

        $(".side-button").css("left", "-50px");
        $("#widget-holder,#grid-holder").css("left", "0px");
      }
    }
  });

  /* END :: Top Left Buttons */

/* START :: Recently Closed Tabs Menu */

  $("#recently-closed-tabs-menu").live("mouseleave", function() {
    $(this).css("display", "none");
  });

  $("#recently-closed-tabs").live("click", function() {
    _gaq.push([ "_trackEvent", "Window", "Recently Closed Tabs" ]);

    closeButton("#recently-closed-tabs-menu");
    $("#recently-closed-tabs-menu").toggle();
  });

  $(window).bind("storage", function (e) {
    if ( typeof(e.originalEvent) === "object"
      && typeof(e.originalEvent.key) === "string"
      && e.originalEvent.key === "recently_closed" )
        resetRecentlyClosedTabs();
  });

  function resetRecentlyClosedTabs() {
    var
      recently_closed = JSON.parse(localStorage.getItem("recently_closed")),
      rctm_html = [];

    $("#recently-closed-tabs-menu").empty();

    if(recently_closed !== null) {
      $.each(recently_closed, function(id, tab) {

        var rct_temp  = $("<div></div>").addClass("rctm-item");
        $("<img></img>").appendTo(rct_temp).addClass("rctm-icon")
          .attr({
            "src"   : "chrome://favicon/" + tab.url,
            "height": 16,
            "width" : 16
          });

        $("<a></a>").appendTo(rct_temp).addClass("rctm-link")
          .attr({
            "id"    : id   ,
            "title" : tab.title,
            "href"  : tab.url
          })
          .html( tab.title );
        $("<span></span>").appendTo(rct_temp)
          .attr({
            "data-rctm-id": id,
            "title"       : chrome.i18n.getMessage("rctm_remove")
          }).addClass("rctm-close");

        rctm_html.push( rct_temp );
      });

      rctm_html.push(
        $('<div class="rctm-reset-all" id="rctm_clear_all">' + chrome.i18n.getMessage("rctm_clear_all") + '</div>')
      );

      $.each(rctm_html, function(i, e) {
        $(e).appendTo("#recently-closed-tabs-menu");
      });
    }
  }

  $('.rctm-close').live("click", function(e) {
    var recently_closed = JSON.parse(localStorage.getItem("recently_closed"));

    recently_closed.splice( $(e.target).attr("data-rctm-id") , 1);

    localStorage.setItem("recently_closed", JSON.stringify(recently_closed));

    resetRecentlyClosedTabs();
  });

  $('#rctm_clear_all').live("click", function(e) {
    if (confirm(chrome.i18n.getMessage("rctm_clear_all_confirm")))
    {
      localStorage.removeItem("recently_closed");
    }
    resetRecentlyClosedTabs();
  });

  $(document).ready(function($) {
    setTimeout(resetRecentlyClosedTabs, 1000);
  });

  /* END :: Recently Closed Tabs Menu */

/* START :: Tooltips */

  $(document).ready(function($) {
    setTimeout(function() {
      $('div[title]').qtip({
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-bootstrap'
        }
      });
    }, 1000);
  });

  /* END :: Tooltips */

/* START :: Configure */

  $(document).ready(function($) {
    if(window.location.hash) {
      switch(window.location.hash) {
        case "#options":
          $("#config-button").trigger("click");
          break;
      }
    }

    if(localStorage.getItem("showbmb") === null) {
      localStorage.setItem("showbmb", "no");
    }

    bookmark_bar_rendered = false;
    if(localStorage.getItem("showbmb") === "yes") {
      $("#toggleBmb").attr('checked', 'checked');
      bookmark_bar_rendered = true;
      chrome.bookmarks.getTree(getBookmarks);
      $("#bookmarksBar").css("display", "block");
    } else {
      $("#bookmarksBar").css("display", "none");
    }

    if(localStorage.getItem("bg-img-css") && localStorage.getItem("bg-img-css") !== "") {
      $("body").css("background", localStorage.getItem("bg-img-css") );
      $("#bg-img-css").val( localStorage.getItem("bg-img-css") );
    }
  });

  $(document).ready(function($) {
    $("#amazon-locale-selection").val(localStorage.getItem("amazon-locale") || "amazon.com");
    $("#amazon-locale-selection").change(function() {
      localStorage.setItem("amazon-locale", $(this).val());
    });

    $("#colorselector-bg").ColorPicker({
      color: '#' + ( localStorage.getItem("color-bg") || "221f20") ,
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $(".bg-color").css('background-color', '#' + hex);
        localStorage.setItem("color-bg", hex);
      }
    });
  });

  $(".bg-color").css("background-color", "#" + (localStorage.getItem("color-bg") || "221f20"));

  $("#toggleBmb").live("click", function(){
    if ($(this).is(':checked')) {
      if ( bookmark_bar_rendered === false ) {
        bookmark_bar_rendered = true;
        chrome.bookmarks.getTree(getBookmarks);
      }

      $("#bookmarksBar").show();
      localStorage.setItem("showbmb", "yes");
      moveGrid({ "animate_top": true });
    } else {
      $("#bookmarksBar").hide();
      localStorage.setItem("showbmb", "no");
      moveGrid({ "animate_top": true });
    }
  });

  $("#bg-img-css").live("keyup change", function() {
    $("body").css("background", "" );
    $("body").css("background", $(this).val() );
    $(".bg-color").css("background-color", '#' + (localStorage.getItem("color-bg") || "221f20") );

    if($(this).val() === "") {
      $(".bg-color").css("background-color", "#" + (localStorage.getItem("color-bg") || "221f20"));
    }

    localStorage.setItem("bg-img-css", $(this).val() );
  });

  // Clears localStorage
  $("#reset-button").live("click", function(){
    var reset = confirm( chrome.i18n.getMessage("ui_confirm_reset") );
    if ( reset === true ) {
      deleteShortcuts();
      deleteRoot();
      localStorage.clear();
      _gaq.push(['_trackEvent', 'Reset', chrome.app.getDetails().version]);

      setTimeout(function() {
        reload();
      }, 250);
    } else {
      $.jGrowl("Whew! Crisis aborted!", { header: "Reset Cancelled" });
    }
  });

  /* END :: Configure */

