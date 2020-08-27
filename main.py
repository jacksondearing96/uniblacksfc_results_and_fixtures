from flask import Flask, render_template, request
from datetime import datetime
import web_scraper
import logging
import os
import json
import cloudstorage as gcs
import webapp2

from google.appengine.api import app_identity

app = Flask(__name__, template_folder='templates')


last_update_time = datetime.now()

bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())


def update_is_required():
    global last_update_time
    return last_update_time.date() < datetime.today().date()


def read_file_to_string(filename):
    try:
        with open(filename, 'r') as file:
            data = file.read()
        file.close()
        return data
    except:
        return ''


def gcs_read_file_to_string(filename):
    try:
        file = gcs.open('/sub-auto.appspot.com/' + filename)
        data = file.read()
        file.close()
        return data
    except:
        return "ERROR"


def gcs_write(filename, data):
    try:
        if type(data) is not str:
            print('ERROR - trying to write data to GCS file that is not of type str')
            return 'FAIL'

        global bucket_name
        gcs_file = gcs.open('/sub-auto.appspot.com/' + filename, 'w')
        gcs_file.write(data)
        gcs_file.close()
        return 'SUCCESS'
    except:
        return 'FAIL'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_css')
def get_css():
    return read_file_to_string('static/css/subAuto.css')


@app.route('/get_rounds')
def get_rounds():
    return gcs_read_file_to_string('database/rounds.csv')


@app.route('/get_includes')
def get_includes():
    return gcs_read_file_to_string('database/includes.csv')


@app.route('/get_finals')
def get_finals():
    return gcs_read_file_to_string('database/finals.csv')


@app.route('/save_rounds_includes_and_finals', methods=['POST'])
def save_rounds_includes_and_finals():
    rounds_includes_and_finals = request.get_json(force=True)
    try:
        print(gcs_write('database/rounds.csv', json.dumps(rounds_includes_and_finals['rounds'])))
        print(gcs_write('database/includes.csv', json.dumps(rounds_includes_and_finals['includes'])))
        print(gcs_write('database/finals.csv', json.dumps(rounds_includes_and_finals['finals'])))
        print('Finished writing files')
        return 'SUCCESS'
    except:
        return 'ERROR'


def csv_string_to_map(csv_string):
    csv_list = csv_string.split(',')

    output_map = {}

    for item in csv_list:
        item = item.split('::')

        # Ensure that their is a pair of values.
        while len(item) < 2:
            item.append('')

        item[0] = item[0].replace('\n','')
        item[1] = item[1].replace('\n','')

        output_map[item[0]] = item[1]

    return output_map


def apply_overrides(nicknames, overrides):
    for key in overrides:
        nicknames[key] = overrides[key]


@app.route('/get_nicknames')
def get_nicknames():
    nicknames = csv_string_to_map(read_file_to_string('database/nicknames.csv'))
    override_nicknames = csv_string_to_map(read_file_to_string('database/override_nicknames.csv'))
    apply_overrides(nicknames, override_nicknames)
    return json.dumps(nicknames)


@app.route('/get_ground_names')
def get_ground_names():
    ground_names = csv_string_to_map(read_file_to_string('database/ground_nicknames.csv'))
    override_ground_names = csv_string_to_map(read_file_to_string('database/override_ground_nicknames.csv'))
    apply_overrides(ground_names, override_ground_names)
    return json.dumps(ground_names)


@app.route('/get_override_image_urls')
def get_override_image_urls():
    return json.dumps(csv_string_to_map(read_file_to_string('database/override_image_urls.csv')))


@app.route('/get_teams')
def get_teams():
    return read_file_to_string('database/configurations.json')


@app.route('/get_past_games', methods=['POST'])
def get_past_games():
    try:
        games = request.get_json(force=True)
        return web_scraper.get_past_games(games)
    except:
        return web_scraper.server_failure()


@app.route('/get_future_games', methods=['POST'])
def get_future_games():
    try:
        games = request.get_json(force=True)
        return web_scraper.get_future_games(games)
    except:
        return web_scraper.server_failure()


@app.route('/update_player_names_from_database')
def update_player_names_from_databse():
    if not update_is_required(): return 'UPDATE OF PLAYER NAMES NOT REQUIRED'

    if not web_scraper.update_player_names_from_database():
        return 'FAIL'

    global last_update_time
    last_update_time = datetime.now()
    return 'SUCCESS'


@app.route('/update_nicknames_from_database')
def update_nicknames_from_database():
    if not update_is_required(): return 'UPDATE OF NICKNAMES NOT REQUIRED'

    if not web_scraper.update_nicknames_from_database():
        return 'FAIL'

    global last_update_time
    last_update_time = datetime.now()
    return 'SUCCESS'
        

@app.route('/update_ground_names_from_database')
def update_ground_names_from_database():
    if not update_is_required(): return 'UPDATE OF GROUND NAMES NOT REQUIRED'

    if not web_scraper.update_ground_names_from_database():
        return 'FAIL'

    global last_update_time
    last_update_time = datetime.now()
    return 'SUCCESS'


@app.route('/save_bowlies_results', methods=['POST'])
def save_bowlies_results():
    return gcs_write('database/bowlies_saved_results.txt', request.get_data())


@app.route('/restore_bowlies_results', methods=['GET'])
def restore_bowlies_results():
    return gcs_read_file_to_string('database/bowlies_saved_results.txt')
    

@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in ['bowlies.html', 'future-game.html', 'past-game.html']:
        return 'ERROR - invalid url path'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        return render_template(path, teams=teams)
    else:
        return render_template(path)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
