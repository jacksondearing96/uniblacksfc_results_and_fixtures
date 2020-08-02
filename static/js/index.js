const NUMBER_OF_TEAMS = 8;

past_teams = [];
past_table = null;

future_teams = [];
future_table = null;

future_games_HTML = [];
past_games_HTML = [];
winning_verbs = [];

// Setters so these variables can be set from a different JS file.
function SetFutureTeams(teams) {
  future_teams = teams;
}

function SetPastTeams(teams) {
  past_teams = teams;
}

function PastContent() {
  return {
    'nickname': "",
    'round': "X",
    'date': "",
    'year': GetCurrentYear(),
    'landing_page': '',
    'opposition': "",
    'opposition_nickname': '',
    'gender': '',
    'division': '',
    'result': '',
    'score_for': "",
    'score_against': "",
    'goal_kickers': "",
    'best_players': "",
    'image_url': "",
    'option': 'SUBSTANDARD',
    'location': '',
    'location_nickname': '',
    'error': ''
  }
}

function FutureContent() {
  return {
    'nickname': "",
    'round': "X",
    'date': "",
    'year': GetCurrentYear(),
    'landing_page': '',
    'opposition': "",
    'opposition_nickname': '',
    'location': "",
    'location_nickname': "",
    'division': "",
    'gender': "",
    'time': "",
    'image_url': "",
    'error': ''
  }
}

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

// TODO: Surely there is a built in Date() method that can handle these conversions.
const day_abbreviations = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday'
}

const month_abbreviations = {
  'Jan': 'January',
  'Feb': 'February',
  'Mar': 'March',
  'Apr': 'April',
  'May': 'May',
  'Jun': 'June',
  'Jul': 'July',
  'Aug': 'August',
  'Sep': 'September',
  'Oct': 'October',
  'Nov': 'November',
  'Dec': 'December'
};

function UpdatePastGameWithArray(game, row_content) {
  game.nickname = row_content[0];
  game.round = row_content[1];
  game.division = row_content[2];
  game.gender = row_content[3];
  game.year = row_content[4];
  game.landing_page = row_content[5];
  game.date = row_content[6];
  game.opposition = row_content[7];
  game.opposition_nickname = row_content[8];
  game.result = row_content[9];
  game.score_for = row_content[10];
  game.score_against = row_content[11];
  game.goal_kickers = row_content[12];
  game.best_players = row_content[13];
  game.image_url = row_content[14];
}

function UpdateFutureGameWithArray(game, row_content) {
  game.nickname = row_content[0];
  game.round = row_content[1];
  game.division = row_content[2];
  game.gender = row_content[3];
  game.year = row_content[4];
  game.landing_page = row_content[5];
  game.date = row_content[6];
  game.opposition = row_content[7];
  game.opposition_nickname = row_content[8];
  game.location = row_content[9];
  game.location_nickname = row_content[10];
  game.time = row_content[11];
  game.image_url = row_content[12];
}

function GetCurrentYear() {
  var date = new Date();
  return date.getFullYear();
}

// TODO: Make use of browser localStorage !!!

function UpdatePastTeamsFromDOM(row_index) {

  // TODO: Only update the relevant cell. This naively updates the entire row.
  let row = document.getElementById('past-games-table').rows[row_index + 1];
  let row_content = [];

  for (let i = 0; i < row.cells.length; ++i) {
    row_content.push(row.cells[i].innerHTML);
  }
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
    cell.setAttribute('contenteditable', true)
    cell.setAttribute('spellcheck', false)
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent
    })
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = past_table.row(e.target.parentElement)
        UpdatePastTeamsFromDOM(row.index());
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
    cell.setAttribute('contenteditable', true)
    cell.setAttribute('spellcheck', false)
    cell.addEventListener("focus", function (e) {
      original = e.target.textContent
    })
    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = future_table.row(e.target.parentElement)
        UpdateFutureTeamsFromDOM(row.index());
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
  return new Promise((resolve) => {
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
          past_team.option = 'SUBSTANDARD';

          future_team.nickname = teams[i].nickname;
          future_team.division = teams[i].division;
          future_team.gender = teams[i].gender;

          past_teams.push(past_team);
          future_teams.push(future_team);
        }
        resolve();
      });
  });
}

