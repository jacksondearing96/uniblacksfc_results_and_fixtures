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

  let winning_percentage = Math.round(wins / (wins + losses) * 100);
  let grade = CalculateGrade(winning_percentage);

  $('#bowlies-container').append(`<div class='row'><div class='col-md-12' id='win-loss-summary'>Won ${wins} out of ${wins + losses} = ${winning_percentage}% => ${grade}</div></div>`)
}

function FormatBowlies() {
  // Clear current content, populate with only the title.
  $('#bowlies-container').html('<div class="row"><div class="col-md-12" id="bowlies-title">Hold Your Bowlies</div></div>');

  IncludeWinLossSummary();

  // TODO: Date checks --> should be doing some sort of check here.

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

  let sandy_coburn_cup_points = 1;

  while (priority_queue.isEmpty() === false) {
    let team = priority_queue.dequeue().element
    team['sandy_points'] = sandy_coburn_cup_points;
    ++sandy_coburn_cup_points;
    past_teams.push(team);
  }
}

function SetBowliesFlag() {
  for (let i in past_teams) {
    past_teams[i].option = 'BOWLIES';
  }
}

function UpdateCacheFromDatabase() {
  return new Promise((resolve) => {
    fetch('/update_cache_from_database', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        if (data == 'SUCCESS') console.log('Updated cache from database');
        resolve();
      });
  });
}

function SaveBowliesResults() {

  var bowlies_results = $('#bowlies-container').html();
  if (bowlies_results === '') return;

  fetch('/save_bowlies_results', { method: 'POST', 'Content-Type': 'text/html', body: bowlies_results })
    .then(response => {

      let save_button = $('#save-bowlies-button');

      console.log(response)
      if (response.status == 200) {
        save_button.removeClass('btn-primary');
        save_button.addClass('btn-success');
        save_button.html('saved')
      } else {
        save_button.removeClass('btn-primary');
        save_button.addClass('btn-danger');
        save_button.html('Save Failed')
      }
    });
}

function ButtonSuccess(button) {

}

function ButtonFail(button) {

}

function RestoreBowliesResults() {
  StartLoading();

  fetch('/restore_bowlies_results', { method: 'GET' })
    .then(response => response.text())
    .then(data => {
      EndLoading();

      let restore_button = $('#restore-button');

      if (data === 'SUCCESS') {
        restore_button.removeClass('btn-primary');
        restore_button.addClass('btn-success');
        restore_button.html('Restored');
        $('#bowlies-container').html(data);
        $('#bowlies-container').css('display', 'block');
      } else {
        restore_button.removeClass('btn-primary');
        restore_button.addClass('btn-danger');
        restore_button.html('Restore failed')
      }
    });
}


function GetSavedRounds() {
  return new Promise(resolve => {
    fetch('/get_rounds', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        data = JSON.parse(data);
        let index = 0;
        for (let team of past_teams) {
          team.round = data[index];
          ++index;
        }
        resolve();
      });
  });
}

function SaveRounds() {
  return new Promise(resolve => {
    let rounds = [];
    for (let team of past_teams) {
      rounds.push(team.round);
    }

    fetch('/save_rounds', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(rounds) })
      .then(response => response.text())
      .then(data => {
        console.log('Saved rounds: ' + data);
      });
  });
}

function AutomateBowlies() {

  StartLoading();

  // Hide the irrelevant tables.
  $('#past-games-table').css('display', 'none');
  $('#future-games-table').css('display', 'none');
  $('#bowlies-container').css('display', 'block');

  SetBowliesFlag();

  GetSavedRounds().then(() => {
    GetPastGames().then(() => {
      UpdateTables(() => {
        OrderTeamsBasedOnMargins();
        FormatBowlies();
        EndLoading();
      });
    });
  });
}