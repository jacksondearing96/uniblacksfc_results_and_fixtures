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
  StartLoading();

  UpdateCacheFromDatabase().then(() => {
    const promises = [GetNicknamesFromCache(), GetGroundNamesFromCache()];

    Promise.all(promises).then(async function () {
      let passed_count = 0;
      let failed_count = 0;

      for (let i in test_functions) {
        let test = { result: PASS };
        await test_functions[i](test);
        if (test.result == PASS) {
          Pass(test_functions[i].name)
          ++passed_count;
        }
        else {
          ++failed_count;
        }
      }

      if (failed_count === 0) {
        $('#test-tick').css('display', 'inline');
        $('#test-button').css('background-color', 'lawngreen');
        $('#test-cross').css('display', 'none');
        $('#test-button span').text(`ALL TESTS PASS (${passed_count})`);
        $('#test-button span').css('color', 'black');
      } else {
        $('#test-cross').css('display', 'inline');
        $('#test-button').css('background-color', 'red');
        $('#test-tick').css('display', 'none');
        $('#test-button span').text(`${failed_count}/${passed_count + failed_count} TESTS FAILED`);
      }

      EndLoading();
    });
  });
}

function TestGetScoreTotal(test) {
  ExpectEqual(GetScoreTotal('1.1-7'), 7, test, "Score total basic");
  ExpectEqual(GetScoreTotal('1.17'), -1, test, "Score total no dash found");
  ExpectEqual(GetScoreTotal('11.11-777'), 777, test, "Score total big score");
  ExpectEqual(GetScoreTotal('1.1-0'), 0, test, "Score total zero");
  ExpectEqual(GetScoreTotal('someinvalidstring'), -1, test, "Score total invalid string");
}

function ValuesAreUnique(list) {
  for (let item of list) {
    if (item == 'def by' || item == 'drew against' || item == '') return false;

    let repeats = 0;
    for (let other_item of list) {
      if (item === other_item) {
        ++repeats;
        if (repeats < 2) continue;
        console.log(`Repeat: ${item} ${other_item}`)
        return false;
      }
    }
  }
  return true;
}

function TestPopulateWinOrLossVerb(test) {
  var game = NewGame(PAST_GAME);

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
  var game = NewGame(PAST_GAME);

  game.opposition = 'Rostrevor';
  PopulateNicknames(game);
  ExpectEqual(game.opposition_nickname, 'Ross and Trevor', test, "Populate nicknames: opposition");
  ExpectEqual(game.opposition, 'Rostrevor', test, "Populate nicknames: opposition unchanged");

  game = NewGame(FUTURE_GAME);
  game.location = 'University Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Bob Neil #1', test, "Populate nicknames: BN#1");

  game.location = 'Fred Bloch Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Chocka Bloch', test, "Populate nicknames: Chocka");

  game.location = 'Payneham Oval';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, '@rse Park', test, "Populate nicknames: Override");

  game.location = 'Port Reserve';
  PopulateNicknames(game);
  ExpectEqual(game.location_nickname, 'Port Wildlife Reserve', test, "Populate nicknames: location");
}

function TestFindNickname(test) {
  ExpectEqual(FindNickname(nicknames, ''), null, test, "Find nicknames: empty");
  ExpectEqual(FindNickname(nicknames, "Broadview"), "Abroadsview", test, "Find nicknames: basic");
  ExpectEqual(FindNickname(nicknames, 'Rostrevor O.C'), "Ross and Trevor", test, "Find nickname: eliminate O.C");
  ExpectEqual(FindNickname(nicknames, 'The'), null, test, "Find nicknames: invalid");
  ExpectEqual(FindNickname(nicknames, 'North SomethingSomething'), null, test, "Find nicknames: inconclusive");
  ExpectEqual(FindNickname(nicknames, "St Peter's OC"), 'The Silver Spooners', test, "Find nicknames: apostrophe")
  ExpectEqual(FindNickname(nicknames, 'Gaza'), 'Nice Gazza', test, 'Find nicknames: override club');
  ExpectEqual(FindNickname(ground_names, 'Torrens Valley Oval'), 'Rat Reserve', test, 'Find ground name');
}

function TestProcessLocation(test) {
  var game = NewGame(FUTURE_GAME);
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
  ExpectEqual(ExpandDate('Wed 5 Aug', 2020), 'Wednesday 5 August, 2020', test, 'Expand date: basic');
}

