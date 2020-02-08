import unittest
import json

import getPastResults

# from getPastResults import GetMatchesJson

class GetPastResultsTest(unittest.TestCase):

    def setUp(self):
        # Div 1, Round 2, 2019, Adl uni vs Brighton.
        self.url = 'http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234885&c=1-114-0-510206-0&pool=1'

    # Testing basic case. Uni away.
    def test_GetPastGameDetails(self):
        game = getPastResults.GetPastGameDetails(self.url, 2, 2019)
        self.assertEqual(game.opposition, 'Brighton Bombers')
        self.assertEqual(game.oppositionImageUrl, '//www-static.spulsecdn.net/pics/00/36/07/46/36074646_1_T.jpg')
        self.assertEqual(game.isHomeGame, False)
        self.assertEqual(game.location, 'Brighton Oval')
        self.assertEqual(game.locationUrl, u'comp_info.cgi?round=2&a=VENUE&venueid=26688848&c=1-114-0-510206-0&fID=125234885')
        self.assertEqual(game.result, getPastResults.Result.WIN)
        self.assertEqual(game.round, 2)
        self.assertEqual(game.time, u'2:15 PM')
        self.assertEqual(game.date, u'Sat 13 Apr')
        self.assertEqual(game.scoreFor, u'12.13-85')
        self.assertEqual(game.scoreAgainst, u'12.9-81')

        goalKickersAndBestPlayers = '<span class="comp-bold">Goal Kickers:</span> N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade<br><span class="comp-bold">Best Players:</span> D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe'
        self.assertEqual(game.goalKickersAndBestPlayers, goalKickersAndBestPlayers)

    def test_GetPastGameDetailsWrongRound(self):
        round = 3    # incorrect
        year = 2019  # correct
        game = getPastResults.GetPastGameDetails(self.url, round, year)
        self.assertIsNone(game)

        round = 2   # correct
        year = 2018 # incorrect
        game = getPastResults.GetPastGameDetails(self.url, round, year)
        self.assertIsNone(game)

    def test_GetMatchResult(self):
        self.assertEqual(getPastResults.GetMatchResult('1.1-7', '1.2-8'), getPastResults.Result.LOSS)
        self.assertEqual(getPastResults.GetMatchResult('1.1-67', '1.2-8'), getPastResults.Result.WIN)
        self.assertEqual(getPastResults.GetMatchResult('1.1-74', '1.2-74'), getPastResults.Result.DRAW)
        
    # Basic game, uni home.
    def test_GetPastGameDetailsHomeGame(self):
        url = 'http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234850&c=1-114-0-510206-0&pool=1'
        game = getPastResults.GetPastGameDetails(url, 3, 2019)
        self.assertEqual(game.opposition, u'Goodwood Saints')
        self.assertEqual(game.oppositionImageUrl, '//www-static.spulsecdn.net/pics/00/02/20/16/2201604_1_T.jpg')
        self.assertEqual(game.isHomeGame, True)
        self.assertEqual(game.location, 'University Oval')
        self.assertEqual(game.locationUrl, u'comp_info.cgi?round=3&a=VENUE&venueid=15225989&c=1-114-0-510206-0&fID=125234850')
        self.assertEqual(game.result, getPastResults.Result.WIN)
        self.assertEqual(game.round, 3)
        self.assertEqual(game.time, u'2:30 PM')
        self.assertEqual(game.date, u'Thu 25 Apr')
        self.assertEqual(game.scoreFor, u'13.14-92')
        self.assertEqual(game.scoreAgainst, u'8.7-55')

    # Womens game.
    def test_GetPastGameDetailsWomensGame(self):
        url = 'http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125275487&c=1-6951-0-522600-0&pool=1'
        game = getPastResults.GetPastGameDetails(url, 14, 2019)
        self.assertEqual(game.opposition, u'SMOSH West Lakes')
        self.assertEqual(game.oppositionImageUrl, '//www-static.spulsecdn.net/images/clublogo_placeholder.gif')
        self.assertEqual(game.isHomeGame, False)
        self.assertEqual(game.location, 'Semaphore Park Oval')
        self.assertEqual(game.locationUrl, u'comp_info.cgi?round=14&a=VENUE&venueid=27368027&c=1-6951-0-522600-0&fID=125275487')
        self.assertEqual(game.result, getPastResults.Result.LOSS)
        self.assertEqual(game.round, 14)
        self.assertEqual(game.time, u'4:45 PM')
        self.assertEqual(game.date, u'Sat 17 Aug')
        self.assertEqual(game.scoreFor, u'0.0-0')
        self.assertEqual(game.scoreAgainst, u'13.17-95')

        goalKickersAndBestPlayers = '<br><span class="comp-bold">Best Players:</span> R. Gardiner, M. von der Borch-Jardine, M. Williams, M. Lock, B. Badenoch, J. Betts'
        self.assertEqual(game.goalKickersAndBestPlayers, goalKickersAndBestPlayers)

    def test_GetPastGameDetailsForfeitAgainst(self):
        url = 'http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125275511&c=1-6951-0-522600-0&pool=1'
        game = getPastResults.GetPastGameDetails(url, 1, 2019)
        self.assertEqual(game.result, getPastResults.Result.OPPOSITION_FORFEIT)