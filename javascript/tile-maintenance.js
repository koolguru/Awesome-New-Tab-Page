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


// Updates widgets
function updateWidget(obj) {
  if ( typeof(obj.id) !== "string" ) return;

  widgets = JSON.parse(localStorage.getItem("widgets"));
  if ( !widgets[obj.id] ) return;

  if ( obj.top !== undefined )
    widgets[obj.id].where[0] = obj.top;
  if ( obj.left !== undefined )
    widgets[obj.id].where[1] = obj.left;


  if ( obj.height !== undefined ) {
    if ( $.inArray( parseInt(obj.height), [1, 2, 3] ) !== -1 ) {
      widgets[obj.id].size[0] = parseInt(obj.height);
    }
  }
  if (  obj.width !== undefined ) {
    if ( $.inArray( parseInt(obj.width ), [1, 2, 3] ) !== -1 ) {
      widgets[obj.id].size[1] = parseInt(obj.width );
    }
  }

  localStorageSync();
}

// Add widget to localStorage then refresh
function addWidget(obj) {
  widgets = JSON.parse(localStorage.getItem("widgets"));
  var stock;

  if ( typeof(obj.height) === "undefined" || parseInt(obj.height) === "NaN" )
    obj.height = 1;
  else
    if      ( parseInt(obj.height) > TILE_MAX_HEIGHT )
      obj.height = TILE_MAX_HEIGHT;
    else if ( parseInt(obj.height) < TILE_MIN_HEIGHT )
      obj.height = TILE_MIN_HEIGHT;
    else
      obj.height = parseInt(obj.height);

  if ( typeof(obj.width ) === "undefined" || parseInt(obj.width ) === "NaN" )
    obj.width  = 1;
  else
    if      ( parseInt(obj.width ) > TILE_MAX_WIDTH )
      obj.width  = TILE_MAX_WIDTH;
    else if ( parseInt(obj.width ) < TILE_MIN_WIDTH )
      obj.width  = TILE_MIN_WIDTH;
    else
      obj.width  = parseInt(obj.width );

  if ( typeof(obj.stock) === "object"
    && obj.is_widget === true ) {
    obj.widget_src = obj.stock.path;
    obj.widget_name = obj.stock.name;
    obj.widget = obj.stock.id;
  } else {
    obj.new_ext_data = extensions.filter(function (ext) { return ext.id === obj.widget; })[0];
    if ( obj.new_ext_data === undefined ) {
      obj.new_ext_data = stock_widgets[obj.widget];
      stock = true;
    }
    if(obj.is_widget === false) {

      if ( stock === true ) {
        obj.widget_img = obj.new_ext_data.img;
      } else {
        obj.widget_img = "chrome://extension-icon/"+obj.new_ext_data.id+"/128/0";
      }
      obj.appLaunchUrl = obj.new_ext_data.appLaunchUrl;
    } else {
      obj.widget_src = "chrome-extension://"+obj.new_ext_data.id+"/" + obj.src.replace(/\s+/g, '');
      obj.widget_options = obj.new_ext_data.optionsUrl;
    }
    obj.widget_name = obj.new_ext_data.name;
  }

  if ( obj.widget === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg" ) {
    obj.widget = new_guid();
  }

  if(obj.is_widget === false) {
    widgets[new_guid()] = {
      where: [obj.top,obj.left],
      size: [1,1],
      isApp: true,
      type: "app",
      name: obj.widget_name,
      id: obj.widget,
      img: obj.widget_img,
      url: obj.appLaunchUrl,
      appLaunchUrl: obj.appLaunchUrl,
      name_show:    stock ? false : true, // default false for stock tiles ONLY
      favicon_show: stock ? false : true, // default false for stock tiles ONLY
      color: palette[Math.floor(Math.random() * palette.length)],
      "resize": true,
      "v2"    : {
        "min_width" : 1,
        "max_width" : 2,
        "min_height": 1,
        "max_height": 2
      }
    };
  }

  if(obj.is_widget === true) {

    if ( obj.poke && parseInt(obj.poke) !== "NaN" ) {
      obj.poke = parseInt(obj.poke);
    } else {
      obj.poke = 1;
    }

  var widgetIndex = obj.widget;
  obj.instance_id = obj.widget;
  if (obj.poke == 3) {
    if (obj.multi_placement == true || obj.multi_placement == "true") {
      obj.instance_id = new_guid();
    }
  }

    widgets[obj.instance_id] = {
      "where" : [obj.top,obj.left],
      "size"  : [obj.height,obj.width],
      "type"  : "iframe",
      "isApp" : false,
      "name"  : obj.widget_name,
      "id"    : obj.widget,
      "img"   : obj.widget_img,
      "path"  : obj.widget_src,
      "optionsUrl": obj.widget_options,
      "poke"  : obj.poke,
      "resize": ( obj.resize === "true" ) ? true : false,
      "v2"    : {
        "min_width" : obj.min_width,
        "max_width" : obj.max_width,
        "min_height": obj.min_height,
        "max_height": obj.max_height
      },
      "instance_id": obj.instance_id
    };
  }

  localStorageSync(true);
}

// Delete widget; no refresh
function removeWidget(widget) {
    widgets = JSON.parse(localStorage.getItem("widgets"));

    delete widgets[widget];

    localStorageSync(false);
}
