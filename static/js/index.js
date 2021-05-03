const ROUND_INDEX = 0;
const SKIP_THIS_GAME_CHECKBOX_INDEX = 1;
const IS_FINAL_CHECKBOX_INDEX = 2;

// Initialises a list of winning verbs.
// These will be used to describe uni beating another team.
function GetInitialisedWinningVerbs() {
  return [
    "smashed",
    "crushed",
    "flogged",
    "conquored",
    "obliterated",
    "slaughtered",
    "demolished",
    "spanked",
    "annihilated",
    "dismantled",
    "decimated",
    "destroyed",
    "wrecked",
  ];
}

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
        const row = input_data_table.row(e.target.parentElement);
        row.invalidate();
      }
    });
  };

  input_data_table = $("#input-data-table").DataTable({
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
      { title: "Include Team?", data: "skip_this_game" },
      { title: "Is A Final?", data: "is_final" },
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
    "#input-data-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (SKIP_THIS_GAME_CHECKBOX_INDEX + 1) +
    ") > input[type=checkbox]"
  );
}

function getIsFinalCheckboxSelector(rowIndex) {
  return (
    "#input-data-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (IS_FINAL_CHECKBOX_INDEX + 1) +
    ") > input[type=checkbox]"
  );
}

function getRoundInputSelector(rowIndex) {
  return (
    "#input-data-table > tbody > tr:nth-child(" +
    (rowIndex + 1) +
    ") > td:nth-child(" +
    (ROUND_INDEX + 1) +
    ") > input[type=number]"
  );
}

function ExtractJSONFromTable() {
  let rows = [];
  input_data_table.rows().every(function (rowIdx, tableLoop, rowLoop) {
    let row = this.data();

    // Get the boolean values out of the two checkboxes.
    let include_checkbox = $(getIncludeCheckboxSelector(rowIdx));
    let is_final_checkbox = $(getIsFinalCheckboxSelector(rowIdx));
    let round_input = $(getRoundInputSelector(rowIdx));

    row["skip_this_game"] = !include_checkbox.prop("checked");
    row["is_final"] = is_final_checkbox.prop("checked");
    row["round"] = round_input.val();

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

function WinLossSummary(teams) {
  // Enter the win/loss percentage.
  let wins = 0;
  let losses = 0;

  teams.forEach((team) => {
    if (isNaN(team.margin) || team.margin <= 0) ++losses;
    if (team.margin > 0) ++wins;
  });

  let winning_percentage = Math.round((wins / (wins + losses)) * 100);
  let grade = CalculateGrade(winning_percentage);

  if (winning_percentage == Number.NaN) return;

  return `<div class='row'><div class='col-md-12' id='win-loss-summary'>Uni won ${wins} out of ${
    wins + losses
  } = ${winning_percentage}% => ${grade}</div></div>`;
}

function OrderTeamsBasedOnMargins(teams) {
  var priority_queue = new PriorityQueue();

  for (let team of teams) {
    if (isNaN(team.margin) || team.margin === null)
      team.margin = -Number.MAX_VALUE;
    priority_queue.enqueue(team, team.margin);
  }

  teams = [];

  let sandy_coburn_cup_points = 1;

  while (!priority_queue.isEmpty()) {
    let team = priority_queue.dequeue().element;

    if (team.margin == -Number.MAX_VALUE) {
      team.sandy_points = 0;
    } else {
      team.sandy_points = sandy_coburn_cup_points;
      ++sandy_coburn_cup_points;
    }

    teams.push(team);
  }
  return teams;
}

function ApplyRandomWinningVerbs(teams) {
  let winning_verbs = GetInitialisedWinningVerbs();
  for (let team of teams) {
    if (team["win_or_loss_verb"] === "defeated") {
      // Use and remove a random verb from the list.
      team["win_or_loss_verb"] = winning_verbs.splice(
        Math.floor(Math.random() * winning_verbs.length),
        1
      )[0];
    }
  }
}

function GetGameDetailsFromServer(game, teams) {
  return new Promise((resolve) => {
    fetch("/get_game", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(game),
    })
      .then((response) => response.text())
      .then((game_data) => {
        teams.push(JSON.parse(game_data));
        resolve();
      });
  });
}

function GetFormattedBowliesHTML(teams) {
  // Clear current content, populate with only the title.
  let container = $("#bowlies-content-container");
  container.html(
    '<div class="row"><div class="col-md-12" id="bowlies-title">Hold Your Bowlies</div></div>'
  );

  container.append(WinLossSummary(teams));

  return new Promise((resolve) => {
    fetch("/bowlies-content.html", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(teams),
    })
      .then((response) => response.text())
      .then((html) => {
        container.append(html);
        resolve();
      });
  });
}

function GetFormattedSubstandardResultsHTML(teams) {
  let container = $("#substandard-results-container");
  container.html(
    '<p id="past-games-title"><b><i>"If winning is all there is, we want no part of it"</i></b></p>'
  );
  container.append(WinLossSummary(teams));

  ApplyRandomWinningVerbs(teams);
  console.log(teams);

  return new Promise((resolve) => {
    fetch("/substandard-results-content.html", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(teams),
    })
      .then((response) => response.text())
      .then((html) => {
        container.append(html);

        // Give the images time to load before the screenshot is taken.
        setTimeout(function () {
          HTMLElementToImage("#substandard-results-container");
          resolve();
        }, 3000);
      });
  });
}