function CondenseIfRequired(list) {
  if (Array.isArray(list) === false) return list;
  var condensed = '';
  for (let i in list) {
    element = list[i];
    if (i !== 0) condensed += ', ';
    condensed += element.name + element.goals;
  }
  return condensed;
}

function UpdatePastTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    if (server_teams[i]['error'] == 'SERVER ERROR') {
      continue;
    }
    past_teams[i]['date'] = ExpandDate(server_teams[i]['date'])
    past_teams[i]['round'] = server_teams[i]['round']
    past_teams[i]['opposition'] = server_teams[i]['opposition']
    past_teams[i]['score_for'] = server_teams[i]['score_for']
    past_teams[i]['score_against'] = server_teams[i]['score_against']
    past_teams[i]['result'] = server_teams[i]['result']
    past_teams[i]['goal_kickers'] = server_teams[i]['goal_kickers']
    past_teams[i]['best_players'] = server_teams[i]['best_players']
    past_teams[i]['image_url'] = server_teams[i]['image_url']
    past_teams[i]['landing_page'] = server_teams[i]['url']
    past_teams[i]['location'] = server_teams[i]['location']
    past_teams[i]['error'] = server_teams[i]['error']

    if (past_teams[i]['opposition'] in override_image_urls) {
      past_teams[i]['image_url'] = override_image_urls[past_teams[i]['opposition']]
    } else {
      past_teams[i]['image_url'] = server_teams[i]['image_url']
    }
  }
  past_table.rows().invalidate().draw();
}

