import json
import util
from datetime import datetime
import connect_to_database

last_update_time = datetime.now()

def test_connection():
    mycursor = connect_to_database.connect()
    mycursor.execute("SELECT OppositionName, Nickname FROM oppositionclubs")
    myresult = mycursor.fetchall()

    for x in myresult:
        print(x)


def update_is_required():
    global last_update_time
    return last_update_time.date() < datetime.today().date()

def open_aufc_database():
    # Opens the AUFC database, logs in and returns a driver for the page.
    # Open headless chrome.
    options = webdriver.ChromeOptions()
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--incognito')
    options.add_argument('--headless')
    driver = webdriver.Chrome(
        "/Users/jacksondearing/Desktop/football_results_automation/chromedriver", chrome_options=options)

    # AUFC database.
    driver.get("http://uniblacksfc.com.au/members/index.php")

    # Fill in username and password.
    driver.find_element_by_id('username').send_keys('bobneil')
    driver.find_element_by_id('password').send_keys('bobneil134!')
    login_button_selector = 'body > div > div.row > div:nth-child(2) > form > button'
    driver.find_element_by_css_selector(login_button_selector).click()

    return driver


def update_player_names_from_database():
    # This logs into the AUFC database front end and searches for all the registered players.
    # It updates the .csv cached file 'registered_players.csv' with each registered player and 
    # there nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-registration").click()
        time.sleep(1)

        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-registration-search > button').click()
        time.sleep(3)

        names = driver.find_elements_by_class_name('registration-edit-name')
        names = map(lambda x: x.get_attribute('innerHTML'), names)
        nicknames = driver.find_elements_by_css_selector(
            '.registration-edit-name + td')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/registered_players.json', 'w') as file:
            file.write('{')
            for name, nickname in zip(names, nicknames):
                name_parts = name.split(', ')
                initial = name_parts[1][0] + '.'
                full_name = name_parts[1] + ' ' + name_parts[0]
                file.write(
                    '"' + initial + ' ' + name_parts[0] + '":"' + str(nickname) + ' (' + full_name + ')' + '",\n')
            file.write('}')

        driver.close()
        return True
    except:
        return False


def update_nicknames_from_database():
    # This logs into the AUFC database front end and searches for all the opposition nicknames.
    # Updates the .csv cached file 'nicknames.csv' with each opposition nickname and 
    # there nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-opposition").click()
        time.sleep(1)
        
        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-opposition-search > button').click()
        time.sleep(3)

        # Get opposition names.
        names = driver.find_elements_by_css_selector('#opposition-search-div > div > table > tbody > tr > td:nth-child(1)')
        names = map(lambda x: x.get_attribute('innerHTML'), names)

        # Get opposition nicknames.
        nicknames = driver.find_elements_by_css_selector('#opposition-search-div > div > table > tbody > tr > td:nth-child(2)')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        # Verify lengths are consistent.
        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/nicknames.json', 'w') as file:
            file.write('{')
            for name, nickname in zip(names, nicknames):
                name = name.replace('amp;','')
                nickname = nickname.replace('amp;','')
                file.write('"' + name + '":"' + nickname + '",\n')
            file.write('}')

        driver.close()
        return True
    except:
        return False

def update_ground_names_from_database():
    # This logs into the AUFC database front end and searches for all the opposition ground names.
    # Updates the .csv cached file 'ground_nicknames.csv' with each opposition ground name and 
    # their ground nickname in the format <name>:<nickname>
    # Storing this information in a cache greatly improves the real-time performance of the system.
    try:
        driver = open_aufc_database()

        driver.find_element_by_id("db-menu-grounds").click()
        time.sleep(1)
        
        # Perform an empty search to get all registered players.
        driver.find_element_by_css_selector(
            '#form-ground-search > button').click()
        time.sleep(3)

        # Get opposition ground names.
        names = driver.find_elements_by_css_selector('#ground-search-div > div > table > tbody > tr > td:nth-child(1)')
        names = map(lambda x: x.get_attribute('innerHTML'), names)

        # Get opposition ground nicknames.
        nicknames = driver.find_elements_by_css_selector('#ground-search-div > div > table > tbody > tr > td:nth-child(2)')
        nicknames = map(lambda x: x.get_attribute('innerHTML'), nicknames)

        # Verify lengths are consistent.
        if (len(names) != len(nicknames)):
            error('Scraped a different number of names and nicknames')

        with open('database/ground_nicknames.json', 'w') as file:
            file.write('{')
            for name, nickname in zip(names, nicknames):
                name = name.replace('amp;','')
                nickname = nickname.replace('amp;','')
                file.write('"' name + '":"' + nickname + '",\n')
            file.write('}')

        driver.close()
        return True
    except:
        return False



def get_player_names():
    return json.loads(util.read_file_to_string('database/registered_players.json'))


def apply_overrides(nicknames, overrides):
    for key in overrides:
        nicknames[key] = overrides[key]


def get_opposition_nicknames():
    opposition_nicknames = json.loads(util.read_file_to_string('database/nicknames.json'))
    override_opposition_nicknames = json.loads(util.read_file_to_string('database/override_nicknames.json'))
    apply_overrides(opposition_nicknames, override_opposition_nicknames)
    return opposition_nicknames


def get_ground_nicknames():
    ground_nicknames = json.loads(util.read_file_to_string('database/ground_nicknames.json'))
    override_ground_nicknames = json.loads(util.read_file_to_string('database/override_ground_nicknames.json'))
    apply_overrides(ground_nicknames, override_ground_nicknames)
    return ground_nicknames


def get_override_image_urls():
    return json.loads(util.read_file_to_string('database/override_image_urls.json'))


def run_updates():
    if not update_is_required(): 
        logging.info('Updates were not required.')

    if not update_ground_names_from_database():
        return 'FAIL'
    if not update_player_names_from_database():
        return 'FAIL'
    if not update_nicknames_from_database():
        return 'FAIL'

    global last_update_time
    last_update_time = datetime.now()
    return 'SUCCESS'