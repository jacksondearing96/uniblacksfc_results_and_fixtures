import unittest
import json

import getPastResults

class GetFutureGameDetails(unittest.TestCase):

    def setUp(self):
        self.url = 'http://websites.sportstg.com/comp_info.cgi?c=1-6951-0-522288-0&a=FIXTURE&compID=481797&round=1'

    def test_GetFutureGameDetails(self):
        game = getPastResults.GetFutureGameDetails(self.url, 1, 2018)
        self.assertIsNotNone(game)
        self.assertEqual(game.year, 2018)
