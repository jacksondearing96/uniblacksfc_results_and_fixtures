import unittest
import json

import web_scraper

FUTURE_GAME = True 
DONT_INCLUDE_PLAYER_NICKNAMES = False
DONT_SKIP_THIS_GAME = False

class GetFutureGameDetails(unittest.TestCase):

    def test_get_div_priority(self):
        self.assertEqual(web_scraper.get_div_priority('Div 1'), 1)
        self.assertEqual(web_scraper.get_div_priority('1'), 1)
        self.assertEqual(web_scraper.get_div_priority('D1'), 1)
        self.assertEqual(web_scraper.get_div_priority('Div 1R'), 1.5)
        self.assertEqual(web_scraper.get_div_priority('Div 1 res'), 1.5)
        self.assertEqual(web_scraper.get_div_priority('Div 1Res'), 1.5)
        self.assertEqual(web_scraper.get_div_priority('1R'), 1.5)
        self.assertEqual(web_scraper.get_div_priority('1res'), 1.5)
        self.assertEqual(web_scraper.get_div_priority('Div 2'), 2)
        self.assertEqual(web_scraper.get_div_priority('2'), 2)
        self.assertEqual(web_scraper.get_div_priority('C1'), 101)
        self.assertEqual(web_scraper.get_div_priority('C7'), 107)
        self.assertEqual(web_scraper.get_div_priority('AB1DEF'), 1)
        self.assertEqual(web_scraper.get_div_priority('invalid'), 1000)


    def test_get_future_game_details(self):
        round = 1
        year = 2018
        url = 'http://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522288-0&a=FIXTURE&compID=481797&round=1'
        game = web_scraper.Game(round, year, url, FUTURE_GAME)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.year, year)
        self.assertEqual(game.round, round)
        self.assertEqual(game.opposition, u'Morphettville Park')
        self.assertEqual(game.location, u'Kellett Reserve')

    # Regular round 1 season match away.
    def test_get_future_game_details_2020(self):
        round = 1
        year = 2020
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547208-0&a=ROUND&round=1&pool=1'
        is_final = False
        game = web_scraper.Game(round, year, url, FUTURE_GAME, is_final)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.year, 2020)
        self.assertEqual(game.round, 1)
        self.assertEqual(game.opposition, "Unley Mercedes Jets")
        self.assertEqual(game.location, 'Kingswood Oval')
        self.assertEqual(game.time, '2:15 PM')
        self.assertEqual(game.date, u'Sat 4 Jul')
        self.assertEqual(game.image_url, u'http://websites.sportstg.com/pics/00/36/74/33/36743304_1_T.jpg')
        self.assertEqual(game.location_url, u'https://websites.sportstg.com/comp_info.cgi?round=1&a=VENUE&venueid=19057075&c=1-114-0-547208-0&fID=125559628')
        self.assertEqual(game.is_home_game, False)

    # Regular season match home.
    def test_get_future_game_details_home_game(self):
        round = 2
        year = 2020
        url = 'https://websites.sportstg.com/comp_info.cgi?a=ROUND&round=2&client=1-114-0-547208-0&pool=1&round=2'
        game = web_scraper.Game(round, year, url, FUTURE_GAME)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.year, year)
        self.assertEqual(game.round, round)
        self.assertEqual(game.opposition, "Prince Alfred OC")
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(game.is_home_game, True)

    # Finals match.
    def test_get_future_game_details_final(self):
        round = 2
        year = 2020
        url = 'https://websites.sportstg.com/comp_info.cgi?a=ROUND&round=2&client=1-114-0-548065-0&pool=1001'
        is_final = True
        game = web_scraper.Game(round, year, url, FUTURE_GAME, is_final)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.year, year)
        self.assertEqual(game.round, round)
        self.assertEqual(game.opposition, 'Old Ignatians')
        self.assertEqual(game.location, u'Karen Rolton Oval')
        self.assertEqual(game.is_home_game, False)

    # Bye.
    def test_get_future_game_details_bye(self):
        round = 6
        year = 2020
        url = 'https://websites.sportstg.com/comp_info.cgi?a=ROUND&round=6&client=1-114-0-547212-0&pool=1'
        game = web_scraper.Game(round, year, url, FUTURE_GAME)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.result, 'BYE')

    # Forfeit.
    def test_get_future_game_details_forfeit(self):
        round = 4
        year = 2020
        url = 'https://websites.sportstg.com/comp_info.cgi?a=ROUND&round=4&client=1-114-0-557892-0&pool=1'
        game = web_scraper.Game(round, year, url, FUTURE_GAME)

        web_scraper.populate_game_from_sportstg(game)

        self.assertIsNotNone(game)
        self.assertEqual(game.result, 'OPPOSITION_FORFEIT')

    # API level call with JSON post data.
    def test_get_future_game(self):
        future_game = {
            "year":2021,
            "round":"1",
            "gender":"Mens",
            "division":"1",
            "nickname":"Benny and the Jets",
            "url_code":"573817",
            "is_final": False,
            "is_past_game": False,
            "include_player_nicknames": False,
            "skip_this_game": False
        }

        scraped_game = web_scraper.get_game_details_from_sportstg(future_game)
        expected_output = {
            "result": None,
            "is_home_game": False,
            "score_against": None,
            "match_name": None,
            "url": "https://websites.sportstg.com/comp_info.cgi?c=1-114-0-573817-0&a=FIXTURE&round=1&pool=1",
            "goal_kickers": "",
            "time": "2:15 PM",
            "location": "Caterer Oval",
            "location_nickname": "Hackney High",
            "score_for": None,
            "priority": 1,
            "nickname": "Benny and the Jets",
            "division": "1",
            "gender": "Mens",
            'AUFC_logo': 'https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png',
            "url_code": "573817",
            "margin": None,
            "win_or_loss_verb": None,
            "error": "",
            "is_past_game": False,
            "image_url": "http://websites.sportstg.com/pics/00/01/76/43/1764333_1_T.jpg",
            "is_final": False,
            "opposition": "St Peter's OC",
            "year": 2021,
            "opposition_nickname": "The Silver Spooners",
            "date": "Sat 10 Apr",
            "location_url": "https://websites.sportstg.com/comp_info.cgi?round=1&a=VENUE&venueid=19057027&c=1-114-0-573817-0&fID=125673421",
            "best_players": "",
            "round": 1,
        }

        self.assertEquals(scraped_game.__dict__, expected_output)
