IconResizing = {
  id: null,
  previewTile: null,
  tileImg: null,
  tileWidth: null,
  tileHeight: null,
  imgWidth: null,
  imgHeight: null,
  sizeRatio: null,

  init: function() {
    // when reset button clicked
    $("#icon-resize-scale-controls #reset-bt").click(IconResizing.resetTileIcon);
    // when center button clicked
    $("#icon-resize-scale-controls #center-bt").click(IconResizing.centerTileIcon);
      // when cover button clicked
    $("#icon-resize-scale-controls #cover-bt").click(function () { IconResizing.changeBackgroundSize("cover"); });
    // when contain button clicked
    $("#icon-resize-scale-controls #contain-bt").click(function () { IconResizing.changeBackgroundSize("contain"); });
    // on zoom
    $("#icon-resize-scale-controls #zoom-slider").change(IconResizing.changeZoomLevel);
  },

  calculateVars: function (callback) {
    var previousId = IconResizing.id;
    IconResizing.id = $(".ui-2#editor").attr("active-edit-id");
    IconResizing.previewTile = $(".ui-2#editor #preview-tile, #widget-holder #" + IconResizing.id),
    IconResizing.tileImg = $("#invisible-tile-img");
    IconResizing.tileWidth = IconResizing.previewTile.filter(":eq(0)").width();
    IconResizing.tileHeight = IconResizing.previewTile.filter(":eq(0)").height();

    // keep on getting image width, height until get correct one
    var handler = setInterval(function() {
      var newImgWidth = IconResizing.tileImg.width();
      var newImgHeight = IconResizing.tileImg.height();
      if (newImgWidth != 0) {
        // if image is changed then reset its position and zoom level
        if (IconResizing.id != previousId && !widgets[IconResizing.id].backgroundPos && !widgets[IconResizing.id].backgroundSize
          || (IconResizing.id == previousId && (IconResizing.imgWidth != newImgWidth || IconResizing.imgHeight != newImgHeight))) {
          IconResizing.imgWidth = newImgWidth;
          IconResizing.imgHeight = newImgHeight;
          IconResizing.sizeRatio = IconResizing.imgWidth / IconResizing.imgHeight;
          IconResizing.resetTileIcon();
        }
        else {
          IconResizing.imgWidth = newImgWidth;
          IconResizing.imgHeight = newImgHeight;
          IconResizing.sizeRatio = IconResizing.imgWidth / IconResizing.imgHeight;
        }
        clearInterval(handler);
        if (callback) {
          callback();
        }
      }
    }, 50);
  },

  previewTileUpdated: function(callback) {
    IconResizing.calculateVars(callback);
  },

  // reset tile's background position to center and scale to 1
  resetTileIcon: function() {
    IconResizing.previewTile.css("background-position", "center center").css("background-size", "auto");
    var slider = $("#icon-resize-scale-controls #zoom-slider");
    if (IconResizing.imgWidth >= IconResizing.tileWidth) {
      slider.val(slider.attr("max"));
    }
    else {
      slider.val(slider.attr("min"));
    }
    IconResizing.savePosition();
  },

  // change tile's background position to center
  centerTileIcon: function() {
    IconResizing.previewTile.css("background-position", "center center");
    IconResizing.savePosition();
  },


  // change tile's background position to cover
  changeBackgroundSize: function(changeTo){
    var imgWidth;
    var imgHeight;
    if (changeTo == "cover"){
      if (IconResizing.sizeRatio >= 1) {
        imgHeight = IconResizing.tileHeight;
        imgWidth = imgHeight * IconResizing.sizeRatio;
      }
      else {
        imgWidth = IconResizing.tileWidth;
        imgHeight = imgWidth / IconResizing.sizeRatio;
      }
    }
    else if (changeTo == "contain"){
      if (IconResizing.sizeRatio >= 1){
        imgWidth = IconResizing.tileWidth;
        imgHeight = imgWidth / IconResizing.sizeRatio;
      }
      else {
        imgHeight = IconResizing.tileHeight;
        imgWidth = imgHeight * IconResizing.sizeRatio;
      }
    }

    IconResizing.previewTile.css("background-size", imgWidth + "px " + imgHeight + "px, 100% 100%");

    IconResizing.updateSlider();
    IconResizing.savePosition();
  },

  // recalculates zoom slider position
  updateSlider: function() {
    var slider = $("#icon-resize-scale-controls #zoom-slider");
    var backgroundWidth = IconResizing.previewTile.filter(":eq(0)").css("background-size").split(" ")[0];
    if (backgroundWidth == "auto,") {
      if (IconResizing.imgWidth > IconResizing.tileWidth) {
        slider.val(slider.attr("max"));
      }
      else {
        slider.val(slider.attr("min"));
      }

    }
    else {
      var currentImgWidth = extractNumber(backgroundWidth);
      var zoomPerStep = IconResizing.getZoomPerStep(slider.attr("max"));
      var step;
      if (IconResizing.imgWidth >= IconResizing.tileWidth) {
        step = (currentImgWidth - IconResizing.tileWidth) / zoomPerStep;
      }
      else {
        step = (currentImgWidth - IconResizing.imgWidth) / zoomPerStep;
      }
      slider.val(step);
    }
  },

  changeZoomLevel: function() {
    var step = this.value;
    var zoomPerStep = IconResizing.getZoomPerStep(this.max);
    var imgWidth;
    if (IconResizing.imgWidth < IconResizing.tileWidth) {
      imgWidth = IconResizing.imgWidth + (step * zoomPerStep);
    }
    else {
      imgWidth = IconResizing.tileWidth + (step * zoomPerStep);
    }
    var imgHeight = imgWidth / IconResizing.sizeRatio;
    IconResizing.previewTile.css("background-size", imgWidth + "px " + imgHeight + "px, 100% 100%");
    IconResizing.savePosition();
  },

  getZoomPerStep: function(maxStep) {
    var zoomPerStep = (IconResizing.imgWidth - IconResizing.tileWidth) / maxStep;
    if (zoomPerStep < 0) {
      zoomPerStep = (IconResizing.tileWidth - IconResizing.imgWidth) / maxStep;
    }
    return zoomPerStep;
  },

  // save tile's position and scale to localstorage
  savePosition: function() {
    widgets = JSON.parse(localStorage.getItem("widgets"));
    widgets[IconResizing.id].backgroundPosition = IconResizing.previewTile.filter(":eq(0)").css("background-position");
    widgets[IconResizing.id].backgroundSize = IconResizing.previewTile.filter(":eq(0)").css("background-size");
    localStorageSync(false);
  }
}

