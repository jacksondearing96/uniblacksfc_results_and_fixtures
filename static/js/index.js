function PastContent() {
  return {
    'nickname': "",
    'round': "1",
    'date': "",
    'opposition': "",
    'gender': '',
    'division': '',
    'result': '',
    'score_for': "",
    'score_against': "",
    'goal_kickers': "",
    'best_players': "",
    'image_url': "",
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
    'image_url': "",
  }
}

past_teams = [];
future_teams = [];

function LoadPastGamesTable(initialise_data_table) {
  $('#past-games-table tbody').html('')
  fetch('/past-games-table.html', { method: 'POST', 'Content-Type': "application/json", body: JSON.stringify(past_teams) })
    .then(response => response.text())
    .then(data => {
      $('#past-games-table tbody').append(data);
      if (initialise_data_table) initialise_data_table('#past-games-table');
    });
}

function LoadFutureGamesTable(initialise_data_table) {
  $('#future-games-table tbody').html('');
  fetch('/future-games-table.html', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
    .then(response => response.text())
    .then(data => {
      $('#future-games-table tbody').append(data);
      if (initialise_data_table) initialise_data_table('#future-games-table');
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

function GetTeamsFromServer(callback) {
  fetch('/get_teams', { method: 'GET' })
    .then(response => response.text())
    .then(data => {
      let teams = JSON.parse(data);

      for (i in teams) {
        let past_team = PastContent();
        let future_team = FutureContent();

        past_team.nickname = teams[i].nickname;
        past_team.division = teams[i].division;
        past_team.gender = teams[i].gender;

        future_team.nickname = teams[i].nickname;
        future_team.division = teams[i].division;
        future_team.gender = teams[i].gender;

        past_teams.push(past_team);
        future_teams.push(future_team);
      }

      if (callback) callback();
    });
}

$(document).ready(GetTeamsFromServer(function () {
  LoadPastGamesTable(InitialiseDataTable);
  LoadFutureGamesTable(InitialiseDataTable);
}));

function GetPastGamesFromTable(callback) {
  past_teams = [];
  let table = $('#past-games-table').DataTable();
  table.rows().every(function () {
    let game = PastContentArrayToJson(this.data());
    past_teams.push(game);
    if (past_teams.length == NUMBER_OF_TEAMS) callback();
  });
}

function UpdatePastTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    past_teams[i]['date'] = server_teams[i]['date']
    past_teams[i]['round'] = server_teams[i]['round']
    past_teams[i]['opposition'] = server_teams[i]['opposition']
    past_teams[i]['score_for'] = server_teams[i]['score_for']
    past_teams[i]['score_against'] = server_teams[i]['score_against']
    past_teams[i]['result'] = server_teams[i]['result']
    past_teams[i]['goal_kickers'] = server_teams[i]['goal_kickers']
    past_teams[i]['best_players'] = server_teams[i]['best_players']
    past_teams[i]['image_url'] = server_teams[i]['image_url']
  }
}

function GetPastGames() {
  GetPastGamesFromTable(function () {
    fetch('/get_past_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
      .then(response => response.text())
      .then(data => {
        UpdatePastTeamsWithInfoFromServer(JSON.parse(data));
        LoadPastGamesTable();
      });
  });
}

function GetFutureGamesFromTable(callback) {
  future_teams = [];
  let table = $('#future-games-table').DataTable();
  table.rows().every(function () {
    let game = FutureContentArrayToJson(this.data());
    future_teams.push(game);
    if (future_teams.length == NUMBER_OF_TEAMS) callback();
  });
}

function UpdateFutureTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    future_teams[i].date = server_teams[i]['date']
    future_teams[i].round = server_teams[i]['round']
    future_teams[i]['opposition'] = server_teams[i]['opposition']
    future_teams[i]['location'] = server_teams[i]['location']
    future_teams[i]['time'] = server_teams[i]['time']
    future_teams[i]['image_url'] = server_teams[i]['image_url']
  }
}

function GetFutureGames() {
  GetFutureGamesFromTable(function () {
    fetch('/get_future_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
      .then(response => response.text())
      .then(data => {
        UpdateFutureTeamsWithInfoFromServer(JSON.parse(data));
        LoadFutureGamesTable();
      });
  });
}