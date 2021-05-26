import random
import sys
from datetime import datetime
from dateutil import parser as date_parser
import calendar

def get_winning_verbs():
    return [
        "smashed",
        "crushed",
        "flogged",
        "conquored",
        "obliterated",
        "slaughtered",
        "demolished",
        "spanked",
        "annihilated",
        "dismantled",
        "decimated",
        "destroyed",
        "wrecked",
    ]

def apply_random_winning_verbs(teams):
    winning_verbs = get_winning_verbs()

    for team in teams:
        if team['win_or_loss_verb'] == 'defeated':
            team['win_or_loss_verb'] = winning_verbs.pop(random.randint(0,len(winning_verbs)-1))
    return teams


def calculate_grade(percentage):
    if percentage >= 85: return 'High Distinction'
    if percentage >= 75: return 'Distinction'
    if percentage >= 65: return 'Credit'
    if percentage >= 50: return 'Pass'
    return 'Fail'


def get_win_loss_summary_stats(teams):
    wins = 0
    losses = 0

    # Count the losses and wins.
    for team in teams:
        margin = team['margin']
        if not isinstance(margin, int) or margin <= 0:
            losses += 1
        else:
            wins += 1

    # Invalid state.
    if wins + losses == 0:
        return 0, 0, 0, ''
    
    winning_percentage = round((wins / (wins + losses)) * 100)
    grade = calculate_grade(winning_percentage)
    return wins, losses, winning_percentage, grade


def get_win_loss_summary_html(teams):
    wins, losses, winning_percentage, grade = get_win_loss_summary_stats(teams)
    return "<div id='win-loss-summary'>Uni won {} out of {} = {}% => {}</div>".format(wins, wins + losses, winning_percentage, grade)


def sort_teams_based_on_division(teams):
    return sorted(teams, key=lambda k: k['priority']) 


def sort_teams_based_on_margin(teams):
    for team in teams:
        if not isinstance(team['margin'], int):
            team['margin'] = -sys.maxsize - 1
    return sorted(teams, key=lambda k: k['margin'])


def sort_teams_for_fixtures(teams):
    mens_teams = []
    womens_teams = []

    for team in teams:
        if team['gender'] == 'Mens':
            mens_teams.append(team)
        else:
            womens_teams.append(team)
    
    mens_teams = sort_teams_based_on_division(mens_teams)
    womens_teams = sort_teams_based_on_division(womens_teams)

    teams = []
    mens_first = datetime.now().isocalendar()[1] % 2 == 1

    if mens_first:
        teams.extend(mens_teams)
        teams.extend(womens_teams)
    else:
        teams.extend(womens_teams)
        teams.extend(mens_teams)

    return teams


def assign_sandy_coburn_cup_points(teams):
    teams = sort_teams_based_on_margin(teams)

    sandy_coburn_cup_points = 1
    for team in teams:
        if team['margin'] == -sys.maxsize - 1:
            team['sandy_points'] = 0
        else:
            team['sandy_points'] = sandy_coburn_cup_points
            sandy_coburn_cup_points += 1
    return teams


def get_errors_html(teams):
    errors = ''
    for team in teams:
        if team['error'] != '':
            errors += '<div class="substandard-error">ERROR found for {}: {}</div>'.format(team['nickname'], team['error'])

    if errors == '':
        errors = '<div class="no-errors-found">All teams and results were found without errors</div>'
    
    return errors


def get_dates_info_html(teams):
    dates_html = "<p>Found matches from the following dates (check that this looks correct):</p>"

    dates = []
    for team in teams:
        if isinstance(team['date'], str):
            dates.append(team['date'])

    unique_dates = set(dates)

    for date in unique_dates:
        dates_html += '<div class="date-found">' + date + '</div>'

    return dates_html


def expand_date(date, year):
    if date == None or date == '':
        return ''

    date_object = date_parser.parse(date + ' ' + str(year))
    return ' '.join([
            calendar.day_name[date_object.weekday()],
            str(date_object.day),
            calendar.month_name[date_object.month], 
            str(date_object.year)
        ])


def include_dates_html_for_appropriate_teams(teams):
    for i in range(0, len(teams)):
        date = teams[i]['date']
        previous_date = teams[i - 1]['date']

        if i == 0 or (date != previous_date and date != None and previous_date != None):
            teams[i]['date_HTML'] = expand_date(date, teams[i]['year'])
        else:
            teams[i]['date_HTML'] = ''

    return teams

        
def get_results_title():
    return '<div id="substandard-results-title">"If winning is all there is, we want no part of it"</div>'


def get_fixtures_title():
    return "<p id='future-games-title'>WHAT'S ON THIS WEEKEND</p>"
