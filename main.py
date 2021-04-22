from flask import Flask, render_template, request
from datetime import datetime
import web_scraper
import logging
import os
import json
import cloudstorage as gcs
import util
import webapp2

from google.appengine.api import app_identity

bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())

app = Flask(__name__, template_folder='templates')


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
            logging.error('Trying to write data to GCS file that is not of type str')
            return 'FAIL'

        global bucket_name
        gcs_file = gcs.open('/sub-auto.appspot.com/' + filename, 'w')
        gcs_file.write(data)
        gcs_file.close()
        return 'SUCCESS'
    except:
        return 'FAIL'


@app.route('/get_teams')
def get_teams():
    return read_file_to_string('database/configurations.json')


@app.route('/get_game', methods=['POST'])
def get_game():
    try:
        game = request.get_json(force=True)
        game = web_scraper.get_game_details_from_sportstg(game)

    except:
        return web_scraper.server_failure()


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in ['bowlies.html', 'future-game.html', 'past-game.html']:
        return 'ERROR - invalid url path'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        return render_template(path, teams=teams)
    else:
        return render_template(path)


############## Save and restore functionality ###################
@app.route('/get_rounds')
def get_rounds():
    return util.gcs_read_file_to_string('database/rounds.csv')


@app.route('/get_includes')
def get_includes():
    return util.gcs_read_file_to_string('database/includes.csv')


@app.route('/get_finals')
def get_finals():
    return util.gcs_read_file_to_string('database/finals.csv')


@app.route('/save_rounds_includes_and_finals', methods=['POST'])
def save_rounds_includes_and_finals():
    rounds_includes_and_finals = request.get_json(force=True)
    try:
        util.gcs_write('database/rounds.csv', json.dumps(rounds_includes_and_finals['rounds']))
        util.gcs_write('database/includes.csv', json.dumps(rounds_includes_and_finals['includes']))
        util.gcs_write('database/finals.csv', json.dumps(rounds_includes_and_finals['finals']))
        return 'SUCCESS'
    except:
        return 'ERROR'

@app.route('/save_bowlies_results', methods=['POST'])
def save_bowlies_results():
    return util.gcs_write('database/bowlies_saved_results.txt', request.get_data())


@app.route('/restore_bowlies_results', methods=['GET'])
def restore_bowlies_results():
    return util.gcs_read_file_to_string('database/bowlies_saved_results.txt')

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
