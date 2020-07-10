// Embeds the CSS file and copies the HTML ready for pasting directly into MailChimp.
function CopyHTML(selector, all = false) {
  var HTML = document.createElement('textarea');
  fetch('get_css', { method: 'GET' })
    .then(response => response.text())
    .then(data => {

      // Embed CSS.
      HTML.value = '<style>' + data + '</style>';

      // Add content to copy.
      if (all = true) {
        HTML.value += document.querySelector('#past-games-container').outerHTML;
        HTML.value += document.querySelector('#future-games-container').outerHTML;
      } else {
        HTML.value += document.querySelector(selector).outerHTML;
      }

      // Execute copy.
      document.body.appendChild(HTML);
      HTML.select();
      document.execCommand('copy');
      document.body.removeChild(HTML);
    });
}

function CopyPastGamesHTML() {
  CopyHTML('#past-games-container');
}

function CopyFutureGamesHTML() {
  CopyHTML('#future-games-container');
}

function CopyAll() {
  CopyHTML('', true);
}