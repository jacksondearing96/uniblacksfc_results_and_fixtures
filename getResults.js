
var puppeteer = require('puppeteer');

cReset   = "\x1b[0m";
cMagenta = "\x1b[35m";
cCyan    = "\x1b[36m";
cYellow  = "\x1b[33m";
cRed     = "\x1b[31m";
cBlack   = "\x1b[30m";
bgBlue   = "\x1b[44m";
bgGreen  = "\x1b[42m";
bgRed    = "\x1b[41m";
cWhite   = "\x1b[37m";

urlStart = "http://websites.sportstg.com/comp_info.cgi?a=ROUND&c=";
urlEnd   = "&pool=-1";

process.on('message', (team) => 
{
  if (team.success_ == true
      && team.pastGame_.result_ != null
      && team.futureGame_.result_ != null)
  {
    process.send(JSON.stringify(team));
    return;
  }
  
  var processesCompleted = [0, 0];
  GetResultsForTeam(team, processesCompleted);     
})

async function GetResultsForTeam(team, processesCompleted)
{
  try
  {
    team.success_ = true; // Set it true initially, set false if necessary
    console.log("SET SUCCESS of team");
    var browserAndPage = await LaunchHeadlessChrome();
    console.log("LAUNCHED HEADLESS CHROME");
    var browser = browserAndPage[0];
    var page = browserAndPage[1];
    console.log("Extracted page and browser");
    await page.goto(urlStart + team.urlCode_ + urlEnd);
    console.log("Landing on team's page");
  
    // ERROR PRONE, omit as it is not a completely necessary feature
    // console.log("Year starting");
    // await SelectYear(page, team);
    // console.log("year finished");
    console.log("selecting round");
    await SelectRound(page, team);
    console.log("round finished");

    const fixtureURL = await page.url();
  
    if (team.pastGame_.round_ != 0)
    {
      GetPastGameDetails(page, team, processesCompleted, browser);
    }
    else
    {
      processesCompleted[0] = true;
    }
  
    var futurePage = await browser.newPage();
    await futurePage.setDefaultNavigationTimeout(120000);
    if (team.lastRoundOfTheSeason_ != team.pastGame_.round_)
    {
      console.log("Finding future game details");
      await futurePage.goto(fixtureURL);
      if (team.pastGame_.round_ != 0)
      {
        await futurePage.waitForSelector("#rdlist-select svg.icon-arrow-right");
        await futurePage.click("#rdlist-select svg.icon-arrow-right");
      }
      GetFutureGameDetails(futurePage, team, processesCompleted, browser);
    }
    else
    {
      console.log("It was the last game of the season, no future game to report");
    }
  }
  catch(err)
  {
    team.success_ = false;
    console.log("*** TEAM FAILED ***");
    browser.close();
    console.log(err);
    process.send(JSON.stringify(team));
  }
}

async function CheckGetResultsProgress(team, processesCompleted, browser)
{
  if (processesCompleted[0] == 1 && processesCompleted[1] == 1)
  {
    browser.close();
    if ((team.pastGame_.result_ == null && team.pastGame_.opposition_ == null) 
      || (team.futureGame_.result_ == null && team.futureGame_.opposition_ == null))
    {
      team.success_ = false;
    }
    else
    {
      team.success_ = true;
    }
  
    process.send(JSON.stringify(team));
  }
}

async function LaunchHeadlessChrome() 
{
  // open headless chrome and extend minimum timeout
  console.log("LAUNCHING HEADLESS CHROME");
  var browser  = await puppeteer.launch({headless:true});
  console.log("NEW PAGE");
  var page = await browser.newPage();
  console.log("SETTING TIMEOUT");
  await page.setDefaultNavigationTimeout(120000);
  return [browser, page];
}

