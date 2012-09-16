requirejs.config({
    baseUrl: 'javascript',
    paths: {
        app: '/colorpicker'
    }
});

function required(file, callback) {
  if (!require.defined(file)) {
    require([file], function() {
      if (callback)
        callback(true);
    });
  }
  else if (callback)
    callback(false);
}

function requiredColorPicker(callback) {
  required('/colorpicker/js/colorpicker.js', function(loaded) {
    if (loaded)
      colorPickerLoaded();
    if (callback)
      callback();
  });
}

require(["/javascript/ui.js?nocache=12"]);

$(document).ready(function() {
  setTimeout(function() {
    require(["jquery.qtip.min"], function() {
      // Tooltips delayed initializer
      $('div[title]').qtip({
        style: {
          classes: 'ui-tooltip-light ui-tooltip-shadow ui-tooltip-bootstrap'
        }
      });
    });

    require(["jquery.confirm", "filesystem", "google-analytics", "storage-updates"]);
  }, 1000);
});
