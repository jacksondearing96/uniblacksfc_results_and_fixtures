
class Game(object):
    # Object to hold all the info about a game (past or present).
    # This should maintain variable names that are compatible with the JSON objects
    # that are expected when this class is converted into a dict and sent to the 
    # front end application. See index.js for the appropriate naming conventions.
    def __init__(self, round, year, url, is_past_game=True, include_player_nicknames=False, skip_this_game=False, is_final=False):
        self.round = round
        self.year = year
        self.url = url
        self.is_past_game = is_past_game
        self.include_player_nicknames = include_player_nicknames 
        self.skip_this_game = skip_this_game 
        self.is_final = is_final

        self.match_name = None
        self.date = None
        self.time = None
        self.opposition = None
        self.opposition_nickname = None
        self.image_url = None
        self.location = None
        self.location_nickname = None
        self.location_url = None
        self.is_home_game = None

        self.result = None
        self.score_for = None
        self.score_against = None
        self.goal_kickers = []
        self.best_players = []

        self.error = ''