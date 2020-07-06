import requests
from enum import Enum
from bs4 import BeautifulSoup
import json
import urllib

debug = True


class Game(object):
    def __init__(self, round, year):
        self.round = round
        self.year = year
        self.date = None
        self.time = None

        self.opposition = None
        self.opposition_image_url = None

        self.location = None
        self.location_url = None

        self.is_home_game = None
        self.result = None

        self.score_for = None
        self.score_against = None

        self.goal_kickers_and_best_players = None


class Result(Enum):
    WIN = 1
    LOSS = 2
    DRAW = 3
    FORFEIT = 4
    OPPOSITION_FORFEIT = 5
    PENDING = 6
    BYE = 7


def Error(message, expected=None, actual=None):
    if (debug):
        print('(!) ERROR - ' + message)
        if expected is not None:
            print('\tExpected: ' + str(expected))
        if actual is not None:
            print('\tActual: ' + str(actual))


def GetMatchResult(score_forStr, score_againstStr):
    score_forTotal = int(score_forStr.split('-')[1])
    score_againstTotal = int(score_againstStr.split('-')[1])

    if score_forTotal > score_againstTotal:
        return Result.WIN
    if score_forTotal < score_againstTotal:
        return Result.LOSS
    if score_forTotal == score_againstTotal:
        return Result.DRAW
    return None


def GetMatchesJson(html):
    # Returns a JSON object that contains all the matches of the round.
    # Extracts the JSON object from a string within a <script> tag.
    # If JSON could not be parsed correctly, returns None.

    # Look through all the <script> elements.
    scripts = html.find_all('script')
    for scriptString in (script.text for script in scripts):
        if 'var matches =' in scriptString:
            # Strip away the javascript wrapping.
            text = scriptString.strip('var matches =')
            text = text.strip(';')
            try:
                matchesJSON = json.loads(text)
                return matchesJSON
            except:
                pass

    Error('Could not find match JSON in HTML of page.')
    return None


def GetGameJsonForAdelaideUni(matches):
    # Takes the JSON array of all the matches and returns the specific
    # object that represents the game which involved Adelaide Uni.
    if not matches:
        return None

    adelaideUni = u'Adelaide University'
    for match in matches:
        homeClub = urllib.unquote(match['HomeClubName'])
        awayClub = urllib.unquote(match['AwayClubName'])
        if homeClub == adelaideUni or awayClub == adelaideUni:
            return match

    Error('Could not find Adelaide uni in the list of matches.')
    return None


def GetAndVerifyYear(html, game, year):
    # Verify the year is correct. Year selection box is of this form:
    #
    # <select name="seasonID" id="id_seasonID" class="noprint">
    #     <option value="5918007">2019</option>
    #     <option value="5696920" selected="">2018</option>
    # ...
    #
    yearSelectionBoxStr = str(html.find('select', id='id_seasonID'))
    target = 'selected=""'
    selectedIndex = yearSelectionBoxStr.find(target)
    # Find the next '>' after the selected="" attribute.
    yearIndex = yearSelectionBoxStr.find('>', selectedIndex) + 1
    yearLength = 4
    actualYear = yearSelectionBoxStr[yearIndex: yearIndex + yearLength]

    if actualYear != str(year):
        Error('Incorrect year', actualYear, str(year))
        return None

    return int(actualYear)


def GetGame(url, round, year, past_game=True):
    if 'sportstg.com' not in url:
        return None

    page = requests.get(url)
    html = BeautifulSoup(page.content, 'html.parser')

    game = Game(round, year)

    game.year = GetAndVerifyYear(html, game, year)
    if game.year == None:
        return None

    # Verify the round=X variable is present in the url.
    if url.find('round=' + str(round)) == -1:
        Error('Round not present in the url')
        return None

    game_json = GetGameJsonForAdelaideUni(GetMatchesJson(html))

    # Get the location.
    game.location = urllib.unquote(game_json['VenueName'])
    if game.location == 'Forfeit':
        game.result = Result.FORFEIT
    game.location_url = game_json['VenueURL']

    # Get the match date and time.
    time_and_date = urllib.unquote(game_json['DateTime'])
    time_and_date = time_and_date.split('<br>')
    game.time = time_and_date[0]
    game.date = time_and_date[1]

    game.is_home_game = urllib.unquote(
        game_json['HomeClubName']) == u'Adelaide University'

    if past_game and game.result != Result.FORFEIT:
        goal_kickers_and_best_players_list = game_json['MatchResults']

    if game.is_home_game:
        game.opposition = urllib.unquote(game_json['AwayClubName'])
        game.opposition_image_url = game_json['AwayClubLogo']
        if past_game:
            game.score_against = game_json['AwayScore']
            game.score_for = game_json['HomeScore']
            if game.result != Result.FORFEIT:
                game.goal_kickers_and_best_players = goal_kickers_and_best_players_list[0]
    else:
        game.opposition = urllib.unquote(game_json['HomeClubName'])
        game.opposition_image_url = game_json['HomeClubLogo']
        if past_game:
            game.score_against = game_json['HomeScore']
            game.score_for = game_json['AwayScore']
            if game.result != Result.FORFEIT:
                game.goal_kickers_and_best_players = goal_kickers_and_best_players_list[1]

    if past_game and game.result != Result.FORFEIT:
        game.result = GetMatchResult(game.score_for, game.score_against)
    else:
        if game.score_for == u'10.0-60':
            game.result = Result.OPPOSITION_FORFEIT

    return game
