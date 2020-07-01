function PastContent() {
  return {
    'nickname': "",
    'round': "X",
    'date': "DD/MM/YY",
    'opposition': "Opposition Name",
    'result': "WIN OR LOSS",
    'score_for': "XX.XX-XXX",
    'score_against': "YY.YY-YYYY",
    'goal_kickers': "List of goal kickers...",
    'best_players': "List of best players...",
    'image_url': "https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png",
  }
}

function FutureContent() {
  return {
    'nickname': "",
    'round': "X",
    'date': "DD/MM/YY",
    'opposition': "Opposition Team",
    'location': "Real Location",
    'location_nickname': "Location Nickname",
    'division': "XY",
    'gender': "Gender",
    'time': "TT:TT AM",
    'image_url': "https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png",
  }
}

past_teams = [];
future_teams = [];

function TeamsToJSON(callback) {

  for (i in teams) {
    let team = teams[i];

    let past_content = PastContent();
    let future_content = FutureContent();

    past_content.nickname = team.nickname_;
    future_content.nickname = team.nickname_;
    future_content.division = team.division_;
    future_content.gender = team.gender_;

    past_teams.push(past_content);
    future_teams.push(future_content);
  }

  callback();
}

function LoadPastGamesTable(initialise_data_table) {

  // Load rows of past games table.
  $('#past-games-table tbody').load('templates/past-games-table-row.html #past-games-table-row', function () {
    var html = document.getElementById('past-games-table-row').outerHTML;
    $("#past-games-table tbody").html('');

    past_teams.forEach((team) => {
      var output = Mustache.render(html, team);
      $("#past-games-table tbody").append(output);
    });

    initialise_data_table('#past-games-table');
  });
}

function LoadFutureGamesTable(initialise_data_table) {

  // Load rows of past games table.
  $('#future-games-table tbody').load('templates/future-games-table-row.html #future-games-table-row', function () {
    var html = document.getElementById('future-games-table-row').outerHTML;
    $("#future-games-table tbody").html('');

    future_teams.forEach((team) => {
      var output = Mustache.render(html, team);
      $("#future-games-table tbody").append(output);
    })

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


$(document).ready(PopulateTeamsFromFile(function () {
  TeamsToJSON(() => {
    LoadPastGamesTable(InitialiseDataTable);
    LoadFutureGamesTable(InitialiseDataTable);
  });
}));