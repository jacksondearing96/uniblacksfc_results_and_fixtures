const ROUND_INDEX = 0;
const SKIP_THIS_GAME_CHECKBOX_INDEX = 1;
const IS_FINAL_CHECKBOX_INDEX = 2;

$(document).ready(function () {
  const createdCell = function (cell) {
    // Don't want the first 4 columns to be editable.
    // These are nickname, division, gender and year.
    if (cell.cellIndex < 4) return;

    let original;

    //cell.setAttribute("contenteditable", true);
    cell.setAttribute("spellcheck", false);

    cell.addEventListener("focus", function (e) {
      original = e.target.textContent;
    });

    cell.addEventListener("blur", function (e) {
      if (original !== e.target.textContent) {
        const row = bowlies_table.row(e.target.parentElement);
        row.invalidate();
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
      data: { year: 2021 },
      datatype: "JSON",
      dataSrc: (jsonTableData) => jsonTableData,
    },
    columns: [
      { title: "Round", data: "round" },
      { title: "Include", data: "skip_this_game" },
      { title: "Final", data: "is_final" },
      { title: "Nickname", data: "nickname" },
      { title: "Division", data: "division" },
      { title: "Gender", data: "gender" },
      { title: "Year", data: "year" },
    ],
    columnDefs: [
      {
        // Editable cells.
        targets: "_all",
        createdCell: createdCell,
      },
      {
        // Checkbox inputs.
        targets: SKIP_THIS_GAME_CHECKBOX_INDEX,
        searchable: false,
        orderable: false,
        className: "dt-body-center",
        render: function (data, type, full, meta) {
          return (
            '<input type="checkbox" checked name="id[]" value="' +
            $("<div/>").text(data).html() +
            '">'
          );
        },
      },
      {
        // Checkbox inputs.
        targets: IS_FINAL_CHECKBOX_INDEX,
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
      {
        // Checkbox inputs.
        targets: ROUND_INDEX,
        searchable: false,
        orderable: false,
        className: "dt-body-center",
        render: function (data, type, full, meta) {
          return '<input type="number" name="id[]" value="1">';
        },
      },
    ],
  });
});

function getIncludeCheckboxSelector(rowIndex) {
  return (
    "#bowlies-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (SKIP_THIS_GAME_CHECKBOX_INDEX + 1) +
    ") > input[type=checkbox]"
  );
}

function getIsFinalCheckboxSelector(rowIndex) {
  return (
    "#bowlies-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (IS_FINAL_CHECKBOX_INDEX + 1) +
    ") > input[type=checkbox]"
  );
}

function getRoundInputSelector(rowIndex) {
  return (
    "#bowlies-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (ROUND_INDEX + 1) +
    ") > input[type=number]"
  );
}

function ExtractJSONFromTable() {
  let rows = [];
  bowlies_table.rows().every(function (rowIdx, tableLoop, rowLoop) {
    let row = this.data();

    // Get the boolean values out of the two checkboxes.
    let include_checkbox = $(getIncludeCheckboxSelector(rowIdx));
    let is_final_checkbox = $(getIsFinalCheckboxSelector(rowIdx));
    let round_input = $(getRoundInputSelector(rowIdx));

    row["skip_this_game"] = !include_checkbox.prop("checked");
    row["is_final"] = is_final_checkbox.prop("checked");
    row["round"] = round_input.val();

    // Bowlies results must always be past games.
    row["is_past_game"] = true;

    rows.push(row);
  });
  return rows;
}

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

bowlies_teams = [];
function PopulateBowliesTeams() {
  bowlies_teams = [];
  for (let team of past_teams) {
    if (team.include === "true") bowlies_teams.push(team);
  }
}

function GetGameDetailsFromServer(game) {
  return new Promise((resolve) => {
    fetch("/get_game", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(game),
    })
      .then((response) => response.text())
      .then((game_data) => {
        bowlies_teams.push(JSON.parse(game_data));
        resolve();
      });
  });
}

function AutomateBowlies() {
  let team_configurations_request_data = ExtractJSONFromTable();
  console.log(team_configurations_request_data);

  // bowlies_teams = [];

  // const promises = [];
  // for (let i = 0; i < team_configurations_request_data.length; ++i) {
  //   if (team_configurations_request_data[i]["skip_this_game"]) continue;
  //   promises.push(
  //     GetGameDetailsFromServer(team_configurations_request_data[i])
  //   );
  // }

  // Promise.all(promises).then(() => {
  //   console.log(bowlies_teams);
  // });

  // StartLoading();

  // $("#bowlies-container").css("display", "block");

  // GetPastGames().then(() => {
  //   PopulateTablesWithNicknamesAndVerbs().then(() => {
  //     PopulateBowliesTeams();
  //     OrderBowliesTeamsBasedOnMargins();
  //     FormatBowlies().then(() => EndLoading());
  //   });
  // });
}
