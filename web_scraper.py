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

import sys
reload(sys)
sys.setdefaultencoding('utf8')

debug = True

PAST_GAME = True
FUTURE_GAME = False


# TODO: Some sort of ability to enter dates. Eg. want matches between start_date and end_date
# This might make it easier than asking for explicit rounds for each team which would require manual work.


class Game(object):
    # Object to hold all the info about a game (past or present).
    # This should maintain variable names that are compatible with the JSON objects
    # that are expected when this class is converted into a dict and sent to the 
    # front end application. See index.js for the appropriate naming conventions.
    def __init__(self, round, year, url, is_past_game=True, option='SUBSTANDARD', include=True, is_final=False):
        self.round = round
        self.year = year
        self.date = None
        self.time = None
        self.url = url

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

        self.is_past_game = is_past_game
        self.is_final = is_final
        self.match_name = None

        self.include = include
        self.option = option
        self.error = ''

def server_failure():
    game = Game(0, 0, '')
    game.error = 'SERVER FAILURE'
    return json.dumps([ game.__dict__ ])


def error(message, expected=None, actual=None):
    # Print an error message. Optional args for expected and actual results.
    if (debug):
        print('(!) ERROR - ' + message)
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
    except:
        pass
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
                except:
                    pass
    except:
        pass

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
    except:
        pass

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
    except:
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
            return '', ''

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

        return goal_kickers, best_players
    except:
        return '', ''


def open_aufc_database():
    # Opens the AUFC database, logs in and returns a driver for the page.
    # Open headless chrome.
    options = webdriver.ChromeOptions()
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--incognito')
    options.add_argument('--headless')
    driver = webdriver.Chrome(
        "/Users/jacksondearing/Desktop/football_results_automation/chromedriver", chrome_options=options)

    # AUFC database.
    driver.get("http://uniblacksfc.com.au/members/index.php")

    # Fill in username and password.
    driver.find_element_by_id('username').send_keys('bobneil')
    driver.find_element_by_id('password').send_keys('bobneil134!')
    login_button_selector = 'body > div > div.row > div:nth-child(2) > form > button'
    driver.find_element_by_css_selector(login_button_selector).click()

    return driver


def update_nicknames_from_database():
    # This logs into the AUFC database front end and searches for all the opposition nicknames.
    # Updates the .csv cached file 'nicknames.csv' with each opposition nickname and 
    # there nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-opposition").click()
        time.sleep(1)
        
        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-opposition-search > button').click()
        time.sleep(3)

        # Get opposition names.
        names = driver.find_elements_by_css_selector('#opposition-search-div > div > table > tbody > tr > td:nth-child(1)')
        names = map(lambda x: x.get_attribute('innerHTML'), names)

        # Get opposition nicknames.
        nicknames = driver.find_elements_by_css_selector('#opposition-search-div > div > table > tbody > tr > td:nth-child(2)')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        # Verify lengths are consistent.
        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/nicknames.csv', 'w') as file:
            for name, nickname in zip(names, nicknames):
                name = name.replace('amp;','')
                nickname = nickname.replace('amp;','')
                file.write(name + '::' + nickname + ',\n')

        driver.close()
        return True
    except:
        return False


def update_ground_names_from_database():
    # This logs into the AUFC database front end and searches for all the opposition ground names.
    # Updates the .csv cached file 'ground_nicknames.csv' with each opposition ground name and 
    # their ground nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-grounds").click()
        time.sleep(1)
        
        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-ground-search > button').click()
        time.sleep(3)

        # Get opposition ground names.
        names = driver.find_elements_by_css_selector('#ground-search-div > div > table > tbody > tr > td:nth-child(1)')
        names = map(lambda x: x.get_attribute('innerHTML'), names)

        # Get opposition ground nicknames.
        nicknames = driver.find_elements_by_css_selector('#ground-search-div > div > table > tbody > tr > td:nth-child(2)')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        # Verify lengths are consistent.
        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/ground_nicknames.csv', 'w') as file:
            for name, nickname in zip(names, nicknames):
                name = name.replace('amp;','')
                nickname = nickname.replace('amp;','')
                file.write(name + '::' + nickname + ',\n')

        driver.close()
        return True
    except:
        return False


