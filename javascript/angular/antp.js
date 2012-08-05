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
          if ( extension.isApp === true ) {
            extension.img = "chrome://extension-icon/"+extension.id+"/128/0";
            $scope.apps.push(extension);
          }
        });
      });

      setTimeout(function() {
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
        if ( widget.isApp === false && widget.type !== "shortcut" && widget.type !== "app" ) {
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
          && widget.type === "app"
          && widget.enabled === true ) {
          widget.mayDisable = false;
          $scope.stock_apps.push(widget);
        }
        $scope.stock_widgets = stockWidgets;
      });
    }, 900);

  }

  /* END :: Apps/Widgets Window */
