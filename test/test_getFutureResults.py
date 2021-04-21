import unittest
import json

import web_scraper

FUTURE_GAME = True 
DONT_INCLUDE_PLAYER_NICKNAMES = False
DONT_SKIP_THIS_GAME = False

class GetFutureGameDetails(unittest.TestCase):

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
        game = web_scraper.Game(round, year, url, FUTURE_GAME, DONT_INCLUDE_PLAYER_NICKNAMES, DONT_SKIP_THIS_GAME, is_final)

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
        game = web_scraper.Game(round, year, url, FUTURE_GAME, DONT_INCLUDE_PLAYER_NICKNAMES, DONT_SKIP_THIS_GAME, is_final)

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