IconResizing.init();

/**
 * Dragging image in preview tile to adjust its position
*/
IconDragging = {
  mouseStartPos: {},
  backgroundPos: {},
  tile: null, // save preview tile to avoid repeatedly searching it
  dragging: false, // true if dragging is in progress

  init: function(){
    // to start dragging on mousedown (start dragging only if clicked on preview tile)
    $(document).mousedown(function(event) {
      if (IconResizing.id && event.button == 0 && widgets[IconResizing.id] && widgets[IconResizing.id].type == "shortcut") {
        var previewTile = $(event.target).parents("#preview-tile");
        if (previewTile.length > 0) // if user clicked within preview tile then start dragging
        {
          $(event.target).css("cursor", "move");
          IconDragging.startDragging(event, previewTile);
        }
      }
    });

    // stop dragging if dragging is in progress
    $(document).mouseup(function(event) {
      if (IconDragging.dragging){
        IconDragging.stopDragging();
      }
    });
  },

  startDragging: function(event, previewTile) {
    previewTile.css("cursor", "move");
    IconDragging.mouseStartPos.X = event.clientX;
    IconDragging.mouseStartPos.Y = event.clientY;
    IconDragging.backgroundPos = getBackgroundPos(previewTile);
    IconDragging.tile = IconResizing.previewTile;
    IconDragging.dragging = true;

    $(document).on('mousemove', IconDragging.dragTile);  // start moving the tile on mousemove
  },

  dragTile: function(event) {
    var newBackgroundPos = {};
    newBackgroundPos.X = (IconDragging.backgroundPos.X + event.clientX - IconDragging.mouseStartPos.X) + "px";
    newBackgroundPos.Y = (IconDragging.backgroundPos.Y + event.clientY - IconDragging.mouseStartPos.Y) + "px";
    IconDragging.tile.css("background-position", newBackgroundPos.X + " " + newBackgroundPos.Y + ", 100% 100%");
  },

  stopDragging: function(event) {
    dragging = false;
    $(document).off("mousemove");
    IconResizing.savePosition();
    $("#preview-tile .iframe-mask").css("cursor", "auto");
  }
}

IconDragging.init();  // binds events for dragging

function getBackgroundPos(element) {
  var position = {}, arr;
  var backgroundPos = element.css("background-position");
  // if background position is in percent then calculate background position manually
  if (backgroundPos == "50% 50%, 50% 50%") {
    var size = element.css("background-size").split(" ");
    if (size[1] == "auto") {
      size[0] = IconResizing.imgWidth;
      size[1] = IconResizing.imgHeight;
    }
    position.X = ((extractNumber(size[0]) / 2) - (IconResizing.tileWidth / 2)) * -1;
    position.Y = ((extractNumber(size[1]) / 2) - (IconResizing.tileHeight / 2)) * -1;
  } else {
    arr = backgroundPos.split(" ");
    position.X = extractNumber(arr[0]);
    position.Y = extractNumber(arr[1]);
  }

  return position;
}

function extractNumber(value) {
  var n = parseInt(value);
  return n == null || isNaN(n) ? 0 : n;
}
