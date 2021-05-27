from flask import Flask, render_template, request, make_response
from datetime import datetime, date, timedelta
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


def apply_generic_options(teams, options, is_for_results=True):
    response_html = ''
    title = ''

    if 'error_info' in options:
        response_html += aufc_teams_util.get_errors_html(teams)
    if 'dates_info' in options:
        response_html += aufc_teams_util.get_dates_info_html(teams)
    if 'title' in options:
        title = aufc_teams_util.get_title(is_for_results)
    if 'dates' in options:
        teams = aufc_teams_util.include_dates_html_for_appropriate_teams(teams)

    return title, teams, response_html


@app.route('/results', methods=['POST'])
async def results():
    request_json = request.get_json(force=True)
    teams = request_json['teams']

    for team in teams:
        team['is_past_game'] = True
    teams = await web_scraper.populate_teams(teams)
    teams = aufc_teams_util.sort_teams_for_fixtures(teams)
    teams = aufc_teams_util.apply_random_winning_verbs(teams)

    if 'options' in request_json:
        title, teams, response_html = apply_generic_options(teams, request_json['options'])

    # Additional option just for results.
    win_loss_summary = ''
    if 'options' in request_json and 'win_loss_summary' in request_json['options']:
        win_loss_summary = aufc_teams_util.get_win_loss_summary_html(teams)

    response_html += render_template('substandard-results-content.html', teams=teams, title=title, win_loss_summary=win_loss_summary)
    return allow_cors(response_html)


@app.route('/fixtures', methods=['POST'])
async def fixtures():
    request_json = request.get_json(force=True)
    teams = request_json['teams']

    for team in teams:
        team['is_past_game'] = False
    teams = await web_scraper.populate_teams(teams)
    teams = aufc_teams_util.sort_teams_for_fixtures(teams)

    if 'options' in request_json:
        is_for_results = False
        title, teams, response_html = apply_generic_options(teams, request_json['options'], is_for_results)

    response_html += render_template('substandard-fixtures-content.html', teams=teams, title=title)
    return allow_cors(response_html)


@app.route('/bowlies', methods=['POST'])
async def bowlies():
    request_json = request.get_json(force=True)
    teams = request_json['teams']

    for team in teams:
        team['is_past_game'] = True
    teams = await web_scraper.populate_teams(teams)
    teams = aufc_teams_util.sort_teams_based_on_margin(teams)

    if 'options' in request_json:
        title, teams, response_html = apply_generic_options(teams, request_json['options'])

    # Additional option just for results.
    win_loss_summary = ''
    if 'options' in request_json and 'win_loss_summary' in request_json['options']:
        win_loss_summary = aufc_teams_util.get_win_loss_summary_html(teams)

    response_html += render_template('bowlies-content.html', teams=teams, win_loss_summary=win_loss_summary)
    return allow_cors(response_html)


cached_last_weekend_results = { 'content': '', 'updated': None }
cached_this_weekend_fixtures = { 'content': '', 'updated': None }

def should_deliver_cache(cached_result):
    today = date.today()
    last_monday = today - timedelta(days=today.weekday())
    return cached_result['updated'] != None and cached_result['updated'] >= last_monday

@app.route('/last_weekend_results', methods=['GET'])
async def last_weekend_results():
    global cached_last_weekend_results
    if should_deliver_cache(cached_last_weekend_results):
        return allow_cors(cached_last_weekend_results['content'])

    year = datetime.today().year
    teams = initialise_teams_input_data_from_configuration(year)

    populated_teams = await web_scraper.populate_teams(teams)
    response_content = render_template('substandard-results-content.html', teams=populated_teams)
    cached_last_weekend_results['content'] = response_content
    cached_last_weekend_results['updated'] = date.today()
    return allow_cors(response_content)


# Implement some smart caching here. Days since Saturday...
@app.route('/this_weekend_fixtures', methods=['GET'])
async def this_weekend_fixtures():
    global cached_this_weekend_fixtures
    if should_deliver_cache(cached_this_weekend_fixtures):
        return allow_cors(cached_this_weekend_fixtures['content'])

    year = datetime.today().year
    teams = initialise_teams_input_data_from_configuration(year)

    for team in teams:
        team['is_past_game'] = False

    populated_teams = await web_scraper.populate_teams(teams)
    response_content = render_template('substandard-fixtures-content.html', teams=populated_teams)
    cached_this_weekend_fixtures['content'] = response_content
    cached_this_weekend_fixtures['updated'] = date.today()
    return allow_cors(response_content)


@app.route('/test')
def test():
    return render_template('test.html')


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
