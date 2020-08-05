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