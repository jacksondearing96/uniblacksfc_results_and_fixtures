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

logging.basicConfig(level=logging.INFO)

bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())

app = Flask(__name__, template_folder='templates')


@app.route('/test_data', methods=['GET'])
def test_data():
    return util.read_file_to_string('database/interesting_games_to_test.json')


@app.route('/get_game', methods=['POST'])
def get_game():
    try:
        game = request.get_json(force=True)
        game = web_scraper.get_game_details_from_sportstg(game)
        return json.dumps(game.__dict__)
    except Exception as e:
        logging.error(e)
        return web_scraper.server_failure('SERVER FAILURE')


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in [
        'bowlies.html',
        'bowlies-content.html'
    ]:
        return 'ERROR - server does not serve that url path'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        return render_template(path, teams=teams)
    else:
        return render_template(path)


def initialise_teams_input_data_from_configuration(requested_year):
    # TODO: may be to simplify this and the configuration file.
    logging.info('Initialising input data from configuration file.') 

    teams = []
    teams_configurations = json.loads(util.read_file_to_string('database/team_configurations.json'))
    for year in teams_configurations.keys():
        if year != str(requested_year): continue
        for gender in teams_configurations[year]:
            for division in teams_configurations[year][gender]:
                url_code = teams_configurations[year][gender][division]['url_code']
                nickname = teams_configurations[year][gender][division]['nickname']
                team = {
                    'year': int(year),
                    'gender': gender,
                    'division': division,
                    'url_code': url_code,
                    'nickname': nickname,
                    'skip_this_game': False,
                    'is_final': False,
                    'round': False
                }
                teams.append(team)
    return teams


@app.route('/input-table-teams-data', methods=['GET'])
def input_table_teams_data():
    year = request.args.get('year')
    return json.dumps(initialise_teams_input_data_from_configuration(year)) 


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
