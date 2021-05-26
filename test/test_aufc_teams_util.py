import unittest
import sys

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

    
    def test_sort_teams_based_on_division(self):
        teams = [
            {'priority': 20},
            {'priority': 50},
            {'priority': -2},
            {'priority': 4}
        ]

        teams = aufc_teams_util.sort_teams_based_on_division(teams)

        self.assertEqual(teams[0]['priority'], -2)
        self.assertEqual(teams[1]['priority'], 4)
        self.assertEqual(teams[2]['priority'], 20)
        self.assertEqual(teams[3]['priority'], 50)


    def test_sort_teams_based_on_margins(self):
        teams = [
            {'margin': 20},
            {'margin': 50},
            {'margin': -2},
            {'margin': 4},
            {'margin': None}
        ]

        teams = aufc_teams_util.sort_teams_based_on_margin(teams)

        self.assertEqual(teams[0]['margin'], -sys.maxsize -  1)
        self.assertEqual(teams[1]['margin'], -2)
        self.assertEqual(teams[2]['margin'], 4)
        self.assertEqual(teams[3]['margin'], 20)
        self.assertEqual(teams[4]['margin'], 50)


    def test_assign_sandy_coburn_cup_points(self):
        teams = [
            {'margin': 20},
            {'margin': 50},
            {'margin': -2},
            {'margin': 4},
            {'margin': None}
        ]

        teams = aufc_teams_util.assign_sandy_coburn_cup_points(teams)

        self.assertEqual(teams[0]['sandy_points'], 0)
        self.assertEqual(teams[1]['sandy_points'], 1)
        self.assertEqual(teams[2]['sandy_points'], 2)
        self.assertEqual(teams[3]['sandy_points'], 3)
        self.assertEqual(teams[4]['sandy_points'], 4)

        # Need to check that the teams have been sorted correctly too.
        self.assertEqual(teams[0]['margin'], -sys.maxsize -  1)
        self.assertEqual(teams[1]['margin'], -2)
        self.assertEqual(teams[2]['margin'], 4)
        self.assertEqual(teams[3]['margin'], 20)
        self.assertEqual(teams[4]['margin'], 50)


    def test_expand_date(self):
        self.assertEqual(aufc_teams_util.expand_date('Wed 26 May', 2021), 'Wednesday 26 May 2021')
        # Notice how it overrides the day name with the correct one given the date and year.
        self.assertEqual(aufc_teams_util.expand_date('Wed 26 May', 2020), 'Tuesday 26 May 2020')


    def test_include_dates_html(self):
        date = '12 May'
        different_date = '1 Jan'
        teams = [
            {'date': date, 'year': 2021},
            {'date': date, 'year': 2021},
            {'date': different_date, 'year': 2021},
            {'date': date, 'year': 2021},
            {'date': date, 'year': 2021}
        ]
        
        teams = aufc_teams_util.include_dates_html_for_appropriate_teams(teams)

        date_html = 'Wednesday 12 May 2021'
        different_date_html = 'Friday 1 January 2021'

        self.assertEqual(teams[0]['date_HTML'], date_html)
        self.assertEqual(teams[1]['date_HTML'], '')
        self.assertEqual(teams[2]['date_HTML'], different_date_html)
        self.assertEqual(teams[3]['date_HTML'], date_html)
        self.assertEqual(teams[4]['date_HTML'], '')
        


