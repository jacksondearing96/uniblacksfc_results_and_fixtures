const FAIL = false;
const PASS = true;

function Pass(function_name) {
  console.log('%c PASS: ' + function_name, 'color: green;')
}

function Fail(actual, expected, description) {
  console.log(`%c FAIL -  ${description}`, 'color: red')
  console.log(`
  \tExpected:  ${expected}
  \tActual:    ${actual}`);
}

function ExpectEqual(actual, expected, test, description) {
  if (actual !== expected) {
    Fail(actual, expected, description);
    test.result = FAIL;
  }
}

function ExpectNotEqual(actual, not_expected, test, description) {
  if (actual == not_expected) {
    Fail(actual, not_expected, description);
    test.result = FAIL;
  }
}

function RunUnitTests() {
  for (let i in test_functions) {
    let test = { result: PASS };
    test_functions[i](test)
    if (test.result == PASS) Pass(test_functions[i].name);
  }
}

function TestGetScoreTotal(test) {
  ExpectEqual(GetScoreTotal('1.1-7'), 7, test, "Score total basic");
  ExpectEqual(GetScoreTotal('1.17'), -1, test, "Score total no dash found");
  ExpectEqual(GetScoreTotal('11.11-777'), 777, test, "Score total big score");
  ExpectEqual(GetScoreTotal('1.1-0'), 0, test, "Score total zero");
  ExpectEqual(GetScoreTotal('someinvalidstring'), -1, test, "Score total invalid string");
}

function ValuesAreUnique(list) {
  for (i in list) {
    if (list[i] == 'def by' || list[i] == 'drew against' || list[i] == '') return false;

    for (j in list) {
      if (i == j) continue;
      if (list[i] == list[j]) {
        console.log(`Repeat: ${list[i]} ${list[j]}`)
        return false;
      }
    }
  }
  return true;
}

function TestPopulateWinOrLossVerb(test) {
  var game = PastContent();

  InitialiseWinningVerbs();

  // Loss
  game.score_for = "1.1-1";
  game.score_against = "1.2-2";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, 'def by', test, "Win/loss verb: loss");

  // Unchanged
  var prev = game.result;
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, prev, test, "Win/Loss verb: preserving old value");

  // Draw
  game.score_against = "1.2-1";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectEqual(game.result, 'drew against', test, "Win/Loss verb: draw");

  // Win
  game.score_for = "1.2-2";
  game.result = ''
  PopulateWinOrLossVerb(game);
  ExpectNotEqual(game.result, 'def by', test, "Win/Loss verb: win");

  var win_loss_verbs = [game.result];
  for (i = 0; i < 8; ++i) {
    game.result = '';
    PopulateWinOrLossVerb(game);
    win_loss_verbs.push(game.result);
  }

  ExpectEqual(ValuesAreUnique(win_loss_verbs), true, test, "Unique win/loss verbs");
}

function TestPopulateNicknames(test) {
  var game = PastContent();

  game.opposition = 'Rostrevor';
  PopulateNicknames(game);
  ExpectEqual(game.opposition_nickname, 'Ross and Trevor', test, "Populate nicknames: opposition");
  ExpectEqual(game.opposition, 'Rostrevor', test, "Populate nicknames: opposition unchanged");

  game = FutureContent();
  game.location = 'University Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Bob Neil #1', test, "Populate nicknames: BN#1");

  game.location = 'Fred Bloch Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Chocka Bloch Oval', test, "Populate nicknames: Chocka");

  game.location = 'Payneham Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, '@rse Park', test, "Populate nicknames: Override");

  game.location = 'Port Reserve';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Port Wildlife Reserve', test, "Populate nicknames: location");
}

