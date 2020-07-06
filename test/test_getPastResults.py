import unittest
import json

import web_scraper

# from web_scraper import GetMatchesJson


class web_scraperTest(unittest.TestCase):

    def setUp(self):
        # Div 1, Round 2, 2019, Adl uni vs Brighton.
        self.url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=2&a=ROUND'

    # Testing basic case. Uni away.
    def test_GetGame(self):
        game = web_scraper.GetGame(self.url, 2, 2019)
        self.assertEqual(game.opposition, 'Brighton Bombers')
        self.assertEqual(game.opposition_image_url,
                         u'//websites.sportstg.com/pics/00/36/07/46/36074646_1_T.jpg')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Brighton Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=2&a=VENUE&venueid=26688848&c=1-114-0-510206-0&fID=125234885')
        self.assertEqual(game.result, web_scraper.Result.WIN)
        self.assertEqual(game.round, 2)
        self.assertEqual(game.time, u'2:15&nbsp;PM')
        self.assertEqual(game.date, u'Sat&nbsp;13 Apr')
        self.assertEqual(game.score_for, u'12.13-85')
        self.assertEqual(game.score_against, u'12.9-81')

        goal_kickers_and_best_players = '<span class="comp-bold">Goal Kickers:</span> N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade<br><span class="comp-bold">Best Players:</span> D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe'
        self.assertEqual(game.goal_kickers_and_best_players,
                         goal_kickers_and_best_players)

    def test_GetPastGameWrongRound(self):
        round = 3    # incorrect
        year = 2019  # correct
        game = web_scraper.GetGame(self.url, round, year)
        self.assertIsNone(game)

        round = 2   # correct
        year = 2018  # incorrect
        game = web_scraper.GetGame(self.url, round, year)
        self.assertIsNone(game)

    def test_GetMatchResult(self):
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-7', '1.2-8'), web_scraper.Result.LOSS)
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-67', '1.2-8'), web_scraper.Result.WIN)
        self.assertEqual(web_scraper.GetMatchResult(
            '1.1-74', '1.2-74'), web_scraper.Result.DRAW)

    # Basic game, uni home.
    def test_GetPastGameHomeGame(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=3&a=ROUND'
        game = web_scraper.GetGame(url, 3, 2019)
        self.assertEqual(game.opposition, u'Goodwood Saints')
        self.assertEqual(game.opposition_image_url,
                         u'//websites.sportstg.com/pics/00/02/20/16/2201604_1_T.jpg')
        self.assertEqual(game.is_home_game, True)
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=3&a=VENUE&venueid=15225989&c=1-114-0-510206-0&fID=125234850')
        self.assertEqual(game.result, web_scraper.Result.WIN)
        self.assertEqual(game.round, 3)
        self.assertEqual(game.time, u'2:30&nbsp;PM')
        self.assertEqual(game.date, u'Thu&nbsp;25 Apr')
        self.assertEqual(game.score_for, u'13.14-92')
        self.assertEqual(game.score_against, u'8.7-55')

    # Womens game.
    def test_GetPastGameWomensGame(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=14&a=ROUND'
        game = web_scraper.GetGame(url, 14, 2019)
        self.assertEqual(game.opposition, u'SMOSH West Lakes')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Semaphore Park Oval')
        self.assertEqual(
            game.location_url, u'comp_info.cgi?round=14&a=VENUE&venueid=27368027&c=1-6951-0-522600-0&fID=125275487')
        self.assertEqual(game.result, web_scraper.Result.LOSS)
        self.assertEqual(game.round, 14)
        self.assertEqual(game.time, u'4:45&nbsp;PM')
        self.assertEqual(game.date, u'Sat&nbsp;17 Aug')
        self.assertEqual(game.score_for, u'0.0-0')
        self.assertEqual(game.score_against, u'13.17-95')

        goal_kickers_and_best_players = '<br><span class="comp-bold">Best Players:</span> R. Gardiner, M. von der Borch-Jardine, M. Williams, M. Lock, B. Badenoch, J. Betts'
        self.assertEqual(game.goal_kickers_and_best_players,
                         goal_kickers_and_best_players)

    def test_GetPastGameForfeitAgainst(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=1&a=ROUND'
        game = web_scraper.GetGame(url, 1, 2019)
        self.assertEqual(game.result, web_scraper.Result.OPPOSITION_FORFEIT)
