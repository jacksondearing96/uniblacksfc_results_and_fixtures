const NUMBER_OF_TEAMS = 8;

const PAST_GAME = true;
const FUTURE_GAME = false;

past_teams = [];
past_table = null;

future_teams = [];
future_table = null;

// Initialises a new default game which can be used for either a past or future game.
function NewGame(is_past_game) {
  return {
    'nickname': "",
    'round': "X",
    'intended_round': '',
    'date': "",
    'year': GetCurrentYear(),
    'landing_page': '',
    'opposition': "",
    'opposition_nickname': '',
    'gender': '',
    'division': '',
    'time': "",
    'location': '',
    'location_nickname': '',
    'result': '',
    'score_for': "",
    'score_against': "",
    'goal_kickers': "",
    'best_players': "",
    'image_url': "",
    'AUFC_logo': "https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png",
    'option': 'SUBSTANDARD',
    'date_HTML': '',
    'error': '',
    'is_past_game': is_past_game,
    'is_final': "false",
    'match_name': '',
    'include': "true"
  };
}

// Initialises a list of winning verbs.
// These will be used to describe uni beating another team.
function InitialiseWinningVerbs() {

  // Ensure there is at least one of these per team so that it can never run out.
  winning_verbs = [
    "smashed",
    "crushed",
    "flogged",
    "conquored",
    "demolished",
    "spanked",
    "annihilated",
    "destroyed",
    "wrecked"
  ];
}

// Takes an array that is extacted from the data tables and applies the array values to
// the relevant past game. This enforces the explicit ordering of the data tables columns.
// TODO: Improve this somehow - surely some way to use destructuring to improve this.
function UpdatePastGameWithArray(game, row_content) {
  game.include = row_content[0];
  game.is_final = row_content[1];
  game.nickname = row_content[2];
  game.round = row_content[3];
  game.intended_round = game.round;
  game.division = row_content[4];
  game.gender = row_content[5];
  game.year = row_content[6];
  game.landing_page = row_content[7];
  game.date = row_content[8];
  game.opposition = row_content[9];
  game.opposition_nickname = row_content[10];
  game.result = row_content[11];
  game.score_for = row_content[12];
  game.score_against = row_content[13];
  game.goal_kickers = row_content[14];
  game.best_players = row_content[15];
  game.image_url = row_content[16];
}

function UpdateFutureGameWithArray(game, row_content) {
  game.include = row_content[0];
  game.is_final = row_content[1];
  game.nickname = row_content[2];
  game.round = row_content[3];
  game.intended_round = game.round;
  game.division = row_content[4];
  game.gender = row_content[5];
  game.year = row_content[6];
  game.landing_page = row_content[7];
  game.date = row_content[8];
  game.opposition = row_content[9];
  game.opposition_nickname = row_content[10];
  game.location = row_content[11];
  game.location_nickname = row_content[12];
  game.time = row_content[13];
  game.image_url = row_content[14];
}

// Returns the current year.
function GetCurrentYear() {
  var date = new Date();
  return date.getFullYear();
}

// Updates the past_teams list based on the row in the table indexed by row_index.
function UpdatePastTeamsFromDOM(row_index) {
  // TODO: Only update the relevant cell. This naively updates the entire row.
  let row = document.getElementById('past-games-table').rows[row_index + 1];
  let row_content = [];

  for (let i = 0; i < row.cells.length; ++i) {
    row_content.push(row.cells[i].innerHTML);
  }

  // Here do the conversion from checkbox to true/false

  UpdatePastGameWithArray(past_teams[row_index], row_content);

  past_table.rows().invalidate().draw();
}

function UpdateFutureTeamsFromDOM(row_index) {

  let row = document.getElementById('future-games-table').rows[row_index + 1];
  let row_content = [];

  for (let i = 0; i < row.cells.length; ++i) {
    row_content.push(row.cells[i].innerHTML);
  }
  UpdateFutureGameWithArray(future_teams[row_index], row_content);

  future_table.rows().invalidate().draw();
}

