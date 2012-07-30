checkLocalStorageVersion();
function checkLocalStorageVersion() {
  var storageVersion = localStorage.storageVersion;
  if (typeof(storageVersion) === "undefined") {
    // apply changes in storageVersion 1
    updateOldPaths();
    onLeftClickUpdate();
    localStorage.storageVersion = "1.0";
    localStorage.msg = JSON.stringify({title: chrome.i18n.getMessage("localStorage_updated_msg_header"), message: chrome.i18n.getMessage("localStorage_updated_msg")});
    window.location.reload();
  }
}

function onLeftClickUpdate() {
  for (var i in widgets) {
    if ( (typeof(widgets[i].type) !== "undefined" && (widgets[i].type === "shortcut" || widgets[i].type === "app")) 
      || (typeof(widgets[i].isApp) !== "undefined" && widgets[i].isApp == true)) {
      if (typeof(widgets[i].pin) !== "undefined" && widgets[i].pin == true) {
        widgets[i].onleftclick = "pin";
        delete widgets[i].pin;
      }
      else {
        widgets[i].onleftclick = null;
      }
    }
  }
}

// if widget paths are old, update them to new one
function updateOldPaths() {
  var oldPathReg = /widgets\/(widget.([^.\/]*).[^\/]*)/;
  for (var i in widgets) {
    if (widgets[i].name === "Awesome New Tab Page" || widgets[i].stock) {
      if (widgets[i].path || widgets[i].img || widgets[i].simg) {
        var oPath = widgets[i].path || widgets[i].img || widgets[i].simg,
          result;
        result = oldPathReg.exec(oPath);
        if (result) {
          var newPath = "/widgets/" + result[2] + "/" + result[1];
          pathChanged = true;
          //update path
          if (widgets[i].path) {
            widgets[i].path = newPath;
          }
          if (widgets[i].img) {
            widgets[i].img = newPath;
          }
          if (widgets[i].simg) {
            widgets[i].simg = newPath;
          }
        }
      }
    } else if (widgets[i].id === "tabs" || widgets[i].path === "widgets/tabs.html"
      || widgets[i].path === "chrome-extension://mgmiemnjjchgkmgbeljfocdjjnpjnmcg/widgets/tabs.html") {
      pathChanged = true;
      widgets[i].path = "widgets/tabs/tabs.html";
    }
  }
  localStorageSync(false);
}