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

var
  ajs = angular.module('antp', ['antp.filters', 'antp.directives']),
  ajsf = angular.module('antp.filters', []),
  ajsd = angular.module('antp.directives', []);

/* START :: i18n */

  // Usage: {{ "message_id" | i18n }}
  // Notes: Does NOT support HTML
  ajsf.filter('i18n', function() {
    return function(messageId) {
      if (chrome.i18n)
        return chrome.i18n.getMessage(messageId);
      else if (parent.chrome.i18n)
        return parent.chrome.i18n.getMessage(messageId);
    };
  });

  // Usage: <i18n message-id="message_id" />
  // Notes: Supports HTML
  ajsd.directive('i18n', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        if (chrome.i18n)
          element.html( chrome.i18n.getMessage(attrs.messageId) );
        else if (parent.chrome.i18n)
          element.html( parent.chrome.i18n.getMessage(attrs.messageId) );
      }
    }
  });

  /* END :: i18n */

/* START :: Widgets/Apps/Custom Shortcuts */

  function tileCtrl($scope) {

    $scope.widgets = [];
    $scope.apps = {};
    $scope.custom_shortcuts = {};

    $scope.revisionCount = 0;

    $scope.update = function() {
      var tiles = store.get("widgets");

      $scope.widgets = [];
      $scope.apps = {};
      $scope.custom_shortcuts = {};

      angular.forEach(tiles, function(tile, id) {
        if ( tile.isApp === true ) {
          tile.type = "app";
          tiles[id].type = "app";
          store.set("widgets", tiles);
        }

        tile.ext = tile.id;
        tile.id = id;

        if ( tiles[tile.id].optionsUrl ) {
          tile.optionsUrl = tiles[tile.id].optionsUrl;
        }

        /* Start :: CSS */

          tile.css = {};
          tile.css.height = ( tile.size[0] * 200 ) + ( ( tile.size[0] - 1 ) * 6 );
          tile.css.width  = ( tile.size[1] * 200 ) + ( ( tile.size[1] - 1 ) * 6 );
          tile.css.top    = tile.where[0] * ( GRID_TILE_SIZE + ( GRID_TILE_PADDING * 2 ) ) + ( GRID_TILE_PADDING * 2 );
          tile.css.left   = tile.where[1] * ( GRID_TILE_SIZE + ( GRID_TILE_PADDING * 2 ) ) + ( GRID_TILE_PADDING * 2 );

          if ( tile.type === "app" || tile.type === "shortcut" ) {
            if ( tile.shortcut_background_transparent === true ) {
              tile.css.bg = "background-image: url("+tile.img+"); background-color: transparent;";
            } else {
              tile.css.bg = "background-image: url("+tile.img+"), -webkit-gradient(linear, 100% 100%, 0% 0%, to(rgba(255, 255, 255, 0.04)), from(rgba(255, 255, 255, 0.35))); background-color: "+tile.color+";";
            }
          }

          if ( tile.img && (tile.type === "app" || tile.type === "shortcut") ) {
            tile.css.bgimg = "background-image: url("+tile.img+")";
          }

          /* END :: CSS */

        // Defaults
        if ( tile.favicon_show === undefined ) {
          tile.favicon_show = true;
        }
        if ( tile.name_show === undefined ) {
          tile.name_show = true;
        }

        switch ( tile.type ) {
          case "iframe":
            if ( tile.instance_id ) {
              tile.hash = encodeURIComponent(JSON.stringify({"id": tile.instance_id}));
            }
            $scope.widgets.push(tile);
            break;
          case "app":
            tile.resize = true;
            $scope.apps[id] = tile;
            break;
          case "shortcut":
            tile.resize = true;
            $scope.custom_shortcuts[id] = tile;
            break;
        }

      });

      setTimeout(function(){
        var tiles = $("#grid-holder > .tile");
        $("#grid-holder > .tile").addClass("empty");
        $("#widget-holder > div").each(function(ind, elem){
          var tiles = getCovered(this);
          $(tiles.tiles).each(function(ind, elem){
            $(elem).removeClass("empty");
          });
        });
      }, 250);


      // To prevent an onload error
      if ( $scope.revisionCount !== 0 ) {
        $scope.$apply();
      }

      $scope.revisionCount++;
    };

    $scope.update();

    $(window).bind("storage antp-widgets", function (e) {
      if ( typeof(e.originalEvent) === "object"
        && typeof(e.originalEvent.key) === "string"
        && e.originalEvent.key === "widgets" )
          $scope.update();
      else if ( e.type === "antp-widgets" )
        $scope.update();
    });

    // todo: setup stock widget check and setup (initialize localStorage)

  }

  /* END :: Widgets/Apps/Custom Shortcuts */

