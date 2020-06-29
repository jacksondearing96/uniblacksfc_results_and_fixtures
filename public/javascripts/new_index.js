// Dummy content
var row_content = {
  team: "Div 1 Res",
  round: "1",
  date: "12/7/20",
  opposition: "Goodwood",
  result: "WIN",
  score_for: "10.10-70",
  score_against: "0.0-0",
  goal_kickers: "list of goal kickers...",
  best_players: "list of best players...",
  image_url: "https://images.squarespace-cdn.com/content/v1/5b96fad570e8022dfb162f35/1537319856877-DYI7MP683EAK1VGZZ90O/ke17ZwdGBToddI8pDm48kGXFqw0I8CD12EXMI_-clElZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PIQzZ-45FsDXKdRMPjGAIBAUdanliO1YkD_4OMT5hDjn0/Logo+home-01.png",
}

var future_content = {
  team: "Pup and His Young Dawgs",
  round: "22",
  date: "12/7/20",
  opposition: "Goodwood",
  location: "Bob Neil #1",
  division: "Div 1",
  gender: "Mens",
  time: "12:15",
  image_url: "https://images.squarespace-cdn.com/content/v1/5b96fad570e8022dfb162f35/1537319856877-DYI7MP683EAK1VGZZ90O/ke17ZwdGBToddI8pDm48kGXFqw0I8CD12EXMI_-clElZw-zPPgdn4jUwVcJE1ZvWQUxwkmyExglNqGp0IvTJZamWLI2zvYWH8K3-s_4yszcp2ryTI0HqTOaaUohrI8PIQzZ-45FsDXKdRMPjGAIBAUdanliO1YkD_4OMT5hDjn0/Logo+home-01.png",
}

function LoadPastGamesTable(initialise_data_table) {

  let number_of_teams = 9;

  // Load rows of past games table.
  $('#past-games-table tbody').load('templates/past-games-table-row.html #past-games-table-row', function () {
    var html = document.getElementById('past-games-table-row').outerHTML;
    $("#past-games-table tbody").html('');

    for (let i = 0; i < number_of_teams; ++i) {
      row_content.team = "team" + i.toString();
      var output = Mustache.render(html, row_content);
      $("#past-games-table tbody").append(output);
    }

    initialise_data_table('#past-games-table');
  });
}

function LoadFutureGamesTable(initialise_data_table) {

  let number_of_teams = 9;

  // Load rows of past games table.
  $('#future-games-table tbody').load('templates/future-games-table-row.html #future-games-table-row', function () {
    var html = document.getElementById('future-games-table-row').outerHTML;
    $("#future-games-table tbody").html('');

    for (let i = 0; i < number_of_teams; ++i) {
      future_content.team = "team" + i.toString();
      var output = Mustache.render(html, future_content);
      $("#future-games-table tbody").append(output);
    }

    initialise_data_table('#future-games-table');
  });
}

function InitialiseDataTable(selector) {

  var table;

  const createdCell = function (cell) {
    let original;
    cell.setAttribute('contenteditable', true)
    cell.setAttribute('spellcheck', false)
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent
    })
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = table.row(e.target.parentElement)
        row.invalidate()
      }
    })
  }

  table = $(selector).DataTable({
    'paging': false,
    'bInfo': false,
    'bSort': false,
    'bFilter': false,
    columnDefs: [{
      targets: '_all',
      createdCell: createdCell
    }]
  });
}

$(document).ready(function () {
  LoadPastGamesTable(InitialiseDataTable);
  LoadFutureGamesTable(InitialiseDataTable);
});