import random
import sys

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
        if teams['gender'] == 'Mens':
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