function InitialisePastGamesTable() {

  const createdCell = function (cell) {
    let original;
    cell.setAttribute('contenteditable', true);
    cell.setAttribute('spellcheck', false);
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent;
    });
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = past_table.row(e.target.parentElement);
        UpdatePastTeamsFromDOM(row.index());
      }
    });
  };

  past_table = $('#past-games-table').DataTable({
    'paging': false,
    'bInfo': false,
    'bSort': false,
    'bFilter': false,
    'data': past_teams,
    'columns': [
      { title: 'Include', data: 'include' },
      { title: 'Final', data: 'is_final' },
      { title: 'Nickname', data: "nickname" },
      { title: 'Round', data: "round" },
      { title: 'Division', data: "division" },
      { title: 'Gender', data: "gender" },
      { title: 'Year', data: "year" },
      { title: 'Landing Page', data: "landing_page" },
      { title: 'Date', data: "date" },
      { title: 'Opposition', data: "opposition" },
      { title: 'Opposition Nickname', data: 'opposition_nickname' },
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
    cell.setAttribute('contenteditable', true);
    cell.setAttribute('spellcheck', false);
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent;
    });
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = future_table.row(e.target.parentElement);
        UpdateFutureTeamsFromDOM(row.index());
      }
    });
  };

  future_table = $('#future-games-table').DataTable({
    'paging': false,
    'bInfo': false,
    'bSort': false,
    'bFilter': false,
    'data': future_teams,
    'columns': [
      { title: 'Include', data: 'include' },
      { title: 'Final', data: 'is_final' },
      { title: 'Nickname', data: "nickname" },
      { title: 'Round', data: "round" },
      { title: 'Division', data: "division" },
      { title: 'Gender', data: "gender" },
      { title: 'Year', data: "year" },
      { title: 'Landing Page', data: 'landing_page' },
      { title: 'Date', data: "date" },
      { title: 'Opposition', data: "opposition" },
      { title: 'Opposition Nickname', data: 'opposition_nickname' },
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

function GetTeamsFromServer() {
  return new Promise(resolve => {
    fetch('/get_teams', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        let teams = JSON.parse(data);

        for (let team of teams) {
          let past_team = NewGame(PAST_GAME);
          let future_team = NewGame(FUTURE_GAME);

          Object.keys(team).forEach(key => {
            past_team[key] = team[key];
            future_team[key] = team[key];
          });

          past_teams.push(past_team);
          future_teams.push(future_team);
        }
        resolve();
      });
  });
}

function GetFutureGamesFromTable(callback) {
  future_teams = [];
  future_table.rows().every(function () {
    let game = UpdateFutureGameWithArray(this.data());
    if (game.nickname === 'Nickname') return; // Skip the title row.
    future_teams.push(game);
    if (future_teams.length == NUMBER_OF_TEAMS) callback();
  });
}

// Takes a date string of the form 'Sat 12 Sep' and a year and converts them into
// a longer format eg. 'Saturday 12 September, 2020'.
function ExpandDate(date, year) {
  if (date == null || date == '') return '';

  d = new Date(date + ' ' + year);
  const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
  const day_name = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(d);

  return `${day_name} ${d.getDate()} ${month}, ${year}`;
}

// Takes the teams retrieved from the server that have been populated with sportstg info 
// and inserts the fields of the server team into the given teams data structure.
function UpdateTeamsWithTeamsFromServer(teams, server_teams, table) {
  if (teams.length != server_teams.length) {
    console.log(teams)
    console.log(server_teams)
    console.error('Updating teams with server teams error - different sizes.');
  }

  for (let i in server_teams) {
    // Apply the updates from the server team.
    Object.keys(server_teams[i]).forEach(key => {
      teams[i][key] = server_teams[i][key];
    });

    // Additional processing.
    teams[i].date = ExpandDate(teams[i].date, teams[i].year);

    if (teams[i].opposition in override_image_urls) {
      teams[i].image_url = override_image_urls[teams[i].opposition];
    }
  }
  table.rows().invalidate().draw();
}

function GetPastGames() {
  return new Promise(resolve => {
    fetch('/get_past_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
      .then(response => response.text())
      .then(data => {
        UpdateTeamsWithTeamsFromServer(past_teams, JSON.parse(data), past_table);
        resolve();
      });
  });
}

function GetFutureGames() {
  return new Promise(resolve => {
    fetch('/get_future_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
      .then(response => response.text())
      .then(data => {
        UpdateTeamsWithTeamsFromServer(future_teams, JSON.parse(data), future_table);
        resolve();
      });
  });
}

// Takes a score string of the form '10.6-66' and returns the total score Eg. 66.
// Returns -1 upon failure.
function GetScoreTotal(score_str) {
  if (score_str === undefined || score_str === null) return -1;
  var dash_index = score_str.indexOf('-');
  if (dash_index == -1) return -1;
  var score_for = score_str.substring(dash_index + 1, score_str.length);
  return Number(score_for);
}

// Takes a game and populates the verb describing whether uni won, lost or drew. If uni won,
// an unique arrogant verb eg. 'smashed' or 'destroyed' is applied.
function PopulateWinOrLossVerb(game) {

  if (winning_verbs.length === 0) console.error('Winning verbs array is empty!');

  if (game.result === 'BYE') return;

  if (game.result === 'FORFEIT' || game.result === 'OPPOSITION_FORFEIT') {
    game.result = 'forfeit';
    return;
  }

  // These will come from the server.
  // Generic results are the ones we want to replace with other
  // text so set these empty. Other results we want keep or maintain.
  if (game.result == 'WIN' || game.result == 'LOSS') {
    game.result = '';
  }

  // If there is already a result present, skip.
  if (game.result !== '') return;

  // Get the scores.
  const score_for = GetScoreTotal(game.score_for);
  const score_against = GetScoreTotal(game.score_against);

  if (score_for > score_against) {
    // Win
    let random_index = Math.floor(Math.random() * winning_verbs.length);
    game.result = winning_verbs[random_index];

    // Remove this verb so that it doesn't get repeated.
    winning_verbs.splice(random_index, 1);
  }
  else if (score_for === score_against) {
    // Draw
    game.result = "drew against";
  }
  else {
    // Loss
    game.result = "def by";
  }
}

// Takes a game and populates it with nicknames for its opposition and location.
function PopulateNicknames(game) {

  // Incase this has already been flagged an error, remove it so that they do not accumulate.
  if (game.opposition_nickname.includes('ERROR')) game.opposition_nickname = '';
  let opposition_nickname = FindNickname(nicknames, game.opposition);
  game.opposition_nickname = (opposition_nickname === null) ? 'ERROR' : opposition_nickname;

  if (game.location_nickname.includes('ERROR')) game.location_nickname = game.location_nickname.replace('ERROR', '');
  let location_nickname = FindNickname(ground_names, game.location);
  game.location_nickname = (location_nickname === null) ? game.location_nickname + 'ERROR' : location_nickname;
}

// Takes a map of options (contains name:nickname pairs) and trys to find the best match.
// Capable of finding partial matches but returns null if no match could be found.
function FindNickname(options, name) {
  inconclusives = [
    '',
    'Saint',
    'North',
    'South',
    'East',
    'West',
    'The'
  ];

  if (name === undefined || name === null) return null;

  for (let i in inconclusives) {
    if (name == inconclusives[i]) return null;
  }

  // Exact match.
  for (let option in options) {
    if (option === name) {
      return (options[option] == '') ? option : options[option];
    }

    // Check to see if it is already a nickname.
    if (options[option] === name) return name;
  }

  // Match that contains the given name.
  for (let option in options) {
    if (option.includes(name)) {
      return (options[option] == '') ? option : options[option];
    }
  }

  // Remove apostrophe if it exists.
  if (name.includes("'")) {
    name = name.replace("'", '');
    return FindNickname(options, name);
  }

  // Remove the last word and try again.
  if (name.includes(' ')) {
    var lastIndex = name.lastIndexOf(" ");
    name = name.substring(0, lastIndex);
    if (name.length <= 3) return null;
    return FindNickname(options, name);
  }

  return null;
}

// Loads a HTML template with the given data and appends it to the list given by destination.
function LoadHTMLTemplate(template_selector, team) {
  return new Promise(resolve => {
    fetch(template_selector, { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(team) })
      .then(response => response.text())
      .then(HTML => {
        //ReOrderAndPrintTeams(final_destination);
        resolve(HTML);
      });
  });
}

// Appends the given date to the past-games-container.
function DateHTML(team) {
  if (team.result === 'BYE') return '';
  return team.date;
}

// Returns the week number, used to determine which team (mens/womens) should be listed first.
Date.prototype.getWeekNumber = function () {
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

function Swap(list, i, j) {
  let temp = list[i];
  list[i] = list[j];
  list[j] = temp;
}

// Returns the Javascript date object that represents the date contained within the given team.
function getDateObject(team) {
  return new Date(Date.parse(team.date + ' ' + team.year));
}

// Reorders the teams such that the mens/womens teams alternate between the top position.
function ReOrderTeams(teams) {

  // Default ordering.
  const order = [
    'Benny and His Jets', 'Moodog and His A Grade Vintage', 'Pup and His Young Dawgz',
    'The Big Lez Show', 'The Chardonnay Socialists', 'The B@stards', 'The Brady Bunch', 'THE SCUM'];

  // Alternate mens/womens being first every week (according to the week of div1 mens game).
  if (getDateObject(teams[0]).getWeekNumber() % 2 == 1) {
    Swap(order, 0, 1);
    Swap(order, 2, 3);
  }

  // Sort teams according to hard-coded order.
  teams.sort((a, b) => {
    return order.indexOf(a.nickname) - order.indexOf(b.nickname);
  });

  // Perform a stable sort according to the year -> month -> date.
  teams.sort((a, b) => {
    const aDate = getDateObject(a);
    const bDate = getDateObject(b);

    const yearDifference = aDate.getFullYear() - bDate.getFullYear();
    const monthDifference = aDate.getMonth() - bDate.getMonth();
    const dayDifference = aDate.getDate() - bDate.getDate();

    if (yearDifference != 0) return yearDifference;
    if (monthDifference != 0) return monthDifference;
    return dayDifference;
  });

  // Function to determine if two dates are the same.
  const sameDate = (a, b) => {
    return a.getFullYear() == b.getFullYear()
      && a.getMonth() == b.getMonth()
      && a.getDate() == b.getDate();
  };

  // Include the date in the HTML for the first of each day.
  let prev_date = null;
  for (let team of teams) {
    if (prev_date === null || !sameDate(prev_date, getDateObject(team))) {
      team.date_HTML = DateHTML(team);
    }
    prev_date = getDateObject(team);
  }

  // Place BYEs at the bottom.
  teams.sort((a, b) => {
    return Number(a.result === 'BYE') - Number(b.result === 'BYE');
  });
}

// Ignores the actual names of uni home grounds becuase everyone knows these already. Surrounds all
// other ground names with parenthases so that if can be distinguished from the ground nickname in the HTML.
function ProcessLocation(game) {
  if (game.location === 'University Oval' || game.location === 'Fred Bloch Oval' || game.location === '') {
    game.location = '';
    return;
  }
  game.location = '(' + game.location + ')';
}

function FormatGames(container_selector, teams, title_HTML, server_path) {
  return new Promise(async (resolve) => {

    // Reveal the container.
    $(container_selector).css('display', 'block');

    // Clear current content, populate with only the title.
    $(container_selector).html(title_HTML);

    ReOrderTeams(teams);

    for (let team of teams) ProcessLocation(team);

    $(container_selector).append(await LoadHTMLTemplate(server_path, teams));

    resolve();
  });
}

function FormatPastGames() {
  const past_games_title = '<p id="past-games-title"><b><i>"If winning is all there is, we want no part of it"</i></b></p>';
  const past_server_path = '/past-game.html';

  return new Promise(resolve => {
    FormatGames('#past-games-container', past_teams, past_games_title, past_server_path)
      .then(() => resolve());
  });
}

function FormatFutureGames() {
  const future_games_title = "<p id='future-games-title'><b>WHAT'S ON THIS WEEKEND</b></p>";
  const future_server_path = '/future-game.html';

  return new Promise(resolve => {
    FormatGames('#future-games-container', future_teams, future_games_title, future_server_path)
      .then(() => resolve());
  });
}

function PopulateTablesWithNicknamesAndVerbs() {
  return new Promise(resolve => {
    InitialiseWinningVerbs();

    for (let i in past_teams) {
      PopulateWinOrLossVerb(past_teams[i]);
      PopulateNicknames(past_teams[i]);
    }

    for (let i in future_teams) PopulateNicknames(future_teams[i]);

    past_table.rows().invalidate().draw();
    future_table.rows().invalidate().draw();

    resolve();
  });
}

// Retrieves the past and future games from the server and formats the substandard sections.
function AutomateSubstandard() {
  StartLoading();
  Promise.all([GetPastGames(), GetFutureGames()])
    .then(async () => {
      await PopulateTablesWithNicknamesAndVerbs();
      Promise.all([FormatPastGames(), FormatFutureGames()])
        .then(() => EndLoading());
    });
}

// This can easily work to disclude teams outside of the desired range.
// But this will require more work to actually find teams in the range.
function InitialiseDateSelector() {
  $('input[name="daterange"]').daterangepicker({
    opens: 'left'
  }, function (start, end, label) {
    dateStart = start;
    dateEnd = end;
    console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
  });
}

async function InitialisePage() {
  StartLoading();

  InitialiseDateSelector();
  await UpdateCacheFromDatabase();

  // Get all the resources we need from the cache asynchronously.
  const resources_from_cache = [
    GetTeamsFromServer(),
    GetNicknamesFromCache(),
    GetGroundNamesFromCache(),
    GetOverrideImageUrlsFromCache()
  ];

  // Once all the resources have been aquired, initialise the tables.
  Promise.all(resources_from_cache).then(() => {
    InitialisePastGamesTable();
    InitialiseFutureGamesTable();
    EndLoading();
  });
}

$(document).ready(() => InitialisePage());