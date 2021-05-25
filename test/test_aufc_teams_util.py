import unittest

import aufc_teams_util

class TestAufcTeamsUtil(unittest.TestCase):

    def test_apply_random_winning_verbs(self):
        teams = [
            {'win_or_loss_verb': 'defeated'},
            {'win_or_loss_verb': 'defeated'},
            {'win_or_loss_verb': 'def by'},
            {'win_or_loss_verb': 'defeated'}
        ]

        aufc_teams_util.apply_random_winning_verbs(teams)

        self.assertEqual(teams[2]['win_or_loss_verb'], 'def by')
        winning_teams_verbs = [
            teams[0]['win_or_loss_verb'],
            teams[1]['win_or_loss_verb'],
            teams[3]['win_or_loss_verb']
        ]
        # Assert there are no duplicates.
        self.assertEqual(len(winning_teams_verbs), len(set(winning_teams_verbs)))

        # Assert it is a subset of the winning verbs.
        winning_verbs = aufc_teams_util.get_winning_verbs()
        self.assertTrue(all(x in winning_verbs for x in winning_teams_verbs))


    def test_calculate_percentage(self):
        self.assertEqual(aufc_teams_util.calculate_grade(100), 'High Distinction')
        self.assertEqual(aufc_teams_util.calculate_grade(85), 'High Distinction')
        self.assertEqual(aufc_teams_util.calculate_grade(13), 'Fail')


    def test_get_win_loss_summary_stats(self):
        teams = [
            {'margin': 20},
            {'margin': 50},
            {'margin': -2},
            {'margin': 4}
        ] 
        wins, losses, percentage, grade = aufc_teams_util.get_win_loss_summary_stats(teams)
        self.assertEqual(wins, 3)
        self.assertEqual(losses, 1)
        self.assertEqual(percentage, 75)
        self.assertEqual(grade, 'Distinction')

        teams = [
            {'margin': 0},
            {'margin': 50},
            {'margin': -2}
        ] 
        wins, losses, percentage, grade = aufc_teams_util.get_win_loss_summary_stats(teams)
        self.assertEqual(wins, 1)
        self.assertEqual(losses, 2)
        self.assertEqual(percentage, 33)
        self.assertEqual(grade, 'Fail')

        teams = [
            {'margin': 0},
            {'margin': -50},
            {'margin': -2}
        ] 
        wins, losses, percentage, grade = aufc_teams_util.get_win_loss_summary_stats(teams)
        self.assertEqual(wins, 0)
        self.assertEqual(losses, 3)
        self.assertEqual(percentage, 0)
        self.assertEqual(grade, 'Fail')

        teams = [] 
        wins, losses, percentage, grade = aufc_teams_util.get_win_loss_summary_stats(teams)
        self.assertEqual(wins, 0)
        self.assertEqual(losses, 0)
        self.assertEqual(percentage, 0)
        self.assertEqual(grade, '')

    
    def test_get_win_loss_summary_html(self):
        teams = [
            {'margin': 20},
            {'margin': 50},
            {'margin': -2},
            {'margin': 4}
        ] 
        self.assertEqual(aufc_teams_util.get_win_loss_summary_html(
            teams
        ), "<div id='win-loss-summary'>Uni won 3 out of 4 = 75% => Distinction</div>")