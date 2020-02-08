import unittest
import json

import getPastResults

# from getPastResults import GetMatchesJson

class GetPastResultsTest(unittest.TestCase):

    def setUp(self):
        # Go to Div 1, Round 2, 2019.
        self.url = 'http://websites.sportstg.com/comp_info.cgi?a=ROUND&round=2&client=1-114-0-510206-0&pool=1'

    def test_GetMatchesJson(self):
        actualJson = getPastResults.GetMatchesJson(self.url)
        expectedMatchResultsStr = u'<b><i>Brighton Bombers</i></b><div style="margin-left:8px;"><span class="comp-bold">Goal Kickers:</span> J. Boyle 3, B. Tate 3, S. Harvey 2, J. Mcpherson, J. Spurling, S. Kennedy, P. Gabb<br><span class="comp-bold">Best Players:</span> J. Boyle, S. Kennedy, J. Spurling, D. Lang, S. Harvey, P. Gabb</div>\n<b><i>Adelaide University</i></b><div style="margin-left:8px;"><span class="comp-bold">Goal Kickers:</span> N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade<br><span class="comp-bold">Best Players:</span> D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe</div>\n'
        self.assertEqual(actualJson[0]['MatchResultsStr'], expectedMatchResultsStr)
        
        invalidWebPageUrl = 'http://www.jacksondearing.com/'
        self.assertIsNone(getPastResults.GetMatchesJson(invalidWebPageUrl))

    def test_GetGameJsonForClub(self):
        matchesJson = getPastResults.GetMatchesJson(self.url)
        actualGame = getPastResults.GetGameJsonForAdelaideUni(matchesJson)
        expectedAwayTeam = 'Adelaide%20University'
        self.assertEqual(actualGame['AwayClubName'], expectedAwayTeam)

    def test_GetPastGameDetails(self):
        game = getPastResults.GetPastGameDetails('http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234885&c=1-114-0-510206-0&pool=1', 2)
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

        goalKickersAndBestPlayers = '<span class="comp-bold">Goal Kickers:</span> N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade<br/><span class="comp-bold">Best Players:</span> D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe'
        self.assertEqual(game.goalKickersAndBestPlayers, goalKickersAndBestPlayers)

    def test_GetPastGameDetailsWrongRound(self):
        # Correct round is actually 2 for this url.
        round = 3
        game = getPastResults.GetPastGameDetails('http://websites.sportstg.com/round_info.cgi?a=MATCH&fixture=125234885&c=1-114-0-510206-0&pool=1', round)
        self.assertIsNone(game)


    def test_GetMatchResult(self):
        self.assertEqual(getPastResults.GetMatchResult('1.1-7', '1.2-8'), getPastResults.Result.LOSS)
        self.assertEqual(getPastResults.GetMatchResult('1.1-67', '1.2-8'), getPastResults.Result.WIN)
        self.assertEqual(getPastResults.GetMatchResult('1.1-74', '1.2-74'), getPastResults.Result.DRAW)
        