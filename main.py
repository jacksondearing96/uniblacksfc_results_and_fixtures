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
# Deploy application
# 
#
# Update requirements based on what pip has in the virtual env
# pip freeze > requirements.txt
#
# Install the requirements into the lib dir
# pip install -t lib -r requirements.txt 
#
# 
#

from flask import Flask, render_template, request
import web_scraper
import os

app = Flask(__name__, template_folder='templates')


def ReadFileToString(filename):
    with open(filename, 'r') as file:
        data = file.read()
    return data


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_css')
def get_css():
    return ReadFileToString('static/css/subAuto.css')


@app.route('/get_teams')
def get_teams():
    return ReadFileToString('configurations.json')


@app.route('/get_past_games', methods=['POST'])
def get_past_games():
    games = request.get_json(force=True)
    return web_scraper.GetPastGames(games)


@app.route('/get_future_games', methods=['POST'])
def get_future_games():
    games = request.get_json(force=True)
    return web_scraper.GetFutureGames(games)


@app.route('/update_player_names_from_database')
def update_player_names_from_database():
    if web_scraper.UpdatePlayerNamesFromDatabase():
        return 'SUCCESS'
    else:
        return 'FAIL'


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if path not in ['bowlies.html', 'future-game.html', 'past-game.html']:
        return 'ERROR'

    if request.method == 'POST':
        teams = request.get_json(force=True)
        return render_template(path, teams=teams)
    else:
        return render_template(path)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
