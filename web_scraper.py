import url_generator
import urllib2
import cookielib
import requests
from enum import Enum
from bs4 import BeautifulSoup
import json
import urllib
from selenium import webdriver
import time
import logging
from game_data_structure import Game
from aufc_database_proxy import AufcDatabaseProxy

import sys
reload(sys)
sys.setdefaultencoding('utf8')

debug = True

PAST_GAME = True
FUTURE_GAME = False


# TODO: Some sort of ability to enter dates. Eg. want matches between start_date and end_date
# This might make it easier than asking for explicit rounds for each team which would require manual work.



def server_failure():
    game = Game(0, 0, '')
    game.error = 'SERVER FAILURE'
    return json.dumps([ game.__dict__ ])


def error(message, expected=None, actual=None):
    # Print an error message. Optional args for expected and actual results.
    if (debug):
        logging.error(message)
        if expected is not None:
            print('\tExpected: ' + str(expected))
        if actual is not None:
            print('\tActual: ' + str(actual))


def get_match_result(score_for, score_against):
    # Returns the match result from two strings that represent the scores in the format:
    # <goals>.<points>-<total>
    try:
        if '-' not in score_for or '-' not in score_against:
            return None

        score_for_total = int(score_for.split('-')[1])
        score_against_total = int(score_against.split('-')[1])

        if score_for_total > score_against_total:
            return "WIN"
        if score_for_total < score_against_total:
            return "LOSS"
        if score_for_total == score_against_total:
            return "DRAW"
    except Exception as e:
        logging.error(e)

    return None


def get_matches_json(html):
    # Returns a JSON object that contains all the matches of the round.
    # Extracts the JSON object from a string within a <script> tag.
    # If JSON could not be parsed correctly, returns None.
    try:
        # Look through all the <script> elements.
        scripts = html.find_all('script')

        for script in scripts:
            script = str(script)
            if 'var matches =' in script:
                # Strip away the javascript wrapping.
                text = script.strip('<script>var matches =')
                text = text.strip(';</script>')
                try:
                    matchesJSON = json.loads(text)
                    return matchesJSON
                except Exception as e:
                    logging.error(e)
    except Exception as e:
        logging.error(e)

    error('Could not find match JSON in HTML of page.')
    return None


def get_game_json_for_adelaide_uni(matches):
    # Takes the JSON list of all the matches and returns the specific
    # object that represents the game which involved Adelaide Uni.
    if not isinstance(matches, list):
        error('JSON array of all the matches from sportstg was invalid')
        return None

    adelaide_uni = u'Adelaide University'

    try:
        for match in matches:
            home_club = urllib.unquote(match['HomeClubName'])
            away_club = urllib.unquote(match['AwayClubName'])
            if home_club == adelaide_uni or away_club == adelaide_uni:
                return match
    except Exception as e:
        logging.error(e)

    error('Could not find Adelaide uni in the list of matches.')
    return None


def get_and_verify_year(html, expected_year):
    # Verify the year is correct. Year selection box is of this form:
    #
    # <select name="seasonID" id="id_seasonID" class="noprint">
    #     <option value="5918007">2019</option>
    #     <option value="5696920" selected="">2018</option>
    # ...
    #

    # Handle exception where year is not explicitly given.
    # 'X' represents an invalid year which will be interpreted by the sportstg url as the 
    # lastest game which is seen on the teams's page.
    try:
        yearSelectionBoxStr = str(html.find('select', id='id_seasonID'))
        target = 'selected=""'
        selectedIndex = yearSelectionBoxStr.find(target)

        # Find the next '>' after the selected="" attribute.
        yearIndex = yearSelectionBoxStr.find('>', selectedIndex) + 1
        yearLength = 4
        actualYear = yearSelectionBoxStr[yearIndex: yearIndex + yearLength]

        if actualYear != str(expected_year):
            error('Incorrect year, expected is different from actual', actualYear, str(expected_year))
            return 'X'
    except Exception as e:
        logging.error(e)
        return 'X'

    return int(actualYear)