function TestOrderingFridayNightGame(test) {
  return new Promise((resolve) => {
    var future_teams_with_friday_night_game = JSON.parse('[{"nickname":"Benny and His Jets","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547208-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"1","gender":"Mens","time":"2:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":"","is_past_game":false, "option":"SUBSTANDARD"},{"nickname":"Pup and His Young Dawgz","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547219-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"1 Res","gender":"Mens","time":"12:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"The Chardonnay Socialists","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547209-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Largs Reserve","location_nickname":"","division":"C1","gender":"Mens","time":"10:15 AM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"The B@stards","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547212-0&a=FIXTURE&round=X&pool=1","opposition":"Mitcham","opposition_nickname":"","location":"Fred Bloch Oval","location_nickname":"","division":"C4","gender":"Mens","time":"12:15 PM","image_url":"//websites.sportstg.com/pics/00/01/78/22/1782218_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"The Brady Bunch","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547401-0&a=FIXTURE&round=X&pool=1","opposition":"Port District","opposition_nickname":"","location":"Fred Bloch Oval","location_nickname":"","division":"C7","gender":"Mens","time":"2:15 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564615_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"THE SCUM","round":5,"date":"Friday 31 July, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-557892-0&a=FIXTURE&round=X&pool=1","opposition":"Blackfriars OS","opposition_nickname":"","location":"University Oval","location_nickname":"","division":"C6","gender":"Mens","time":"7:00 PM","image_url":"//websites.sportstg.com/pics/00/02/56/46/2564622_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"Moodog and His A Grade Vintage","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-548065-0&a=FIXTURE&round=X&pool=1","opposition":"Payneham NU","opposition_nickname":"","location":"Payneham Oval","location_nickname":"","division":"1","gender":"Womens","time":"3:30 PM","image_url":"//websites.sportstg.com/pics/00/02/56/47/2564729_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"},{"nickname":"The Big Lez Show","round":5,"date":"Saturday 1 August, 2020","year":2020,"landing_page":"https://websites.sportstg.com/comp_info.cgi?c=1-114-0-555668-0&a=FIXTURE&round=X&pool=1","opposition":"Payneham NU","opposition_nickname":"","location":"Payneham Oval","location_nickname":"","division":"1 Res","gender":"Womens","time":"1:45 PM","image_url":"//websites.sportstg.com/pics/00/02/56/47/2564729_1_T.jpg","error":"","is_past_game":false,"option":"SUBSTANDARD"}]');
    future_teams = future_teams_with_friday_night_game;
    PopulateTablesWithNicknamesAndVerbs().then(() => {
      FormatFutureGames().then(() => {
        let expected_text = [
          'Friday 31 July, 2020',
          'Saturday 1 August, 2020',
          'Bob Neil #1',
          '7:00 PM',
          'Div C6',
          'Friar Truck',
          'Round 5',

          'Benny and His Jets',
          'Port Red Light District',
          'Largs Loony Bin',
          'Largs Reserve',
          '2:15 PM'
        ];

        for (let text of expected_text) {
          ExpectEqual($('#future-games-container').html().includes(text), true, test, 'Future games including text: ' + text);
        }

        resolve();
      });
    });
  });
}

function TestGetPastGames(test) {
  return new Promise((resolve) => {
    past_teams = JSON.parse('[{"nickname":"Benny and His Jets","round":"4","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","gender":"Mens","division":"1","result":"","score_for":"","score_against":"","goal_kickers":"","best_players":"","image_url":"","option":"SUBSTANDARD","location":"","location_nickname":"","error":"","is_past_game":true,"option":"SUBSTANDARD"},{"nickname":"Pup and His Young Dawgz","round":"4","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","gender":"Mens","division":"1 Res","result":"","score_for":"","score_against":"","goal_kickers":"","best_players":"","image_url":"","option":"SUBSTANDARD","location":"","location_nickname":"","error":"","is_past_game":true,"option":"SUBSTANDARD"}]');
    GetPastGames().then(() => {
      ExpectEqual(past_teams[0].opposition, 'Goodwood Saints', test, 'Opposition');
      ExpectEqual(past_teams[0].result, 'LOSS', test, 'Result');
      ExpectEqual(past_teams[0].score_for, '10.6-66', test, 'Score for');
      ExpectEqual(past_teams[0].score_against, '16.6-102', test, 'Score Against');
      ExpectEqual(past_teams[0].image_url, '//websites.sportstg.com/pics/00/02/20/16/2201604_1_T.jpg', test, 'Image url');
      ExpectEqual(past_teams[0].goal_kickers, 'B. Edwards 5, W. McGowan 2, M. Marini 2, N. Cottrell', test, 'Goal Kickers');
      ExpectEqual(past_teams[0].best_players, 'B. Adams, W. McGowan, D. Cunningham, N. Cottrell, B. Edwards, H. Wallace', test, 'Best Players');
      ExpectEqual(past_teams[0].date, 'Saturday 25 July, 2020', test, 'Date');

      ExpectEqual(past_teams[1].nickname, 'Pup and His Young Dawgz', test, 'Pup and his dawgz are present');

      ExpectEqual(past_teams.length, 2, test, 'Length of past teams');
      resolve();
    });
  });
}

function TestGetFutureGames(test) {
  return new Promise((resolve) => {
    future_teams = JSON.parse('[{"nickname":"THE SCUM","round":"5","date":"","year":2020,"landing_page":"","opposition":"","opposition_nickname":"","location":"","location_nickname":"","division":"C6","gender":"Mens","time":"","image_url":"","error":"","is_past_game":false,"option":"SUBSTANDARD"}]');
    GetFutureGames().then(() => {
      ExpectEqual(future_teams[0].opposition, 'Blackfriars OS', test, 'Opposition');
      ExpectEqual(future_teams[0].image_url, '//websites.sportstg.com/pics/00/02/56/46/2564622_1_T.jpg', test, 'Image url');
      ExpectEqual(future_teams[0].date, 'Friday 31 July, 2020', test, 'Date');
      ExpectEqual(future_teams[0].round, 5, test, 'Round');
      ExpectEqual(future_teams[0].nickname, 'THE SCUM', test, 'Nickname');
      ExpectEqual(future_teams[0].location, 'University Oval', test, 'Location');
      ExpectEqual(future_teams[0].time, '7:00 PM', test, 'Time');
      ExpectEqual(future_teams.length, 1, test, 'Length of past teams');
      resolve();
    });
  });
}

function Reset() {
  $('#past-games-container').html('');
  $('#future-games-container').html('');
  $('#bowlies-container').html('');
}

var test_functions = [
  TestGetScoreTotal,
  TestPopulateWinOrLossVerb,
  TestPopulateNicknames,
  TestFindNickname,
  TestProcessLocation,
  TestExpandDate,
  TestOrderingFridayNightGame,
  TestGetPastGames,
  TestGetFutureGames,

  Reset
];


// TODO: Test Payneham in the @rse
// TODO: Test the winning margin override of 30 points for a win by forfeit.