/* START :: Apps/Widgets Window */

  function windowAppsWidgetsCtrl($scope) {

    $scope.stock_apps = []
    $scope.stock_widgets = {};

    $scope.apps = [];
    $scope.widgets = {};

    $scope.update = function() {
      // Refresh widgets
      var bp = chrome.extension.getBackgroundPage();
      chrome.management.getAll( bp.reloadExtensions );

      // Refresh apps
      chrome.management.getAll(function(all){
        $scope.apps = [];
        angular.forEach(all, function(extension, id){
          if ( extension.isApp === true && extension.enabled === true ) {
            extension.img = "chrome://extension-icon/"+extension.id+"/128/0";
            $scope.apps.push(extension);
          }
        });
      });

      setTimeout(function() {
        $scope.apps.sort(function(a, b){
          var
            nameA=a.name.toLowerCase(),
            nameB=b.name.toLowerCase();
          if (nameA < nameB)
            return -1;
          if (nameA > nameB)
            return 1;
          return 0
        });
        $scope.apps = $scope.apps.concat($scope.stock_apps);
        $scope.widgets = Object.merge(bp.installedWidgets, $scope.stock_widgets);

        // $scope.appsCount = $scope.apps.length;
        // $scope.widgetsCount = Object.keys( bp.installedWidgets ).length;

        // Update every 30 seconds
        setTimeout($scope.update, 30000);

        $scope.$apply();

      }, 1000);
    };

    setTimeout($scope.update, 1000);

    chrome.management.onEnabled.addListener( $scope.update );
    chrome.management.onInstalled.addListener( $scope.update );
    chrome.management.onDisabled.addListener( $scope.update );
    chrome.management.onUninstalled.addListener( $scope.update );

    // Save $scope.stock_widgets and $scope.stock_apps
    setTimeout(function() {
      var stockWidgets = {};
      angular.forEach(stock_widgets, function(widget, id) {
        if ( widget.type !== "shortcut" && widget.type !== "app" ) {
          widget.height = widget.size[0];
          widget.width = widget.size[1];
          if ( !widget.poke ) {
            widget.poke = 1;
            widget.v2 = {};
            widget.v2.resize = false;

            widget.v3 = {};
            widget.v3.multi_placement = false;
          } else if ( widget.poke === 2 ) {
            widget.v3 = {};
            widget.v3.multi_placement = false;
          }
          widget.pokeVersion = widget.poke;

          widget.img = "icon128.png";
          widget.id = "mgmiemnjjchgkmgbeljfocdjjnpjnmcg";

          widget.stock = true;

          // Starts with z so that they're always displayed last
          stockWidgets["zStock_" + id] = widget;
        } else if ( widget.isApp === true
          && widget.type === "app" ) {
          widget.mayDisable = false;
          $scope.stock_apps.push(widget);
        }
        $scope.stock_widgets = stockWidgets;
      });
    }, 900);

  }

  /* END :: Apps/Widgets Window */

/* START :: Recently Closed Tabs Menu */

  function RCTMCtrl($scope) {

    $scope.recently_closed = [];

    $scope.clear = function() {
      $scope.recently_closed = [];
      store.set("recently_closed", []);

      $scope.$apply();
    };

    $scope.removeTab = function(tabToRemove) {
      var index = this.recently_closed.indexOf(tabToRemove);
      this.recently_closed.splice(index, 1);
      store.set("recently_closed", this.recently_closed);
    };

    $scope.update = function() {
      $scope.recently_closed = store.get("recently_closed");

      $scope.$apply();

    };

    setTimeout($scope.update, 1000);

    $(window).bind("storage", function (e) {
      if ( typeof(e.originalEvent) === "object"
        && typeof(e.originalEvent.key) === "string"
        && e.originalEvent.key === "recently_closed" )
          $scope.update();
    });

  }

  /* END :: Recently Closed Tabs Menu */
