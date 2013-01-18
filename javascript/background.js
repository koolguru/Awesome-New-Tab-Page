  /*
     -
     -  Awesome New Tab Page
     -    http://antp.co/
     -    Copyright 2011+ Michael Hart (http://h4r7.me/).
     -
     -  Want to make it even more awesome?
     -    https://github.com/michaelhart/Awesome-New-Tab-Page/
     -
     -  background.html
     -    Where every journey begins.
     -
     -  Licensed under GPL v3:
     -    http://www.gnu.org/licenses/gpl-3.0.txt
     -
     */

/* START :: Recently Closed Tabs & Tab Manager Widget */
  chrome.tabs.onRemoved.addListener( onRemoved );
  function onRemoved(tabId) {
    var
      recently_closed = JSON.parse(localStorage.getItem("recently_closed")),
      tabs = localStorage.getItem("open_tabs"),
      tab;

    tabs = tabs == null ? [] : JSON.parse(tabs);
    tab = tabs.filter(function (tab) { return tab.id === tabId})[0];

    if (recently_closed === null ) {
      recently_closed = [];
    }

    if ( !tab || tab.incognito === true
      || tab.title === ""
      || (tab.url).indexOf("chrome://" ) !== -1 ) {
      return;
    }

    recently_closed.unshift({title: tab.title, url: tab.url});

    if(recently_closed.length > 15) {
      recently_closed.pop();
    }

    localStorage.setItem("recently_closed", JSON.stringify( recently_closed ));

    getAllTabs();
  }

  chrome.tabs.onMoved.addListener( getAllTabs );
  chrome.tabs.onCreated.addListener( getAllTabs );
  chrome.tabs.onUpdated.addListener( getAllTabs );
  //chrome.tabs.onHighlighted.addListener( getAllTabs );

  function getAllTabs() {
    chrome.tabs.getAllInWindow(null, getAllTabs_callback);
  }
  function getAllTabs_callback(tabs) {
    localStorage.setItem("open_tabs", JSON.stringify( tabs ));
  }
  chrome.tabs.getAllInWindow(null, getAllTabs_callback);

  /* END :: Recently Closed Tabs */

/* START :: Tab Manager Widget */

  $(window).bind("storage", function (e) {
    if ( e.originalEvent.key === "switch_to_tab" ) {
      if (localStorage.getItem("switch_to_tab") != -1) {
        var id = parseInt(localStorage.getItem("switch_to_tab"));

        chrome.tabs.getSelected(null, function(tab){
          if (id != tab.id) {
            chrome.tabs.remove(tab.id);
          }
        });
        chrome.tabs.update(id, {active: true});
        localStorage.setItem("switch_to_tab", -1);
      }
    }

    if ( e.originalEvent.key === "close_tab" ) {
      var id = parseInt(localStorage.getItem("close_tab"));
      if (localStorage.getItem("close_tab") !== "-1") {
          chrome.tabs.remove(id);
          localStorage.setItem("close_tab", "-1");
      }
    }

    if ( e.originalEvent.key === "pin_toggle" ) {
      var id  = parseInt(localStorage.getItem("pin_toggle"));
      if ( typeof id === "null" ) {
        return false;
      }

      var tabs = localStorage.getItem("open_tabs");
      tabs = tabs == null ? [] : JSON.parse(tabs);
      var tab = tabs.filter(function (tab) { return tab.id === id; })[0];
      if ( typeof tab === "undefined" ) {
        console.error("Tab wasn't found");
        return false;
      }

      // Invert pin state
      chrome.tabs.update(id, { pinned: !tab.pinned });

      localStorage.setItem("pin_toggle", "null");
    }
  });

  /* END :: Tab Manager Widget */