async function SelectYear(page, team)
{
  console.log("SELECTING ", team.year_);
  yearValueMap = 
  {
    2019:"5916972",
    2018:"5696695",
    2017:"5696697"
  };
  await page.select('select[name="seasonID"]', yearValueMap[team.year_]);

  // var  correctYearFound = false;

  // await page.waitForSelector('#id_seasonID');
  // const yearDropBox = await page.$("#id_seasonID");

  // console.log("about to click");
  // await page.click(yearDropBox);

  // console.log("hereee");

  // await page.waitForSelector('#id_seasonID option');
  // const yearOptions = await page.$$("#id_seasonID option");

  // for (let i = 0; i < yearOptions.length; i++)
  // {
  //   const yearOption = yearOptions[i];

  //   const yearOptionText = await page.evaluate(
  //     yearOption => yearOption.innerText, yearOption);

  //   if (Number(yearOptionText) == Number(team.year_))
  //   {
  //     var isSelected = await page.evaluate(
  //       yearOption => yearOption.selected, yearOption);

  //     if (isSelected)
  //     {
  //       console.log("Already selected!");
  //       break;
  //     }

  //     var valueToSelect = await page.evaluate(
  //       yearOption => yearOption.value, yearOption);

  //     await page.select('#id_seasonID', valueToSelect);
  //     correctYearFound = true;
  //     await SelectCompetition(page, team);
  //     break;
  //   }
  // }

  // if (correctYearFound)
  // {
  //   console.log("Correct year is selected (", team.year_, ")");
  // }
  // else
  // {
  //   throw "Correct year could not be found";
  // }
}

async function SelectCompetition(page, team)
{
  await page.waitForSelector('#compselectbox');
  await page.click('#compselectbox');

  // capture each division in the drop down
  const divisionDropBox = await page.$("#compselectbox");
  const divisionOptions = await page.$$('#compselectbox option');

  if (divisionOptions.length == 0)
  {
    throw "Couldn't find division in drop box";
  }

  for (let i = 0; i < divisionOptions.length; i++) 
  {
    // obtain the text at each division option
    let option = divisionOptions[i];
    const optionText = await page.evaluate(
      option => option.innerText, option);

    if (await TextMatchesTeam(optionText, team) == true) 
    {
      const valueToSelect = await page.evaluate(
        option => option.value, option);

      await page.select('#compselectbox', valueToSelect);
      return;
    }
  }

  // can use this to verify. 
  // var optionSelected = await page.evaluate(
  //   divisionDropBox => divisionDropBox.options[divisionDropBox.selectedIndex].innerText, divisionDropBox);

  throw "FAILED to find the competition";
}

// For now, default this function to just select NORMAL SEASON every time
async function SelectMinorRoundOrFinals(page, team)
{
  await page.waitForSelector('a.actpool');
  await page.$("a.actpool");
  await page.click('a.actpool');

  await page.waitForSelector(".nonactpool-wrap.showpools a");
  var roundOptions = await page.$$(".nonactpool-wrap.showpools a");

  for (let i = 0; i < roundOptions.length; i++)
  {
    const roundOption = roundOptions[i];
    const roundOptionText = await page.evaluate(
      roundOption => roundOption.innerText, roundOption);

    if (team.final_ == false && roundOptionText.toLowerCase() == "normal season")
    {
      console.log("clicking on normal season option");
      await page.click(".nonactpool-wrap.showpools a:nth-child(" + (i + 1) + ")");
      return;
    }
    else if (isAFinal == true && roundOptionText.toLowerCase() == "finals")
    {
      console.log("clicking on finals match option");
      await page.click(".nonactpool-wrap.showpools a:nth-child(" + (i + 1) + ")");
      return;
    }
  }

  throw "finals/minor round couldn't be found or selected";
}

async function SelectRound(page, team)
{
  await page.waitForSelector("#rdlist-select");
  const options = await page.$$('#rdlist-select option');
  console.log("number of round options: ", options.length);

  if (options.length == 0)
  {
    team.success_ = 0;
    throw "Number of round options was 0";
  }
  else if (options.length <= 5 && team.final_ == false)
  {
    console.log("Selecting minor round");
    await SelectMinorRoundOrFinals(page, team);
    console.log("minor round selection finished");
    await page.waitForSelector("#rdlist-select");
    const options = await page.$$('#rdlist-select option');
    console.log("number of round options: ", options.length);
  }

  for (let i = 0; i < options.length; i++) 
  {
    // obtain the text at each division option
    let option = options[i];
    const optionValue = await page.evaluate(
      option => option.value, option);
  
    if ((optionValue == team.pastGame_.round_) || (optionValue == 1 && team.pastGame_.round_ == 0))
    {
      console.log("Found the correct round");
      await page.select('select[name="round"]', optionValue);
      return;
    }
  }
}