def extract_goal_kickers_and_best_players(goal_kickers_and_best_players):
    try:
        # Check if goal kickers and best players are actuall present in the string.
        goal_kickers_present = False
        if 'Goal Kickers:' in goal_kickers_and_best_players:
            goal_kickers_present = True
        
        best_players_present = False
        if 'Best Players' in goal_kickers_and_best_players:
            best_players_present  = True

        if not best_players_present and  not goal_kickers_present:
            error('Neither Goal Kickers nor Best Players were present in the string to extract them from')
            return [], []

        # Remove the unwanted HTML.
        goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
            'Goal Kickers:</span> ', '')
        goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
            'Best Players:</span> ', '')
        goal_kickers_and_best_players = goal_kickers_and_best_players.replace(
            '<br>', '')

        # Split into a list of [ goal_kickers, best_players ]
        goal_kickers_and_best_players = goal_kickers_and_best_players.split(
            '<span class="comp-bold">')

        goal_kickers = ''
        best_players = ''

        if len(goal_kickers_and_best_players) == 2:
            # This is the case in which there is only one of either GK or BP.
            if goal_kickers_present:
                goal_kickers = goal_kickers_and_best_players[1]
            else:
                best_players = goal_kickers_and_best_players[1]

        if len(goal_kickers_and_best_players) == 3:
            # Both are present here.
            goal_kickers = goal_kickers_and_best_players[1]
            best_players = goal_kickers_and_best_players[2]

        goal_kickers = get_players_array_from_comma_separated_string(goal_kickers)
        best_players = get_players_array_from_comma_separated_string(best_players)

        # Parse the number of goals kicked for each goal kicker.
        for goal_kicker in goal_kickers:
            goal_kicker['goals'] = 1

            if ' ' not in goal_kicker['name']:
                continue

            potential_goal = goal_kicker['name'].split(' ')[-1]
            if potential_goal.isdigit():
                goal_kicker['goals'] = int(potential_goal)
                # Remove the goal from the name.
                goal_kicker['name'] = goal_kicker['name'].rsplit(' ', 1)[0]

        return goal_kickers, best_players

    except Exception as e:
        logging.error(e)
        return [], []


def get_players_array_from_comma_separated_string(players_str):
    players = players_str.split(', ')
    if players == ['']: players = []

    players_arr = []
    for player in players:
        players_arr.append({'name': player})
    return players_arr


def get_actual_round(game_json):
    # Extracts the actual round of the match according to the json from sportstg.
    # Important to get this so that it can be verified with the intended round 
    # or used in the case the round is invalid meaning the most recent is required.
    # TODO: Improve. Use regex.
    str_with_round_embedded = game_json['Venue']
    str_with_round_embedded = str_with_round_embedded.split('round=')
    str_with_round_embedded = str_with_round_embedded[1]
    str_with_round_embedded = str_with_round_embedded.split('&')
    str_with_round_embedded = str_with_round_embedded[0]
    return int(str_with_round_embedded)


def get_game_location(game_json, game):
    # Extracts and returns the game location from the json.
    game.location = urllib.unquote(game_json['VenueName'])
    if game.location == 'Forfeit':
        game.result = 'FORFEIT'
    game.location_url = 'https://websites.sportstg.com/' + game_json['VenueURL']
    game.location = game.location.strip()


def get_data_and_time(game_json, game):
    # Extracts and populates the match date and time.
    time_and_date = urllib.unquote(game_json['DateTime'])
    time_and_date = time_and_date.split('<br>')
    game.time = time_and_date[0]
    game.time = game.time.replace('&nbsp;', ' ')
    game.date = time_and_date[1]
    game.date = game.date.replace('&nbsp;', ' ')

