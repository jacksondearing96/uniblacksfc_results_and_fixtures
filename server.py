from flask import Flask, render_template, request
import web_scraper

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


@app.route('/<path:path>', methods=['GET', 'POST'])
def send_file(path):
    if request.method == 'POST':
        teams = request.get_json(force=True)
        print(render_template(path, teams=teams))
        return render_template(path, teams=teams)

    else:
        return render_template(path)


if __name__ == '__main__':
    app.run(debug=True)
