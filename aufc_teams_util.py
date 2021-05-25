import random

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