async function GetPastGameDetails(page, team, processesCompleted, browser) {
  console.log("getting past game details");

  await page.waitForSelector("div.match-detail");
  await page.waitFor(1500);
  
  const pClubs = await page.$$('a.m-team');
  var pClubCount = 0;

  // iterate through each pClub in the fixture
  for (const pClub of pClubs) {
    pClubCount++;

    if (await clubIsAUFC(page, pClub)) {
      console.log("Found AUFC in fixture");
      team.pastGame_.date_ = await getGameDate(page);
      if (await roundIsABye(page, team.pastGame_) == false) {
        console.log("Round was not a bye");
        noResults = false;

        pHomeAwayIndex = await homeOrAway(page, pClub);
        team.pastGame_.home_ = pHomeAwayIndex ? true : false;

        var oppositionAndURL = await getOppositionClub(
          page, pClubs, pClubCount, pHomeAwayIndex);
        team.pastGame_.opposition_ = oppositionAndURL[0];
        team.pastGame_.oppositionImageUrl_ = oppositionAndURL[1];

        team.pastGame_.location = await getGameLocation(page, pClubCount, pHomeAwayIndex, team, team.pastGame_);

        if (team.pastGame_.result_ != 'forfeit' && !noResults) 
        {
          await getScores(page, pClubCount, pHomeAwayIndex, team);
          await getGoalKickersAndBestPlayers(page, pClubCount, pHomeAwayIndex, team);
        }

        console.log("\n");

      } // end if it was a bye

      processesCompleted[0] = 1;
      CheckGetResultsProgress(team, processesCompleted, browser);
      break; // if AUFC is found, no need to continue loop
    } // end if club was AUFC
  } // end loop through Clubs
}

async function clubIsAUFC(page, Club) 
{
  // find the name of the fClub
  const clubName = await page.evaluate(
    Club => Club.innerText, Club
  );

  // check if the Club is Adelaide uni
  if (clubName.includes("Adelaide University")) 
  {
    return true;
  } 
  else 
  {
    return false;
  }
}

async function roundIsABye(page, game) 
{
  const byeTeams = await page.$$('div.m-bye');
  for (const byeTeam of byeTeams)
  {
    const text = await page.evaluate(byeTeam => byeTeam.textContent, byeTeam);
    if (text.includes("Adelaide University"))
    {
      console.log(bgRed+cWhite + "BYE for AUFC this round" + cReset + "\n\n\n");
      game.result_ = 'bye';
      return true;
    }
  }
  return false;
}

async function homeOrAway(page, Club) 
{
  // obtain class names from the HTML element
  const ClubClasses = await page.evaluate(
    Club => Club.className, Club);

  // determine if AUFC was home or away
  if (ClubClasses.includes("m-home")) 
  {
    console.log("AUFC played at" + cCyan + " home" + cReset);
    homeAwayIndex = 1;
  } 
  else if (ClubClasses.includes("m-away")) 
  {
    console.log("AUFC played " + cCyan + "away" + cReset);
    homeAwayIndex = -1;
  }

  return homeAwayIndex;
}

async function getOppositionClub(page, Clubs, ClubCount, homeAwayIndex) 
{
  // now allocate the opp Club according to homeAwayIndex
  var spotInFixture = 0;

  for (var i = 0; i < Clubs.length; i++) 
  {
    const OtherClub = Clubs[i];
    spotInFixture++;

    if (spotInFixture == ClubCount + homeAwayIndex) 
    {
      const OppClub = await page.evaluate(
        OtherClub => OtherClub.innerText, OtherClub);

      await page.waitForSelector(".m-img img");
      var teamImages = await page.$$(".m-img img");
      oppositionImage = teamImages[i];
      oppositionImageURL = await page.evaluate(
        oppositionImage => oppositionImage.src, oppositionImage);

      console.log("Opposition: ", cMagenta + OppClub + cReset);
      console.log("Opposition image URL: ", oppositionImageURL);
      return [OppClub, oppositionImageURL];
    }
  }
}


