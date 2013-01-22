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



function removeFromTile(tile) {
  var to_delete = $(tile).parent().parent();
  if(to_delete) {
    var id = $(to_delete).attr("id");
    if ( widgets[id]
      && widgets[id].type === "shortcut"
      && (widgets[id].img).match("filesystem:") ) {

      deleteShortcut( (widgets[id].img).match(/^(.*)\/(.*)/)[2] );
    }

    $(".ui-2.x").trigger("click");
    removeWidget( $(to_delete).attr("id") );

    hscroll = true;

    var tiles = getCovered(to_delete);
    $(tiles.tiles).each(function(ind, elem){
        $(elem).addClass("empty");
    });

    $(to_delete).remove();
  }
}

// Create shortcut on click
function createShortcut(tile) {
  var new_shortcut_id = new_guid();

  addShortcut(
    new_shortcut_id,
    $(tile).attr("land-top"),
    $(tile).attr("land-left")
  );

  $("#" + new_shortcut_id).css({
    "left": $(tile).position().left,
    "top": $(tile).position().top,
    "width": "200",
    "height": "200",
    "zIndex": "1"
  }).find(".iframe-mask").find("#shortcut-edit").trigger("click");

  $(tile).removeClass("add-shortcut").removeClass("empty");
}

// Adds shortcut
function addShortcut(widget, top, left) {
  widgets = JSON.parse(localStorage.getItem("widgets"));

  widgets[widget] = {
    where: [top,left],
    size: [1,1],
    type: "shortcut",
    isApp: false,
    name: "Google",
    id: widget,
    img: "core.shortcut.blank2.png",
    appLaunchUrl: "http://www.google.com/",
    url: "http://www.google.com/",
    color: palette[Math.floor(Math.random() * palette.length)],
    name_show: true,
    favicon_show: true
  };

  localStorageSync(true);
}
