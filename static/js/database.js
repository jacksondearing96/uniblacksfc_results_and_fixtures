// File for making server requests that are relevant to updating or retrieving database cache.

// Gets the opposition clubs and their respective nicknames from the database cache.
function GetNicknamesFromCache() {
  return new Promise(resolve => {
    fetch('/get_nicknames', { method: 'GET' })
      .then(response => response.text())
      .then(nicknames_from_server => {
        nicknames = JSON.parse(nicknames_from_server);
        resolve();
      });
  });
}

// Gets the ground names and their associated nicknames from the cached resources.
function GetGroundNamesFromCache() {
  return new Promise(resolve => {
    fetch('/get_ground_names', { method: 'GET' })
      .then(response => response.text())
      .then(ground_names_from_server => {
        ground_names = JSON.parse(ground_names_from_server);
        resolve();
      });
  });
}

// Gets the urls that are used to override sportstg urls.
function GetOverrideImageUrlsFromCache() {
  return new Promise(resolve => {
    fetch('/get_override_image_urls', { method: 'GET' })
      .then(response => response.text())
      .then(override_image_urls_json_string => {
        override_image_urls = JSON.parse(override_image_urls_json_string);
        resolve();
      });
  });
}

function GetRoundsFromCache() {
  return new Promise(resolve => {
    fetch('/get_rounds', { method: 'GET' })
      .then(response => response.text())
      .then(rounds => {
        if (rounds === 'ERROR') {
          console.log("Couldn't read rounds from GCS");
          resolve();
          return;
        }

        rounds = JSON.parse(rounds);
        let index = 0;
        for (let team of past_teams) {
          team.round = rounds[index];
          ++index;
        }
        resolve();
      });
  });
}

function GetIncludesFromCache() {
  return new Promise(resolve => {
    fetch('/get_includes', { method: 'GET' })
      .then(response => response.text())
      .then(includes => {
        includes = JSON.parse(includes);
        let index = 0;
        for (let team of past_teams) {
          team.include = includes[index];
          ++index;
        }
        resolve();
      });
  });
}

function GetFinalsFromCache() {
  return new Promise(resolve => {
    fetch('/get_finals', { method: 'GET' })
      .then(response => response.text())
      .then(finals => {
        finals = JSON.parse(finals);
        let index = 0;
        for (let team of past_teams) {
          team.is_final = finals[index];
          ++index;
        }
        resolve();
      });
  });
}

function UpdatePlayerNamesFromDatabase() {
  return new Promise(resolve => {
    fetch('/update_player_names_from_database', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        if (data == 'SUCCESS') { console.log('Updated player names from database'); } else { console.log(data); }
        resolve();
      });
  });
}

function UpdateNicknamesFromDatabase() {
  return new Promise(resolve => {
    fetch('/update_nicknames_from_database', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        if (data == 'SUCCESS') { console.log('Updated nicknames from database'); } else { console.log(data); }
        resolve();
      });
  });
}

function UpdateGroundNamesFromDatabase() {
  return new Promise(resolve => {
    fetch('/update_ground_names_from_database', { method: 'GET' })
      .then(response => response.text())
      .then(data => {
        if (data == 'SUCCESS') { console.log('Updated ground names from database'); } else { console.log(data); }
        resolve();
      });
  });
}

function UpdateCacheFromDatabase() {
  return new Promise(resolve => {
    StartLoading();
    Promise.all([
      UpdatePlayerNamesFromDatabase(),
      UpdateNicknamesFromDatabase(),
      UpdateGroundNamesFromDatabase()
    ]).then(() => {
      EndLoading();
      resolve();
    })
  });
}

function SaveRoundsIncludesAndFinalsToCache() {
  return new Promise(resolve => {

    let rounds = [];
    let includes = [];
    let finals = [];
    for (let team of past_teams) {
      rounds.push(team.round);
      includes.push(team.include);
      finals.push(team.is_final);
    }

    const rounds_includes_and_finals = { "rounds": rounds, "includes": includes, "finals": finals };

    fetch('/save_rounds_includes_and_finals', { method: 'POST', 'Content-Type': 'application/json', body: JSON.stringify(rounds_includes_and_finals) })
      .then(response => response.text())
      .then(response => {

        let save_rounds_button = $('#save-rounds-button');

        if (response == 'SUCCESS') {
          ButtonSuccess(save_rounds_button, 'Saved');
        } else {
          ButtonFail(save_rounds_button, 'Save Failed')
        }

        resolve();
      });
  });
}