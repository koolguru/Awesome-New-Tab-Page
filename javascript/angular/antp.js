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
  ajs = angular.module('antp', []);

/* START :: i18n */

  // Usage: {{ "message_id" | i18n }}
  // Notes: Does NOT support HTML
  ajs.filter('i18n', function() {
    return function(messageId) {
      if (chrome.i18n)
        return chrome.i18n.getMessage(messageId);
      else if (parent.chrome.i18n)
        return parent.chrome.i18n.getMessage(messageId);
    };
  });

  // Usage: <i18n message-id="message_id" />
  // Notes: Supports HTML
  ajs.directive('i18n', function() {
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
        if ( tile.isApp === true )
          tile.type = "app";

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

        // Fixed list app urls with  their search urls
        var fixedSearchURLs = {
          "http://www.youtube.com/"                       : "http://www.youtube.com/results?search_query={input}",
          "http://www.amazon.com/?tag=sntp-20"            : "http://www.amazon.com/s/?field-keywords={input}&tag=sntp-20",
          "http://www.facebook.com/"                      : "http://www.facebook.com/search/?q={input}",
          "http://www.twitter.com/"                       : "http://twitter.com/search?q={input}&src=typd",
          "http://plus.google.com/"                       : "http://plus.google.com/s/{input}",
          "http://www.google.com/webhp?source=search_app" : "http://www.google.com/search?source=search_app&q={input}",
          "https://chrome.google.com/webstore?utm_source=webstore-app&utm_medium=awesome-new-tab-page" : "https://chrome.google.com/webstore/search/{input}"
        };

        switch ( tile.type ) {
          case "iframe":
            if ( tile.instance_id ) {
              tile.hash = "#" + encodeURIComponent(JSON.stringify({"id": tile.instance_id}));
            } else {
              tile.hash = "";
            }
            $scope.widgets.push(tile);
            break;
          case "app":
            tile.resize = true;
            if (fixedSearchURLs[tile.appLaunchUrl]) {
              tile.searchUrl = fixedSearchURLs[tile.appLaunchUrl];
              tile.searchEnabled = true;
            }

            $scope.apps[id] = tile;
            break;
          case "shortcut":
            tile.resize = true;
            if (tile.searchUrl && tile.searchUrl.indexOf("{input}") != -1) {
              tile.searchEnabled = true;
            }
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

    var timeoutId = null;

    $scope.update = function() {
      clearTimeout(timeoutId);  // to prevent multiple running of $scope.update function

      // Refresh widgets
      chrome.runtime.getBackgroundPage(function(bp) {
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
          timeoutId = setTimeout($scope.update, 30000);

          $scope.$apply();

        }, 1000);
      });
    };

    timeoutId = setTimeout($scope.update, 1000);

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

/* START :: Tile Editor */

  function windowTileEditorCtrl($scope) {

    $scope.update = function (a, b) {
      // save all the things, put all the things into the tile.
      var id = $(".ui-2#editor").attr("active-edit-id");
      var widgets = JSON.parse(localStorage.getItem("widgets"));
      $scope[a] = b;

      if (typeof widgets[id][a] !== undefined) { // if object exists, set
        widgets[id][a] = $scope[a];
      }

      switch (a) {
        case "appLaunchUrl":
          $scope.favicon = "chrome://favicon/" + widgets[id].appLaunchUrl;
          widgets[id].url = widgets[id].appLaunchUrl;
          $("#widget-holder #"+id+" a").attr("data-url", $scope.appLaunchUrl).attr("href", $scope.appLaunchUrl);
          $("#widget-holder #"+id+" .app-favicon").attr("src", $scope.favicon);
          break;
        case "shortcut_pin": case "shortcut_newtab":
          if ( $scope.shortcut_pin === "pin" ) {
            widgets[id].onleftclick = "pin";
          }
          if ( $scope.shortcut_newtab === "newtab" ) {
            widgets[id].onleftclick = "newtab";
          }
          if ( $scope.shortcut_newtab !== "newtab" && $scope.shortcut_pin !== "pin" ) {
            widgets[id].onleftclick = "";
          }
          $scope.onleftclick = widgets[id].onleftclick;
          $("#widget-holder #"+id+" .url").attr("onleftclick", widgets[id].onleftclick);
          break;
        case "searchUrl":
          widgets[id].searchEnabled = ($scope.shortcut_search_url !== "");
          $("#widget-holder #"+id+" .search-box").attr("data-search", $scope.shortcut_search_url);
          break;
        case "shortcut_background_transparent":
        case "backgroundimage":
        case "backgroundcolor":
        case "img":
          if ($scope.shortcut_background_transparent === true) {
            $scope.backgroundimage = "url("+widgets[id].img+")";
            $scope.backgroundcolor = "transparent";
            widgets[id].shortcut_background_transparent = true;
          } else {
            $scope.backgroundimage = "url("+widgets[id].img+")" + gradient;
            $scope.backgroundcolor = widgets[id].color;
            widgets[id].color = $scope.color;
            widgets[id].shortcut_background_transparent = false;
          }
          $(".ui-2#editor #invisible-tile-img").attr("src", widgets[id].img);
          $("#widget-holder #"+id + ", #preview-tile").css("background-image", $scope.backgroundimage).css("background-color", $scope.backgroundcolor);
          break;
        case "name":
          $("#widget-holder #"+id+" .app-name").html($scope.name).css("opacity", +$scope.name_show);
          break;
        case "favicon_show":
          $("#widget-holder #"+id+" .app-favicon").css("opacity", +$scope.favicon_show);
          break;
      }

      localStorage.setItem("widgets", JSON.stringify(widgets));
      $scope.$apply();
    };

    $scope.edit = function() {

      var id = $(this).parent().parent().attr("id");
      var widgets = JSON.parse(localStorage.getItem("widgets"));

      var this_extension = extensions.filter(function (ext) { return ext.id === id })[0];
      var is_app = (typeof(this_extension) !== "undefined" && typeof(this_extension.isApp) === "boolean");
      var is_shortcut = (widgets[id].type && widgets[id].type === "shortcut");

      var editor_type;
      if ( is_shortcut ) {
        editor_type = "shortcut";
        $(".ui-2#editor").addClass("type-shortcut").removeClass("type-app");
      } else {
        editor_type = "app";
        $(".ui-2#editor").addClass("type-app").removeClass("type-shortcut");
      }

      var stock_app = false;
      if ( $.inArray(id, ["webstore", "amazon", "amazoninstantvideo", "facebook", "twitter"]) !== -1 ) {
        widgets[id].img = stock_widgets[id].simg;
        stock_app = true;
      }

      if ( is_shortcut ) {
        $scope.favicon = "chrome://favicon/" + widgets[id].appLaunchUrl;
        if ( widgets[id].favicon_show !== false ) {
          $scope.favicon_show = true;
        } else {
          $scope.favicon_show = false;
        }
        $scope.searchUrl = widgets[id].searchUrl;
      } else {
        $scope.searchUrl = "";
        $scope.favicon_show = false;
      }

      var tile = widgets[id];

      $scope.name = tile.name;
      $scope.name_show = tile.name_show;
      $scope.shortcut_pin = (tile.onleftclick === "pin");
      $scope.shortcut_newtab = (tile.onleftclick === "newtab");
      $scope.onleftclick = tile.onleftclick;
      $scope.url = tile.appLaunchUrl;
      $scope.appLaunchUrl = tile.appLaunchUrl;
      $scope.searchUrl = tile.searchUrl;
      $scope.shortcut_background_transparent = tile.shortcut_background_transparent;
      $scope.img = tile.img;
      $scope.color = tile.color; // to preserve the actual color
      $scope.backgroundcolor = tile.color; // to hold color/transparent

      if($scope.shortcut_background_transparent === true) {
        $scope.backgroundimage = "url("+widgets[id].img+")";
        $scope.backgroundcolor = "transparent";
      } else {
        $scope.backgroundimage = "url("+widgets[id].img+")" + gradient;
        $scope.backgroundcolor = tile.color;
        $scope.color = tile.color;
      }

      $("body > .ui-2").hide();

      $(".ui-2#editor")
        .show()
        .attr("active-edit-id", id)
        .attr("active-edit-type", editor_type);
      $scope.$apply();

      requiredColorPicker(function() {
        var rgb = [];
        rgb = (widgets[$(".ui-2#editor").attr("active-edit-id")].color).match(/(rgba?)|(\d+(\.\d+)?%?)|(\.\d+)/g);

        $(".ui-2#editor #shortcut_colorpicker").ColorPicker({
          color: ( ({ r: rgb[1], g: rgb[2], b: rgb[3] }) || "#309492") ,
          onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            rgb = (widgets[$(".ui-2#editor").attr("active-edit-id")].color).match(/(rgba?)|(\d+(\.\d+)?%?)|(\.\d+)/g);
            color: ( ({ r: rgb[1], g: rgb[2], b: rgb[3] }) || "#309492")
            return false;
          },
          onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
          },
          onChange: function (hsb, hex, rgb) {
            $scope.backgroundcolor = "rgba("+rgb.r+","+rgb.g+","+rgb.b+", 1)";
            $scope.shortcut_background_transparent = false;
            $scope.color = $scope.backgroundcolor;
            $scope.update("backgroundcolor", $scope.color);
          }
        });
        $(".ui-2#editor #shortcut_colorpicker").ColorPickerSetColor( ({ r: rgb[1], g: rgb[2], b: rgb[3] }) );
      });

      $("#swatches").html("").hide();
      if ( is_app === true && stock_app === false ) {
        var image = widgets[id].img;
        required("quantize", function() {
          required("color-thief", function() {
            var medianPalette = createPalette(
              $("<img />").attr({
                "src": image,
                "id" : "temporary-element-to-delete"
              }).css({
                "display": "none"
              }).appendTo("body")
            , 5);
            $.each(medianPalette, function(index, value) {
              var swatchEl = $('<div>')
              .css("background-color","rgba(" +value[0]+ "," +value[1]+  "," +value[2]+ ", 1)")
              .data({
                "r": value[0],
                "g": value[1],
                "b": value[2]
              }).addClass("swatch");
              $("#swatches").append(swatchEl).show();
            });

            $("#temporary-element-to-delete").remove();
          });
        });
      }
      $(".ui-2#editor #invisible-tile-img").attr("src", widgets[id].img);
      if (widgets[id].backgroundSize) {
          $("#widget-holder #"+id + ", #preview-tile").css("background-size", widgets[id].backgroundSize);
          IconResizing.previewTileUpdated(IconResizing.updateSlider);
        }
        IconResizing.previewTileUpdated();
    };

    $scope.setswatch = function(e) {
      var id = $(".ui-2#editor").attr("active-edit-id");
      var widgets = JSON.parse(localStorage.getItem("widgets"));

      var rgb = $(e.target.outerHTML).css("background-color").match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      var r = rgb[1];
      var g = rgb[2];
      var b = rgb[3];
      $scope.backgroundcolor = "rgb(" + r + ", " + g + ", " + b + ")";
      $scope.color = $scope.backgroundcolor;
      $scope.shortcut_background_transparent = false;
    }

    $(document).on("click", "#shortcut-edit", $scope.edit);
  }

  ajs.directive('ngTileEditor', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elm, attr, ngModelCtrl) {
        var bind_method;
        if (attr.type === 'radio' || attr.type === 'checkbox') {
          bind_method = "click";
        } else {
          bind_method = "change keyup keydown keypress";
        }
        elm.bind(bind_method, function(event) {
          var value = elm.val();
          scope.$apply(function() {
            // i have to set up special cases, because some checkboxes use values AND checked booleans
            // if checked, use value.
            if (attr.ngModel === "shortcut_pin" || attr.ngModel === "shortcut_newtab") {
              var checked = $("[ng-model=" + attr.ngModel + "]").attr("checked");

              // uncheck the other box (if checked)
              $("[ng-model=" + (attr.ngModel == "shortcut_pin" ? "shortcut_newtab" : "shortcut_pin") + "]").removeAttr("checked");

              if (!checked) {
                value = undefined;
              }
            }

            // checked = true, unchecked = false
            // rather than unchecked = undefined
            if (attr.ngModel === "name_show" || attr.ngModel === "favicon_show" || attr.ngModel === "shortcut_background_transparent") {
              value = $("[ng-model=" + attr.ngModel + "]").is(':checked');
            }

            ngModelCtrl.$setViewValue(value);
          });
          scope.update(attr.ngModel, value);
        });
      }
    };
  });

  /* END :: Tile Editor */

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

/* START :: Tabs & Panes Directives */

  ajs.directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        var panes = $scope.panes = [];

        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;

          if(pane.selected === true && pane.name === "Background") {
            $("#icon-resize-scale-controls").show();
          } else {
            $("#icon-resize-scale-controls").hide();
          }
        }

        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      },
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" class="{{pane.class}}" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.name}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  }).
  directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { name: '@', class: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  });

  /* END :: Tabs & Panes Directives */
