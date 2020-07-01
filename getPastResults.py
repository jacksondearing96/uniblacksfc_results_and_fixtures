import requests
from enum import Enum
from bs4 import BeautifulSoup
import json
import urllib

class Game(object):
    def __init__(self, round, year):
        self.round = round
        self.year = year
        self.date = None
        self.time = None
        
        self.opposition = None
        self.oppositionImageUrl = None
        
        self.location = None
        self.locationUrl = None

        self.isHomeGame = None
        self.result = None

        self.scoreFor = None
        self.scoreAgainst = None

        self.goalKickersAndBestPlayers = None

class Result(Enum):
    WIN = 1
    LOSS = 2
    DRAW = 3
    FORFEIT = 4
    OPPOSITION_FORFEIT = 5
    PENDING = 6

def GetMatchResult(scoreForStr, scoreAgainstStr):
    scoreForTotal = int(scoreForStr.split('-')[1])
    scoreAgainstTotal = int(scoreAgainstStr.split('-')[1])

    if scoreForTotal > scoreAgainstTotal:
        return Result.WIN
    if scoreForTotal < scoreAgainstTotal:
        return Result.LOSS
    if scoreForTotal == scoreAgainstTotal:
        return Result.DRAW
    return None

def GetPastGameDetails(url, round, year):
    if 'sportstg.com' not in url: return None

    try:
        page = requests.get(url)
        html = BeautifulSoup(page.text)
        print(html)
        return

        game = Game(round, year)

        # Verify the round is as expected.
        actualRound = int(html.select('h4.rname')[0].text.split(' ')[1])
        if actualRound != game.round: return None

        # Verify the year is correct.
        try:
            actualYear = int(html.select('h2.mc-comp')[0].text.split(' ')[-1])
            if actualYear != game.year:
                return None
        except:
            # Women's pages don't have information about the year.
            pass

        timeAndDateElements = html.find('span', {'class':'matchdate'}).text.split()
        game.time = timeAndDateElements[0] + ' ' + timeAndDateElements[1]
        game.date = ' '.join(timeAndDateElements[3:])

        # Get location.
        game.location = html.find('a', {'class':'venuename'}).text
        game.locationUrl = html.select('span.venuename > a.maplink')[0]['href']

        # Assume uni is away.
        game.isHomeGame = False
        oppositionTeam = 'hometeam'
        oppositionLogoSelector = 'home-logo'
        uniScore = 'awayscore'
        oppositionScore = 'homescore'
        goalsAndBestDiv = 'team-2-game-summary'

        if html.find('div', {'class':'hometeam'})['title'] == 'Adelaide University':
            game.isHomeGame = True

            oppositionTeam = 'awayteam'
            oppositionLogoSelector = 'away-logo'
            uniScore = 'homescore'
            oppositionScore = 'awayscore'
            goalsAndBestDiv = 'team-1-game-summary'

        game.opposition = html.find('div', {'class':oppositionTeam})['title'].strip()
        game.oppositionImageUrl = html.find('div', id=oppositionLogoSelector).findChild('img')['src']
        
        game.scoreFor = html.select('#match-detail-wrap > div.detailed_score.' + uniScore + ' > div.small-score')[0].text
        game.scoreAgainst = html.select('#match-detail-wrap > div.detailed_score.' + oppositionScore + ' > div.small-score')[0].text

        game.result = GetMatchResult(game.scoreFor, game.scoreAgainst)

        # Now check for a forfeit. If there is a forfeit, there won't
        # be any data for goalKickersAndBestPlayers.
        if game.location == u'Forfeit':
            game.result = Result.FORFEIT if game.result == Result.LOSS else Result.OPPOSITION_FORFEIT
        else:
            game.goalKickersAndBestPlayers = str(html.select('div.' + goalsAndBestDiv + ' > div.tg-results')[0])
            game.goalKickersAndBestPlayers = game.goalKickersAndBestPlayers.strip('<div class="tg-results">').strip('</div>').strip()
            game.goalKickersAndBestPlayers = game.goalKickersAndBestPlayers.replace('<br/>', '<br>')

        # Check the match results are final.
        if html.select('#match-status > span.livenow')[0]['style'] != 'display:none;':
            game.result = Result.PENDING
        
        return game
    except:
        return None

# Returns a JSON object that contains all the matches of the round.
# Extracts the JSON object from a string within a <script> tag.
# If JSON could not be parsed correctly, returns None.
def GetMatchesJson(url):
    page = requests.get(url)
    html = BeautifulSoup(page.content, 'html.parser')

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
    return None

# Takes the JSON array of all the matches and returns the specific
# object that represents the game which involved clubName.
def GetGameJsonForAdelaideUni(matches):
    if not matches: return None

    adelaideUni = u'Adelaide University'
    for match in matches:
        homeClub = urllib.unquote(match['HomeClubName'])
        awayClub = urllib.unquote(match['AwayClubName'])
        if homeClub == adelaideUni or awayClub == adelaideUni:
            return match
    return None

def GetFutureGameDetails(url, round, year):
    if 'sportstg.com' not in url:
        return None

    page = requests.get(url)
    html = BeautifulSoup(page.content, 'html.parser')

    game = Game(round, year)

    # Verify the year is correct. Year selection box is of this form:

    # <select name="seasonID" id="id_seasonID" class="noprint">
    #     <option value="5918007">2019</option>
    #     <option value="5696920" selected="">2018</option>
    # ...
    yearSelectionBoxStr = str(html.find('select', id='id_seasonID'))
    target = 'selected=""'
    selectedIndex = yearSelectionBoxStr.find(target)
    # Find the next '>' after the selected="" attribute.
    yearIndex = yearSelectionBoxStr.find('>', selectedIndex) + 1
    yearLength = 4
    actualYear = yearSelectionBoxStr[yearIndex : yearIndex + yearLength]

    if actualYear != str(year):
        return None
    game.year = int(actualYear)

    # Verify the round is as expected.
    if url.find('round=' + str(round)) == -1:
        return None
    print(html)
    # Get the match date.
    teams = html.select('a.m-team')
    print("Teams: ")
    for team in teams:
        print team
    
    return game