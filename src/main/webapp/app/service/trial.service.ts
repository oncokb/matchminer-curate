import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Trial } from '../trial/trial.model';
import { Http, Response } from '@angular/http';
import * as _ from 'underscore';
import { currentId } from 'async_hooks';
import { SERVER_API_URL } from '../app.constants';
import { environment } from '../environments/environment';
@Injectable()
export class TrialService {
    production = environment.production ? environment.production : false;
    trialsCollection: AngularFirestoreCollection<Trial>;
    trialList = [];
    nctIdList: Array<string> = [];
    trialChosen: Observable<Trial[]>;
    nctIdChosen = '';
    pathPool: Array<string> = [];
    operationPool: Array<string> = [];
    loginStatus = [false];
    validGenomic = [false];
    currentPath = '';
    movingPath = {
        from: '',
        to: ''
    };
    genomicInput = {
        hugo_symbol: '',
        oncokb_variant: '',
        matching_examples: '',
        protein_change: '',
        wildcard_protein_change: '',
        variant_classification: '',
        variant_category: '',
        exon: '',
        cnv_call: '',
        wildtype: '',
        no_hugo_symbol: false,
        no_oncokb_variant: false,
        no_matching_examples: false,
        no_protein_change: false,
        no_wildcard_protein_change: false,
        no_variant_classification: false,
        no_variant_category: false,
        no_exon: false,
        no_cnv_call: false
    };
    clinicalInput = {
        age_numerical: '',
        oncotree_diagnosis: '',
        main_type: '',
        sub_type: '',
        no_age_numerical: false,
        no_oncotree_diagnosis: false
    };
    mainTypes = ['All Solid', 'All Liquid', 'All Tumors'];
    subTypes = {};
    oncokb_variants = {};
    constructor(public afs: AngularFirestore, public http: Http) {
        this.trialsCollection = afs.collection<Trial>('Trials');
        this.trialsCollection.snapshotChanges().map(changes => {
            return changes.map(a => {
                const data = a.payload.doc.data() as Trial;
                return data;
            });
        }).subscribe(trials => {
            for (const trial of trials) {
                if (this.nctIdList.indexOf(trial.nct_id) === -1) {
                    this.nctIdList.push(trial.nct_id);
                }
            }
            this.trialList = trials;
        });
        // prepare main types list
        this.http.get(this.getAPIUrl('MainType'))
        .subscribe((res: Response) => {
            let mainTypeQueries = [];
            for (const item of res.json().data) {
                this.mainTypes.push(item.name);
                mainTypeQueries.push({
                    "exactMatch": true,
                    "query": item.name,
                    "type": "mainType"
                });
            }
            this.mainTypes.sort();
            // prepare subtypes by maintype
            let queries =  {
                "queries": mainTypeQueries
              };
            this.http.post(this.getAPIUrl('SubType'), queries)
            .subscribe((res: Response) => {
                let tempSubTypes = res.json().data;
                let currentSubtype = '';
                let currentMaintype = '';
                for (const items of tempSubTypes) {
                    for (const item of items) {
                        currentMaintype = item.mainType.name;
                        currentSubtype = item.name;
                        if (this.subTypes[currentMaintype] == undefined) {
                            this.subTypes[currentMaintype] = [currentSubtype];
                        } else {
                            this.subTypes[currentMaintype].push(currentSubtype);
                        }
                    }
                    this.subTypes[currentMaintype].sort();
                }
            });
        });
        // prepare oncokb variant list
        this.http.get(this.getAPIUrl('OncoKBVariant'))
        .subscribe((res: Response) => {
           const allAnnotatedVariants = res.json();
           for(const item of  allAnnotatedVariants) {
                if (item['gene']['hugoSymbol']) {
                    if (this.oncokb_variants[item['gene']['hugoSymbol']]) {
                        this.oncokb_variants[item['gene']['hugoSymbol']].push(item['alteration']);
                    } else {
                        this.oncokb_variants[item['gene']['hugoSymbol']] = [item['alteration']];
                    }
                }
           }
           for(const key of _.keys(this.oncokb_variants)) {
                this.oncokb_variants[key].sort();
           }
        });
    }

    getNctIdList() {
        return this.nctIdList;
    }
    getTrialList() {
        return this.trialList;
    }
    getTrialsCollection() {
        return this.trialsCollection;
    }
    getChosenTrialDoc(nctId: string) {
        return this.afs.collection<Trial>('Trials', ref => ref.where('nct_id', '==', nctId)).valueChanges();
    }
    getChosenTrialJSON(nctId: string) {
        for (const currentTrial of this.trialList) {
            if (currentTrial.nct_id === nctId) {
                return currentTrial;
            }
        }
    }
    setNctIdChosen(nctId: string) {
        this.nctIdChosen = nctId;
    }
    getNctIdChosen() {
        return this.nctIdChosen;
    }
    getPathpool() {
        return this.pathPool;
    }
    getOperationPool() {
        return this.operationPool;
    }
    getCurrentPath() {
        return this.currentPath;
    }
    setCurrentPath(currentPath: string) {
        this.currentPath = currentPath;
    }
    getMovingPath() {
        return this.movingPath;
    }
    setMovingPath(key: string, value: string) {
        this.movingPath[key] = value;
    }
    getClinicalInput() {
        return this.clinicalInput;
    }
    setClinicalInput(key: string, value: any) {
        this.clinicalInput[key] = value;
    }
    getGenomicInput() {
        return this.genomicInput;
    }
    setGenomicInput(key: string, value: any) {
        this.genomicInput[key] = value;
    }
    getStyle(indent: number) {
        return { 'margin-left': (indent * 40) + 'px' };
    }
    getMainTypes() {
        return this.mainTypes;
    }
    getSubTypes() {
        return this.subTypes;
    }
    getOncokbVariants() {
        return this.oncokb_variants;
    }
    getLoginStatus() {
        return this.loginStatus;
    }
    getValidGenomic() {
        return this.validGenomic;
    }
    getAPIUrl(type: string) {
        if (this.production === true) {
            switch(type) {
                case 'MainType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/oncotree/api/mainTypes';
                case 'SubType': 
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/oncotree/api/tumorTypes/search';  
                case 'OncoKBVariant':
                    return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/variants';
                case 'GeneValidation':
                    return SERVER_API_URL + 'proxy/http/mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return SERVER_API_URL + 'proxy/https/clinicaltrialsapi.cancer.gov/v1/clinical-trial/';

            }
        } else {
            switch(type) {
                case 'MainType':
                    return 'http://oncotree.mskcc.org/oncotree/api/mainTypes';
                case 'SubType': 
                    return 'http://oncotree.mskcc.org/oncotree/api/tumorTypes/search';  
                case 'OncoKBVariant':
                    return 'http://oncokb.org/api/v1/variants';
                case 'GeneValidation':
                    return 'http://mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
            }
        }
    }
}
