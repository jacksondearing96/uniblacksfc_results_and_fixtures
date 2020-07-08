import requests
from enum import Enum
from bs4 import BeautifulSoup
import json
import urllib

import url_generator

debug = True

PAST_GAME = True
FUTURE_GAME = False


class Game(object):
    def __init__(self, round, year):
        self.round = round
        self.year = year
        self.date = None
        self.time = None

        self.opposition = None
        self.image_url = None

        self.location = None
        self.location_url = None

        self.is_home_game = None
        self.result = None

        self.score_for = None
        self.score_against = None

        self.goal_kickers = None
        self.best_players = None


def PastGameJson(game):
    return {
        "nickname": None,
        "round": game.round,
        "date": game.date,
        "opposition": game.opposition,
        "result": "",
        "score_for": game.score_for,
        "score_against": game.score_against,
        "goal_kickers": game.goal_kickers,
        "best_players": game.best_players,
        "image_url": game.image_url
    }


def FutureGameJson(game):
    return {
        "nickname": None,
        "round": game.round,
        "date": game.date,
        "opposition": game.opposition,
        "location": game.location,
        "location_nickname": '',
        "division": '',
        "gender": '',
        "time": game.time,
        "image_url": game.image_url
    }


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
        return "WIN"
    if score_forTotal < score_againstTotal:
        return "LOSS"
    if score_forTotal == score_againstTotal:
        return "DRAW"
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


def ExtractGoalKickersAndBestPlayers(goal_kickers_and_best_players):
    goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
        'Goal Kickers:</span> ', '')
    goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
        'Best Players:</span> ', '')
    goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
        '<br>', '')

    goal_kickers_and_best_players = goal_kickers_and_best_players.split(
        '<span class="comp-bold">')

    goal_kickers = ''
    best_players = ''

    # TODO: Make this more robust. Check that the 'Goal Kickers' or 'Best Players' text is also present so we are sure.
    if len(goal_kickers_and_best_players) == 2:
        # This is when there are no goal kickers.
        best_players = goal_kickers_and_best_players[1]

    if len(goal_kickers_and_best_players) == 3:
        goal_kickers = goal_kickers_and_best_players[1]
        best_players = goal_kickers_and_best_players[2]

    return goal_kickers, best_players


def GetGame(url, round, year=2020, past_game=True):
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

    # TODO: Improve. Use regex.
    str_with_round_embedded = game_json['Venue']
    str_with_round_embedded = str_with_round_embedded.split('round=')
    str_with_round_embedded = str_with_round_embedded[1]
    str_with_round_embedded = str_with_round_embedded.split('&')
    str_with_round_embedded = str_with_round_embedded[0]
    game.round = int(str_with_round_embedded)

    # TODO: Make use of these attributes in the JSON:
    # isBye
    # PastGame

    # Get the location.
    game.location = urllib.unquote(game_json['VenueName'])
    if game.location == 'Forfeit':
        game.result = 'FORFEIT'
    game.location_url = game_json['VenueURL']

    # Get the match date and time.
    time_and_date = urllib.unquote(game_json['DateTime'])
    time_and_date = time_and_date.split('<br>')
    game.time = time_and_date[0]
    game.time = game.time.replace('&nbsp;', ' ')
    game.date = time_and_date[1]
    game.date = game.date.replace('&nbsp;', ' ')

    game.is_home_game = urllib.unquote(
        game_json['HomeClubName']) == u'Adelaide University'

    if past_game and game.result != 'FORFEIT':
        goal_kickers_and_best_players_list = game_json['MatchResults']

    if game.is_home_game:
        game.opposition = urllib.unquote(game_json['AwayClubName'])
        game.image_url = game_json['AwayClubLogo']
        if past_game:
            game.score_against = game_json['AwayScore']
            game.score_for = game_json['HomeScore']
            if game.result != 'FORFEIT':
                goal_kickers_and_best_players = goal_kickers_and_best_players_list[0]
    else:
        game.opposition = urllib.unquote(game_json['HomeClubName'])
        game.image_url = game_json['HomeClubLogo']
        if past_game:
            game.score_against = game_json['HomeScore']
            game.score_for = game_json['AwayScore']
            if game.result != 'FORFEIT':
                goal_kickers_and_best_players = goal_kickers_and_best_players_list[1]

    if past_game and game.result != 'FORFEIT':
        game.result = GetMatchResult(game.score_for, game.score_against)
        game.goal_kickers, game.best_players = ExtractGoalKickersAndBestPlayers(
            goal_kickers_and_best_players)
    else:
        if game.score_for == u'10.0-60':
            game.result = 'OPPOSITION_FORFEIT'

    return game


def GetPastGames(games):
    past_games = []
    for game in games:
        game['year'] = "2020"  # TODO: generalise this
        url = url_generator.GetUrl(
            int(game['year']), game['gender'], game['division'], game['round'])
        past_games.append(PastGameJson(
            GetGame(url, game['round'], game['year'], PAST_GAME)))
    return json.dumps(past_games)


def GetFutureGames(games):
    future_games = []
    for game in games:
        game["year"] = "2020"  # TODO: generalise this
        url = url_generator.GetUrl(
            int(game["year"]), game["gender"], game["division"], game["round"])
        future_games.append(FutureGameJson(
            GetGame(url, game["round"], game["year"], FUTURE_GAME)))
    return json.dumps(future_games)
