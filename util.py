import logging

def csv_string_to_map(csv_string):
    csv_list = csv_string.split(',')

    output_map = {}

    for item in csv_list:
        item = item.split('::')

        # Ensure that their is a pair of values.
        while len(item) < 2:
            item.append('')

        item[0] = item[0].replace('\n','')
        item[1] = item[1].replace('\n','')

        output_map[item[0]] = item[1]

    return output_map


def read_file_to_string(filename):
    try:
        with open(filename, 'r') as file:
            data = file.read()
        file.close()
        return data
    except:
        return ''