/* START :: Get Installed Widgets */

  var TILE_MIN_WIDTH      = 1,
      TILE_MAX_WIDTH      = 3,
      TILE_MIN_HEIGHT     = 1,
      TILE_MAX_HEIGHT     = 3;

  var extensions,
      installedWidgets = {};

  function reloadExtensions(data) {
    extensions = data,
    installedWidgets = {};
    sayHelloToPotentialWidgets();
  }
  chrome.management.getAll(reloadExtensions);

  function buildWidgetObject(_widget) {
    var widget = {};

    if (!_widget.request || !_widget.sender) {
      console.error("buildWidgetObject:", "Sender missing.");
      return null;
    }
    else if (!_widget.request.body) {
      console.error("buildWidgetObject:", "Body missing.");
      return null;
    }
    else if (!_widget.request.body.poke) {
      console.error("buildWidgetObject:", "Poke version not defined.");
      return null;
    }
    widget.pokeVersion = parseInt(_widget.request.body.poke);
    if (widget.pokeVersion === "NaN" || widget.pokeVersion < 1 || widget.pokeVersion > 3) {
      console.error("buildWidgetObject:", "Invalid poke version.");
      return null;
    }
    else if (widget.pokeVersion == 1) {
      console.error("buildWidgetObject:", "Support for poke version 1 has been discontinued. Use poke version 3 instead.");
      return null;
    }

    widget.height = parseInt(_widget.request.body.height);
    widget.width = parseInt(_widget.request.body.width);
    if (!widget.width || !widget.height) {
      console.error("buildWidgetObject:", "Width or Height not defined.");
      return null;
    }
    if (widget.height === "NaN") {
      console.error("buildWidgetObject:", "Invalid height.");
      return null;
    }
    else if (widget.width === "NaN") {
      console.error("buildWidgetObject:", "Invalid width.");
      return null;
    }
    else if(widget.height > 3 || widget.width > 3) {
      console.error("buildWidgetObject:", "Width or Height too large.");
      return null;
    }

    if (_widget.sender.name) {
      widget.name = _widget.sender.name;
    }
    else {
      if ( typeof _widget.sender.id === "string" ) {
        widget.name = extensions.filter(function (ext) { return ext.id === _widget.sender.id })[0];
      }

      if ( typeof widget.name !== "undefined"
        && typeof widget.name.name === "string" ) {
        widget.name = widget.name.name;
      }
      else {
        console.error("buildWidgetObject:", "Widget name undefined.");
        return null;
      }
    }

    widget.id = _widget.sender.id;
    widget.img = 'chrome://extension-icon/' + widget.id + '/128/0';

    // Poke v2 Checks
    var obj = _widget.request.body;
    widget.v2 = {};
    if ( widget.pokeVersion >= 2
      && parseInt(obj.v2.min_width ) !== "NaN"
      && parseInt(obj.v2.max_width ) !== "NaN"
      && parseInt(obj.v2.min_height) !== "NaN"
      && parseInt(obj.v2.max_height) !== "NaN" ) {
      widget.v2.min_width  = ( parseInt(obj.v2.min_width  ) < TILE_MIN_WIDTH  ) ? TILE_MIN_WIDTH : parseInt(obj.v2.min_width );
      widget.v2.min_width  = ( parseInt(obj.v2.min_width  ) > TILE_MAX_WIDTH  ) ? TILE_MAX_WIDTH : parseInt(obj.v2.min_width );

      widget.v2.max_width  = ( parseInt(obj.v2.max_width  ) < TILE_MIN_WIDTH  ) ? TILE_MIN_WIDTH : parseInt(obj.v2.max_width );
      widget.v2.max_width  = ( parseInt(obj.v2.max_width  ) > TILE_MAX_WIDTH  ) ? TILE_MAX_WIDTH : parseInt(obj.v2.max_width );

      widget.v2.min_height = ( parseInt(obj.v2.min_height) < TILE_MIN_HEIGHT ) ? TILE_MIN_HEIGHT : parseInt(obj.v2.min_height);
      widget.v2.min_height = ( parseInt(obj.v2.min_height) > TILE_MAX_HEIGHT ) ? TILE_MAX_HEIGHT : parseInt(obj.v2.min_height);

      widget.v2.max_height = ( parseInt(obj.v2.max_height) < TILE_MIN_HEIGHT ) ? TILE_MIN_HEIGHT : parseInt(obj.v2.max_height);
      widget.v2.max_height = ( parseInt(obj.v2.max_height) > TILE_MAX_HEIGHT ) ? TILE_MAX_HEIGHT : parseInt(obj.v2.max_height);
      widget.v2.resize = obj.v2.resize;
    } else {
      widget.v2.resize = false;
    }

    if ( widget.pokeVersion === 3 ) {
      if (typeof _widget.request.body.v3  === "undefined") {
        console.error("buildWidgetObject:", "v3 property is missing. v3 property is required in poke version 3.")
        return;
      }
      else if ( typeof _widget.request.body.v3.multi_placement === "undefined") {
        console.error("buildWidgetObject:", "v3.multi_placement property is missing. v3.multi_placement property is required in poke version 3.")
        return;
      }
      widget.v3 = _widget.request.body.v3;
    }
    else {
      widget.v3 = {};
      widget.v3.multi_placement = false;
    }


    var ext = extensions.filter(function(ext) { return ext.id === widget.id; })[0];
    widget.path = _widget.request.body.path;
    widget.optionsUrl = ext.optionsUrl;

    return widget;
  }

  /* END :: Get Installed Widgets */

/* START :: External Communication Stuff */

  // Attempts to establish a connection to all installed widgets
  function sayHelloToPotentialWidgets() {
    for (var i in extensions) {
      chrome.extension.sendMessage(
        extensions[i].id,
        "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke"
      );
    }
  };

  // Listens for responses
  chrome.extension.onMessageExternal.addListener( onMessageExternal );
  function onMessageExternal(request, sender, sendResponse) {
    if(request.head && request.head === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback") {
      var widget = buildWidgetObject({ "request": request, "sender": sender});
      if (widget != null) {
        installedWidgets[widget.id] = widget;
      }
    }
  }

  /* END :: External Communication Stuff */


  /* START :: App installed */
  chrome.management.onInstalled.addListener(function(ExtensionInfo) {
    if (ExtensionInfo.type == "hosted_app" || ExtensionInfo.type == "packaged_app" || ExtensionInfo.type == "legacy_packaged_app") {
      setTimeout(showAppsUI, 1000);
    }
  });

  function showAppsUI () {
    var tabs = chrome.extension.getViews({type: "tab"});
    for (var i=0, tab; tab=tabs[i]; i++) {
      tab.showAppsWindow();
    }
  }

  /* END :: App installed */
