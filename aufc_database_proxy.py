import json
import util
from datetime import datetime
import mysql.connector
from database_credentials import DatabaseCredentials
import logging

logging.basicConfig(level=logging.INFO)


class AufcDatabaseProxy(object):
    def __init__(self):
        self.opposition_nicknames = None
        self.opposition_nicknames_overrides = None

        self.ground_nicknames = None
        self.ground_nicknames_overrides = None

        self.player_names_and_nicknames = None

        self.image_url_overrides = None

        self.connection = None
        self.last_update_time = datetime.now()

    
    def connect_to_aufc_database(self):
        self.connection = mysql.connector.connect(
            host=DatabaseCredentials.host,
            user=DatabaseCredentials.user,
            password=DatabaseCredentials.password,
            database=DatabaseCredentials.database)


    def update_cache(self):
        if not self.update_is_required(): 
            return
        
        logging.info('Updating database cache.')
        
        self.last_update_time = datetime.today()

        self.update_player_names_and_nicknames()
        self.update_ground_nicknames()
        self.update_opposition_nicknames()


    def update_is_required(self):
        if self.last_update_time.date() < datetime.today().date(): return True
        if self.player_names_and_nicknames is None: return True
        return False


    def update_overrides(self):
        self.update_opposition_nicknames_overrides()
        self.update_ground_nicknames_overrides()
        self.update_image_url_overrides()

    def update_ground_nicknames_overrides(self):
        self.ground_nicknames_overrides = json.loads(util.read_file_to_string('database/override_ground_nicknames.json'))
    
    def update_image_url_overrides(self):
        self.image_url_overrides = json.loads(util.read_file_to_string('database/override_image_urls.json'))

    def update_opposition_nicknames_overrides(self):
        self.opposition_nicknames_overrides = json.loads(util.read_file_to_string('database/override_nicknames.json'))


    def update_player_names_and_nicknames(self):
        self.connect_to_aufc_database()
        cursor = self.connection.cursor()

        cursor.execute('SELECT FirstName, Surname, Nickname, MemberID FROM members WHERE FirstName != ""')
        players_and_nicknames = cursor.fetchall()
        logging.info('Fetched {} players from AUFC database'.format(len(players_and_nicknames)))

        self.player_names_and_nicknames = {}
        for player_and_nickname in players_and_nicknames:
            firstname = player_and_nickname[0]
            firstname_initial = firstname[0]
            surname = player_and_nickname[1]
            nickname = player_and_nickname[2]
            member_id = player_and_nickname[3]

            key = firstname_initial + '. ' + surname
            entry = { 'fullname': firstname + ' ' + surname, 'nickname': nickname, 'memberID': member_id}

            # Skip this entry if we find a duplicate key (first name initial and last name).
            # Use memberID to keep only the most recently created member by default.
            if self.player_names_and_nicknames.has_key(key) and self.player_names_and_nicknames[key]['memberID'] > member_id:
                logging.info('Duplicate player key found: ' + key)
                continue

            self.player_names_and_nicknames[key] = entry
        
        self.connection.close()


    def update_ground_nicknames(self):
        self.update_ground_nicknames_overrides()

        self.connect_to_aufc_database()
        cursor = self.connection.cursor()

        cursor.execute('SELECT Ground, Nickname FROM grounds')
        grounds_and_nicknames = cursor.fetchall()

        self.ground_nicknames = {}
        for ground_and_nickname in grounds_and_nicknames:
            ground = ground_and_nickname[0]
            nickname = ground_and_nickname[1]

            self.ground_nicknames[ground] = nickname

            # Override if necessary.
            if self.ground_nicknames_overrides.has_key(ground):
                self.ground_nicknames[ground] = self.ground_nicknames_overrides[ground]
        
        self.connection.close()
    
    def update_opposition_nicknames(self):
        self.update_opposition_nicknames_overrides()

        self.connect_to_aufc_database()
        cursor = self.connection.cursor()

        cursor.execute("SELECT OppositionName, Nickname FROM oppositionclubs")
        opposition_names_and_nicknames = cursor.fetchall()

        self.opposition_nicknames = {}
        for opposition_names_and_nickname in opposition_names_and_nicknames:

            opposition_name = opposition_names_and_nickname[0]
            opposition_nickname = opposition_names_and_nickname[1]

            self.opposition_nicknames[opposition_name] = opposition_nickname

            # Override if necessary.
            if self.opposition_nicknames_overrides.has_key(opposition_name):
                self.opposition_nicknames[opposition_name] = self.opposition_nicknames_overrides[opposition_name]
        
        self.connection.close()

    def get_player_nickname(self, player_name):
        self.update_cache()
        if self.player_names_and_nicknames.has_key(player_name):
            return self.player_names_and_nicknames[player_name]
        
        logging.warning('No match for player: {} in database.'.format(player_name))
        return {} 

    def get_opposition_nickname(self, opposition_name):
        self.update_cache()
        if self.opposition_nicknames.has_key(opposition_name):
            return self.opposition_nicknames[opposition_name]

        logging.warning('No match for opposition name: {} in database.'.format(opposition_name))
        return ''

    def get_ground_nickname(self, ground_name):
        self.update_cache()
        if self.ground_nicknames.has_key(ground_name):
            return self.ground_nicknames[ground_name]

        logging.warning('No match for ground name: {} in database.'.format(ground_name))
        return '' 