function GetFormattedSubstandardFixturesHTML(teams) {
  let container = $("#substandard-fixtures-container");
  container.html(
    "<p id='future-games-title'><b>WHAT'S ON THIS WEEKEND</b></p>"
  );

  return new Promise((resolve) => {
    fetch("/substandard-fixtures-content.html", {
      method: "POST",
      "Content-Type": "application/json",
      body: JSON.stringify(teams),
    })
      .then((response) => response.text())
      .then((html) => {
        container.append(html);

        // Give the images time to load before the screenshot is taken.
        setTimeout(function () {
          HTMLElementToImage("#substandard-fixtures-container");
          resolve();
        }, 3000);
      });
  });
}

function FormatTeams(team_configurations_request_data, formatter_callback) {
  StartLoading();

  let teams = [];

  const promises = [];
  for (let team of team_configurations_request_data) {
    if (team["skip_this_game"]) continue;
    promises.push(GetGameDetailsFromServer(team, teams));
  }

  Promise.all(promises).then(() => {
    teams = OrderTeamsBasedOnMargins(teams);
    console.log(teams);
    formatter_callback(teams).then(() => EndLoading());
  });
}

function AutomateBowlies() {
  $("#bowlies-content-container").html("");
  let team_configurations_request_data = ExtractJSONFromTable();
  for (let team of team_configurations_request_data)
    team["is_past_game"] = true;
  FormatTeams(team_configurations_request_data, GetFormattedBowliesHTML);
}

function SubstandardResults() {
  $("#substandard-results-container").html("");
  let team_configurations_request_data = ExtractJSONFromTable();

  for (let team of team_configurations_request_data)
    team["is_past_game"] = true;

  FormatTeams(
    team_configurations_request_data,
    GetFormattedSubstandardResultsHTML
  );
}

function SubstandardFixtures() {
  $("#substandard-fixtures-container").html("");
  let team_configurations_request_data = ExtractJSONFromTable();

  for (let team of team_configurations_request_data)
    team["is_past_game"] = false;

  FormatTeams(
    team_configurations_request_data,
    GetFormattedSubstandardFixturesHTML
  );
}

function RunBowliesTests() {
  fetch("/test_data")
    .then((response) => response.text())
    .then((test_data_str) => {
      let teams_test_data = JSON.parse(test_data_str);
      FormatTeams(teams_test_data, GetFormattedBowliesHTML);
    });
}

function HTMLElementToImage(selector) {
  window.scrollTo(0, 0);
  html2canvas(document.querySelector(selector), {
    allowTaint: true,
  }).then((canvas) => {
    // Remove the HTML element.
    $(selector).html("");
    // Add the image.
    $(selector).append(canvas);
  });
}
