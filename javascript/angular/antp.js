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

/* START :: Widgets Window */

  function windowWidgetsCtrl($scope) {

    $scope.widgets = {};
    $scope.widgetsCount = 0;

    $scope.update = function() {
      var bp = chrome.extension.getBackgroundPage();
      chrome.management.getAll( bp.reloadExtensions );

      setTimeout(function() {
        $scope.widgets = bp.installedWidgets;
        $scope.widgetsCount = Object.keys( bp.installedWidgets ).length;

        if ( $scope.widgetsCount === 0 )
          setTimeout($scope.update, 30000);

        $scope.$apply();

      }, 1000);
    };

    setTimeout($scope.update, 1000);

    chrome.management.onEnabled.addListener( $scope.update );
    chrome.management.onInstalled.addListener( $scope.update );
    chrome.management.onDisabled.addListener( $scope.update );
    chrome.management.onUninstalled.addListener( $scope.update );

  }


  /* END :: Widgets Window */
