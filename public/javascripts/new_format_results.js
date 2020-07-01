const NUMBER_OF_TEAMS = 8;

function PastContentArrayToJson(row_content) {
  return {
    nickname: row_content[0],
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
    nickname: row_content[0],
    round: row_content[1],
    date: row_content[2],
    opposition: row_content[3],
    location: row_content[4],
    location_nickname: row_content[5],
    division: row_content[6],
    gender: row_content[7],
    time: row_content[8],
    image_url: row_content[9],
  }
}

future_games_HTML = [];
past_games_HTML = [];

// Abstraction to load a HTML template into a given destination with the provided data.
function LoadHTMLTemplate(template_selector, destination, data, callback) {
  $('#buffer').load(template_selector, function () {
    var html = document.getElementById('buffer').innerHTML;
    var output = Mustache.render(html, data);
    $(destination).append(output);
    // Clear the buffer.
    $('#buffer').html('');

    if (callback) callback();
  });
}

// Loads a HTML template with the given data and appends it to the list given by destination.
function LoadHTMLTemplateToList(template_selector, destination, data, final_destination) {
  $('#buffer').load(template_selector, function () {
    var html = document.getElementById('buffer').innerHTML;
    var output = Mustache.render(html, data);
    destination.push(output);

    // Clear the buffer.
    $('#buffer').html('');
    ReOrderTeams(final_destination);
  });
}

// Appends the given date to the past-games-container.
function IncludeDate(selector) {
  date = {
    day: "Saturday",
    month: "MMMM",
    day_number: "DD",
    year: "YYYY"
  }
  let date_HTML = "<p class='date'>\
                     <b>" + date.day + ", " + date.month + " " + date.day_number + ", " + date.year + "</b>\
                  </p>";
  $(selector).append(date_HTML);
}

// Returns the week number, used to determine which team (mens/womens) should be listed first.
Date.prototype.getWeekNumber = function () {
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

// Reorders the teams such that the mens/womens teams alternate between the top position.
// Also prints the HTML content to the relevant container.
function ReOrderTeams(selector) {

  let list = []
  list = selector.includes('past') ? list = past_games_HTML : list = future_games_HTML;

  // This should only be done when all the teams have been completed.
  if (list.length !== NUMBER_OF_TEAMS) return;

  let womens_div_1 = list[6];
  let womens_div_2 = list[7];

  const no_delete = 0;
  let insert_index = 0;

  // Alternate mens/womens being first every week.
  if ((new Date().getWeekNumber()) % 2 == 0) ++insert_index;

  list.splice(insert_index, no_delete, womens_div_1);
  list.splice(insert_index + 2, no_delete, womens_div_2);
  list.pop();
  list.pop();

  for (let i = 0; i < list.length; ++i) {
    $(selector).append(list[i]);
  }
}

function FormatPastGames() {

  // Clear current content, populate with only the title.
  $('#past-games-container').html('<p id="past-games-title"><b><i>"If winning is all there is, we want no part of it"</i></b></p>');

  // TODO: This should be checked before every game. For 2020, every  game is played on a Saturday so this is not a high priority
  // for the 2020 season.
  IncludeDate('#past-games-container');

  past_games_HTML = [];

  let table = $('#past-games-table').DataTable();
  table.rows().every(function () {
    let row_content = PastContentArrayToJson(this.data());
    LoadHTMLTemplateToList('templates/past-game.html .past-game', past_games_HTML, row_content, '#past-games-container');
  });
}

function FormatFutureGames() {

  // Clear current content, populate with only the title.
  $('#future-games-container').html("<p id='future-games-title'><b>WHAT'S ON THIS WEEKEND</b></p>");

  // TODO: This should be checked before every game. For 2020, every  game is played on a Saturday so this is not a high priority
  // for the 2020 season.
  IncludeDate('#future-games-container');

  future_games_HTML = []

  let table = $('#future-games-table').DataTable();
  table.rows().every(function () {
    let row_content = FutureContentArrayToJson(this.data());
    LoadHTMLTemplateToList('templates/future-game.html .future-game', future_games_HTML, row_content, '#future-games-container');
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