function TestFindNickname(test) {

  nicknames = { "Edwardstown": "Edwards Clowns", "Broadview": "Abroadsview", "Athelstone": "The Raggies", "Henley Greek": "Henley Geeks", "Goodwood Saints": "Goodwood Sinners", "Port District": "Port Red Light District", "Tea Tree Gully": "Tee Hee Gully", "Kilburn": "The Kilburn Motorcyle & Tattoo Club", "PHOS Camden": "PHOS Williams", "Portland": "Flagon of Portland", "SMOSH West Lakes": "SMUSH West Fakes", "Rostrevor OC": "Ross and Trevor", "Greenacres": "Gang Green Acres", "Salisbury North": "Salisbury NSE&W", "Gaza": "Nice Gaza", "Hectorville": "Hannibal Hectorville", "Colonel Light Gardens": "Colonel Light's Garbage", "Adelaide Lutheran": "Adelaide Loos", "Glenunga": "Glenunga & Thirst", "Pembroke OS.": "Pembrokedown", "Unley": "Ugly", "CB.C.OC": "Can The Blacks Crap on the Catholics", "Mitcham": "Robert Mitchum", "Plympton": "Pimp Town", "Kenilworth": "Whats A Kenilworth", "Henley": "Henley-definitely-not-on-Drugs", "Sacred Heart OC": "Sacred Fart", "Pooraka": "The Poos", "Brahma Lodge": "Bananaramafudge", "Houghton Districts": "Hout and About", "Eastern Park": "Far Eastern Park", "Flinders University": "Karl Marx University", "Ovingham": "The Roving Hams", "Flinders Park": "Flinders Parkour", "Old Ignatians": "Very Old Ignatians", "Prince Alfred OC": "The Tarnished Spooners", "St Peters OC": "The Silver Spooners", "Scotch OC": "Scotch on the Rocks", "Seaton Ramblers": "The Seaton Trams", "Walkerville": "Max Walkerville", "Gepps Cross": "Gepps Double Cross", "Modbury": "Mudbury", "Paralowie": "Paralowsie", "Salisbury West": "Salisbury NSE&W", "Salvation Army": "The Tambourine Bangers", "Bye": "", "Wingfield Royals": "The Wingfield Dump", "Rosewater": "Sweet Smelling Rosewater", "Pulteney OS.": "Paltry Old Socks", "Ingle Farm": "Giggle Farm", "Salisbury": "Smallsbury", "Alberton United": "Al & Bert's Unit", "Central United": "Central DisUnited", "North Pines": "North Pines for a Win", "North Haven": "North Haven for Hobos", "Payneham Norwood Union": "Payneham in the Arse", "Brighton District & OS.": "Brighton Bummers", "Adelaide High OS.": "Ka Ringa Ronga Ringa", "Ethelton": "Ethel Weights a Ton", "SMOSH": "SMUSH", "West Lakes": "West Fakes", "Norwood Union": "Norwood Non-Workers Union", "Saint Pauls OS.": "Saint Paul", "Salisbury Central": "Salisbury Sickoes", "Riverside": "Down by the River Side", "Campbelltown Magill": "Donald Campbelltown", "Burnside Kensington": "Burn Down Kensington", "Lockleys": "Lock & Keys", "Hope Valley": "No Hope Valley", "West Croydon": "West Croydon Bleau", "Cedars": "The Conceders", "Greek Camden": "", "Woodville South": "Woodville NSE&W", "Edwardstown Baptist": "", "Fitzroy": "If the Cap Fits Roy", "Kenilworth Colonel Light": "", "Ferryden Park": "Fairey Den Park", "Plympton High OS.": "PHOS Williams", "Port Adelaide Presbyterian": "", "Para Hills": "Para Dills", "AN.Z. Bank": "", "Woodville District": "", "Immanuel OS.": "", "Australian National Institute": "", "Brighton High OS.": "", "Para District Uniting": "", "SA Cats": "", "SAIT": "", "Glandore": "Glad Whore", "Greek": "Bleek", "Saint Dominics": "", "Saint Peters YCW": "", "Post Tel Institute": "", "Renown Park": "Unrenown Park", "Adelaide College": "", "Murray Park Teachers": "", "Saint Raphaels": "", "National Bank": "", "Banksia Park High OS.": "", "Woodville West": "", "Salisbury College": "", "Port Adelaide United": "", "Taperoo": "", "Eastwood": "", "Albert Sports": "", "The Parks": "", "Henley District & OS.": "", "Sydney University": "", "Monash University": "", "Melbourne University": "", "LaTrobe University": "", "Macquarie University": "", "Queensland University": "", "Deakin University": "", "Philip University": "", "Northern Territory University": "", "Victoria University": "", "Australian National University": "", "Australian Defence Academy": "", "Wollongong University": "", "Swinburne University": "", "Charles Sturt Mitchell University": "", "NSW University": "", "Golden Grove": "Golden Grovel", "Westminster OS.": "Westminster Cathedral", "Internal Trial": "", "Mitchell Park": "Mitchell Car Park", "Western Warriors": "Western Worriers", "Smithfield": "Smith's Chips", "Ballarat University": "", "University Technology Sydney": "", "Elizabeth": "Lizbef", "Kaurna Eagles": "", "University of WA": "", "Black Friars": "Friar Tuck", "Angel Vale": "Angel Fail", "Riverland Super Dogs": "Riverland Super Dogs", "Blackwood": "Blackwood", "Morphettville Park": "Morphies", "Mawson Lakes": "Sir Douglas Mawson Lakes", "Christies Beach": "Christies a B!tch", "Port Adelaide": "The Wharfies", "Happy Valley": "Unhappy Valley" };

  // ExpectEqual(FindNickname(nicknames, ''), null, test, "Find nicknames: empty");
  // ExpectEqual(FindNickname(nicknames, "Broadview"), "Abroadsview", test, "Find nicknames: basic");
  // ExpectEqual(FindNickname(nicknames, 'Rostrevor O.C'), "Ross and Trevor", test, "Find nickname: eliminate O.C");
  // ExpectEqual(FindNickname(nicknames, 'The'), null, test, "Find nicknames: invalid");
  // ExpectEqual(FindNickname(nicknames, 'North SomethingSomething', null, test, "Find nicknames: inconclusive"))
  // ExpectEqual(FindNickname(nicknames, "St Peter's OC"), 'The Silver Spooners', test, "Find nicknames: apostrophe")
}

function TestProcessLocation(test) {
  var game = FutureContent();
  game.location = 'University Oval';

  ProcessLocation(game)
  ExpectEqual(game.location, '', test, 'Process location: BN#1');

  game.location = "Fred Bloch Oval";
  ProcessLocation(game)
  ExpectEqual(game.location, '', test, 'Process location: Chocka');

  game.location = "Actual Oval Name";
  ProcessLocation(game)
  ExpectEqual(game.location, '(Actual Oval Name)', test, 'Process location: away oval');
}

function TestExpandDate(test) {
  ExpectEqual(ExpandDate('Mon 7 Jul'), 'Monday 7 July', test, 'Expand date: basic');
  ExpectEqual(ExpandDate('Mon Tue Wed Thu Fri Sat Sun Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
    'Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December', test, 'Expand date: all examples');
}

var test_functions = [
  TestGetScoreTotal,
  TestPopulateWinOrLossVerb,
  TestPopulateNicknames,
  TestFindNickname,
  TestProcessLocation,
  TestExpandDate
];