async function getGameLocation(page, ClubCount, homeAwayIndex, team, game) 
{
  await getRawLocationString(page, ClubCount, homeAwayIndex, team);
  locationStr = await removeMapFromLocation(locationStr);
  locationStr = await capitaliseLetterAfterBracket(locationStr);
  game.locationURL_ = "http://websites.sportstg.com/" + locationURL;

  await checkForForfeit(game, locationStr);

  if (game.result_ == "forfeit") 
  {
    return null;
  }
  else
  {
    console.log("Location: ", cYellow + locationStr + cReset);
    return locationStr;
  }
}


async function getRawLocationString(page, ClubCount, homeAwayIndex, team) 
{
  locationStr = "";
  locationDivHTML = "";
  locationURL = "";

  // m-detail class contains match time and location
  // time is the even index, location is the odd index
  const matchDetails = await page.$$('.m-detail');

  var htmlElementCounter = 0;
  for (const matchDetail of matchDetails) 
  {
    htmlElementCounter++;

    if (await correctLocationElement(htmlElementCounter, ClubCount, homeAwayIndex)) 
    {
      locationStr = await page.evaluate(
        matchDetail => matchDetail.innerText, matchDetail);

      locationDivHTML = await page.evaluate(
        matchDetail => matchDetail.innerHTML, matchDetail);

      locationURL = await ExtractLocationURL(locationDivHTML);
    }

    if (await correctTimeElement(htmlElementCounter, ClubCount, homeAwayIndex)) 
    {
      team.futureGame_.time_ = await page.evaluate(
        matchDetail => matchDetail.innerText, matchDetail
      );
      console.log("Time of game is: " + cCyan, team.futureGame_.time_ + cReset);
    }
  }
}

function ExtractLocationURL(html)
{
  var indexOfHref = html.indexOf('href="');
  var lengthOfHrefPrefix = 6;
  var i = indexOfHref + lengthOfHrefPrefix;

  var url = "";
  while (html[i] != '"')
  {
    url += html[i];
    i++;
  }
  return url;
}

function correctLocationElement(htmlElementCounter, ClubCount, homeAwayIndex) 
{
  // allocate location differently depending on whether AUFC was home or away
  if (htmlElementCounter == ClubCount && homeAwayIndex == -1) 
  {
    return true;
  }

  if (htmlElementCounter == ClubCount+1 && homeAwayIndex == 1) 
  {
    return true;
  }

  return false;
}


function correctTimeElement(htmlElementCounter, ClubCount, homeAwayIndex) 
{
  if (htmlElementCounter == ClubCount-1 && homeAwayIndex == -1) 
  {
    return true;
  }

  if (htmlElementCounter == ClubCount && homeAwayIndex == 1) 
  {
    return true;
  }

  return false;
}


function removeMapFromLocation(locationStr) 
{
  // process the string to remove (MAP)
  const pMapIndex = locationStr.indexOf("(MAP)");
  locationStr = locationStr.substring(0,pMapIndex-1);

  // code to idealise capitalisation
  var splitStr = locationStr.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) 
  {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  locationStr = splitStr.join(' ');
  return locationStr;
}


function capitaliseLetterAfterBracket(locationStr) 
{
  if (locationStr.includes('(')) 
  {
    var bracInd = locationStr.indexOf('(');
    var upLet   = locationStr.charAt(bracInd+1).toUpperCase();
    locationStr = locationStr.substring(0,bracInd+1) + upLet +
                  locationStr.substring(bracInd+2,
                  locationStr.length);
  }
  return locationStr;
}


