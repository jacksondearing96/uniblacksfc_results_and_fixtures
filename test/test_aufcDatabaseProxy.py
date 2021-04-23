import unittest
import json

from aufc_database_proxy import AufcDatabaseProxy


class TestAufcDatabaseProxy(unittest.TestCase):

    def test_connect_to_database(self):
        AufcDatabaseProxy.connect_to_aufc_database()
        self.assertIsNotNone(AufcDatabaseProxy.connection)
        AufcDatabaseProxy.connection.close()


    def test_update_overrides(self):
        AufcDatabaseProxy.update_overrides()

        self.assertIsNotNone(AufcDatabaseProxy.opposition_nicknames_overrides)
        self.assertEquals(AufcDatabaseProxy.opposition_nicknames_overrides['Christies Beach'], "Christie's a B!tch")

        self.assertIsNotNone(AufcDatabaseProxy.ground_nicknames_overrides)
        self.assertEquals(AufcDatabaseProxy.ground_nicknames_overrides['Caterer Oval'], 'Hackney High')

        self.assertIsNotNone(AufcDatabaseProxy.image_url_overrides)
        self.assertEquals(AufcDatabaseProxy.image_url_overrides['Marion'], 'https://aflnational.com/wp-content/uploads/Marion-Rams-AFL-logo.jpg')


    def test_update_opposition_nicknames(self):
        AufcDatabaseProxy.connect_to_aufc_database()

        AufcDatabaseProxy.update_opposition_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.opposition_nicknames)
        self.assertEquals(AufcDatabaseProxy.opposition_nicknames['Portland'], 'Flagon of Portland')
        self.assertEquals(AufcDatabaseProxy.opposition_nicknames['North Haven'], 'North Haven for Hobos')
        self.assertEquals(AufcDatabaseProxy.opposition_nicknames["St Peter's OC"], 'The Silver Spooners')
        
        AufcDatabaseProxy.connection.close()

    def test_update_ground_nicknames(self):
        AufcDatabaseProxy.connect_to_aufc_database()

        AufcDatabaseProxy.update_ground_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.ground_nicknames)
        self.assertEquals(AufcDatabaseProxy.ground_nicknames['Woodville Oval'], 'The Woods')
        self.assertEquals(AufcDatabaseProxy.ground_nicknames['University Oval'], 'Bob Neil #1')

        AufcDatabaseProxy.connection.close()
    
    def test_update_player_names_and_nicknames(self):
        AufcDatabaseProxy.connect_to_aufc_database()

        AufcDatabaseProxy.update_player_names_and_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.player_names_and_nicknames)
        self.assertGreater(len(AufcDatabaseProxy.player_names_and_nicknames.keys()), 4000)

        player = AufcDatabaseProxy.player_names_and_nicknames['J. Dearing']
        self.assertEquals(player['fullname'], 'Jackson Dearing')
        self.assertEquals(player['nickname'], 'Buck Hunter')

        AufcDatabaseProxy.connection.close()

    def test_get_player_nickname(self):
        player = AufcDatabaseProxy.get_player_nickname('J. Dearing')
        self.assertEquals(player['fullname'], 'Jackson Dearing')
        self.assertEquals(player['nickname'], 'Buck Hunter')

        self.assertEquals(AufcDatabaseProxy.get_player_nickname('J. GooseInvalid'), {})

    def test_get_opposition_nickname(self):
        self.assertEquals(AufcDatabaseProxy.get_opposition_nickname('Athelstone'), 'The Raggies')
        self.assertEquals(AufcDatabaseProxy.get_opposition_nickname('Rostrevor OC'), 'Ross and Trevor')
        self.assertEquals(AufcDatabaseProxy.get_opposition_nickname('Non existant club'), '')
        self.assertEquals(AufcDatabaseProxy.get_opposition_nickname("St Peter's OC"), 'The Silver Spooners')

    def test_get_ground_nickname(self):
        self.assertEquals(AufcDatabaseProxy.get_ground_nickname('University Oval'), 'Bob Neil #1')
        self.assertEquals(AufcDatabaseProxy.get_ground_nickname('Goodwood Oval'), 'Sin Stadium')
        self.assertEquals(AufcDatabaseProxy.get_ground_nickname('Non existant Oval'), '')
        self.assertEquals(AufcDatabaseProxy.get_ground_nickname('Caterer Oval'), 'Hackney High')
        self.assertEquals(AufcDatabaseProxy.get_ground_nickname('Ray White TTG Oval (Pertaringa)'), '')

    def test_get_correct_image_url(self):
        self.assertEquals(AufcDatabaseProxy.get_override_image_url("Morphettville Park"),
            "https://mpwfc.files.wordpress.com/2014/05/mpwfc_logo.png?w=676")
        self.assertEquals(AufcDatabaseProxy.get_override_image_url('Gaza'), '')