def populate_game_from_sportstg(game):
    try:
        if game.skip_this_game: return

        if 'sportstg.com' not in game.url:
            error('URL error: incorrect url with no sportstg present')
            return

        page = requests.get(game.url)
        html = BeautifulSoup(page.content, 'html.parser')

        game.year = get_and_verify_year(html, game.year)
        if game.year == None:
            error('Error occurred with the year requested')
            game.error = 'ERROR WITH YEAR REQUESTED'
            return

        matches_json = get_matches_json(html)
        if matches_json is None:
            game.skip_this_game = True
            return

        game_json = get_game_json_for_adelaide_uni(matches_json)

        if game_json == None:
            game.error = "Team not present in week's matches"

        if game_json['MatchName'] != u'':
            game.is_final = 'true'
            game.match_name = game_json['MatchName']
            while game.match_name[-1] == ' ' or game.match_name[-1].isdigit():
                game.match_name = game.match_name[:-1]

        game.round = get_actual_round(game_json)

        if game.is_past_game and game_json['PastGame'] != 1:
            # This means we want the results from this match but it's results have not been 
            # completed in sportstg yet.
            # If we detect this error, simply proceed as if it is a future game and
            # flag inside the content that the results had not been finalised.
            error('This is not a past game.')
            game.error = 'MATCH HAS NOT BEEN PLAYED YET'
            game.is_past_game = False

        if game_json['isBye'] == 1:
            game.result = 'BYE'
            return

        # Get the location and the associated location url.
        get_game_location(game_json, game)
        get_data_and_time(game_json, game)

        game.is_home_game = urllib.unquote(
            game_json['HomeClubName']) == u'Adelaide University'

        game.goal_kickers = ''
        game.best_players = ''

        if game.is_past_game and game.result != 'FORFEIT':
            try:
                goal_kickers_and_best_players_list = game_json['MatchResults']
            except:
                goal_kickers_and_best_players_list = ['', '']

        if game.is_home_game:
            game.opposition = urllib.unquote(game_json['AwayClubName'])
            game.image_url = 'http:' + game_json['AwayClubLogo']
            if game.is_past_game:
                game.score_against = game_json['AwayScore']
                game.score_for = game_json['HomeScore']
                if game.result != 'FORFEIT':
                    if len(goal_kickers_and_best_players_list) < 1:
                        goal_kickers_and_best_players = ''
                    else:
                        goal_kickers_and_best_players = goal_kickers_and_best_players_list[0]
        else:
            game.opposition = urllib.unquote(game_json['HomeClubName'])
            game.image_url = 'http:' + game_json['HomeClubLogo']
            if game.is_past_game:
                game.score_against = game_json['HomeScore']
                game.score_for = game_json['AwayScore']
                if game.result != 'FORFEIT':
                    if len(goal_kickers_and_best_players_list) != 2:
                        goal_kickers_and_best_players = ''
                    else:
                        goal_kickers_and_best_players = goal_kickers_and_best_players_list[1]

        if game.score_for == '&nbsp;':
            game.is_past_game = False
            game.error = 'RESULTS NOT ENTERED YET'
            return

        if game.is_past_game and game.result != 'FORFEIT':
            game.result = get_match_result(game.score_for, game.score_against)
            game.goal_kickers, game.best_players = extract_goal_kickers_and_best_players(
                goal_kickers_and_best_players)
        else:
            if game.score_for == u'10.0-60':
                game.result = 'OPPOSITION_FORFEIT'

        if game.include_player_nicknames:
            names_and_nicknames = AufcDatabaseProxy.get_player_names()
            game.goal_kickers = insert_nicknames(
                game.goal_kickers, names_and_nicknames)
            game.best_players = insert_nicknames(
                game.best_players, names_and_nicknames)

    except Exception as e:
        logging.error(e)
        return


def get_game_details_from_sportstg(game):
    url = url_generator.get_url(
        int(game['year']),
        game['gender'],
        game['division'],
        int(game['round']),
        bool(game['is_past_game']),
        bool(game['is_final']))

    populated_game = Game(
        int(game['round']),
        int(game['year']),
        url,
        bool(game['is_past_game']),
        bool(game['include_player_nicknames']),
        bool(game['skip_this_game']),
        bool(game['is_final']))

    # Scrape details from sportstg.
    populate_game_from_sportstg(populated_game)

    # Populate nicknames.
    populated_game.opposition_nickname = AufcDatabaseProxy.get_opposition_nickname(populated_game.opposition)
    populated_game.location_nickname = AufcDatabaseProxy.get_ground_nickname(populated_game.location)
    
    for i in range(len(populated_game.goal_kickers)):
        populated_game.goal_kickers[i] = AufcDatabaseProxy.get_player_nickname(populated_game.goal_kickers[i]['name'])

    for i in range(len(populated_game.best_players)):
        populated_game.best_players[i] = AufcDatabaseProxy.get_player_nickname(populated_game.best_players[i]['name'])

    # Get the correct image url (may need to be overridden).
    override_image_url = AufcDatabaseProxy.get_override_image_url(populated_game.opposition)
    if override_image_url != '':
        populated_game.image_url = override_image_url

    return populated_game