function checkForForfeit(game, locationStr) 
{
  if (locationStr.toLowerCase().includes('forfeit')) 
  {
    game.result_ = "forfeit";
    console.log(bgRed + cWhite + "There was a forfeit" + cReset);
  } 
}


async function getGameDate(page) 
{
  // find all the 'day wrap' blocks
  const days = await page.$$(".day-wrap");

  // cycle through different day wraps of the round
  dayWrapsCount=0;
  for (const day of days) {
    dayWrapsCount++;

    // try to find AUFC in the pDay
    const dayTextContent = await page.evaluate(
      day => day.textContent, day
    );

    if (dayTextContent.includes("Adelaide University")) 
    {
      gameDate = await getActualDate(page, dayWrapsCount);
      break; // if we've found the right pDay
    }
  }

  //gameDate = expandDate(gameDate);
  console.log("Date of game was: ", cRed+ gameDate + cReset);
  return gameDate;
}



async function getActualDate(page) 
{

  // capture the actual DATE divs
  const dates = await page.$$(".match-date");
  dateCounter=0;

  // find the corresponding pDate to the matched pDay-wrap
  for (const date of dates) 
  {
    dateCounter++;
    if (dateCounter == dayWrapsCount) 
    {
      gameDate = await page.evaluate(
        date => date.innerText, date);
      return gameDate;
    }
  }
}


async function getScores(page, ClubCount, homeAwayIndex, team) 
{
  // capture all the scores on the page
  const scores = await page.$$(".m-score");

  // loop through each score
  scoresCount = 0;
  for (const score of scores) 
  {
    scoresCount++;
    await setAUFCScore(page, scoresCount, ClubCount, score, team);
    await allocateOppScore(page, homeAwayIndex, scoresCount, ClubCount, score, team);
  }

  await checkScoresWereEntered(page, team);
}


async function setAUFCScore(page, scoresCount, ClubCount, score, team) 
{
  if (scoresCount == ClubCount) 
  {
    team.pastGame_.scoreFor_ = await page.evaluate(
      score => score.innerText, score
    );
  }
}


async function allocateOppScore(page, homeAwayIndex, scoreCount, ClubCount, score, team) 
{
  if (homeAwayIndex == 1 && scoreCount == ClubCount+1) 
  {
    team.pastGame_.scoreAgainst_ = await page.evaluate(
      score => score.innerText, score
    );
  }

  if (homeAwayIndex == -1 && scoreCount == ClubCount-1) 
  {
    team.pastGame_.scoreAgainst_ = await page.evaluate(
      score => score.innerText, score
    );
  }
}


async function checkScoresWereEntered(page, team) 
{
  if (team.pastGame_.scoreFor_ == "" && 
    team.pastGame_.scoreAgainst_ == "" && 
    team.pastGame_.result_ != 'forfeit') 
  {
    noResults = true;
    console.log(bgRed+cWhite + "No scores have been entered yet" +
      cReset);
  } 
  else 
  {
    noResults = false;
    console.log("Uni score was: ", cWhite + team.pastGame_.scoreFor_ + cReset);
    console.log(team.pastGame_.opposition_ + " score was: ",cWhite +
                team.pastGame_.scoreAgainst_ +cReset);
  }
}


async function getGoalKickersAndBestPlayers(page, ClubCount, homeAwayIndex, team) 
{
  resultString = "Goal Kickers Best Players";

  // use ClubCount of AUFC to calculate the match centre index
  const matchCentreIndex = Math.floor((ClubCount+1) / 2);
  await goToMatchCentre(page, matchCentreIndex);

  resultString = await obtainBPGKString(page, homeAwayIndex);
  await processAndSetResultString(resultString, team);
}


async function goToMatchCentre(page, matchCentreIndex) 
{
  const matchCentreLinks = await page.$$('.match-link');

  // loop through links, click on one for AUFC
  linkCount = 0;
  for (link of matchCentreLinks) 
  {
    linkCount++;
    if (linkCount == matchCentreIndex) 
    {
      link.click();
      await page.waitForNavigation();
      break;
    }
  }
}


