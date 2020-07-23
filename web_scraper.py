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

# Character encoding hack to make it work.
import sys
reload(sys)
sys.setdefaultencoding('utf8')


debug = True

PAST_GAME = True
FUTURE_GAME = False


class Game(object):
    def __init__(self, round, year, url):
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

        self.option = 'SUBSTANDARD'
        self.error = ''


def PastGameJson(game):
    return {
        "nickname": None,
        "round": game.round,
        "date": game.date,
        "url": game.url,
        "opposition": game.opposition,
        "result": "",
        "score_for": game.score_for,
        "score_against": game.score_against,
        "goal_kickers": game.goal_kickers,
        "best_players": game.best_players,
        "image_url": game.image_url,
        "location": game.location,
        "error": game.error
    }


def FutureGameJson(game):
    return {
        "nickname": None,
        "round": game.round,
        "date": game.date,
        "url": game.url,
        "opposition": game.opposition,
        "location": game.location,
        "location_nickname": '',
        "division": '',
        "gender": '',
        "time": game.time,
        "image_url": game.image_url,
        "error": game.error
    }


def Error(message, expected=None, actual=None):
    if (debug):
        print('(!) ERROR - ' + message)
        if expected is not None:
            print('\tExpected: ' + str(expected))
        if actual is not None:
            print('\tActual: ' + str(actual))


def GetMatchResult(score_forStr, score_againstStr):
    if '-' not in score_forStr:
        return "UNKNOWN RESULT"

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

    # Handle exception where year is not explicitly given.
    try:
        int(year)
    except ValueError:
        return year

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
    goal_kickers_present = False
    if 'Goal Kickers:' in goal_kickers_and_best_players:
        goal_kickers_present = True

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
        if goal_kickers_present:
            goal_kickers = goal_kickers_and_best_players[1]
        else:
            best_players = goal_kickers_and_best_players[1]

    if len(goal_kickers_and_best_players) == 3:
        goal_kickers = goal_kickers_and_best_players[1]
        best_players = goal_kickers_and_best_players[2]

    return goal_kickers, best_players


def UpdatePlayerNamesFromDatabase():
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
        Error('Scraped a different number of names and nicknames')

    with open('registered_players.csv', 'w') as file:
        for name, nickname in zip(names, nicknames):
            name_parts = name.split(', ')
            initial = name_parts[1][0] + '.'
            full_name = name_parts[1] + ' ' + name_parts[0]
            file.write(
                initial + ' ' + name_parts[0] + ':' + str(nickname) + ' (' + full_name + ')' + '\n')

    driver.close()
    return True


def GetPlayerNamesFromCache():
    names_and_nicknames = {}
    with open('registered_players.csv', 'r') as file:
        lines = file.readlines()
        for line in lines:
            parts = line.split(':')
            names_and_nicknames[parts[0]] = parts[1]
    return names_and_nicknames


def InsertNicknames(names, names_and_nicknames):
    if names == None or names == '':
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

        #     # This means there is no nickname for this name:
        #     if names[i][0:2] == ' (':
        #         names[i] = '<NO NICKNAME>' + names[i]

        # else:
        #     names[i] = '<PLAYER NOT IN DATABASE>' + names[i]

        names[i] = {'name': names[i], 'goals': goals}
        names[i]['name'] = names[i]['name'].replace('amp;', '')

    return names


def PopulateGameFromSportsTg(game, past_game=True, option='SUBSTANDARD'):
    if 'sportstg.com' not in game.url:
        Error('URL error: incorrect url with no sportstg present')
        return

    page = requests.get(game.url)
    html = BeautifulSoup(page.content, 'html.parser')

    game.year = GetAndVerifyYear(html, game, game.year)
    if game.year == None:
        Error('Error occurred with the year requested')
        game.error = 'ERROR WITH YEAR REQUESTED'
        return

    game_json = GetGameJsonForAdelaideUni(GetMatchesJson(html))

    # TODO: Improve. Use regex.
    str_with_round_embedded = game_json['Venue']
    str_with_round_embedded = str_with_round_embedded.split('round=')
    str_with_round_embedded = str_with_round_embedded[1]
    str_with_round_embedded = str_with_round_embedded.split('&')
    str_with_round_embedded = str_with_round_embedded[0]
    game.round = int(str_with_round_embedded)

    if past_game and game_json['PastGame'] != 1:
        # If we detect this error, simply proceed as if it is a future game and
        # flag inside the content that the results had not been finalised.
        Error('This is not a past game.')
        game.error = 'MATCH HAS NOT BEEN PLAYED YET'
        past_game = False

    if game_json['isBye'] == 1:
        game.result = 'BYE'

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
        try:
            goal_kickers_and_best_players_list = game_json['MatchResults']
        except:
            goal_kickers_and_best_players_list = ['', '']

    if game.is_home_game:
        game.opposition = urllib.unquote(game_json['AwayClubName'])
        game.image_url = game_json['AwayClubLogo']
        if past_game:
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
        if past_game:
            game.score_against = game_json['HomeScore']
            game.score_for = game_json['AwayScore']
            if game.result != 'FORFEIT':
                if len(goal_kickers_and_best_players_list) != 2:
                    goal_kickers_and_best_players = ''
                else:
                    goal_kickers_and_best_players = goal_kickers_and_best_players_list[1]

    if game.score_for == '&nbsp;':
        past_game = False
        game.error = 'RESULTS NOT ENTERED YET'
        return

    if past_game and game.result != 'FORFEIT':
        game.result = GetMatchResult(game.score_for, game.score_against)
        game.goal_kickers, game.best_players = ExtractGoalKickersAndBestPlayers(
            goal_kickers_and_best_players)
    else:
        if game.score_for == u'10.0-60':
            game.result = 'OPPOSITION_FORFEIT'

    if option == 'BOWLIES':
        names_and_nicknames = GetPlayerNamesFromCache()
        game.goal_kickers = InsertNicknames(
            game.goal_kickers, names_and_nicknames)
        game.best_players = InsertNicknames(
            game.best_players, names_and_nicknames)

        # Need to make sure there are 5 elements for the HTML template.
        # TODO: Test the case where there is less than 5 in the best.
        while len(game.best_players) < 5:
            game.best_players.append('')



def GetPastGames(games):
    past_games = []

    for game in games:
        url = url_generator.GetUrl(
            int(game['year']), game['gender'], game['division'], game['round'])

        game_to_fill = Game(game['round'], game['year'], url)
        PopulateGameFromSportsTg(game_to_fill, PAST_GAME, game['option'])
        past_games.append(PastGameJson(game_to_fill))

    return json.dumps(past_games)


def GetFutureGames(games):
    future_games = []

    for game in games:
        url = url_generator.GetUrl(
            int(game["year"]), game["gender"], game["division"], game["round"])

        game_to_fill = Game(game['round'], game['year'], url)
        PopulateGameFromSportsTg(game_to_fill, FUTURE_GAME, 'SUBSTANDARD')
        future_games.append(FutureGameJson(game_to_fill))

    return json.dumps(future_games)
