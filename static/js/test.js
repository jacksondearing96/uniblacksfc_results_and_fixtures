function GetTestData() {
  return new Promise((resolve) => {
    fetch("/test_data")
      .then((response) => response.text())
      .then((test_data_str) => {
        resolve(JSON.parse(test_data_str));
      });
  });
}

function RunBowliesTests() {
  GetTestData().then((teams) => {
    SendTeamsRequestToServer("/bowlies", teams, /* convertToImage= */ false);
  });
}

function RunSubstandardResultsTests() {
  GetTestData().then((teams) => {
    SendTeamsRequestToServer("/results", teams, /* convertToImage= */ true);
  });
}

function RunSubstandardFixturesTests() {
  GetTestData().then((teams) => {
    SendTeamsRequestToServer("/fixtures", teams, /* convertToImage= */ true);
  });
}
