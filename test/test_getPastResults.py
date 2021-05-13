import unittest
import json
import requests
from bs4 import BeautifulSoup

import web_scraper


class GetPastResults(unittest.TestCase):

    def setUp(self):
        # Div 1, Round 2, 2019, Adl uni vs Brighton.
        self.url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=2&a=ROUND'

    # Testing basic case. Uni away.
    def test_populate_game_from_sportstg(self):
        round = 2
        year = 2019
        game = web_scraper.Game(round, year, self.url)

        web_scraper.populate_game_from_sportstg(game)

        self.assertEqual(game.opposition, 'Brighton Bombers')
        self.assertEqual(game.image_url,
                         u'http://www-static.spulsecdn.net/pics/00/36/07/46/36074646_1_T.jpg')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Brighton Oval')
        self.assertEqual(
            game.location_url, u'https://websites.sportstg.com/comp_info.cgi?round=2&a=VENUE&venueid=26688848&c=1-114-0-510206-0&fID=125234885')
        self.assertEqual(game.result,  'WIN')
        self.assertEqual(game.round, round)
        self.assertEqual(game.time, u'2:15 PM')
        self.assertEqual(game.date, u'Sat 13 Apr')
        self.assertEqual(game.score_for, u'12.13-85')
        self.assertEqual(game.score_against, u'12.9-81')
        goal_kickers = [{'name': u'N. Langridge', 'goals': 4}, {'name': u'C. Parker', 'goals': 2}, {'name': u'R. Marini', 'goals': 1}, {'name': u'M. Langridge', 'goals': 1}, {'name': u'S. Sharley', 'goals': 1}, {'name': u'A. Offe', 'goals': 1}, {'name': u'J. Keynes', 'goals': 1}, {'name': u'M. Slade', 'goals': 1}] 
        best_players = [{'name': u'D. Cunningham'}, {'name': u'C. Parker'}, {'name': u'B. Adams'}, {'name': u'N. Langridge'}, {'name': u'M. Marini'}, {'name': u'A. Offe'}]

        self.assertEqual(len(game.goal_kickers),
                         len(goal_kickers))
        self.assertEqual(len(game.best_players), len(best_players))

        for i in range(len(goal_kickers)):
            self.assertEqual(game.goal_kickers[i], goal_kickers[i])
        for i in range(len(best_players)):
            self.assertEqual(game.best_players[i], best_players[i])


    def test_get_match_result(self):
        self.assertEqual(web_scraper.get_match_result(
            '1.1-7', '1.2-8'), 'LOSS')
        self.assertEqual(web_scraper.get_match_result(
            '1.1-67', '1.2-8'),  'WIN')
        self.assertEqual(web_scraper.get_match_result(
            '1.1-74', '1.2-74'), 'DRAW')

    # Basic game, uni home.
    def test_get_past_game_home_game(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&pool=1&round=3&a=ROUND'
        game = web_scraper.Game(3, 2019, url)
        web_scraper.populate_game_from_sportstg(game)
        self.assertEqual(game.opposition, u'Goodwood Saints')
        self.assertEqual(game.image_url,
                         u'http://www-static.spulsecdn.net/pics/00/02/20/16/2201604_1_T.jpg')
        self.assertEqual(game.is_home_game, True)
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(
            game.location_url, u'https://websites.sportstg.com/comp_info.cgi?round=3&a=VENUE&venueid=15225989&c=1-114-0-510206-0&fID=125234850')
        self.assertEqual(game.result,  'WIN')
        self.assertEqual(game.round, 3)
        self.assertEqual(game.time, u'2:30 PM')
        self.assertEqual(game.date, u'Thu 25 Apr')
        self.assertEqual(game.score_for, u'13.14-92')
        self.assertEqual(game.score_against, u'8.7-55')

    # Womens game.
    def test_get_past_game_womens_game(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=14&a=ROUND'
        game = web_scraper.Game(14, 2019, url)
        web_scraper.populate_game_from_sportstg(game)
        self.assertEqual(game.opposition, u'SMOSH West Lakes')
        self.assertEqual(game.is_home_game, False)
        self.assertEqual(game.location, 'Semaphore Park Oval')
        self.assertEqual(
            game.location_url, u'https://websites.sportstg.com/comp_info.cgi?round=14&a=VENUE&venueid=27368027&c=1-6951-0-522600-0&fID=125275487')
        self.assertEqual(game.result, 'LOSS')
        self.assertEqual(game.round, 14)
        self.assertEqual(game.time, u'4:45 PM')
        self.assertEqual(game.date, u'Sat 17 Aug')
        self.assertEqual(game.score_for, u'0.0-0')
        self.assertEqual(game.score_against, u'13.17-95')

        goal_kickers = []
        best_players = [
            {"name": u"R. Gardiner"},
            {"name": u"M. von der Borch-Jardine"},
            {"name": u"M. Williams"},
            {"name": u"M. Lock"},
            {"name": u"B. Badenoch"},
            {"name": u"J. Betts"},
        ]
        self.assertEqual(len(game.goal_kickers), len(goal_kickers))
        self.assertEqual(len(game.best_players), len(best_players))
        for i in range(len(best_players)):
            self.assertEqual(game.best_players[i], best_players[i])

    def test_opposition_forfeit(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-557892-0&a=ROUND&round=4&pool=1'
        game = web_scraper.Game(4, 2020, url)
        web_scraper.populate_game_from_sportstg(game)
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

    def test_bye(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?round=6&a=ROUND&client=1-114-0-547212-0&pool=1'
        game = web_scraper.Game(6, 2020, url)
        web_scraper.populate_game_from_sportstg(game)
        self.assertEqual(game.result, 'BYE')
        self.assertEqual(game.error, '')

    def test_get_past_game_forfeit_against(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522600-0&pool=1&round=1&a=ROUND'
        game = web_scraper.Game(1, 2019, url)
        web_scraper.populate_game_from_sportstg(game)
        self.assertEqual(game.result, 'OPPOSITION_FORFEIT')

    def test_get_and_verify_year(self):
        expected_year = 2019
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        self.assertEqual(web_scraper.get_and_verify_year(html, expected_year), expected_year)
        self.assertEqual(web_scraper.get_and_verify_year(html, expected_year + 1), 'X')
        self.assertEqual(web_scraper.get_and_verify_year(html,  None), 'X')
        self.assertEqual(web_scraper.get_and_verify_year(html,  ''), 'X')
        self.assertEqual(web_scraper.get_and_verify_year(html,  'X'), 'X')

    def test_get_game_json_for_adelaide_uni(self):
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        matches_json = web_scraper.get_matches_json(html)
        self.assertNotEqual(web_scraper.get_game_json_for_adelaide_uni(matches_json), None)
        self.assertEqual(web_scraper.get_game_json_for_adelaide_uni(''), None)
        self.assertEqual(web_scraper.get_game_json_for_adelaide_uni(None), None)
        self.assertEqual(web_scraper.get_game_json_for_adelaide_uni([]), None)
        self.assertEqual(web_scraper.get_game_json_for_adelaide_uni([1, 2, 3]), None)

    def test_get_matches_json(self):
        page = requests.get(self.url)
        html = BeautifulSoup(page.content, 'html.parser')
        self.assertNotEqual(web_scraper.get_matches_json(html), None)
        self.assertEqual(web_scraper.get_matches_json('invalid html'), None)
        self.assertEqual(web_scraper.get_matches_json(None), None)
        self.assertEqual(web_scraper.get_matches_json([]), None)

    def test_get_match_result(self):
        self.assertEqual(web_scraper.get_match_result('1.2-10', '1.2-11'), ('LOSS', -1, 'def. by'))
        self.assertEqual(web_scraper.get_match_result('1.2-12', '1.2-11'), ('WIN', 1, 'defeated'))
        self.assertEqual(web_scraper.get_match_result('1.2-11', '1.2-11'), ('DRAW', 0, 'drew against'))
        self.assertEqual(web_scraper.get_match_result('1.210', '1.2-11'), None)
        self.assertEqual(web_scraper.get_match_result([], '1.2-11'), None)
        self.assertEqual(web_scraper.get_match_result('', ''), None)
        self.assertEqual(web_scraper.get_match_result(None, None), None)
        self.assertEqual(web_scraper.get_match_result('1.2-invalid', '1.2-11'), None)

    def test_extract_goal_kickers_and_best_players(self):
        # Working case is already tested in the full system test above. Just test edge cases here.
        gk, bp = web_scraper.extract_goal_kickers_and_best_players('')
        self.assertEqual(gk, [])
        self.assertEqual(bp, [])
        gk, bp = web_scraper.extract_goal_kickers_and_best_players(None)
        self.assertEqual(gk, [])
        self.assertEqual(bp, [])
        gk, bp = web_scraper.extract_goal_kickers_and_best_players([])
        self.assertEqual(gk, [])
        self.assertEqual(bp, [])


    def test_get_past_games(self):
        past_game_details = {
            "year":2021,
            "round":"1",
            "gender":"Mens",
            "division":"1",
            "nickname": "Benny and the Jets",
            "url_code": "573817",
            "is_final": False,
            "is_past_game": True,
            "include_player_nicknames": False,
            "skip_this_game":False
        }

        scraped_game_details = web_scraper.get_game_details_from_sportstg(past_game_details)
        expected_output = {
            "result": "LOSS",
            "is_home_game": False,
            "location_nickname": 'Hackney High',
            "score_against": "10.8-68",
            "match_name": None,
            "url": "https://websites.sportstg.com/comp_info.cgi?c=1-114-0-573817-0&a=ROUND&round=1&pool=1",
            "goal_kickers": [{'fullname': u'Matthew Langridge', 'nickname': u'Good Langridge', 'name': u'M. Langridge', 'goals': 2, 'memberID': 27080}, {'fullname': u'Harrison Gloyne', 'nickname': u'The Path', 'name': u'H. Gloyne', 'goals': 1, 'memberID': 26909}, {'fullname': u'Maris Olekalns', 'nickname': u'Son of a Gun', 'name': u'M. Olekalns', 'goals': 1, 'memberID': 27683}, {'fullname': u'Mitchell Marini', 'nickname': u'Nonna Marini', 'name': u'M. Marini', 'goals': 1, 'memberID': 27375}, {'fullname': u'Edward Sims', 'nickname': u'Virtual Reality', 'name': u'E. Sims', 'goals': 1, 'memberID': 27513}, {'fullname': u'Ryan Marini', 'nickname': u'Nonno Marini', 'name': u'R. Marini', 'goals': 1, 'memberID': 27317}],
            "time": "2:15 PM",
            "location": "Caterer Oval",
            "score_for": "7.7-49",
            "win_or_loss_verb": "def. by",
            "margin": -19,
            "priority": 1,
            "has_been_played": True,
            "error": "",
            "nickname": "Benny and the Jets",
            "division": "1",
            "gender": "Mens",
            "AUFC_logo": 'https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png',
            "url_code": "573817",
            "is_past_game": True,
            "image_url": "http://www-static.spulsecdn.net/pics/00/01/76/43/1764333_1_T.jpg",
            "is_final": False,
            "opposition": "St Peter's OC",
            "opposition_nickname": "The Silver Spooners",
            "year": 2021,
            "date": "Sat 10 Apr",
            "location_url": "https://websites.sportstg.com/comp_info.cgi?round=1&a=VENUE&venueid=19057027&c=1-114-0-573817-0&fID=125673421",
            "best_players": [{'fullname': u'Damian Cunningham', 'nickname': u'Cunninghams Warehouse, Yes Sir-eee!!!', 'name': u'D. Cunningham', 'memberID': 26610}, {'fullname': u'Conor Noonan', 'nickname': u'Harry Styles', 'name': u'C. Noonan', 'memberID': 27208}, {'fullname': u'Ben Adams', 'nickname': u'The Adams Family', 'name': u'B. Adams', 'memberID': 27099}, {'fullname': u'Stefan Jankewicz', 'nickname': u'Stef-Hahn Super Dry', 'name': u'S. Jankewicz', 'memberID': 27316}, {'fullname': u'Ryan Marini', 'nickname': u'Nonno Marini', 'name': u'R. Marini', 'memberID': 27317}, {'fullname': u'Hamish Wallace', 'nickname': u'Wallace & Gromit', 'name': u'H. Wallace', 'memberID': 27443}],
            "round": 1,
        }

        scraped_game_details = scraped_game_details.__dict__
        self.assertEqual(len(scraped_game_details.keys()), len(expected_output))
        for key in expected_output.keys():
            self.assertEqual(scraped_game_details[key], expected_output[key])
