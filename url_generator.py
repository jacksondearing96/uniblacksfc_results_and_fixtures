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
# pool=1 makes sure it lands on the normal season games (not finals)
# pool=0 will land on finals if they exist
# https://websites.sportstg.com/comp_info.cgi?client=1-114-0-510206-0&pool=1&round=1&a=ROUND


url_codes = {
    "2020": {
        "Mens": {
            "1": "547208",
            "1 Res": "547219",
            "C1": "547209",
            "C4": "547212",
            "C6": "557892",
            "C7": "547401"
        },
        "Womens": {
            "1": "548065",
            "1 Res": "555668"
        }
    },
    "2019": {
        "Mens": {
            "1": "510206",
        }
    },
    "2018": {
        "Womens": {
            "1": "522288",
        }
    },
}


def GetUrlCode(year, gender, division):
    year = str(year)
    if not url_codes.has_key(year):
        return None
    year = url_codes[year]
    if not year.has_key(gender):
        return None
    gender = year[gender]
    if not gender.has_key(division):
        return None
    code = gender[division]
    return code


def GetUrl(year, gender, division, round):
    code = GetUrlCode(year, gender, division)
    if not code:
        print('Error - could not find url code.')
        return None
    normal_season = '&pool=1'
    round = '&round=' + str(round)
    return 'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-' + code + '-0&a=FIXTURE' + round + normal_season


# TODO: Extend to account for finals matches
