import unittest
import json

from aufc_database_proxy import AufcDatabaseProxy


class TestAufcDatabaseProxy(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        AufcDatabaseProxy.update_cache()


    def test_connect_to_database(self):
        connection = AufcDatabaseProxy.connect_to_aufc_database()
        self.assertIsNotNone(connection)
        connection.close()


    def test_update_overrides(self):
        AufcDatabaseProxy.update_overrides()

        self.assertIsNotNone(AufcDatabaseProxy.ground_nicknames_overrides)

        self.assertIsNotNone(AufcDatabaseProxy.image_url_overrides)
        self.assertEqual(AufcDatabaseProxy.image_url_overrides['Marion'], 'https://aflnational.com/wp-content/uploads/Marion-Rams-AFL-logo.jpg')


    def test_update_opposition_nicknames(self):
        AufcDatabaseProxy.update_opposition_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.opposition_nicknames)
        self.assertEqual(AufcDatabaseProxy.opposition_nicknames['Portland'], 'Flagon of Portland')
        self.assertEqual(AufcDatabaseProxy.opposition_nicknames['North Haven'], 'North Misbe-haven')
        self.assertEqual(AufcDatabaseProxy.opposition_nicknames["Saint Peters O.C."], 'The Silver Spooners')
        

    def test_update_ground_nicknames(self):
        AufcDatabaseProxy.update_ground_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.ground_nicknames)
        self.assertEqual(AufcDatabaseProxy.ground_nicknames['Woodville Oval'], 'The Woods')
        self.assertEqual(AufcDatabaseProxy.ground_nicknames['University Oval'], 'Bob Neil #1')

    
    def test_update_player_names_and_nicknames(self):
        AufcDatabaseProxy.update_player_names_and_nicknames()

        self.assertIsNotNone(AufcDatabaseProxy.player_names_and_nicknames)
        self.assertGreater(len(AufcDatabaseProxy.player_names_and_nicknames.keys()), 4000)

        player = AufcDatabaseProxy.player_names_and_nicknames['J. Dearing']
        self.assertEqual(player['fullname'], 'Jackson Dearing')
        self.assertEqual(player['nickname'], 'Buck Hunter')


    def test_get_player_nickname(self):
        player = AufcDatabaseProxy.get_player_nickname('J. Dearing')
        self.assertEqual(player['fullname'], 'Jackson Dearing')
        self.assertEqual(player['nickname'], 'Buck Hunter')

        self.assertEqual(AufcDatabaseProxy.get_player_nickname('J. GooseInvalid'), {'fullname': '', 'nickname': '', 'name': 'J. GooseInvalid', 'memberID': 0})

    def test_get_opposition_nickname(self):
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname('Athelstone'), 'The Raggies')
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname('Rostrevor OC'), 'Ross and Trevor')
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname('Non existant club'), '')
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("St Peter's OC"), 'The Silver Spooners')
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Angle Vale"), "Angle Fail")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("St Paul's OS"), "Saint Paul")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Payneham Norwood Union"), "Payneham in the @rse")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Blackfriars OS"), "Friar Tuck")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Gaza"), "Nice Gaza")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Brighton District & O.S."), "Brighton Boomers")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Smithfield"), "Smiths Chips")
        self.assertEqual(AufcDatabaseProxy.get_opposition_nickname("Christies Beach"), "Christies a B!tch")

    def test_get_ground_nickname(self):
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname('University Oval'), 'Bob Neil #1')
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname('Goodwood Oval'), 'Sin Stadium')
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname('Non existant Oval'), '')
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname('Caterer Oval'), 'Hackney High')
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname('Ray White TTG Oval (Pertaringa)'), '')
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Forfeit"), "FORFEIT")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Payneham Oval"), "@rse Park")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("West Lakes Shore Oval"), "Fake Field")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("St Pauls College"), "The Cathedral")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Hunter Park"), "The Nursing Home")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Harpers Field"), "Grovel Park")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Harpers Field No 2"), "Grovel Park")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("University Oval"), "Bob Neil #1")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Caterer Oval"), "Hackney High")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Karen Rolton Oval"), "The Barton")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Simonds Park"), "The Dog Pound")
        self.assertEqual(AufcDatabaseProxy.get_ground_nickname("Woodville Oval"), "The Woods")

    def test_get_correct_image_url(self):
        self.assertEqual(AufcDatabaseProxy.get_override_image_url("Morphettville Park"),
            "https://mpwfc.files.wordpress.com/2014/05/mpwfc_logo.png?w=676")
        self.assertEqual(AufcDatabaseProxy.get_override_image_url('Gaza'), '')