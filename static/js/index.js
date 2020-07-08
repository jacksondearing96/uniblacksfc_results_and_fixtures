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
    'date': "",
    'opposition': "",
    'location': "",
    'location_nickname': ".",
    'division': "",
    'gender': "",
    'time': "",
    'image_url': "",
  }
}

past_teams = [];
past_table = null;

future_teams = [];
future_table = null;

// TODO: Make use of browser localStorage !!!

function UpdatePastTeamsFromDOM() {
  past_table.rows().every(function (row_index) {
    let row = document.getElementById('past-games-table').rows[row_index];
    let row_content = [];
    for (let i = 0; i < row.cells.length; ++i) {
      row_content.push(row.cells[i].innerHTML);
    }
    past_teams[row_index] = PastContentArrayToJson(row_content);
  });
}

function UpdateFutureTeamsFromDOM() {
  future_table.rows().every(function (row_index) {
    let row = document.getElementById('future-games-table').rows[row_index];
    let row_content = [];
    for (let i = 0; i < row.cells.length; ++i) {
      row_content.push(row.cells[i].innerHTML);
    }
    future_teams[row_index] = FutureContentArrayToJson(row_content);
  });
}

function InitialisePastGamesTable() {

  const createdCell = function (cell) {
    let original;
    cell.setAttribute('contenteditable', true)
    cell.setAttribute('spellcheck', false)
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent
    })
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = past_table.row(e.target.parentElement)
        UpdatePastTeamsFromDOM();
      }
    })
  }

  past_table = $('#past-games-table').DataTable({
    'paging': false,
    'bInfo': false,
    'bSort': false,
    'bFilter': false,
    'data': past_teams,
    'columns': [
      { title: 'Nickname', data: "nickname" },
      { title: 'Round', data: "round" },
      { title: 'Division', data: "division" },
      { title: 'Gender', data: "gender" },
      { title: 'Date', data: "date" },
      { title: 'Opposition', data: "opposition" },
      { title: 'Result', data: "result" },
      { title: 'Score For', data: "score_for" },
      { title: 'Score Against', data: "score_against" },
      { title: 'Goal Kickers', data: "goal_kickers" },
      { title: 'Best Players', data: "best_players" },
      { title: 'Image Url', data: "image_url" }
    ],
    columnDefs: [{
      targets: '_all',
      createdCell: createdCell
    }],
  });
}

function InitialiseFutureGamesTable() {

  const createdCell = function (cell) {
    let original;
    cell.setAttribute('contenteditable', true)
    cell.setAttribute('spellcheck', false)
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent
    })
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = future_table.row(e.target.parentElement)
        UpdateFutureTeamsFromDOM();
      }
    })
  }

  future_table = $('#future-games-table').DataTable({
    'paging': false,
    'bInfo': false,
    'bSort': false,
    'bFilter': false,
    'data': future_teams,
    'columns': [
      { title: 'Nickname', data: "nickname" },
      { title: 'Round', data: "round" },
      { title: 'Division', data: "division" },
      { title: 'Gender', data: "gender" },
      { title: 'Date', data: "date" },
      { title: 'Opposition', data: "opposition" },
      { title: 'Location', data: "location" },
      { title: 'Location Nickname', data: "location_nickname" },
      { title: 'Time', data: "time" },
      { title: 'Image Url', data: "image_url" }
    ],
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

function UpdatePastTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    past_teams[i]['date'] = ExpandDate(server_teams[i]['date'])
    past_teams[i]['round'] = server_teams[i]['round']
    past_teams[i]['opposition'] = server_teams[i]['opposition']
    past_teams[i]['score_for'] = server_teams[i]['score_for']
    past_teams[i]['score_against'] = server_teams[i]['score_against']
    past_teams[i]['result'] = server_teams[i]['result']
    past_teams[i]['goal_kickers'] = server_teams[i]['goal_kickers']
    past_teams[i]['best_players'] = server_teams[i]['best_players']
    past_teams[i]['image_url'] = server_teams[i]['image_url']
  }
  past_table.rows().invalidate().draw();
}

function GetPastGames(callback) {
  fetch('/get_past_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
    .then(response => response.text())
    .then(data => {
      UpdatePastTeamsWithInfoFromServer(JSON.parse(data));
      if (callback) callback();
    });
}

function GetFutureGamesFromTable(callback) {
  future_teams = [];
  future_table.rows().every(function () {
    let game = FutureContentArrayToJson(this.data());
    future_teams.push(game);
    if (future_teams.length == NUMBER_OF_TEAMS) callback();
  });
}

function ExpandDate(date) {
  const day_abbreviations = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];

  const day_full_length = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const month_abbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const month_full_length = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  for (let i = 0; i < day_abbreviations.length; ++i) {
    date = date.replace(day_abbreviations[i], day_full_length[i]);
  }

  for (let i = 0; i < month_abbreviations.length; ++i) {
    date = date.replace(month_abbreviations[i], month_full_length[i]);
  }

  return date;
}

override_image_urls = { "Morphettville Park": "https://mpwfc.files.wordpress.com/2014/05/mpwfc_logo.png?w=676", };

function UpdateFutureTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    future_teams[i].date = ExpandDate(server_teams[i]['date']);
    future_teams[i].round = server_teams[i]['round']
    future_teams[i]['opposition'] = server_teams[i]['opposition']
    future_teams[i]['location'] = server_teams[i]['location']
    future_teams[i]['time'] = server_teams[i]['time']

    if (future_teams[i]['opposition'] in override_image_urls) {
      future_teams[i]['image_url'] = override_image_urls[future_teams[i]['opposition']]
    } else {
      future_teams[i]['image_url'] = server_teams[i]['image_url']
    }
  }
  future_table.rows().invalidate().draw();
}

function GetFutureGames(callback) {
  fetch('/get_future_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
    .then(response => response.text())
    .then(data => {
      UpdateFutureTeamsWithInfoFromServer(JSON.parse(data));
      if (callback) callback();
    });
}

function UpdateTables(callback) {
  UpdateTablesHelper(past_teams, future_teams, function () {
    past_table.rows().invalidate().draw();
    future_table.rows().invalidate().draw();
    if (callback) callback();
  });
}

function FormatPastGames() {
  FormatPastGamesHelper(past_teams)
}

function FormatFutureGames() {
  FormatFutureGamesHelper(future_teams)
}

function Automate() {
  GetPastGames(function () {
    GetFutureGames(function () {
      UpdateTables(function () {
        FormatPastGames();
        FormatFutureGames();
      });
    });
  });
}

$(document).ready(GetTeamsFromServer(function () {
  InitialisePastGamesTable();
  InitialiseFutureGamesTable();
}));