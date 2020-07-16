function PrintBowliesHTML(bowlies_html) {
  for (let i in bowlies_html) {
    let html = bowlies_html[i];
    $('#bowlies-container').append(html);
  }
}

function CalculateGrade(percentage) {
  if (percentage >= 85) return 'High Distinction';
  if (percentage >= 75) return 'Distinction';
  if (percentage >= 65) return 'Credit';
  if (percentage >= 50) return 'Pass';
  return 'Fail';
}

function IncludeWinLossSummary() {
  // Enter the win/loss percentage.
  let wins = 0;
  let losses = 0;
  past_teams.forEach((team) => {
    if (team.margin > 0) ++wins;
    if (team.margin < 0) ++losses;
  });

  let winning_percentage = wins / (wins + losses) * 100;
  let grade = CalculateGrade(winning_percentage);

  $('#bowlies-container').append(`<p id='winn-loss-summary'>Won ${wins} out of ${wins + losses} = ${winning_percentage}% => ${grade}</p>`)
}

function FormatBowlies() {
  // Clear current content, populate with only the title.
  $('#bowlies-container').html('<p id="bowlies-title"><b><i>Bowlies Results</i></b></p>');

  IncludeWinLossSummary();

  // TODO: This should be checked before every game. For 2020, every  game is played on a Saturday so this is not a high priority
  // for the 2020 season.
  let date = past_teams[0].date;
  IncludeDate('#bowlies-container', date);

  let bowlies_HTML = [];
  let completed_count = 0;

  past_teams.forEach((team, index) => {
    fetch('/bowlies.html', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(team) })
      .then(response => response.text())
      .then(data => {
        bowlies_HTML[index] = data;
        ++completed_count;
        if (completed_count === past_teams.length) PrintBowliesHTML(bowlies_HTML);
      });
  });
}

function GetMargin(team) {
  return GetScoreTotal(team.score_for) - GetScoreTotal(team.score_against);
}

function OrderTeamsBasedOnMargins() {
  var priority_queue = new PriorityQueue();

  for (let team_index in past_teams) {
    let team = past_teams[team_index];
    team.margin = GetMargin(team);
    priority_queue.enqueue(team, team.margin);
  }

  past_teams = []
  while (priority_queue.isEmpty() === false) {
    past_teams.push(priority_queue.dequeue().element);
  }
}

function SetBowliesFlag() {
  for (let i in past_teams) {
    past_teams[i].option = 'BOWLIES';
  }
}

function UpdatePlayerNamesFromDatabase() {
  fetch('/update_player_names_from_database', { method: 'GET' })
    .then(() => console.log('Updated player names from database'));
}

function AutomateBowlies() {
  SetBowliesFlag();
  GetPastGames().then(() => {
    UpdateTables(() => {
      OrderTeamsBasedOnMargins();
      FormatBowlies();
    });
  });
}