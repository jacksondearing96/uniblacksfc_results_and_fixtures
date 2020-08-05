// Toggles the visibility of the 'More' button which reveals a set of buttons
// for increased functionality.
function MoreOptions() {
  var more_options_section = $('#more-options');

  if (more_options_section.css('display') === 'none') {
    more_options_section.css('display', 'block');
    $('#more-options-button').html('Less');
  } else {
    more_options_section.css('display', 'none');
    $('#more-options-button').html('More');
  }
}

// Covers and dulls the page so that no buttons can be pressed until the EndLoading() 
// function is called. Also provides a loading animation. 
function StartLoading() {
  $('#loading-container').css('display', 'block');
}

// Hides the loading cover so that buttons can be pressed again.
function EndLoading() {
  $('#loading-container').css('display', 'none');
}

// Reveals the tables.
function ShowTables() {
  $('#past-games-table').css('display', 'block');
  $('#future-games-table').css('display', 'block');
}