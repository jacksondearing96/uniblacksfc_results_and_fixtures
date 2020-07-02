// Colours for use in console
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

var express   = require('express');
var fs        = require('fs');
const { fork } = require('child_process');

var router = express.Router();

require('events').EventEmitter.defaultMaxListeners = 25;

router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Football Results Automation' });
});

// read the configurations file and send text back
// send back as a list of strings representing each line of the file
router.get('/configurations', function(req, res)
{
  var text = fs.readFileSync('configurations.csv').toString();
  res.send(text);
});

// accept a 'team' object, populate it's attributes and send back
router.post('/FindUrlCodes', function(req,res) 
{
  teams = req.body;

  (async() => {

    var browserAndPage = await LaunchHeadlessChrome();
    var browser = browserAndPage[0];
    var page = browserAndPage[1];

    await GoToAdelaideFootyLeagueWebsite(page);
    await ClickOnCompetitionSelectionDropBox(page);
    await ExtractUrlCodes(page, teams);
    browser.close();
    res.send(JSON.stringify(teams));

  })();
});

router.post('/saveConfigurations', function(req, res)
{
  var configurationsText = req.body[0];
  
  fs.writeFile('configurations.csv', configurationsText, function(err)
  {
    if (err)
    {
      console.log("Failed to save configurations");
      res.send("failure");
    }
  });

  console.log("Successfully saved configuraitons");
  res.send("success");

});

router.post('/saveTasks', function(req, res)
{
  var tasksHTML = req.body[0];
  fs.writeFile('taskManager.txt', tasksHTML, function (err, file) {
    if (err) throw err;
    console.log("Tasks saved to file");
  });
  res.send("");
});

router.get('/loadTasks', function(req, res)
{
  var text = fs.readFileSync('taskManager.txt').toString();
  res.send(text);
});

// accept a 'team' object, populate it's attributes and send back
router.post('/getResults', function(req,res) 
{
  const forked = fork('getResults.js');
  var team = req.body;
  forked.send(team);

  forked.on('message', (msg) => 
  {
    res.send(msg);
  });
});

async function ExtractUrlCodes(page, teams) {
  // capture each division in the drop down
  const options = await page.$$('#sblock4_dropdown option');

  for (let j = 0; j < teams.length; j++)
  {
    for (let i = 0; i < options.length; i++) 
    {
      let option = options[i];
  
      // obtain the text at each division option
      const optionText = await page.evaluate(
        option => option.innerText, option);
  
      if (await TextMatchesTeam(optionText, teams[j]) == true) {
        console.log("Found " + cMagenta + teams[j].nickname_ + cReset);
  
        // extract the competition code for the url
        url = await page.evaluate(option => option.value, option);
  
        var urlCodeStartIndex = url.indexOf("c=") + 2;
        var urlCodeEndIndex   = urlCodeStartIndex + url.substring(urlCodeStartIndex).indexOf("&");
        teams[j].urlCode_     = url.substring(urlCodeStartIndex, urlCodeEndIndex);
        console.log(teams[j].urlCode_);
        break;
      }
    }
  }
}

module.exports = router;