function PastContent() {
  return {
    'nickname': "",
    'round': "X",
    'date': "DD/MM/YY",
    'opposition': "Opposition Name",
    'result': '',
    'score_for': "1.1-11",
    'score_against': "1.1-5",
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

function LoadPastGamesTable(initialise_data_table) {
  fetch('/past-games-table.html', { method: 'POST', 'Content-Type': "application/json", body: JSON.stringify(past_teams) })
    .then(response => response.text())
    .then(data => {
      $('#past-games-table tbody').append(data);
      initialise_data_table('#past-games-table');
    });
}

function LoadFutureGamesTable(initialise_data_table) {
  fetch('/future-games-table.html', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
    .then(response => response.text())
    .then(data => {
      $('#future-games-table tbody').append(data);
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

function GetTeamsFromServer(callback) {
  fetch('/get_teams', { method: 'GET' })
    .then(response => response.text())
    .then(data => {
      let teams = JSON.parse(data);

      for (i in teams) {
        let past_team = PastContent();
        let future_team = FutureContent();

        past_team.nickname = teams[i].nickname;
        future_team.nickname = teams[i].nickname;
        future_team.division = teams[i].nickname;
        future_team.gender = teams[i].nickname;

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

function GetPastGames() {
  GetPastGamesFromTable(function () {
    console.log(past_teams);
    fetch('/get_past_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
      .then(response => response.text())
      .then(data => {
        // let games = JSON.parse(data);

        console.log('Past games: ');
        // console.log(games);

        // Update table here.
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

function GetFutureGames() {
  GetFutureGamesFromTable(function () {
    fetch('/get_future_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
      .then(response => response.text())
      .then(data => {
        // let games = JSON.parse(data);

        console.log('Future games: ');
        // console.log(games);

        // Update table here.
      });
  });
}