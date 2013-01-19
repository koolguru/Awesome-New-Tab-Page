required("/javascript/base64.js?nocache=12");
$("#run-import-btn").hide(); // hide Apply button instantly. (won't work properly if done from CSS)

// select export-textarea's text on focus
$("#export-textarea").bind("focus mousedown mouseup", function(e) {
  e.preventDefault();
  $(this).select();
});

// upon click on import button
$("#import-btn").bind("click", function() {
  $("#export-textarea").hide();
  $importTextarea = $("#import-textarea");
  $importTextarea.show();
  $importTextarea.focus();
  $("#run-import-btn").show();
  _gaq.push([ "_trackEvent", "Window", "Import/Export" ]);
});

// upon click on restore button
$("#restore-btn").bind("click", function() {
    $.confirm({title: chrome.i18n.getMessage('ui_import_export_confirm_restore_title'),
    message: chrome.i18n.getMessage('ui_import_export_confirm_restore'),
      buttons: {
        Yes: {'class': 'blue', action: restore},
        No: {'class' : 'gray'}
      }
  });
});

function restore() {
var restoreString = localStorage.backupBeforeImport;
  if (restoreString) {
    if (importLocalStorage(restoreString)) {
      localStorage.msg = JSON.stringify({title: chrome.i18n.getMessage("ui_import_export_msg_header"),
        message: chrome.i18n.getMessage("ui_import_export_restore_complete_msg")});
      window.location.reload();
    }
  }
  else {
    $.jGrowl(chrome.i18n.getMessage("ui_import_export_no_restore_msg"), { header: chrome.i18n.getMessage("ui_import_export_msg_header") });
  }
}

// upon click on export button
$("#export-btn").bind("click", function() {
  $("#import-textarea").hide();
  $("#run-import-btn").hide();
  $textArea = $("#export-textarea");
  $textArea.show();

  var exportString = buildExportString();

  $textArea.val(exportString);
  $textArea.select();
});

function buildExportString() {
  var exportDataObj = {};
  var locStor = localStorage;
  for(var i=0, len=locStor.length; i<len; i++) {
    var key = locStor.key(i);
    if (key != "backupBeforeImport" && key != "installed_widgets") { // don't export restore data and installed_widgets
      var value = locStor[key];
      exportDataObj[key] = value;
    }
  }
  var base64str = Base64.encode(JSON.stringify(exportDataObj));
  var dateObj = new Date();
  var fullYearVal = dateObj.getFullYear();
  var monthVal = dateObj.getMonth()+1;
  var dateVal = dateObj.getDate();
  if (dateVal<10) {dateVal='0'+dateVal;}
  if (monthVal<10) {monthVal='0'+monthVal;}

  var exportString = '[ANTP_EXPORT|' + fullYearVal + '-' + monthVal + '-' + dateVal + '|' + chrome.app.getDetails().version + '|' + base64str + ']';
  return exportString;
}


// upon click on run import button
$("#import-export-contents #run-import-btn").bind("click", function() {
  var $textArea = $("#import-textarea");
  var inputStr = $textArea.val().trim();
  if (validateImportString(inputStr))
  {
    if (importLocalStorage(inputStr)) {
      // to display message on page refresh, store it in localstorage
      localStorage.msg = JSON.stringify({title: chrome.i18n.getMessage("ui_import_export_msg_header"),
        message: chrome.i18n.getMessage("ui_import_export_complete_msg")});
      window.location.reload();
    }
  }
});

function validateImportString(importString) {
  if (importString.length == 0) {
    $.jGrowl(chrome.i18n.getMessage("ui_import_export_empty_string_msg"), { header: chrome.i18n.getMessage("ui_import_export_msg_header") });
    return false;
  }
  else {
    var stringParts = importString.split('|');
    if (stringParts.length != 4 || stringParts[0] != "[ANTP_EXPORT" || (new Date(stringParts[1])).toString() == "Invalid Date" || stringParts[3].length < 1) {
      $.jGrowl(chrome.i18n.getMessage("ui_import_export_invalid_string_msg"), { header: chrome.i18n.getMessage("ui_import_export_msg_header") });
      return false;
    }
    else {
      var antpVersion = stringParts[2].split('.');
      if (antpVersion.length != 4) {
        $.jGrowl(chrome.i18n.getMessage("ui_import_export_invalid_string_msg"), { header: chrome.i18n.getMessage("ui_import_export_msg_header") });
        return false;
      }
    }
  }
  return true;
}

function importLocalStorage(importString) {
  importString = importString.substring(0, importString.length-1);
  var tArr = importString.split('|');
  var base64str = tArr[tArr.length-1];
  var exportDataObj = JSON.parse(Base64.decode(base64str));
  localStorage.backupBeforeImport = buildExportString();  // save data before import for restore purpose
  var locStor = localStorage;
  for(var key in exportDataObj) {
    locStor.setItem(key, exportDataObj[key]);
  }
  return true;
}
