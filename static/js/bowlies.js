$(document).ready(function () {
  fetch("/input-table-teams-data", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((data) => {
      // console.log(data);
      // console.log(JSON.parse(data));
    });
});

$(document).ready(function () {
  const SKIP_THIS_GAME_CHECKBOX_INDEX = 4;
  const IS_FINAL_CHECKBOX_INDEX = 5;

  const createdCell = function (cell) {
    let original;

    cell.setAttribute("contenteditable", true);
    cell.setAttribute("spellcheck", false);

    cell.addEventListener("focus", function (e) {
      original = e.target.textContent;
    });

    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = bowlies_table.row(e.target.parentElement);
        row.invalidate();
        console.log("Row changed: ", row.data());
      }
    });
  };

  bowlies_table = $("#bowlies-table").DataTable({
    paging: false,
    bInfo: false,
    bSort: false,
    bFilter: false,
    processing: true,
    serverSide: true,
    ajax: {
      url: "/input-table-teams-data",
      datatype: "JSON",
      dataSrc: (jsonTableData) => jsonTableData,
    },
    columns: [
      { title: "Nickname", data: "nickname" },
      { title: "Division", data: "division" },
      { title: "Gender", data: "gender" },
      { title: "Year", data: "year" },
      { title: "Include", data: "skip_this_game" },
      { title: "Final", data: "is_final" },
      { title: "Round", data: "round" },
    ],
    columnDefs: [
      {
        // Editable cells.
        targets: "_all",
        createdCell: createdCell,
      },
      {
        // Checkbox inputs.
        targets: [SKIP_THIS_GAME_CHECKBOX_INDEX, IS_FINAL_CHECKBOX_INDEX],
        searchable: false,
        orderable: false,
        className: "dt-body-center",
        render: function (data, type, full, meta) {
          return (
            '<input type="checkbox" name="id[]" value="' +
            $("<div/>").text(data).html() +
            '">'
          );
        },
      },
    ],
  });
});

function CalculateGrade(percentage) {
  if (percentage >= 85) return "High Distinction";
  if (percentage >= 75) return "Distinction";
  if (percentage >= 65) return "Credit";
  if (percentage >= 50) return "Pass";
  return "Fail";
}

function IncludeWinLossSummary() {
  // Enter the win/loss percentage.
  let wins = 0;
  let losses = 0;

  past_teams.forEach((team) => {
    if (team.result == "BYE" || team.error !== "") return;
    if (team.margin > 0) ++wins;
    if (team.margin < 0) ++losses;
    if (team.margin === 0) wins += 0.5;
  });

  let winning_percentage = Math.round((wins / (wins + losses)) * 100);
  let grade = CalculateGrade(winning_percentage);

  if (winning_percentage == Number.NaN) return;

  $("#bowlies-container").append(
    `<div class='row'><div class='col-md-12' id='win-loss-summary'>Won ${wins} out of ${
      wins + losses
    } = ${winning_percentage}% => ${grade}</div></div>`
  );
}

function FormatBowlies() {
  // Clear current content, populate with only the title.
  $("#bowlies-container").html(
    '<div class="row"><div class="col-md-12" id="bowlies-title">Hold Your Bowlies</div></div>'
  );

  IncludeWinLossSummary();

  // TODO: Date checks --> should be doing some sort of check here.
  return new Promise((resolve) => {
    fetch("/bowlies.html", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(bowlies_teams),
    })
      .then((response) => response.text())
      .then((html) => {
        $("#bowlies-container").append(html);
        resolve();
      });
  });
}

function GetMargin(team) {
  if (team.result === "OPPOSITION_FORFEIT") return 30; // TODO: test this.
  return GetScoreTotal(team.score_for) - GetScoreTotal(team.score_against);
}

function OrderBowliesTeamsBasedOnMargins() {
  var priority_queue = new PriorityQueue();

  for (let team_index in bowlies_teams) {
    let team = bowlies_teams[team_index];
    team.margin = team.result === "BYE" ? -Number.MAX_VALUE : GetMargin(team);
    priority_queue.enqueue(team, team.margin);
  }

  bowlies_teams = [];

  let sandy_coburn_cup_points = 1;

  while (priority_queue.isEmpty() === false) {
    let team = priority_queue.dequeue().element;

    if (team.result == "BYE" || team.error !== "") {
      team.sandy_points = 0;
    } else {
      team.sandy_points = sandy_coburn_cup_points;
      ++sandy_coburn_cup_points;
    }

    bowlies_teams.push(team);
  }
}

// function SaveBowliesResults() {

//   var bowlies_results = $('#bowlies-container').html();
//   if (bowlies_results === '') return;

//   fetch('/save_bowlies_results', { method: 'POST', 'Content-Type': 'text/html', body: bowlies_results })
//     .then(response => {

//       let save_button = $('#save-bowlies-button');

//       if (response.status == 200) {
//         ButtonSuccess(save_button, 'Saved');
//       } else {
//         ButtonFail(save_button, 'Save Failed');
//       }
//     });
// }

function ButtonSuccess(button, new_text) {
  button.removeClass("btn-primary");
  button.removeClass("btn-danger");
  button.addClass("btn-success");
  button.html(new_text);
}

function ButtonFail(button, new_text) {
  button.removeClass("btn-primary");
  button.removeClass("btn-success");
  button.addClass("btn-danger");
  button.html(new_text);
}

// function RestoreBowliesResults() {
//   StartLoading();

//   fetch('/restore_bowlies_results', { method: 'GET' })
//     .then(response => response.text())
//     .then(data => {
//       EndLoading();

//       let restore_button = $('#restore-button');

//       if (data !== 'FAIL') {
//         ButtonSuccess(restore_button, 'Restored');
//         $('#bowlies-container').html(data);
//         $('#bowlies-container').css('display', 'block');
//       } else {
//         ButtonFail(restore_button, 'Restore Failed');
//       }
//     });
// }

bowlies_teams = [];
function PopulateBowliesTeams() {
  bowlies_teams = [];
  for (let team of past_teams) {
    if (team.include === "true") bowlies_teams.push(team);
  }
}

function AutomateBowlies() {
  StartLoading();

  $("#bowlies-container").css("display", "block");

  GetPastGames().then(() => {
    PopulateTablesWithNicknamesAndVerbs().then(() => {
      PopulateBowliesTeams();
      OrderBowliesTeamsBasedOnMargins();
      FormatBowlies().then(() => EndLoading());
    });
  });
}
