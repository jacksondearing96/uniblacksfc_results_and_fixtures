import json
import util
from datetime import datetime
import mysql.connector
from database_credentials import DatabaseCredentials
import logging

logging.basicConfig(level=logging.INFO)


class AufcDatabaseProxy(object):
    last_update_time = datetime.now()

    opposition_nicknames = None

    ground_nicknames = None
    ground_nicknames_overrides = None

    player_names_and_nicknames = None

    image_url_overrides = None

    @classmethod 
    def connect_to_aufc_database(cls):
        return mysql.connector.connect(
            host=DatabaseCredentials.host,
            user=DatabaseCredentials.user,
            password=DatabaseCredentials.password,
            database=DatabaseCredentials.database)


    @classmethod 
    def update_cache(cls):
        try:
            if not AufcDatabaseProxy.update_is_required(): 
                return
            
            logging.info('Updating database cache.')
            
            AufcDatabaseProxy.last_update_time = datetime.today()

            AufcDatabaseProxy.update_player_names_and_nicknames()
            AufcDatabaseProxy.update_ground_nicknames()
            AufcDatabaseProxy.update_opposition_nicknames()

            AufcDatabaseProxy.update_image_url_overrides()
        except Exception as e:
            logging.error(e)


    @classmethod 
    def update_is_required(cls):
        if AufcDatabaseProxy.last_update_time.date() < datetime.today().date(): return True
        if AufcDatabaseProxy.player_names_and_nicknames is None: return True
        return False


    @classmethod 
    def update_overrides(cls):
        AufcDatabaseProxy.update_ground_nicknames_overrides()
        AufcDatabaseProxy.update_image_url_overrides()


    @classmethod 
    def update_ground_nicknames_overrides(cls):
        AufcDatabaseProxy.ground_nicknames_overrides = json.loads(util.read_file_to_string('database/override_ground_nicknames.json'))
    

    @classmethod 
    def update_image_url_overrides(cls):
        AufcDatabaseProxy.image_url_overrides = json.loads(util.read_file_to_string('database/override_image_urls.json'))


    @classmethod 
    def update_player_names_and_nicknames(cls):
        connection = AufcDatabaseProxy.connect_to_aufc_database()
        cursor = connection.cursor()

        cursor.execute('SELECT FirstName, Surname, Nickname, MemberID FROM members WHERE FirstName != ""')
        players_and_nicknames = cursor.fetchall()
        logging.info('Fetched {} players from AUFC database'.format(len(players_and_nicknames)))

        AufcDatabaseProxy.player_names_and_nicknames = {}
        for player_and_nickname in players_and_nicknames:
            firstname = player_and_nickname[0]
            firstname_initial = firstname[0]
            surname = player_and_nickname[1]
            nickname = player_and_nickname[2]
            member_id = player_and_nickname[3]

            key = firstname_initial + '. ' + surname
            entry = { 'name': key, 'fullname': firstname + ' ' + surname, 'nickname': nickname, 'memberID': member_id}

            # Skip this entry if we find a duplicate key (first name initial and last name).
            # Use memberID to keep only the most recently created member by default.
            if key in AufcDatabaseProxy.player_names_and_nicknames and AufcDatabaseProxy.player_names_and_nicknames[key]['memberID'] > member_id:
                logging.info('Duplicate player key found: ' + key)
                continue

            AufcDatabaseProxy.player_names_and_nicknames[key] = entry
        
        connection.close()


    @classmethod 
    def update_ground_nicknames(cls):
        AufcDatabaseProxy.update_ground_nicknames_overrides()

        connection = AufcDatabaseProxy.connect_to_aufc_database()
        cursor = connection.cursor()

        cursor.execute('SELECT Ground, Nickname FROM grounds')
        grounds_and_nicknames = cursor.fetchall()

        AufcDatabaseProxy.ground_nicknames = {}
        for ground_and_nickname in grounds_and_nicknames:
            ground = ground_and_nickname[0]
            nickname = ground_and_nickname[1]

            AufcDatabaseProxy.ground_nicknames[ground] = nickname

            # Override if necessary.
            for ground_name in AufcDatabaseProxy.ground_nicknames_overrides.keys():
                AufcDatabaseProxy.ground_nicknames[ground_name] = AufcDatabaseProxy.ground_nicknames_overrides[ground_name]
        
        connection.close()
    

    @classmethod 
    def update_opposition_nicknames(cls):
        connection = AufcDatabaseProxy.connect_to_aufc_database()
        cursor = connection.cursor()

        cursor.execute("SELECT OppositionName, Nickname FROM oppositionclubs")
        opposition_names_and_nicknames = cursor.fetchall()

        AufcDatabaseProxy.opposition_nicknames = {}
        for opposition_names_and_nickname in opposition_names_and_nicknames:

            opposition_name = opposition_names_and_nickname[0]
            opposition_nickname = opposition_names_and_nickname[1]

            AufcDatabaseProxy.opposition_nicknames[opposition_name] = opposition_nickname
        
        connection.close()


    @classmethod 
    def get_player_nickname(cls, player_name):
        empty_player = { 'name': '', 'nickname': '', 'fullname': '', 'memberID': 0 } 
        try:
            empty_player['name'] = player_name
        except:
            pass

        try:
            if player_name in AufcDatabaseProxy.player_names_and_nicknames:
                return AufcDatabaseProxy.player_names_and_nicknames[player_name]
            
            logging.warning('No match for player: {} in database.'.format(player_name))
        except:
            pass
        
        return empty_player


    @classmethod 
    def get_opposition_nickname(cls, opposition_name, original_name=None):
        try:
            opposition_name = opposition_name.strip()

            if original_name is None:
                original_name = opposition_name

            inconclusives = [
                '',
                'Saint',
                'North',
                'South',
                'East',
                'West',
                'The',
                'Port',
                'Adelaide',
                'Mount',
                'Old'
            ]

            # Inconclusive.
            if (opposition_name == '' or opposition_name in inconclusives):
                logging.warning('No match for opposition name: {} in database.'.format(original_name))
                return ''

            # Exact match.
            if opposition_name in AufcDatabaseProxy.opposition_nicknames:
                return AufcDatabaseProxy.opposition_nicknames[opposition_name]

            # Contains.
            for actual_opposition_name in AufcDatabaseProxy.opposition_nicknames.keys():
                if opposition_name in actual_opposition_name:
                    return AufcDatabaseProxy.opposition_nicknames[actual_opposition_name]

            # Remove the apostrophe if it is present.
            if "'" in opposition_name:
                return AufcDatabaseProxy.get_opposition_nickname(opposition_name.replace("'", ''), original_name)

            if 'OC' in opposition_name:
                res = AufcDatabaseProxy.get_opposition_nickname(opposition_name.replace('OC', 'O.C.'), original_name)
                if res != '':
                    return res

            if 'St' in opposition_name:
                res = AufcDatabaseProxy.get_opposition_nickname(opposition_name.replace('St', 'Saint'), original_name)
                if res != '':
                    return res

            # Remove the last word and try again.
            if ' ' in opposition_name:
                return AufcDatabaseProxy.get_opposition_nickname(opposition_name.rsplit(' ', 1)[0], original_name)

            logging.warning('No match for opposition name: {} in database.'.format(original_name))
            return ''
        except Exception as e:
            logging.error(e)
            return ''


    @classmethod
    def get_ground_nickname(cls, ground_name, original_ground_name=None):
        try:
            ground_name = ground_name.strip()

            if original_ground_name is None:
                original_ground_name = ground_name

            inconclusives = [
                '',
                'Saint',
                'North',
                'St',
                'South',
                'East',
                'West',
                'The',
                'Port',
                'Adelaide',
                'Mount',
                'Old'
            ]

            # Inconclusive.
            if (ground_name == '' or ground_name in inconclusives):
                logging.warning('No match for ground name: {} in database.'.format(original_ground_name))
                return ''

            # Exact match.
            if ground_name in AufcDatabaseProxy.ground_nicknames:
                return AufcDatabaseProxy.ground_nicknames[ground_name]

            # Contains.
            for actual_ground_name in AufcDatabaseProxy.ground_nicknames.keys():
                if ground_name in actual_ground_name:
                    return AufcDatabaseProxy.ground_nicknames[actual_ground_name]

            # Remove the apostrophe if it is present.
            if "'" in ground_name:
                return AufcDatabaseProxy.get_ground_nickname(ground_name.replace("'", ''), original_ground_name)

            if 'OC' in ground_name:
                res = AufcDatabaseProxy.get_ground_nickname(ground_name.replace('OC', 'O.C.'), original_ground_name)
                if res != '':
                    return res

            if 'St' in ground_name:
                res = AufcDatabaseProxy.get_ground_nickname(ground_name.replace('St', 'Saint'), original_ground_name)
                if res != '':
                    return res

            # Remove the last word and try again.
            if ' ' in ground_name:
                return AufcDatabaseProxy.get_ground_nickname(ground_name.rsplit(' ', 1)[0], original_ground_name)

            logging.warning('No match for ground name: {} in database.'.format(original_ground_name))
            return ''
        except Exception as e:
            logging.error(e)
            return ''


    @classmethod
    def get_override_image_url(cls, opposition):
        try:
            if opposition in AufcDatabaseProxy.image_url_overrides.keys():
                return AufcDatabaseProxy.image_url_overrides[opposition]
            return ''
        except Exception as e:
            logging.error(e)
            return ''