async function obtainBPGKString(page, homeAwayIndex) 
{
  // obtain the set of two player results
  const playerResults = await page.$$('.tg-results');
  const gameSummaries = await page.$$('.team-game-summary');

  var resultsString = "(!) Failed to extraxt the BP and GK";

  for (let i = 0; i < gameSummaries.length; i++) 
  {
    var gameSummary = gameSummaries[i];
    var gameSummaryHTML = await page.evaluate(
      gameSummary => gameSummary.textContent, gameSummary
    );

    if (gameSummaryHTML.toLowerCase().includes("adelaide university")) 
    {
      var playerResult = playerResults[i];
      resultString = await page.evaluate(
        playerResult => playerResult.textContent, playerResult
      );
      break;
    }
  }
  return resultString;
}


function processAndSetResultString(resultString, team) 
{
  // determine indicies of start/end of BP and GK
  const startBP = resultString.indexOf("Best Players");
  const endBP = resultString.length;

  const startGK = resultString.indexOf("Goal Kickers");
  const endGK = startBP;

  team.pastGame_.bestPlayers_ = resultString.substring(startBP+14, endBP);
  team.pastGame_.goalKickers_ = resultString.substring(startGK+14, endGK);

  console.log(bgBlue+"Goal Kickers: "+cReset, team.pastGame_.goalKickers_);
  console.log(bgBlue+"Best Players: "+cReset, team.pastGame_.bestPlayers_);
}


async function GetFutureGameDetails(page, team, processesCompleted, browser) 
{
  await page.waitForSelector("a.m-team");
  await page.waitFor(1500);

  const fClubs = await page.$$('a.m-team');
  
  var fClubCount = 0;

  // iterate through each fClub in the fixture
  for (const fClub of fClubs) {
    fClubCount++;

    if (await clubIsAUFC(page, fClub)) 
    {
      team.futureGame_.date_ = await getGameDate(page);
      if (await roundIsABye(page, team.futureGame_) == false) 
      {
        fHomeAwayIndex = await homeOrAway(page, fClub);
        team.futureGame_.home_ = fHomeAwayIndex ? true : false;

        oppositionAndURL = await getOppositionClub(
          page, fClubs, fClubCount, fHomeAwayIndex);
        team.futureGame_.opposition_ = oppositionAndURL[0];
        team.futureGame_.oppositionImageUrl_ = oppositionAndURL[1];
        team.futureGame_.location_ = await getGameLocation(page, fClubCount, fHomeAwayIndex, team, team.futureGame_);

        console.log("\n\n");

      } // end if it was a bye
      processesCompleted[1] = 1;
      CheckGetResultsProgress(team, processesCompleted, browser);
      break // if Adelaide uni fClub is found, no need to keep going
    }
  }
}

async function GoToAdelaideFootyLeagueWebsite(page) 
{
  var adelaideFootyLeagueHomeUrl = "http://www.adelaidefootball.com.au/";
  await page.goto(adelaideFootyLeagueHomeUrl);
}

async function ClickOnCompetitionSelectionDropBox(page) 
{
  await page.waitForSelector('#sblock4_dropdown');
  await page.click('#sblock4_dropdown');
}

function TextMatchesTeam(text, team)
{
    text = text.toLowerCase();
    text = RemoveYear(text);

    var division = team.division_.toLowerCase();
    var sponsor  = team.sponsor_.toLowerCase();

    if (text.includes(sponsor) == false)
    {
        return false;
    }
    text = text.replace(sponsor, "");

    if (division.includes("r"))
    {
        if (text.includes('reserves') == false)
        {
          return false;
        }
        division = division.replace("r", "");
        text = text.replace("reserves", "");
    }

    if (text.includes('reserves') && division.includes('r') == false)
    {
      return false;
    }

    if (text.includes(division) == false)
    {
      return false;
    }

    return true;
}

function RemoveYear(text)
{
  for (var year = 2013; year < 2030; year++)
  {
    if (text.includes(year.toString()))
    {
      text = text.replace(year.toString(), "");
      break;
    }
  }
  return text;
} 