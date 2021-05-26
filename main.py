from flask import Flask, render_template, request, make_response
from datetime import datetime
import web_scraper
import logging
import os
import json
import util
import asyncio
import time

import aufc_teams_util

logging.basicConfig(level=logging.INFO)

app = Flask(__name__, template_folder='templates')


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test_data', methods=['GET'])
def test_data():
    return util.read_file_to_string('database/interesting_games_to_test.json')


# Deprecated.
@app.route('/get_game', methods=['POST'])
def get_game():
    try:
        game = request.get_json(force=True)
        game = web_scraper.get_game_details_from_sportstg(game)
        return allow_cors(json.dumps(game.__dict__))
    except Exception as e:
        logging.error(e)
        return web_scraper.server_failure('SERVER FAILURE')


@app.route('/results', methods=['POST'])
async def results():
    request_json = request.get_json(force=True)
    teams = request_json['teams']

    for team in teams:
        team['is_past_game'] = True
    teams = await web_scraper.populate_teams(teams)
    teams = aufc_teams_util.sort_teams_for_fixtures(teams)
    teams = aufc_teams_util.apply_random_winning_verbs(teams)

    response_html = ''
    title = ''
    win_loss_summary = ''

    if 'options' in request_json:
        options = request_json['options']
        if 'error_info' in options:
            response_html += aufc_teams_util.get_errors_html(teams)
        if 'dates_info' in options:
            response_html += aufc_teams_util.get_dates_info_html(teams)
        if 'title' in options:
            title = aufc_teams_util.get_results_title()
        if 'win_loss_summary' in options:
            win_loss_summary = aufc_teams_util.get_win_loss_summary_html(teams)
        if 'dates' in options:
            teams = aufc_teams_util.include_dates_html_for_appropriate_teams(teams)

    response_html += render_template('substandard-results-content.html', teams=teams, title=title, win_loss_summary=win_loss_summary)
    return allow_cors(response_html)


@app.route('/fixtures', methods=['POST'])
def fixtures():
    return 'unimplemented'


@app.route('/last_weekend_results', methods=['GET'])
async def last_weekend_results():
    year = datetime.today().year
    teams = initialise_teams_input_data_from_configuration(year)

    populated_teams = await web_scraper.populate_teams(teams)
    response_content = render_template('substandard-results-content.html', teams=populated_teams)
    return allow_cors(response_content)


@app.route('/this_weekend_fixtures', methods=['GET'])
async def this_weekend_fixtures():
    year = datetime.today().year
    teams = initialise_teams_input_data_from_configuration(year)

    for team in teams:
        team['is_past_game'] = False

    populated_teams = await web_scraper.populate_teams(teams)
    response_content = render_template('substandard-fixtures-content.html', teams=populated_teams)
    return allow_cors(response_content)


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in [
        'index.html',
    ]:
        return 'ERROR - server does not serve that url path'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        return allow_cors(render_template(path, teams=teams))
    else:
        return render_template(path)

# Sending a response with this header set will allow the resource
# to be utilised by an external app.
def allow_cors(content):
    response = make_response(content)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


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
    return allow_cors(response_data)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