function GetPastGames() {
  return new Promise((resolve) => {
    fetch('/get_past_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
      .then(response => response.text())
      .then(data => {
        UpdatePastTeamsWithInfoFromServer(JSON.parse(data));
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

function ExpandDate(date) {

  if (date == null || date == '') {
    return ''
  }

  Object.keys(day_abbreviations).forEach((key) => {
    date = date.replace(key, day_abbreviations[key]);
  })

  Object.keys(month_abbreviations).forEach((key) => {
    date = date.replace(key, month_abbreviations[key]);
  })

  return date;
}

override_image_urls = { "Morphettville Park": "https://mpwfc.files.wordpress.com/2014/05/mpwfc_logo.png?w=676", };

function UpdateFutureTeamsWithInfoFromServer(server_teams) {
  for (i in server_teams) {
    future_teams[i].date = ExpandDate(server_teams[i]['date']);
    future_teams[i].round = server_teams[i]['round']
    future_teams[i].opposition = server_teams[i]['opposition']
    future_teams[i].location = server_teams[i]['location']
    future_teams[i].time = server_teams[i]['time']
    future_teams[i].landing_page = server_teams[i]['url']
    future_teams[i].result = server_teams[i]['result']
    future_teams[i].error = server_teams[i]['error']

    if (future_teams[i]['opposition'] in override_image_urls) {
      future_teams[i]['image_url'] = override_image_urls[future_teams[i]['opposition']]
    } else {
      future_teams[i]['image_url'] = server_teams[i]['image_url']
    }
  }
  future_table.rows().invalidate().draw();
}

function GetFutureGames() {
  return new Promise((resolve) => {
    fetch('/get_future_games', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(future_teams) })
      .then(response => response.text())
      .then(data => {
        UpdateFutureTeamsWithInfoFromServer(JSON.parse(data));
        resolve();
      });
  });
}

function GetScoreTotal(score_str) {
  if (score_str === null) return -1;
  var dash_index = score_str.indexOf('-');
  if (dash_index == -1) return -1;
  var score_for = score_str.substring(dash_index + 1, score_str.length);
  return Number(score_for);
}

function PopulateWinOrLossVerb(game) {

  if (winning_verbs.length === 0) {
    console.error('Winning verbs array is empty!');
  }

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
  if (game.result !== '') {
    return;
  }

  const score_for = GetScoreTotal(game.score_for);
  const score_against = GetScoreTotal(game.score_against);

  if (score_for > score_against) {
    // Win
    let random_index = Math.floor(Math.random() * winning_verbs.length);
    game.result = winning_verbs[random_index];

    // Remove this verb so that it doesn't get repeated.
    winning_verbs.splice(random_index, 1);
  }
  else if (score_for == score_against) {
    // Draw
    game.result = "drew against";
  }
  else {
    // Loss
    game.result = "def by";
  }
}

// TODO: This could be improved by separating the database's content from 
// my personal ammendments. Then the database contennt could be periodically updated
// without erasing all my changes.
nicknames = { "Edwardstown": "Edwards Clowns", "Broadview": "Abroadsview", "Athelstone": "The Raggies", "Henley Greek": "Henley Geeks", "Goodwood Saints": "Goodwood Sinners", "Port District": "Port Red Light District", "Tea Tree Gully": "Tee Hee Gully", "Kilburn": "The Kilburn Motorcyle & Tattoo Club", "PHOS Camden": "PHOS Williams", "Portland": "Flagon of Portland", "SMOSH West Lakes": "SMUSH West Fakes", "Rostrevor OC": "Ross and Trevor", "Greenacres": "Gang Green Acres", "Salisbury North": "Salisbury NSE&W", "Gaza": "Nice Gaza", "Hectorville": "Hannibal Hectorville", "Colonel Light Gardens": "Colonel Light's Garbage", "Adelaide Lutheran": "Adelaide Loos", "Glenunga": "Glenunga & Thirst", "Pembroke OS.": "Pembrokedown", "Unley": "Ugly", "CB.C.OC": "Can The Blacks Crap on the Catholics", "Mitcham": "Robert Mitchum", "Plympton": "Pimp Town", "Kenilworth": "Whats A Kenilworth", "Henley": "Henley-definitely-not-on-Drugs", "Sacred Heart OC": "Sacred Fart", "Pooraka": "The Poos", "Brahma Lodge": "Bananaramafudge", "Houghton Districts": "Hout and About", "Eastern Park": "Far Eastern Park", "Flinders University": "Karl Marx University", "Ovingham": "The Roving Hams", "Flinders Park": "Flinders Parkour", "Old Ignatians": "Very Old Ignatians", "Prince Alfred OC": "The Tarnished Spooners", "St Peters OC": "The Silver Spooners", "Scotch OC": "Scotch on the Rocks", "Seaton Ramblers": "The Seaton Trams", "Walkerville": "Max Walkerville", "Gepps Cross": "Gepps Double Cross", "Modbury": "Mudbury", "Paralowie": "Paralowsie", "Salisbury West": "Salisbury NSE&W", "Salvation Army": "The Tambourine Bangers", "Bye": "", "Wingfield Royals": "The Wingfield Dump", "Rosewater": "Sweet Smelling Rosewater", "Pulteney OS.": "Paltry Old Socks", "Ingle Farm": "Giggle Farm", "Salisbury": "Smallsbury", "Alberton United": "Al & Bert's Unit", "Central United": "Central DisUnited", "North Pines": "North Pines for a Win", "North Haven": "North Haven for Hobos", "Payneham Norwood Union": "Payneham in the Arse", "Brighton District & OS.": "Brighton Bummers", "Adelaide High OS.": "Ka Ringa Ronga Ringa", "Ethelton": "Ethel Weights a Ton", "SMOSH": "SMUSH", "West Lakes": "West Fakes", "Norwood Union": "Norwood Non-Workers Union", "Saint Pauls OS.": "Saint Paul", "Salisbury Central": "Salisbury Sickoes", "Riverside": "Down by the River Side", "Campbelltown Magill": "Donald Campbelltown", "Burnside Kensington": "Burn Down Kensington", "Lockleys": "Lock & Keys", "Hope Valley": "No Hope Valley", "West Croydon": "West Croydon Bleau", "Cedars": "The Conceders", "Greek Camden": "", "Woodville South": "Woodville NSE&W", "Edwardstown Baptist": "", "Fitzroy": "If the Cap Fits Roy", "Kenilworth Colonel Light": "", "Ferryden Park": "Fairey Den Park", "Plympton High OS.": "PHOS Williams", "Port Adelaide Presbyterian": "", "Para Hills": "Para Dills", "AN.Z. Bank": "", "Woodville District": "", "Immanuel OS.": "", "Australian National Institute": "", "Brighton High OS.": "", "Para District Uniting": "", "SA Cats": "", "SAIT": "", "Glandore": "Glad Whore", "Greek": "Bleek", "Saint Dominics": "", "Saint Peters YCW": "", "Post Tel Institute": "", "Renown Park": "Unrenown Park", "Adelaide College": "", "Murray Park Teachers": "", "Saint Raphaels": "", "National Bank": "", "Banksia Park High OS.": "", "Woodville West": "", "Salisbury College": "", "Port Adelaide United": "", "Taperoo": "", "Eastwood": "", "Albert Sports": "", "The Parks": "", "Henley District & OS.": "", "Sydney University": "", "Monash University": "", "Melbourne University": "", "LaTrobe University": "", "Macquarie University": "", "Queensland University": "", "Deakin University": "", "Philip University": "", "Northern Territory University": "", "Victoria University": "", "Australian National University": "", "Australian Defence Academy": "", "Wollongong University": "", "Swinburne University": "", "Charles Sturt Mitchell University": "", "NSW University": "", "Golden Grove": "Golden Grovel", "Westminster OS.": "Westminster Cathedral", "Internal Trial": "", "Mitchell Park": "Mitchell Car Park", "Western Warriors": "Western Worriers", "Smithfield": "Smith's Chips", "Ballarat University": "", "University Technology Sydney": "", "Elizabeth": "Lizbef", "Kaurna Eagles": "", "University of WA": "", "Black Friars": "Friar Tuck", "Angel Vale": "Angel Fail", "Riverland Super Dogs": "Riverland Super Dogs", "Blackwood": "Blackwood", "Morphettville Park": "Morphies", "Mawson Lakes": "Sir Douglas Mawson Lakes", "Christies Beach": "Christies a B!tch", "Port Adelaide": "The Wharfies", "Happy Valley": "Unhappy Valley" };
ground_names = { "University Oval": "Bob Neil #1", "Fred Bloch Oval": "Chocka Bloch Oval", "Park 10": "Bob Neil #2", "Broadview Oval": "Prostitute Park", "Henley Oval": "The Opium Den", "Largs Reserve": "Largs Loony Bin", "Blair Athol Reserve": "Kill Burn Maim & Destroy Oval", "Edwardstown Oval": "Clown Town", "Torrens Valley Oval": "Rat Reserve", "Goodwood Oval": "Sin Stadium", "Pertaringa Oval": "The Comedy Colosseum", "Camden Oval": "Fos's Farm", "Prospect Oval": "Wembley of the North", "West Lakes Reserve": "Fake Field", "Rostrevor College": "Abode of the Angelic Umpire", "Payneham Oval": "Arse Park", "Port Reserve": "Port Wildlife Reserve", "St Marys Oval": "The Dog Pound", "Foxfield Oval": "Rat Reserve", "Eric Sutton Oval": "Perfume Park", "LJ. Lewis Reserve": "Yatala Jail", "Klemzig Reserve": "Mardi Gras Park", "Salisbury North Oval": "Unemployment Park", "Campbelltown Oval": "Campbell's Cow Paddock", "Pedlar Reserve": "The Tram Terminus", "Daly Oval": "Arfur Daly Oval", "Mortlock Park": "The Rubbish Bin", "Cnr Sth Tce and Goodwood Rd": "South Terrace Lavatories", "Cnr Greenhill and Glen Osmond Rd": "Big Als' Toilet", "Plympton Oval": "Pimp Park", "Newlands Reserve": "Imperial Park", "Webb Oval": "Starvation Stadium", "Renown Park Oval": "Unrenown Park", "Kingswood Oval": "Home For Horribles", "Dwight Reserve": "Elton John Reserve", "Flinders University Oval": "The Gulag", "Cane Reserve": "Dog Poo/Postage Stamp Park", "Brahma Lodge Oval": "Fudge Field", "Houghton Oval": "Faraway Field", "Duncan Fraser Reserve": "Animal Farm", "Edward Smith Reserve": "Paint Pot Park", "Modbury Oval": "The Mud Heap", "Paralowie Oval": "The Flea Pit", "Lindholm Park": "Poo Park", "Salisbury Downs Oval": "Salisbury Downs Syndrome", "Windsor Gardens High School": "The Citadel", "Flinders Park Oval": "Paedophile Playground", "Park 9": "Bob Neil Four", "Wilson Oval, St Peters College": "Hackney High", "Unley Oval": "Jack Oatey Stables", "Walkerville Oval": "Tangle Park", "Thomas More College": "Bob Neil Three", "Hawthorn Oval": "Hawthorn Odeon", "Ledger Oval": "General Ledger", "Adelaide Oval": "The Light Towers", "Eastern Parade Reserve": "Rubbish Reserve", "Morgan Oval, South Tce": "Sock City", "Rowe Park": "Giggle Ground", "Sacred Heart Middle School": "Stink Stadium", "Sacred Heart Junior School": "Stink Stadium", "Salisbury Oval": "Tiny Town", "Mofflin Reserve": "The Welfare Office", "Andrew Smith Reserve": "Paint Pot Park", "Largs North Reserve": "Largs North Toilets", "Fawk Reserve": "Guy Fawkes Reserve", "Alberton Oval": "Al and Bert's Unit", "Brighton Oval": "Brighton-On-Sludge", "Railways Oval": "The Acropolis", "EP. Nazer Reserve": "Nazi Reserve", "McNally Oval": "The Reformatory", "PA.C. Park Oval": "Bob Neil Five", "Carnegie Reserve": "Carnegie Hall", "Brookway Park Oval": "Layabout Lounge", "Saint Pauls College": "The Cathedral", "Parafield Gardens High School": "", "Daws Road High School": "", "The Levels": "", "Sturt CAE Oval": "", "Scotch College Oval": "Rock Reserve", "Bartels Road Oval": "Bob Neil Six", "Bill Cooper Oval": "", "Lockleys Oval": "Padlock Park", "Bourke Oval, St Ignatius College": "Old Folks Home", "Hope Valley Oval": "Home for Incurables", "Adelaide High School Oval": "The Acropolis", "Salisbury CA.E. Oval": "", "Haslam Oval": "Don Haslam Oval", "STA Employees Club Oval": "", "Almond Tree Flat": "", "Memorial Oval, Rostrevor College": "Abode of the Angelic Oval", "Caterer Oval, St Peters College": "Hackney High", "Sacred Heart Senior School": "Stink Stadium", "Ferryden Park Reserve": "Fairies' Den", "St Peters College Front Oval": "Hackney High", "Northfield High School": "", "Saint Clair Oval": "", "Atkinson Oval, St Ignatius College": "Old Folks Home", "Magill CA.E. Oval": "", "Unley High School": "", "Myer Sports Ground": "", "Pennington Oval": "", "Paddocks Oval": "The Dopey Dugout", "Post Tel Oval, West Tce": "", "West Lakes High School": "", "Glandore Oval": "The Brothel", "Norwood Oval": "", "Park 25": "", "Graduates Oval": "", "Barratt Reserve": "Stink Stadium", "Plympton High School": "", "Immanuel College": "", "Parks Community Centre": "", "Colonel Waite Oval": "", "Fitzroy Terrace": "", "Thebarton Oval": "", "Mawson High School": "", "Glengowrie High School": "", "Brighton High School": "", "PA.C.": "", "Weigall Oval": "", "Tubemakers Oval": "", "Devitt Oval": "", "Baulderstone Oval, St Ignatius College": "Old Folks Home", "Cnr Pulteney St & Sth Tce": "Sock City", "Banksia Park High School": "", "Enfield High School": "", "Park 17, Greenhill Road": "", "Park 19": "", "Meyer Oval": "", "Findon High School": "", "Challa Gardens Primary School": "", "Marion High School": "", "Thorndon High School": "", "Hillcrest Hospital Oval": "", "Saint Michaels College": "", "Urrbrae College": "", "Australian National University": "", "Melbourne University": "", "Allard Park, Brunswick": "", "Prince Park No 2": "", "Sydney University": "", "Surfers Paradise": "", "Albert Park Oval": "", "Monash University": "", "Cazaly Park": "", "Jack Dyer Oval": "", "Labrador Oval": "", "Westminster College": "Heaven Number Two", "Greenwith Community Centre": "Grovel Park", "Underdale High School": "Worry Park", "Yalumba Drive Reserve": "The Flea Pit", "Croydon High School": "Surrender Stadium", "Bye": "", "Kensington Oval": "Bradman Park", "Smithfield Oval": "", "Woodville Oval": "", "Richmond Oval": "", "Newcastle University": "", "Argana Park": "", "Kilburn Oval": "Kill Burn Maim & Destroy Oval", "Harpers Field": "", "Salisbury West Oval": "", "Mitchell Park Oval": "", "Mawson Lakes Oval": "South Pole Mawson Lakes", "West Lakes Shore Oval": "", "Vaughton Oval": "", "St Dominics Oval": "Sherwood Forest", "Roseworthy Oval": "", "Elliott Goodger Memorial Park": "Beyond the Black Stump", "Fitzroy Sports Club": "", "Ottoway Reserve": "", "Lyrup": "Lyrup", "Reynella": "Reynella", "The Paddocks": "The Cow Paddock", "Thomas Farms Oval (Price Memorial Oval)": "The Meat Works", "Max Amber Sportsfield (Torrens Valley Oval)": "Rat Reserve", "John Bice Memorial Oval": "Bicep Oval", "Kellett Reserve": "The Pastie", "Happy Valley Sports Park": "Unhappy Land" };

override_nicknames = { "Angle Vale": "Angle Fail", "St Paul's OS": "Saint Paul", "Payneham Norwood Union": "Payneham in the @rse", "Blackfriars OS": "Burnt Fries" };
override_ground_names = { 'Forfeit': 'FORFEIT', 'Payneham Oval': '@rse Park', 'West Lakes Shore Oval': 'Fake Field', 'St Pauls College': 'The Cathedral', 'Hunter Park': 'The Nursing Home', 'Harpers Field': 'Grovel Park', 'Harpers Field No 2': 'Grovel Park' };

function PopulateNicknames(game) {

  // Incase this has already been flagged an error, remove it so that they do not accumulate.
  if (game.opposition_nickname.includes('ERROR')) game.opposition_nickname = '';

  let opposition_nickname = FindNickname(nicknames, game.opposition);

  // Override if needed.
  if (game.opposition in override_nicknames) {
    opposition_nickname = override_nicknames[game.opposition];
  }

  game.opposition_nickname = (opposition_nickname === null) ? 'ERROR' : opposition_nickname;

  if (game.location_nickname.includes('ERROR')) game.location_nickname = game.location_nickname.replace('ERROR', '');
  let location_nickname = FindNickname(ground_names, game.location);

  // Override if needed.
  if (game.location in override_ground_names) {
    location_nickname = override_ground_names[game.location];
  }

  game.location_nickname = (location_nickname === null) ? game.location_nickname + 'ERROR' : location_nickname;
}

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

  if (name === null || name.length <= 3) return null;

  for (i in inconclusives) {
    if (name == inconclusives[i]) return null;
  }

  // Exact match.
  for (let option in options) {
    if (option === name) {
      if (options[option] === '') {
        return "NO NICKNAME IN DATABASE";
      }
      else {
        return options[option];
      }
    }

    // Check to see if it is already a nickname.
    if (options[option] === name) return name;
  }

  // Match that contains the given name.
  for (let option in options) {
    if (option.includes(name)) {
      if (options[option] == '') {
        return "NO NICKNAME IN DATABASE";
      }
      else {
        return options[option];
      }
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
function IncludeDate(selector, team) {
  if (team.result === 'BYE') return;

  let date_HTML = "<div class='row'><div class='col-md-12'><p class='date'>\
                     " + team.date + ", 2020\
                  </p></div></div>";
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

function GetTeamNicknameFromHTMLString(html) {
  let start_pattern = "<span class='nickname'>";
  let end_pattern = "</span>";
  let nickname = html.substring(html.indexOf(start_pattern) + start_pattern.length);
  nickname = nickname.substring(0, nickname.indexOf(end_pattern));
  return nickname;
}

function Swap(list, i, j) {
  let temp = list[i];
  list[i] = list[j];
  list[j] = temp;
}

function getDateObject(team) {
  return new Date(Date.parse(team.date + ' ' + team.year));
}

// Reorders the teams such that the mens/womens teams alternate between the top position.
// TODO: Could probably make this more efficient. Although I like how explicit each step is. Probably
// keep like this as robustness and readability is more important than performance.
function ReOrderTeams(teams) {

  // Default ordering.
  const order = [
    'Benny and His Jets', 'Moodog and His A Grade Vintage', 'Pup and His Young Dawgz',
    'The Big Lez Show', 'The Chardonnay Socialists', 'The B@stards', 'The Brady Bunch', 'THE SCUM'];

  // Sort teams according to hard-coded order.
  teams.sort((a, b) => {
    return order.indexOf(a.nickname) - order.indexOf(b.nickname);
  });

  // Alternate mens/womens being first every week (according to the week of div1 mens game).
  if (getDateObject(teams[0]).getWeekNumber() % 2 == 0) {
    Swap(order, 0, 1);
    Swap(order, 2, 3);
  }

  // Perform a stable sort according to the day of the week.
  teams.sort((a, b) => {
    return getDateObject(a).getDay() - getDateObject(b).getDay();
  });

  // Place BYEs at the bottom.
  teams.sort((a, b) => {
    return Number(a.result === 'BYE') - Number(b.result === 'BYE');
  });
}

function PrintTeamsToDOM(selector, teams) {
  let prev_date = null;

  for (let team of teams) {

    // Include the date if this is the first game of the day.
    if (prev_date === null || prev_date != getDateObject(team).getDay()) {
      IncludeDate(selector, team);
    }

    $(selector).append(team.HTML);

    prev_date = getDateObject(team).getDay();
  }
}

function ProcessLocation(game) {
  if (game.location === 'University Oval' || game.location === 'Fred Bloch Oval' || game.location === '') {
    game.location = '';
    return;
  }
  game.location = '(' + game.location + ')';
}

function FormatGames(container_selector, teams, title_HTML, server_path, callback) {

  $(container_selector).css('display', 'block');

  // Clear current content, populate with only the title.
  $('#future-games-container').html(title_HTML);

  let teams_HTML_promise = [];
  for (let team of teams) {
    ProcessLocation(team);
    teams_HTML_promise.push(LoadHTMLTemplate(server_path, team));
  }

  Promise.all(teams_HTML_promise,).then(HTML_list => {
    for (let i = 0; i < HTML_list.length; ++i) {
      teams[i].HTML = HTML_list[i];
    }

    ReOrderTeams(teams);
    PrintTeamsToDOM(container_selector, teams);

    if (callback) callback();
  });
}

function FormatPastGames(callback) {
  const past_games_title = '<p id="past-games-title"><b><i>"If winning is all there is, we want no part of it"</i></b></p>';
  const past_server_path = '/past-game.html';
  FormatGames('#past-games-container', past_teams, past_games_title, past_server_path, callback);
}

function FormatFutureGames(callback) {
  const future_games_title = "<p id='future-games-title'><b>WHAT'S ON THIS WEEKEND</b></p>";
  const future_server_path = '/future-game.html';
  FormatGames('#future-games-container', future_teams, future_games_title, future_server_path, callback);
}

function UpdateTables(callback) {

  InitialiseWinningVerbs();

  for (let i in past_teams) {
    PopulateWinOrLossVerb(past_teams[i]);
    PopulateNicknames(past_teams[i]);
  }

  for (let i in future_teams) {
    PopulateNicknames(future_teams[i]);
  }

  past_table.rows().invalidate().draw();
  future_table.rows().invalidate().draw();

  if (callback) callback();
}

function AutomateSubstandard() {

  StartLoading();

  Promise.all([GetPastGames(), GetFutureGames()]).then(() => {
    UpdateTables(() => {
      FormatPastGames(() => {
        FormatFutureGames(() =>
          EndLoading());
      });
    });
  });
}

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

function StartLoading() {
  $('#loading-container').css('display', 'block');
}

function EndLoading() {
  $('#loading-container').css('display', 'none');
}

function ShowTables() {
  $('#past-games-table').css('display', 'block');
  $('#future-games-table').css('display', 'block');
}

$(document).ready(function () {
  StartLoading();

  UpdatePlayerNamesFromDatabase(() => {
    GetTeamsFromServer().then(() => {
      InitialisePastGamesTable();
      InitialiseFutureGamesTable();
      EndLoading();
    });
  });
});