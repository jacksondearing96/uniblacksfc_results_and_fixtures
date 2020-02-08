import requests
from enum import Enum
from bs4 import BeautifulSoup
import json
import urllib


class Game:
    def __init__(self, round):
        self.round = round
        self.date = None
        self.time = None
        self.opposition = None
        self.oppositionImageUrl = None
        
        self.location = None
        self.locationUrl = None

        self.isHomeGame = None
        self.result = None

class PastGame(Game):
    def __init__():
        super().__init__()
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

def GetPastGameDetails(url, round):
    page = requests.get(url)
    html = BeautifulSoup(page.content, 'html.parser')

    game = Game(round)

    # Verify the round is as expected.
    round = int(html.select('h4.rname')[0].text.split(' ')[1])
    if round != game.round:
        return None

    # Get location.
    game.location = html.find('a', {'class':'venuename'}).text
    game.locationUrl = html.select('span.venuename > a.maplink')[0]['href']

    timeAndDateElements = html.find('span', {'class':'matchdate'}).text.split()
    game.time = timeAndDateElements[0] + ' ' + timeAndDateElements[1]
    game.date = ' '.join(timeAndDateElements[3:])

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
        oppositionLogoSelector = 'away'
        uniScore = 'homescore'
        oppositionScore = 'awayscore'
        goalsAndBestDiv = 'team-1-game-summary'

    game.opposition = html.find('div', {'class':oppositionTeam})['title']
    game.oppositionImageUrl = html.find('div', id='home-logo').findChild('img')['src']
    
    game.scoreFor = html.select('#match-detail-wrap > div.detailed_score.' + uniScore + ' > div.small-score')[0].text
    game.scoreAgainst = html.select('#match-detail-wrap > div.detailed_score.' + oppositionScore + ' > div.small-score')[0].text

    game.result = GetMatchResult(game.scoreFor, game.scoreAgainst)

    game.goalKickersAndBestPlayers = str(html.select('div.team-2-game-summary > div.tg-results')[0])
    game.goalKickersAndBestPlayers = game.goalKickersAndBestPlayers.strip('<div class="tg-results">').strip('</div>').strip()

    # Check the match results are final.
    if html.select('#match-status > span.livenow')[0]['style'] != 'display:none;':
        game.result = Result.PENDING
    
    return game
    

# gameDetails = GetPastGameDetails('http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234885&c=1-114-0-510206-0&pool=1')
# print(gameDetails.location)
# matches = GetMatchesJson('http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234885&c=1-114-0-510206-0&pool=1')
# print(GetGameJsonForAdelaideUni(matches))


    # # Verify it was a past game.
    # if gameJson['PastGame'] != 1:
    #     return None

    # game = Game()

    # # Check that the results have been entered.
    # if gameJson['MatchStatus'] != u'Results Entered':
    #     game.result = Result.PENDING
    #     return game

    # homeClub = urllib.unquote(gameJson['HomeClubName'])
    # awayClub = urllib.unquote(gameJson['AwayClubName'])

    # # Set the opposition club and the match result.
    # if (homeClub == u'Adelaide University'):
    #     game.result = Result.WON if gameJSON['VersusString'] == u'def' else Result.LOSS
    #     game.opposition = awayClub
    # else:
    #     game.result = Result.LOSS if gameJSON['VersusString'] == u'def' else Result.LOSS
    #     game.opposition = homeClub

    # return game
  