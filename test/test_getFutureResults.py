import unittest
import json

import web_scraper

FUTURE_GAME = False


class GetFutureGameDetails(unittest.TestCase):

    def setUp(self):
        self.url = 'http://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522288-0&a=FIXTURE&compID=481797&round=1'

    def test_get_future_game_details(self):
        game = web_scraper.Game(1, 2018, self.url, FUTURE_GAME, 'SUBSTANDARD')
        web_scraper.populate_game_from_sportstg(game)
        self.assertIsNotNone(game)
        self.assertEqual(game.year, 2018)
        self.assertEqual(game.round, 1)
        self.assertEqual(game.opposition, u'Morphettville Park')
        self.assertEqual(game.location, u'Kellett Reserve')

    def test_get_future_game_details_2020(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547208-0&a=FIXTURE&round=1'
        game = web_scraper.Game(1, 2020, url, FUTURE_GAME, 'SUBSTANDARD')
        web_scraper.populate_game_from_sportstg(game)
        self.assertIsNotNone(game)
        self.assertEqual(game.year, 2020)
        self.assertEqual(game.round, 1)
        self.assertEqual(game.opposition, "Unley Mercedes Jets")
        self.assertEqual(game.location, 'Kingswood Oval')
        self.assertEqual(game.is_home_game, False)

    def test_get_future_game_details_home_game(self):
        url = 'https://websites.sportstg.com/comp_info.cgi?a=ROUND&round=2&client=1-114-0-547208-0&pool=1&round=2'
        game = web_scraper.Game(1, 2020, url, FUTURE_GAME, 'SUBSTANDARD')
        web_scraper.populate_game_from_sportstg(game)
        self.assertIsNotNone(game)
        self.assertEqual(game.year, 2020)
        self.assertEqual(game.round, 2)
        self.assertEqual(game.opposition, "Prince Alfred OC")
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(game.is_home_game, True)
