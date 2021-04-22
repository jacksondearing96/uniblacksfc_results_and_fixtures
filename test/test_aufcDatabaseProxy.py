import unittest
import json

from aufc_database_proxy import AufcDatabaseProxy


class TestAufcDatabaseProxy(unittest.TestCase):

    def setUp(self):
        self.aufc_database = AufcDatabaseProxy()


    def test_connect_to_database(self):
        self.aufc_database.connect_to_aufc_database()
        self.assertIsNotNone(self.aufc_database.connection)
        self.aufc_database.connection.close()


    def test_update_overrides(self):
        self.aufc_database.update_overrides()

        self.assertIsNotNone(self.aufc_database.opposition_nicknames_overrides)
        self.assertEquals(self.aufc_database.opposition_nicknames_overrides['Christies Beach'], "Christie's a B!tch")

        self.assertIsNotNone(self.aufc_database.ground_nicknames_overrides)
        self.assertEquals(self.aufc_database.ground_nicknames_overrides['Caterer Oval'], 'Hackney High')

        self.assertIsNotNone(self.aufc_database.image_url_overrides)
        self.assertEquals(self.aufc_database.image_url_overrides['Marion'], 'https://aflnational.com/wp-content/uploads/Marion-Rams-AFL-logo.jpg')


    def test_update_opposition_nicknames(self):
        self.aufc_database.connect_to_aufc_database()

        self.aufc_database.update_opposition_nicknames()

        self.assertIsNotNone(self.aufc_database.opposition_nicknames)
        self.assertEquals(self.aufc_database.opposition_nicknames['Portland'], 'Flagon of Portland')
        self.assertEquals(self.aufc_database.opposition_nicknames['North Haven'], 'North Haven for Hobos')
        
        self.aufc_database.connection.close()

    def test_update_ground_nicknames(self):
        self.aufc_database.connect_to_aufc_database()

        self.aufc_database.update_ground_nicknames()

        self.assertIsNotNone(self.aufc_database.ground_nicknames)
        self.assertEquals(self.aufc_database.ground_nicknames['Woodville Oval'], 'The Woods')
        self.assertEquals(self.aufc_database.ground_nicknames['University Oval'], 'Bob Neil #1')

        self.aufc_database.connection.close()
    
    def test_update_player_names_and_nicknames(self):
        self.aufc_database.connect_to_aufc_database()

        self.aufc_database.update_player_names_and_nicknames()

        self.assertIsNotNone(self.aufc_database.player_names_and_nicknames)
        self.assertGreater(len(self.aufc_database.player_names_and_nicknames.keys()), 4000)

        player = self.aufc_database.player_names_and_nicknames['J. Dearing']
        self.assertEquals(player['fullname'], 'Jackson Dearing')
        self.assertEquals(player['nickname'], 'Buck Hunter')

        self.aufc_database.connection.close()

    def test_get_player_nickname(self):
        player = self.aufc_database.get_player_nickname('J. Dearing')
        self.assertEquals(player['fullname'], 'Jackson Dearing')
        self.assertEquals(player['nickname'], 'Buck Hunter')

        self.assertEquals(self.aufc_database.get_player_nickname('J. GooseInvalid'), {})

    def test_get_opposition_nickname(self):
        self.assertEquals(self.aufc_database.get_opposition_nickname('Athelstone'), 'The Raggies')
        self.assertEquals(self.aufc_database.get_opposition_nickname('Non existant club'), '')

    def test_get_ground_nickname(self):
        self.assertEquals(self.aufc_database.get_ground_nickname('University Oval'), 'Bob Neil #1')
        self.assertEquals(self.aufc_database.get_ground_nickname('Goodwood Oval'), 'Sin Stadium')
        self.assertEquals(self.aufc_database.get_ground_nickname('Non existant Oval'), '')