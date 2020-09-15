function activateMenuItem(menuItem) {
  menuItem.css('background-color', 'black');
  menuItem.css('color', 'white');
}

function deactivateMenuItem(menuItem) {
  console.log(menuItem);
  menuItem.css('background-color', 'grey');
  menuItem.css('color', 'black');
}

function deactivateAllMenuItems() {
  $('.song-menu-item').each((index, menuItem) => deactivateMenuItem($(menuItem)));
}

function displaySong(song) {
  let titleContainer = $('#song .title');
  let lyricsContainer = $('#song .lyrics');

  titleContainer.html('');
  lyricsContainer.html('');

  titleContainer.append(song.title);
  lyricsContainer.append(song.lyrics);
}

function initialiseMenuItems() {
  const songMenuItems = document.getElementsByClassName('song-menu-item');

  Array.from(songMenuItems).forEach(songMenuItem => {
    songMenuItem.addEventListener('click', (clickedElement) => {

      deactivateAllMenuItems();

      // Activate target item.
      let menuItem = $(clickedElement.path[0]);
      if (menuItem.is('IMG')) menuItem = menuItem.parent();
      activateMenuItem(menuItem);

      // Get the newly selected song.
      let songId = menuItem.data("song-id");
      let song = songs[songId];
      if (song === undefined) return;

      displaySong(songs[songId]);
    });
  });
}

$(document).ready(() => {
  initialiseMenuItems();
});

let songs = {
  holdYourBowlies: {
    title: 'Hold Your Bowlies',
    lyrics: `
    It’s time for Hold Your Bowlies
    It’s time to drink West End
    It’s time to start the follies
    And to meet the club le-gend
    
    It’s time to read the BPs
    It’s time to hear the scores
    It’s time to hand out freebies
    And to hear who won the wars
    
    We nom-i-nate a skuller
    To down two jugs real quick
    Cour-tes-y of our landlord
    And then he spews up sick
    (really spews up sick!)
    
    It’s time to put on makeup
    It’s time to dress up right
    It’s time to get things started
    (why don’t we get things started)
    It’s time to get things started
    On the most sensational
    Inspirational
    Celebrational 
    Bob Neil-ational
    This is what we call
    Hold Your Bowlies`
  },

  greenGingerWine: {
    title: 'Green Ginger Wine',
    lyrics: `Greeeeeeen ginger wine`
  }
};