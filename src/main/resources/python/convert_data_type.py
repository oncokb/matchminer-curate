#!/usr/bin/env python2

"""
SYNOPSIS

    This script will accept a trial json/format string and convert it to yaml/json format.

EXAMPLES
    - to convert NCT trial between JSON/YAML format:
        ./json_to_yaml.py \
            -i {jsonObject} \
            -t {json/yaml}

AUTHOR
    Jing Su <suj1@mskcc.org> (Dec 2017)
"""

import os
import sys
import yaml
import json
import argparse

def isjson(data):
    try:
        json_object = json.loads(data)
    except ValueError, e:
        print '## ERROR: Not valid json data: %s .\n' % data
        return False
    return json_object

def isyaml(data):
    try:
        yaml_object = yaml.load(data)
    except ValueError, e:
        print '## ERROR: Not valid yaml data: %s .\n' % data
        return False
    return yaml_object

def main(opts):

    # error handling
    if opts.type and not (opts.type.upper() == 'YAML' or opts.type.upper() == 'JSON'):
        print '## ERROR: Not valid data type: %s .\n' \
              '##        Please specify the data type you would prefer: JSON or YAML\n' % opts.type
        sys.exit(0)

    if opts.type.upper() == 'YAML':
        json_data = isjson(opts.input)
        yaml_data = yaml.safe_dump(json_data)
        print yaml_data
    elif opts.type.upper() == 'JSON':
        yaml_data = isyaml(opts.input)
        json_data = json.dumps(yaml_data)
        print json_data


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', dest='input', required=True,
                        help='Input a json/yaml object of trial.')
    parser.add_argument('-t', dest='type', required=True,
                        help='Specify data type. It has to be either YAML or JSON.')
    parser.set_defaults(func=main)

    args = parser.parse_args()
    args.func(args)

