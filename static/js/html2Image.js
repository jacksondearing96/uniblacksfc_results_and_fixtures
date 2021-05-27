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
