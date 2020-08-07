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
    if (team.result == 'BYE' || team.error !== '') return;
    if (team.margin > 0) ++wins;
    if (team.margin < 0) ++losses;
    if (team.margin === 0) wins += 0.5;
  });

  let winning_percentage = Math.round(wins / (wins + losses) * 100);
  let grade = CalculateGrade(winning_percentage);

  $('#bowlies-container').append(`<div class='row'><div class='col-md-12' id='win-loss-summary'>Won ${wins} out of ${wins + losses} = ${winning_percentage}% => ${grade}</div></div>`)
}

function FormatBowlies() {
  // Clear current content, populate with only the title.
  $('#bowlies-container').html('<div class="row"><div class="col-md-12" id="bowlies-title">Hold Your Bowlies</div></div>');

  IncludeWinLossSummary();

  // TODO: Date checks --> should be doing some sort of check here.
  return new Promise(resolve => {
    fetch('/bowlies.html', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(past_teams) })
      .then(response => response.text())
      .then(html => {
        $('#bowlies-container').append(html);
        resolve();
      });
  });
}

function GetMargin(team) {
  if (team.result === 'OPPOSITION_FORFEIT') return 30; // TODO: test this.
  return GetScoreTotal(team.score_for) - GetScoreTotal(team.score_against);
}

function OrderTeamsBasedOnMargins() {
  var priority_queue = new PriorityQueue();

  for (let team_index in past_teams) {
    let team = past_teams[team_index];
    team.margin = (team.result === 'BYE') ? -Number.MAX_VALUE : GetMargin(team);
    priority_queue.enqueue(team, team.margin);
  }

  past_teams = [];

  let sandy_coburn_cup_points = 1;

  while (priority_queue.isEmpty() === false) {
    let team = priority_queue.dequeue().element;

    if (team.result == 'BYE' || team.error !== '') {
      team.sandy_points = 0;
    } else {
      team.sandy_points = sandy_coburn_cup_points;
      ++sandy_coburn_cup_points;
    }

    past_teams.push(team);
  }
}

function SetBowliesFlag() {
  for (let i in past_teams) {
    past_teams[i].option = 'BOWLIES';
  }
}

function SaveBowliesResults() {

  var bowlies_results = $('#bowlies-container').html();
  if (bowlies_results === '') return;

  fetch('/save_bowlies_results', { method: 'POST', 'Content-Type': 'text/html', body: bowlies_results })
    .then(response => {

      let save_button = $('#save-bowlies-button');

      console.log(response)
      if (response.status == 200) {
        ButtonSuccess(save_button, 'Saved');
      } else {
        ButtonFail(save_button, 'Save Failed');
      }
    });
}

function ButtonSuccess(button, new_text) {
  button.removeClass('btn-primary');
  button.removeClass('btn-danger');
  button.addClass('btn-success');
  button.html(new_text);
}

function ButtonFail(button, new_text) {
  button.removeClass('btn-primary');
  button.removeClass('btn-success');
  button.addClass('btn-danger');
  button.html(new_text);
}

function RestoreBowliesResults() {
  StartLoading();

  fetch('/restore_bowlies_results', { method: 'GET' })
    .then(response => response.text())
    .then(data => {
      EndLoading();

      let restore_button = $('#restore-button');

      if (data !== 'FAIL') {
        ButtonSuccess(restore_button, 'Restored');
        $('#bowlies-container').html(data);
        $('#bowlies-container').css('display', 'block');
      } else {
        ButtonFail(restore_button, 'Restore Failed');
      }
    });
}

function AutomateBowlies() {

  StartLoading();

  // Hide the irrelevant tables.
  $('#past-games-table').css('display', 'none');
  $('#future-games-table').css('display', 'none');
  $('#bowlies-container').css('display', 'block');

  SetBowliesFlag();

  GetRoundsFromCache().then(() => {
    GetPastGames().then(() => {
      PopulateTablesWithNicknamesAndVerbs().then(() => {
        OrderTeamsBasedOnMargins();
        FormatBowlies().then(() => EndLoading());
      });
    });
  });
}