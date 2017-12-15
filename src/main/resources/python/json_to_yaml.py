#!/usr/bin/env python2

"""
SYNOPSIS

    This script will accept a trial json object and convert it to yaml format. 
    If users type output path, a CTML file in YAML format containing 
    all information returned by the API. 

EXAMPLES
    - to convert NCT trial from JSON to YAML format:
        ./json_to_yaml.py \
            -i {jsonObject} \

    - to creat a YAML file:
        ./nci_to_ctml.py \
        -i {jsonObject} \
        -o ${output_directory}

AUTHOR
    Jing Su <suj1@mskcc.org> (Dec 2017)
"""

import os
import sys
import yaml
import json
import argparse

def isjson(myjson):
    try:
        json_object = json.loads(myjson)
    except ValueError, e:
        print '## ERROR: Not valid json data: %s .\n' % myjson
        return False
    return json_object

def main(opts):

    # error handling
    if opts.outpath and not os.path.isdir(opts.outpath):
        print '## ERROR: Output directory %s not found.\n' \
              '##        Please specify the output directory you would prefer\n' \
              '##        or leave unset to write to your current working directory.\n' % opts.outpath
        sys.exit(0)

    
    data = isjson(opts.input)
    yaml_data = yaml.safe_dump(data)
    print yaml_data

    # Write CTML yaml file
    if opts.outpath and os.path.isdir(opts.outpath):
        filename = '%s/%s.yml' % (opts.outpath, nctid.upper())
        with open(filename, 'w') as ff:
            yaml.safe_dump(data, ff, default_flow_style=False)

        print '## INFO: Successfully wrote CTML file for %s' % nctid.upper()

    return yaml_data
    

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', dest='input', required=True,
                        help='Input a json object of trial.')
    parser.add_argument('-o', dest='outpath', required=False,
                        help='Specify the output path of your CTML files.')
    parser.set_defaults(func=main)

    args = parser.parse_args()
    args.func(args)