def update_player_names_from_database():
    # This logs into the AUFC database front end and searches for all the registered players.
    # It updates the .csv cached file 'registered_players.csv' with each registered player and 
    # there nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-registration").click()
        time.sleep(1)

        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-registration-search > button').click()
        time.sleep(3)

        names = driver.find_elements_by_class_name('registration-edit-name')
        names = map(lambda x: x.get_attribute('innerHTML'), names)
        nicknames = driver.find_elements_by_css_selector(
            '.registration-edit-name + td')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/registered_players.csv', 'w') as file:
            for name, nickname in zip(names, nicknames):
                name_parts = name.split(', ')
                initial = name_parts[1][0] + '.'
                full_name = name_parts[1] + ' ' + name_parts[0]
                file.write(
                    initial + ' ' + name_parts[0] + '::' + str(nickname) + ' (' + full_name + ')' + '\n')

        driver.close()
        return True
    except:
        return False


def get_player_names_from_cache():
    names_and_nicknames = {}
    with open('database/registered_players.csv', 'r') as file:
        lines = file.readlines()
        for line in lines:
            parts = line.split('::')
            names_and_nicknames[parts[0]] = parts[1]
    return names_and_nicknames


def insert_nicknames(names, names_and_nicknames):
    # Takes a str of names and inserts the nickname for that particular player according to 
    # the cached nicknames.
    # Returns a list of objects that preserves the goals kicked by that player in the form:
    # [ { name: '<NICKNAME> (<NAME>)', goals: '<GOALS>' }  , ... ]

    try:
        if names is None or names == '':
            return []

        names = names.split(', ')
        for i in range(len(names)):

            if len(names[i]) == 0:
                continue

            # Save and remove the number of goals kicked
            goals = ''
            while names[i][-1].isdigit() or names[i][-1] == ' ':
                goals = names[i][-1] + goals
                names[i] = names[i][:-1]
                if len(names) == 0:
                    break

            
            if names[i] in names_and_nicknames:
                names[i] = names_and_nicknames[names[i]]

            # Surpress this for now as we don't want it showing up in the bowlies results.
            #     # This means there is no nickname for this name:
            #     if names[i][0:2] == ' (':
            #         names[i] = '<NO NICKNAME>' + names[i]

            # else:
            #     names[i] = '<PLAYER NOT IN DATABASE>' + names[i]

            names[i] = {'name': names[i], 'goals': goals}
            names[i]['name'] = names[i]['name'].replace('amp;', '')
            names[i]['name'] = names[i]['name'].replace('\n', '')

        return names
    except:
        return []


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


def GetGameLocation(game_json, game):
    # Extracts and returns the game location from the json.
    game.location = urllib.unquote(game_json['VenueName'])
    if game.location == 'Forfeit':
        game.result = 'FORFEIT'
    game.location_url = game_json['VenueURL']
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
        if game.include != 'true': return

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
            game.include = 'false'
            return
            
        game_json = get_game_json_for_adelaide_uni(matches_json)
        if game.is_final == 'true':
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
        GetGameLocation(game_json, game)
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
            game.image_url = game_json['AwayClubLogo']
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
            game.image_url = game_json['HomeClubLogo']
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

        if game.option == 'BOWLIES':
            names_and_nicknames = get_player_names_from_cache()
            game.goal_kickers = insert_nicknames(
                game.goal_kickers, names_and_nicknames)
            game.best_players = insert_nicknames(
                game.best_players, names_and_nicknames)

    except:
        return



def get_past_games(games):
    past_games = []

    for game in games:
        url = url_generator.get_url(
            int(game['year']), game['gender'], game['division'], game['round'], True, game['is_final'])

        game_to_fill = Game(game['round'], game['year'], url, game['is_past_game'], game['option'], game['include'], game['is_final'])
        print(game_to_fill.is_final)
        populate_game_from_sportstg(game_to_fill)
        past_games.append(game_to_fill.__dict__)

    return json.dumps(past_games)


def get_future_games(games):
    future_games = []

    for game in games:
        url = url_generator.get_url(
            int(game["year"]), game["gender"], game["division"], game["round"], False, game['is_final'])

        game_to_fill = Game(game['round'], game['year'], url, game['is_past_game'], game['option'], game['include'], game['is_final'])
        populate_game_from_sportstg(game_to_fill)
        future_games.append(game_to_fill.__dict__)

    return json.dumps(future_games)
