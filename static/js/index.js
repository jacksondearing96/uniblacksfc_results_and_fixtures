const ROUND_INDEX = 0;
const SKIP_THIS_GAME_CHECKBOX_INDEX = 1;
const IS_FINAL_CHECKBOX_INDEX = 2;
const ALL_OPTIONS = {
  error_info: true,
  dates_info: true,
  title: true,
  win_loss_summary: true,
  dates: true,
};

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

function ExtractTeamsJsonFromTable() {
  let rows = [];
  input_data_table.rows().every(function (rowIdx, tableLoop, rowLoop) {
    let row = this.data();

    // Get the boolean values out of the two checkboxes.
    let include_checkbox = $(getIncludeCheckboxSelector(rowIdx));
    let is_final_checkbox = $(getIsFinalCheckboxSelector(rowIdx));
    let round_input = $(getRoundInputSelector(rowIdx));

    if (!include_checkbox.prop("checked")) return;
    row["is_final"] = is_final_checkbox.prop("checked");
    row["round"] = round_input.val();

    rows.push(row);
  });
  return rows;
}

function AutomateBowlies() {}

function SubstandardResults() {
  StartLoading();

  let teams = ExtractTeamsJsonFromTable();

  fetch("/results", {
    method: "POST",
    "Content-Type": "application/json",
    body: JSON.stringify({ teams: teams, options: ALL_OPTIONS }),
  })
    .then((response) => response.text())
    .then((html) => {
      $("#content-from-server").html(html);
      EndLoading();
      // Give the images time to load before the screenshot is taken.
      setTimeout(function () {
        HTMLElementToImage(".screenshot-content");
      }, 3000);
    });
}

function SubstandardFixtures() {}

function RunBowliesTests() {
  fetch("/test_data")
    .then((response) => response.text())
    .then((test_data_str) => {
      let teams_test_data = JSON.parse(test_data_str);
      // TODO
    });
}

function RunSubstandardResultsTests() {
  fetch("/test_data")
    .then((response) => response.text())
    .then((test_data_str) => {
      let teams_test_data = JSON.parse(test_data_str);
      // TODO
    });
}

function RunSubstandardFixturesTests() {
  fetch("/test_data")
    .then((response) => response.text())
    .then((test_data_str) => {
      let teams_test_data = JSON.parse(test_data_str);
      // TODO
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
    $(selector).css("background-color", "grey");
  });
}
