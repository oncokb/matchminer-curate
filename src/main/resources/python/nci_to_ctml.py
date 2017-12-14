#!/usr/bin/env python2

"""
SYNOPSIS

    This script will accept a clinical trial's NCT ID, a comma-separated list
    of NCT IDs, or a file containing a comma-separated list of NCT IDs,
    query the NCI Clinical Trials API. If users type output path, a CTML file
    in YAML format containing all information returned by the NCI API.
    Otherwise, the trial json data will be stored in Firebase.

    NCI Clinical Trials API documentation is available here:
    https://clinicaltrialsapi.cancer.gov/

EXAMPLES
    - to get NCT trials and store them in Firebase:
        ./nci_to_ctml.py \
            -i NCT02194738

    - to remove fields returned by NCI's CT API but that you want excluded from Firebase collection:
        ./nci_to_ctml.py \
            -i NCT02194738 \
            --remove-fields sites,arms

    - to creat a CTML file:
        ./nci_to_ctml.py \
        -i NCT02194738 \
        -o ${output_directory}

    - to remove fields returned by NCI's CT API but that you want excluded from the CTML file:
        ./nci_to_ctml.py \
            -i NCT02194738 \
            -o ${output_directory} \
            --remove-fields sites,arms

AUTHOR
    Zachary Zwiesler <zwiesler@jimmy.harvard.edu> (Nov 2017)
"""

import os
import sys
import yaml
import json
import time
import requests
import argparse
import datetime as dt
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import db

address = 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trials'

def main(opts):

    nctids = []
    if os.path.isfile(opts.inpath):
        with open(opts.inpath, 'r') as f:
            for line in f.readlines():
                nctids.extend([i for i in line.strip().split(',') if i])
    else:
        nctids.extend(opts.inpath.split(','))

    # error handling
    if opts.outpath and not os.path.isdir(opts.outpath):
        print '## ERROR: Output directory %s not found.\n' \
              '##        Please specify the output directory you would prefer\n' \
              '##        or leave unset to write to your current working directory.\n' % opts.outpath
        sys.exit(0)

    if all(not i.upper().startswith('NCT') for i in nctids):
        print '## ERROR: There are no valid NCT IDs in your list. All IDs should start\n' \
              '##        with the characters "NCT". Aborting script.'
        sys.exit(0)

    # Use a service account. Replace private key json file for matchminer-curate firebase
    cred = credentials.Certificate("src/main/resources/certificates/matchminercurate-key.json")
    # Initialize the app with a service account, granting admin privileges for Realtime Database
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://matchminercurate-63c82.firebaseio.com'
    })
    # As an admin, the app has access to read and write all data, regradless of Security Rules
    ref = db.reference('trials')

    json_data = {}
    for nctid in nctids:

        if not nctid.upper().startswith('NCT'):
            print '\n## WARNING: "%s" is not a valid NCT ID. All IDs should start' % nctid
            print '##          with the characters "NCT". This trial will be skipped.\n'
            continue

        # API request
        params = '?nct_id=%s' % nctid
        url = address + params

        try:
            r = requests.get(url)
        except:
            time.sleep(1)
            r = requests.get(url)

        if r.status_code != 200 or 'trials' not in r.json():
            print '\n## WARNING: API request %s was unsuccessful. \n' \
                  '## %s\n' % (url, r.content)
            continue

        data = r.json()['trials']
        if len(data) == 0:
            print '\n## WARNING: Trial not found: %s\n' % nctid
            continue

        # Write CTML
        data = data[0]
        if opts.remove_fields:
            for field in opts.remove_fields.split(','):
                if field in data:
                    del data[field]

        if opts.outpath and os.path.isdir(opts.outpath):
            filename = '%s/%s.yml' % (opts.outpath, nctid.upper())
            with open(filename, 'w') as ff:
                yaml.safe_dump(data, ff, default_flow_style=False)

            print '## INFO: Successfully wrote CTML file for %s' % nctid.upper()
        elif not opts.outpath:
            trials_ref = ref.child(nctid.upper())
            trials_ref.set(data)
            json_data[nctid.upper()] = json.dumps(data)
            print(json_data[nctid.upper()])

    return json_data


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', dest='inpath', required=True,
                        help='Specify an NCT ID, a comma-separated list of NCT IDs, or the '
                             'path to a file containing a comma-separated list of NCT IDs.')
    parser.add_argument('-o', dest='outpath', required=False,
                        help='Specify the output path of your CTML files. Defaults to your '
                             'current working directory.')
    parser.add_argument('--remove-fields', dest='remove_fields', required=False,
                        help='Optionally specify a comma-separated list of NCI CT fields'
                             'you would like to exclude from the final CTML.')
    parser.set_defaults(func=main)

    args = parser.parse_args()
    args.func(args)

