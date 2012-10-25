if(localStorage.getItem("StockNotepad") === null) {
  localStorage.setItem("StockNotepad", parent.chrome.i18n.getMessage("notepad_default") );
}

$(document).ready(function($) {
  if (localStorage.getItem("StockNotepad")) {
    $("#notepad").val( localStorage.getItem("StockNotepad") );
  }

  $("#notepad").live("keyup", function() {
    localStorage.setItem("StockNotepad", $(this).val() );
  });
});

  $(window).bind("storage", function (e) {
    if ( e.originalEvent.key === "StockNotepad" ) {
      $("#notepad").val( localStorage.getItem("StockNotepad") );
    }
  });
