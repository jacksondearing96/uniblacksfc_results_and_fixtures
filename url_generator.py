import logging

logging.basicConfig(level=logging.INFO)

# 2020 Div 1 Mens
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547208-0&a=FIXTURE
# 2020 Div 1 Res Mens
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547219-0&a=FIXTURE
# 2020 Div C1
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547209-0&a=FIXTURE
# 2020 Div C4
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547212-0&a=FIXTURE
# 2020 Div C6
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-557892-0&a=FIXTURE
# 2020 Div C7
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-547401-0&a=FIXTURE
# 2020 Div 1 Women
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-548065-0&a=FIXTURE
# 2020 Div 1 Res Women
# https://websites.sportstg.com/comp_info.cgi?c=1-114-0-555668-0&a=FIXTURE


# 2019 Div 1 Mens
# a=ROUND makes sure it lands on the results page (not the ladder or something else)
# a=MATCH will take you to Match Centre
# a=FIXTURE will show you the next match to come
# pool=1 makes sure it lands on the normal season games (not finals)
# pool=0 will land on finals if they exist
# https://websites.sportstg.com/comp_info.cgi?client=1-114-0-510206-0&pool=1&round=1&a=ROUND

import util
import json

team_configurations_str = util.read_file_to_string('database/team_configurations.json')
team_configurations = json.loads(team_configurations_str)

def get_url_code(year, gender, division):
    year = str(year)
    global team_configurations

    if not team_configurations.has_key(year):
        logging.error('Failed to get_url_code year: ' + year + ' was invalid.')
        return None
    year = team_configurations[year]

    if not year.has_key(gender):
        logging.error('Failed to get_url_code, gender: ' + gender + ' was not present under year: ' + year)
        return None
    gender = year[gender]

    if not gender.has_key(division):
        logging.error('Failed to get_url_code, division: ' + division + ' was not present under year: ' + year + ' and gender: ' + gender)
        return None
    team = gender[division]

    if not team.has_key('url_code'):
        logging.error('Failed to get_url_code, url_code was not present for division: ' + division + ' year: ' + year + ' and gender: ' + gender)

    return team['url_code'] 


def get_url(year, gender, division, round, past=True, is_final=False):
    code = get_url_code(year, gender, division)
    logging.info('Determining url for: year=' + str(year) + ', gender=' + gender + ', div=' + division + ', round=' + round + ', past=' + str(past) + ', is_final=' + str(is_final))
    return get_url(code, round, past, is_final)


def get_url(code, round, past=True, is_final=False):
    if not code:
        logging.error('Error - could not get_url code.')
        return None

    round = '&round=' + str(round)

    fixture_or_round = 'ROUND'
    if not past: fixture_or_round = 'FIXTURE'

    normal_or_final = '&pool=1'
    if is_final: normal_or_final = ''

    url = 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-' + code + '-0&a=' + fixture_or_round + round + normal_or_final
    
    logging.info(url)

    return url
