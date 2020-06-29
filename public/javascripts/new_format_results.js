function PastContentArrayToJson(row_content) {
  return {
    team: row_content[0],
    round: row_content[1],
    date: row_content[2],
    opposition: row_content[3],
    result: row_content[4],
    score_for: row_content[5],
    score_against: row_content[6],
    goal_kickers: row_content[7],
    best_players: row_content[8],
    image_url: row_content[9],
  }
}

function FutureContentArrayToJson(row_content) {
  return {
    team: row_content[0],
    round: row_content[1],
    date: row_content[2],
    opposition: row_content[3],
    location: row_content[4],
    lcoation_nickname: row_content[5],
    division: row_content[6],
    gender: row_content[7],
    time: row_content[8],
    image_url: row_content[9],
  }
}

// Abstraction to load a HTML template into a given destination with the provided data.
function LoadHTMLTemplate(template_selector, destination, data) {
  $('#buffer').load(template_selector, function () {
    var html = document.getElementById('buffer').innerHTML;
    var output = Mustache.render(html, data);
    $(destination).append(output);
    // Clear the buffer.
    $('#buffer').html('');
  });
}

// Appends the given date to the past-games-container.
function IncludeDate() {
  date = {
    day: "Saturday",
    month: "August",
    day_number: "3",
    year: "2019"
  }
  LoadHTMLTemplate('templates/date-row.html .date', '#past-games-container', date);
}

function FormatPastGames() {

  // Clear current content, populate with only the title.
  $('#past-games-container').html('<p id="past-games-title"><b><i>"If winning is all there is, we want no part of it"</i></b></p>');

  // TODO: This should be checked before every game. For 2020, every  game is played on a Saturday so this is not a high priority
  // for the 2020 season.
  IncludeDate();

  let table = $('#past-games-table').DataTable();
  table.rows().every(function () {
    let row_content = PastContentArrayToJson(this.data());
    LoadHTMLTemplate('templates/past-game.html .past-game', '#past-games-container', row_content);
  });
}

function FormatFutureGames() {

  // Clear current content, populate with only the title.
  $('#future-games-container').html("<p id='future-games-title'><b>WHAT'S ON THIS WEEKEND</b></p>");

  // TODO: This should be checked before every game. For 2020, every  game is played on a Saturday so this is not a high priority
  // for the 2020 season.
  IncludeDate();

  let table = $('#future-games-table').DataTable();
  table.rows().every(function () {
    let row_content = FutureContentArrayToJson(this.data());
    LoadHTMLTemplate('templates/future-game.html .future-game', '#future-games-container', row_content);
  });
}

// Copies the HTML contained in the element provided by the selector to the clipboard.
// TODO: This also needs to read the CSS file and embed it into the HTML so that it can be placed directly into MailChimp.
function CopyHTML(selector) {
  var HTML = document.createElement('textarea');
  HTML.value = document.querySelector(selector).outerHTML;
  document.body.appendChild(HTML);
  HTML.select();
  document.execCommand('copy');
  document.body.removeChild(HTML);
}

function CopyPastGamesHTML() {
  CopyHTML('#past-games-container');
}

function CopyFutureGamesHTML() {
  CopyHTML('#future-games-container');
}