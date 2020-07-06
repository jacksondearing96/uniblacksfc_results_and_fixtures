const NUMBER_OF_TEAMS = 8;

function PastContentArrayToJson(row_content) {
  return {
    nickname: row_content[0],
    round: row_content[1],
    date: row_content[2],
    opposition: row_content[3],
    gender: row_content[4],
    division: row_content[5],
    result: row_content[6],
    score_for: row_content[7],
    score_against: row_content[8],
    goal_kickers: row_content[9],
    best_players: row_content[10],
    image_url: row_content[11],
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
winning_verbs = []

function GetScoreTotal(score_str) {
  var dash_index = score_str.indexOf('-');
  if (dash_index == -1) return -1;
  var score_for = score_str.substring(dash_index + 1, score_str.length);
  return Number(score_for);
}

function PopulateWinOrLossVerb(game) {

  // If there is already a result present, skip.
  if (game.result !== '') {
    return;
  }

  // Error, something failed.
  if ((game.score_against == "YY.YY-YYY") ||
    (game.score_for == "XX.XX-XXX")) {
    game.result = '???';
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
groundNames = { "University Oval": "Bob Neil #1", "Fred Bloch Oval": "Chocka Bloch Oval", "Park 10": "Bob Neil #2", "Broadview Oval": "Prostitute Park", "Henley Oval": "The Opium Den", "Largs Reserve": "Largs Loony Bin", "Blair Athol Reserve": "Kill Burn Maim & Destroy Oval", "Edwardstown Oval": "Clown Town", "Torrens Valley Oval": "Rat Reserve", "Goodwood Oval": "Sin Stadium", "Pertaringa Oval": "The Comedy Colosseum", "Camden Oval": "Fos's Farm", "Prospect Oval": "Wembley of the North", "West Lakes Reserve": "Fake Field", "Rostrevor College": "Abode of the Angelic Umpire", "Payneham Oval": "Arse Park", "Port Reserve": "Port Wildlife Reserve", "St Marys Oval": "The Dog Pound", "Foxfield Oval": "Rat Reserve", "Eric Sutton Oval": "Perfume Park", "LJ. Lewis Reserve": "Yatala Jail", "Klemzig Reserve": "Mardi Gras Park", "Salisbury North Oval": "Unemployment Park", "Campbelltown Oval": "Campbell's Cow Paddock", "Pedlar Reserve": "The Tram Terminus", "Daly Oval": "Arfur Daly Oval", "Mortlock Park": "The Rubbish Bin", "Cnr Sth Tce and Goodwood Rd": "South Terrace Lavatories", "Cnr Greenhill and Glen Osmond Rd": "Big Als' Toilet", "Plympton Oval": "Pimp Park", "Newlands Reserve": "Imperial Park", "Webb Oval": "Starvation Stadium", "Renown Park Oval": "Unrenown Park", "Kingswood Oval": "Home For Horribles", "Dwight Reserve": "Elton John Reserve", "Flinders University Oval": "The Gulag", "Cane Reserve": "Dog Poo/Postage Stamp Park", "Brahma Lodge Oval": "Fudge Field", "Houghton Oval": "Faraway Field", "Duncan Fraser Reserve": "Animal Farm", "Edward Smith Reserve": "Paint Pot Park", "Modbury Oval": "The Mud Heap", "Paralowie Oval": "The Flea Pit", "Lindholm Park": "Poo Park", "Salisbury Downs Oval": "Salisbury Downs Syndrome", "Windsor Gardens High School": "The Citadel", "Flinders Park Oval": "Paedophile Playground", "Park 9": "Bob Neil Four", "Wilson Oval, St Peters College": "Hackney High", "Unley Oval": "Jack Oatey Stables", "Walkerville Oval": "Tangle Park", "Thomas More College": "Bob Neil Three", "Hawthorn Oval": "Hawthorn Odeon", "Ledger Oval": "General Ledger", "Adelaide Oval": "The Light Towers", "Eastern Parade Reserve": "Rubbish Reserve", "Morgan Oval, South Tce": "Sock City", "Rowe Park": "Giggle Ground", "Sacred Heart Middle School": "Stink Stadium", "Sacred Heart Junior School": "Stink Stadium", "Salisbury Oval": "Tiny Town", "Mofflin Reserve": "The Welfare Office", "Andrew Smith Reserve": "Paint Pot Park", "Largs North Reserve": "Largs North Toilets", "Fawk Reserve": "Guy Fawkes Reserve", "Alberton Oval": "Al and Bert's Unit", "Brighton Oval": "Brighton-On-Sludge", "Railways Oval": "The Acropolis", "EP. Nazer Reserve": "Nazi Reserve", "McNally Oval": "The Reformatory", "PA.C. Park Oval": "Bob Neil Five", "Carnegie Reserve": "Carnegie Hall", "Brookway Park Oval": "Layabout Lounge", "Saint Pauls College": "The Cathedral", "Parafield Gardens High School": "", "Daws Road High School": "", "The Levels": "", "Sturt CAE Oval": "", "Scotch College Oval": "Rock Reserve", "Bartels Road Oval": "Bob Neil Six", "Bill Cooper Oval": "", "Lockleys Oval": "Padlock Park", "Bourke Oval, St Ignatius College": "Old Folks Home", "Hope Valley Oval": "Home for Incurables", "Adelaide High School Oval": "The Acropolis", "Salisbury CA.E. Oval": "", "Haslam Oval": "Don Haslam Oval", "STA Employees Club Oval": "", "Almond Tree Flat": "", "Memorial Oval, Rostrevor College": "Abode of the Angelic Oval", "Caterer Oval, St Peters College": "Hackney High", "Sacred Heart Senior School": "Stink Stadium", "Ferryden Park Reserve": "Fairies' Den", "St Peters College Front Oval": "Hackney High", "Northfield High School": "", "Saint Clair Oval": "", "Atkinson Oval, St Ignatius College": "Old Folks Home", "Magill CA.E. Oval": "", "Unley High School": "", "Myer Sports Ground": "", "Pennington Oval": "", "Paddocks Oval": "The Dopey Dugout", "Post Tel Oval, West Tce": "", "West Lakes High School": "", "Glandore Oval": "The Brothel", "Norwood Oval": "", "Park 25": "", "Graduates Oval": "", "Barratt Reserve": "Stink Stadium", "Plympton High School": "", "Immanuel College": "", "Parks Community Centre": "", "Colonel Waite Oval": "", "Fitzroy Terrace": "", "Thebarton Oval": "", "Mawson High School": "", "Glengowrie High School": "", "Brighton High School": "", "PA.C.": "", "Weigall Oval": "", "Tubemakers Oval": "", "Devitt Oval": "", "Baulderstone Oval, St Ignatius College": "Old Folks Home", "Cnr Pulteney St & Sth Tce": "Sock City", "Banksia Park High School": "", "Enfield High School": "", "Park 17, Greenhill Road": "", "Park 19": "", "Meyer Oval": "", "Findon High School": "", "Challa Gardens Primary School": "", "Marion High School": "", "Thorndon High School": "", "Hillcrest Hospital Oval": "", "Saint Michaels College": "", "Urrbrae College": "", "Australian National University": "", "Melbourne University": "", "Allard Park, Brunswick": "", "Prince Park No 2": "", "Sydney University": "", "Surfers Paradise": "", "Albert Park Oval": "", "Monash University": "", "Cazaly Park": "", "Jack Dyer Oval": "", "Labrador Oval": "", "Westminster College": "Heaven Number Two", "Greenwith Community Centre": "Grovel Park", "Underdale High School": "Worry Park", "Yalumba Drive Reserve": "The Flea Pit", "Croydon High School": "Surrender Stadium", "Bye": "", "Kensington Oval": "Bradman Park", "Smithfield Oval": "", "Woodville Oval": "", "Richmond Oval": "", "Newcastle University": "", "Argana Park": "", "Kilburn Oval": "Kill Burn Maim & Destroy Oval", "Harpers Field": "", "Salisbury West Oval": "", "Mitchell Park Oval": "", "Mawson Lakes Oval": "South Pole Mawson Lakes", "West Lakes Shore Oval": "", "Vaughton Oval": "", "St Dominics Oval": "Sherwood Forest", "Roseworthy Oval": "", "Elliott Goodger Memorial Park": "Beyond the Black Stump", "Fitzroy Sports Club": "", "Ottoway Reserve": "", "Lyrup": "Lyrup", "Reynella": "Reynella", "The Paddocks": "The Cow Paddock", "Thomas Farms Oval (Price Memorial Oval)": "The Meat Works", "Max Amber Sportsfield (Torrens Valley Oval)": "Rat Reserve", "John Bice Memorial Oval": "Bicep Oval", "Kellett Reserve": "The Pastie", "Happy Valley Sports Park": "Unhappy Land" };

function PopulateNicknames(game) {

  // Incase this has already been flagged an error, remove it so that they do not accumulate.
  if (game.opposition.includes(' - ERROR')) game.opposition = game.opposition.replace(' - ERROR', '');

  let opposition_nickname = FindNickname(nicknames, game.opposition);
  game.opposition = (opposition_nickname === null) ? game.opposition + ' - ERROR' : opposition_nickname;

  if (game.location_nickname) {
    if (game.location_nickname.includes(' - ERROR')) game.location_nickname = game.location_nickname.replace(' - ERROR', '');
    let location_nickname = FindNickname(groundNames, game.location);
    game.location_nickname = (location_nickname === null) ? game.location_nickname + ' - ERROR' : location_nickname;
  }
}

function FindNickname(options, name) {

  if (name === null || name === '') {
    return null;
  }

  // Exact match.
  for (let option in options) {
    if (option === name) {
      if (options[option] === '') {
        return name + " - NO NICKNAME IN DATABASE";
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
        return name + " - NO NICKNAME IN DATABASE";
      }
      else {
        return options[option];
      }
    }
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
function LoadHTMLTemplateToList(template_selector, destination, teams, final_destination) {
  console.log(teams);
  fetch(template_selector, { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(teams) })
    .then(response => response.text())
    .then(data => {
      destination.push(data);
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

function ProcessLocation(game) {
  if (game.location === 'University Oval' || game.location === 'Fred Bloch Oval') {
    game.location = '';
    return;
  }
  game.location = '(' + game.location + ')';
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
    LoadHTMLTemplateToList('/past-game.html', past_games_HTML, row_content, '#past-games-container');
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
    ProcessLocation(row_content); // Add the braces around the real location and ignore home ground real names.
    LoadHTMLTemplateToList('/future-game.html', future_games_HTML, row_content, '#future-games-container');
  });
}

function UpdateTables() {

  InitialiseWinningVerbs();

  const opposition_col_index = 3;
  const result_col_index = 4;

  let table = $('#past-games-table').DataTable();
  table.rows().every(function (row_index, table_loop, row_loop) {
    let row_content = PastContentArrayToJson(this.data());
    PopulateWinOrLossVerb(row_content);
    PopulateNicknames(row_content);
    table.row(this).cell(row_index, opposition_col_index).data(row_content.opposition).draw();
    table.row(this).cell(row_index, result_col_index).data(row_content.result).draw();
  });

  const location_nickname_row_index = 5;

  table = $('#future-games-table').DataTable();
  table.rows().every(function (row_index, table_loop, row_loop) {
    let row_content = FutureContentArrayToJson(this.data());
    PopulateNicknames(row_content);
    table.row(this).cell(row_index, opposition_col_index).data(row_content.opposition).draw();
    table.row(this).cell(row_index, location_nickname_row_index).data(row_content.location_nickname).draw();
  });
}

// Embeds the CSS file and copies the HTML ready for pasting directly into MailChimp.
function CopyHTML(selector) {
  var HTML = document.createElement('textarea');
  fetch('get_css', { method: 'GET' })
    .then(response => response.text())
    .then(data => {
      HTML.value = '<style>' + data + '</style>';
      HTML.value += document.querySelector(selector).outerHTML;
      document.body.appendChild(HTML);
      HTML.select();
      document.execCommand('copy');
      document.body.removeChild(HTML);
    });
}

function CopyPastGamesHTML() {
  CopyHTML('#past-games-container');
}

function CopyFutureGamesHTML() {
  CopyHTML('#future-games-container');
}