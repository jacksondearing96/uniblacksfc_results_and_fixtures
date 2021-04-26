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
        output = json.dumps(game.__dict__)
        print(output)
        return output
    except Exception as e:
        logging.error(e)
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


# @app.route('/update-row-of-table-data', methods=['POST'])
# def update_row_of_table_data():
#     global teams_input_data

#     row = request.get_json()

#     print('BEFORE:')
#     print('TEAMS LENGTH: ' + str(len(teams_input_data)))
#     print('ROW INDEX: ' + str(row['row_index']))

#     try:
#         teams_input_data[row['row_index']]['skip_this_game'] = row['skip_this_game']
#         teams_input_data[row['row_index']]['is_final'] = row['is_final']
#         teams_input_data[row['row_index']]['round'] = row['round']
#     except Exception as e:
#         logging.error(e)
#         logging.error('Tried to update teams input data from frontend table but failed, fields were not correct')
#         logging.error('Data row sent was: ' + str(row))
    
#     print('AFTER:')
#     print('TEAMS LENGTH: ' + str(len(teams_input_data)))
#     # teams_input_data[row['row_index']] = team
#     print(teams_input_data[row['row_index']])

#     return 'SUCCESS'

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
