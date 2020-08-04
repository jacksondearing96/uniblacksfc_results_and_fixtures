# Initialise gcloud
# ./~/google-cloud-sdk/bin/gcloud init
#
# Run a test server (this will be similar to what is deployed on app engine)
#  dev_appserver.py --application=sub-auto app.yaml
#
# Create a virtual environment
# virtualenv venv
#
# Enter the venv
# source venv/bin/activate
#
# Exit the venv
# deactivate
#
# Update requirements based on what pip has in the virtual env
# pip freeze > requirements.txt
#
# Install the requirements into the lib dir
# pip install -t lib -r requirements.txt 
#
# Deploy application
# ~/google-cloud-sdk/bin/gcloud app deploy
#
# View application
# gcloud app browse
#

from flask import Flask, render_template, request
from datetime import datetime
import web_scraper
import os
import json

app = Flask(__name__, template_folder='templates')


last_update_time = datetime.now()


def update_is_required():
    return last_update_time.date() < datetime.today().date()


def ReadFileToString(filename):
    try:
        with open(filename, 'r') as file:
            data = file.read()
        return data
    except:
        return ''


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_css')
def get_css():
    return ReadFileToString('static/css/subAuto.css')


rounds = '' # This is a hack work around for when save rounds to disk doesn't work.
@app.route('/get_rounds')
def get_rounds():
    return ReadFileToString('database/rounds.csv')


@app.route('/save_rounds', methods=['POST'])
def save_rounds():
    try:
        rounds = requests.get_data()
        with open('database/rounds.csv', 'w') as file:
            print(request.get_data())
            file.write(request.get_data())
            return 'SUCCESS'
    except:
        pass
    return 'FAIL'


def csv_string_to_map(csv_string):
    csv_list = csv_string.split(',')

    output_map = {}

    for item in csv_list:
        item = item.split(':')

        # Ensure that their is a pair of values.
        while len(item) < 2:
            item.append('')

        output_map[item[0]] = item[1]

    return output_map


def apply_overrides(nicknames, overrides):
    for key in overrides:
        nicknames[key] = overrides[key]


@app.route('/get_nicknames')
def get_nicknames():
    nicknames = csv_string_to_map(ReadFileToString('database/nicknames.csv'))
    override_nicknames = csv_string_to_map(ReadFileToString('database/override_nicknames.csv'))
    apply_overrides(nicknames, override_nicknames)
    return json.dumps(nicknames)


@app.route('/get_ground_names')
def get_ground_names():
    ground_names = csv_string_to_map(ReadFileToString('database/ground_nicknames.csv'))
    override_ground_names = csv_string_to_map(ReadFileToString('database/override_ground_nicknames.csv'))
    apply_overrides(ground_names, override_ground_names)
    return json.dumps(ground_names)


@app.route('/get_teams')
def get_teams():
    return ReadFileToString('database/configurations.json')


@app.route('/get_past_games', methods=['POST'])
def get_past_games():
    try:
        games = request.get_json(force=True)
        return web_scraper.GetPastGames(games)
    except:
        return web_scraper.ServerFailure()


@app.route('/get_future_games', methods=['POST'])
def get_future_games():
    try:
        games = request.get_json(force=True)
        return web_scraper.GetFutureGames(games)
    except:
        return web_scraper.ServerFailure()


@app.route('/update_cache_from_database')
def update_cache_from_databse():
    if not update_is_required(): return 'UPDATE NOT REQUIRED'

    if web_scraper.UpdatePlayerNamesFromDatabase('database/registered_players.csv'):
        last_update_time = datetime.now()
        return 'SUCCESS'
    else:
        return 'FAIL'


@app.route('/save_bowlies_results', methods=['POST'])
def save_bowlies_results():
    try:
        with open('database/bowlies_saved_results.txt', 'w') as file:
            file.write(request.get_data())
            return 'SUCCESS'
    except:
        pass
    return 'FAIL'


@app.route('/restore_bowlies_results', methods=['GET'])
def restore_bowlies_results():
    with open('database/bowlies_saved_results.txt', 'r') as file:
        return file.read()
    return 'FAIL'
    

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
