from flask import Flask, render_template, request, make_response
from datetime import datetime
import web_scraper
import logging
import os
import json
import util

logging.basicConfig(level=logging.INFO)

app = Flask(__name__, template_folder='templates')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test_data', methods=['GET'])
def test_data():
    return util.read_file_to_string('database/interesting_games_to_test.json')


@app.route('/get_game', methods=['POST'])
def get_game():
    try:
        game = request.get_json(force=True)
        game = web_scraper.get_game_details_from_sportstg(game)
        print(game.goal_kickers)
        resp = make_response(json.dumps(game.__dict__))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    except Exception as e:
        logging.error(e)
        return web_scraper.server_failure('SERVER FAILURE')


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in [
        'index.html',
        'bowlies.html',
        'bowlies-content.html',
        'substandard.html',
        'substandard-results-content.html',
        'substandard-fixtures-content.html'
    ]:
        return 'ERROR - server does not serve that url path'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        print(teams)
        resp = make_response(render_template(path, teams=teams))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
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
                    'is_past_game': True,
                    'round': False
                }
                teams.append(team)
    return teams


@app.route('/input-table-teams-data', methods=['GET'])
def input_table_teams_data():
    year = request.args.get('year')
    response_data = json.dumps(initialise_teams_input_data_from_configuration(year)) 
    resp = make_response(response_data)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
