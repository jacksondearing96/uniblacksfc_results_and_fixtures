import unittest
import json
import requests
from bs4 import BeautifulSoup

import web_scraper

PAST_GAME = True


class web_scraperTest(unittest.TestCase):

    def setUp(self):
        # Div 1, Round 2, 2019, Adl uni vs Brighton.
        self.url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=2&a=ROUND'

    # Testing basic case. Uni away.
    def test_PopulateGameFromSportsTg(self):
        game = web_scraper.Game(2, 2019, self.url)
        web_scraper.PopulateGameFromSportsTg(game, PAST_GAME, 'SUBSTANDARD')
        self.assertEqual(game.opposition, 'Brighton Bombers')
        self.assertEqual(game.image_url,
                         u'//websites.sportstg.com/pics/00/36/07/46/36074646_1_T.jpg')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Brighton Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=2&a=VENUE&venueid=26688848&c=1-114-0-510206-0&fID=125234885')
        self.assertEqual(game.result,  'WIN')
        self.assertEqual(game.round, 2)
        self.assertEqual(game.time, u'2:15 PM')
        self.assertEqual(game.date, u'Sat 13 Apr')
        self.assertEqual(game.score_for, u'12.13-85')
        self.assertEqual(game.score_against, u'12.9-81')
        goal_kickers = 'N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade'
        best_players = 'D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe'
        self.assertEqual(game.goal_kickers,
                         goal_kickers)
        self.assertEqual(game.best_players, best_players)


    def test_GetMatchResult(self):
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-7', '1.2-8'), 'LOSS')
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-67', '1.2-8'),  'WIN')
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-74', '1.2-74'), 'DRAW')

    # Basic game, uni home.
    def test_GetPastGameHomeGame(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=3&a=ROUND'
        game = web_scraper.Game(3, 2019, url)
        web_scraper.PopulateGameFromSportsTg(game, PAST_GAME, 'SUBSTANDARD')
        self.assertEqual(game.opposition, u'Goodwood Saints')
        self.assertEqual(game.image_url,
                         u'//websites.sportstg.com/pics/00/02/20/16/2201604_1_T.jpg')
        self.assertEqual(game.is_home_game, True)
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=3&a=VENUE&venueid=15225989&c=1-114-0-510206-0&fID=125234850')
        self.assertEqual(game.result,  'WIN')
        self.assertEqual(game.round, 3)
        self.assertEqual(game.time, u'2:30 PM')
        self.assertEqual(game.date, u'Thu 25 Apr')
        self.assertEqual(game.score_for, u'13.14-92')
        self.assertEqual(game.score_against, u'8.7-55')

    # Womens game.
    def test_GetPastGameWomensGame(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=14&a=ROUND'
        game = web_scraper.Game(14, 2019, url)
        web_scraper.PopulateGameFromSportsTg(game, PAST_GAME, 'SUBSTANDARD')
        self.assertEqual(game.opposition, u'SMOSH West Lakes')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Semaphore Park Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=14&a=VENUE&venueid=27368027&c=1-6951-0-522600-0&fID=125275487')
        self.assertEqual(game.result, 'LOSS')
        self.assertEqual(game.round, 14)
        self.assertEqual(game.time, u'4:45 PM')
        self.assertEqual(game.date, u'Sat 17 Aug')
        self.assertEqual(game.score_for, u'0.0-0')
        self.assertEqual(game.score_against, u'13.17-95')

        goal_kickers = ''
        best_players = 'R. Gardiner, M. von der Borch-Jardine, M. Williams, M. Lock, B. Badenoch, J. Betts'
        self.assertEqual(game.goal_kickers,
                         goal_kickers)
        self.assertEqual(game.best_players, best_players)

    def test_OppositionForfeit(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-557892-0&a=ROUND&round=4&pool=1'
        game = web_scraper.Game(4, 2020, url)
        web_scraper.PopulateGameFromSportsTg(game, PAST_GAME, 'SUBSTANDARD')
        self.assertEqual(game.opposition, u'Hectorville')
        self.assertEqual(game.is_home_game, True)
        self.assertEqual(game.location, u'Forfeit')
        self.assertEqual(game.result, 'OPPOSITION_FORFEIT')
        self.assertEqual(game.round, 4)
        self.assertEqual(game.date, u'Sat 25 Jul')
        self.assertEqual(game.score_for, u'10.0-60')
        self.assertEqual(game.score_against, u'0.0-0')
        self.assertEqual(game.goal_kickers, '')
        self.assertEqual(game.best_players, '')

    def test_GetPastGameForfeitAgainst(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=1&a=ROUND'
        game = web_scraper.Game(1, 2019, url)
        web_scraper.PopulateGameFromSportsTg(game, PAST_GAME, 'SUBSTANDARD')
        self.assertEqual(game.result, 'OPPOSITION_FORFEIT')

    def test_GetAndVerifyYear(self):
        expected_year = 2019
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        self.assertEqual(web_scraper.GetAndVerifyYear(html, expected_year), expected_year)
        self.assertEqual(web_scraper.GetAndVerifyYear(html, expected_year + 1), 'X')
        self.assertEqual(web_scraper.GetAndVerifyYear(html,  None), 'X')
        self.assertEqual(web_scraper.GetAndVerifyYear(html,  ''), 'X')
        self.assertEqual(web_scraper.GetAndVerifyYear(html,  'X'), 'X')

    def test_GetGameJsonForAdelaideUni(self):
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        matches_json = web_scraper.GetMatchesJson(html)
        self.assertNotEqual(web_scraper.GetGameJsonForAdelaideUni(matches_json), None)
        self.assertEqual(web_scraper.GetGameJsonForAdelaideUni(''), None)
        self.assertEqual(web_scraper.GetGameJsonForAdelaideUni(None), None)
        self.assertEqual(web_scraper.GetGameJsonForAdelaideUni([]), None)
        self.assertEqual(web_scraper.GetGameJsonForAdelaideUni([1, 2, 3]), None)

    def test_GetMatchesJson(self):
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        self.assertNotEqual(web_scraper.GetMatchesJson(html), None)
        self.assertEqual(web_scraper.GetMatchesJson('invalid html'), None)
        self.assertEqual(web_scraper.GetMatchesJson(None), None)
        self.assertEqual(web_scraper.GetMatchesJson([]), None)

    def test_GetMatchResult(self):
        self.assertEqual(web_scraper.GetMatchResult('1.2-10', '1.2-11'), 'LOSS')
        self.assertEqual(web_scraper.GetMatchResult('1.2-12', '1.2-11'), 'WIN')
        self.assertEqual(web_scraper.GetMatchResult('1.2-11', '1.2-11'), 'DRAW')
        self.assertEqual(web_scraper.GetMatchResult('1.210', '1.2-11'), None)
        self.assertEqual(web_scraper.GetMatchResult([], '1.2-11'), None)
        self.assertEqual(web_scraper.GetMatchResult('', ''), None)
        self.assertEqual(web_scraper.GetMatchResult(None, None), None)
        self.assertEqual(web_scraper.GetMatchResult('1.2-invalid', '1.2-11'), None)

    def test_ExtractGoalKickersAndBestPlayers(self):
        # Working case is already tested in the full system test above. Just test edge cases here.
        gk, bp = web_scraper.ExtractGoalKickersAndBestPlayers('')
        self.assertEqual(gk, '')
        self.assertEqual(bp, '')
        gk, bp = web_scraper.ExtractGoalKickersAndBestPlayers(None)
        self.assertEqual(gk, '')
        self.assertEqual(bp, '')
        gk, bp = web_scraper.ExtractGoalKickersAndBestPlayers([])
        self.assertEqual(gk, '')
        self.assertEqual(bp, '')

    def test_InsertNicknames(self):
        names_and_nicknames = web_scraper.GetPlayerNamesFromCache()

        names = 'J. Dearing'
        names = web_scraper.InsertNicknames(names, names_and_nicknames)
        self.assertEqual(names[0]['name'], 'Buck Hunter (Jackson Dearing)')
        self.assertEqual(names[0]['goals'], '')

        names = 'J. Dearing 7, E. Dadds'
        names = web_scraper.InsertNicknames(names, names_and_nicknames)
        self.assertEqual(names[0]['name'], 'Buck Hunter (Jackson Dearing)')
        self.assertEqual(names[0]['goals'], ' 7')
        self.assertEqual(names[1]['name'], 'Ya Mumms ya Dadds (Edward Dadds)')
        self.assertEqual(names[1]['goals'], '')

        names = ''
        names = web_scraper.InsertNicknames(names, names_and_nicknames)
        self.assertEqual(names, [])

        names = None
        names = web_scraper.InsertNicknames(names, names_and_nicknames)
        self.assertEqual(names, [])

