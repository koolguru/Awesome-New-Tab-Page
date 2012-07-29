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

function reloadWidgets() {
  $(".ui-2#widgets .widget").remove();
  backgroundPage = chrome.extension.getBackgroundPage();
  setupInstalledWidgets();
  setupStockWidgets();
  console.log('reloaded');
}
setInterval(reloadWidgets, 5000);

var backgroundPage = chrome.extension.getBackgroundPage();
chrome.management.getAll(backgroundPage.reloadExtensions);  // call backround function to load extensions

$(document).ready(function() {
  setTimeout(reloadWidgets, 600);
});

function setupInstalledWidgets() {
  for (var id in backgroundPage.installedWidgets) {
    setupDrawerWidget(backgroundPage.installedWidgets[id]);
  }
}

function setupStockWidgets() {
  $.each(stock_widgets, function(id, widget) {
    if(widget.isApp === false && widget.type !== "shortcut" && widget.type !== "app") {

      var stockWidget = widget;
      stockWidget.height = widget.size[0];
      stockWidget.width = widget.size[1];
      if (!stockWidget.poke) {
        stockWidget.poke = 1;
        stockWidget.v2 = {};
        stockWidget.v2.resize = false;
        stockWidget.v3 = {};
        stockWidget.v3.multi_placement = false;
      }
      else if (stockWidget.poke == 2) {
        stockWidget.v3 = {};
        stockWidget.v3.multi_placement = false;
      }
      stockWidget.pokeVersion = stockWidget.poke;

      widget.img = "icon128.png";
      widget.id = "mgmiemnjjchgkmgbeljfocdjjnpjnmcg";
      
      setupDrawerWidget(stockWidget);
    }
  });
}

// Only handles 1 at a time; widget
function setupDrawerWidget(_widget) {
    // if already exist in drawer then do nothing
    if (_widget.id != "mgmiemnjjchgkmgbeljfocdjjnpjnmcg" && $(".ui-2#widgets #" + _widget.id + ".widget").length > 0) {
      return;
    }
    $(stitch(
      /*  Type: str [app, widget, app-drawer, widget-drawer]*/  "widget-drawer",
      /*  Ext. ID: str [mgmiemnjjchgkmgbeljfocdjjnpjnmcg]   */  _widget.id,
      /*  Ext. Name: str [Awesome New Tab Page]             */  _widget.name,
      /*  URL: str, can be iframe or app url                */  (_widget.path).replace(/\s+/g, ''),
      /*  Img: str, full path                               */  _widget.img,
      /*  Height: int [1, 2, 3]                             */  parseInt(_widget.height),
      /*  Width: int [1, 2, 3]                              */  parseInt(_widget.width),
      /*  Top: int                                          */  null,
      /*  Left: int                                         */  null,
      /*  Poke: array                                       */  [_widget.pokeVersion, _widget.v2, _widget.v3]
    )).appendTo("#widget-drawer");
}

$(".ui-2.widgets-refresh").bind("click", function() {
  $(".ui-2#widgets .widget").remove();
  backgroundPage.installedWidgets = {};
  chrome.management.getAll(backgroundPage.reloadExtensions);
  setTimeout(reloadWidgets, 500);
});

$("#widget-drawer-button").bind("click", function(){
  _gaq.push([ '_trackEvent', 'Window', "Widgets" ]);

  $(".ui-2#widgets").toggle();
  $(".ui-2#apps").hide();
  $(".ui-2#config").hide();
  $("#recently-closed-tabs-menu").hide();
  $(".ui-2#about").hide();
  $(".ui-2#editor").hide();
});
