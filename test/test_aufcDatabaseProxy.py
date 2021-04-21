import unittest
import aufc_database_proxy
import web_scraper

class TestAufcDatabaseProxy(unittest.TestCase):

    def test_insert_nicknames(self):
        names_and_nicknames = aufc_database_proxy.get_player_names()

        names = 'J. Dearing'
        names = web_scraper.insert_nicknames(names, names_and_nicknames)
        self.assertEqual(names[0]['name'], 'Buck Hunter (Jackson Dearing)')
        self.assertEqual(names[0]['goals'], '')

        names = 'J. Dearing 7, E. Dadds'
        names = web_scraper.insert_nicknames(names, names_and_nicknames)
        self.assertEqual(names[0]['name'], 'Buck Hunter (Jackson Dearing)')
        self.assertEqual(names[0]['goals'], ' 7')
        self.assertEqual(names[1]['name'], 'Ya Mumms ya Dadds (Edward Dadds)')
        self.assertEqual(names[1]['goals'], '')

        names = ''
        names = web_scraper.insert_nicknames(names, names_and_nicknames)
        self.assertEqual(names, [])

        names = None
        names = web_scraper.insert_nicknames(names, names_and_nicknames)
        self.assertEqual(names, [])