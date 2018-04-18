import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Trial } from '../trial/trial.model';
import { Genomic } from '../genomic/genomic.model';
import { Clinical } from '../clinical/clinical.model';
import { MovingPath } from '../panel/movingPath.model';
import { Arm } from '../arm/arm.model';
import { Http, Response } from '@angular/http';
import * as _ from 'underscore';
import { currentId } from 'async_hooks';
import { SERVER_API_URL } from '../app.constants';
import { environment } from '../environments/environment';
import {ConnectionService} from "./connection.service";

@Injectable()
export class TrialService {
    oncokb = environment.oncokb ? environment.oncokb : false;

    private nctIdChosenSource = new BehaviorSubject<string>('');
    nctIdChosenObs = this.nctIdChosenSource.asObservable();

    trial = this.createTrial();
    private trialChosenSource = new BehaviorSubject<Trial>(this.trial);
    trialChosenObs = this.trialChosenSource.asObservable();

    private trialListSource = new BehaviorSubject<Array<Trial>>([]);
    trialListObs = this.trialListSource.asObservable();

    private authorizedSource = new BehaviorSubject<boolean>(false);
    authorizedObs = this.authorizedSource.asObservable();

    private operationPoolSource = new BehaviorSubject<object>({});
    operationPoolObs = this.operationPoolSource.asObservable();

    private currentPathSource = new BehaviorSubject<string>('');
    currentPathObs = this.currentPathSource.asObservable();

    movingPath: MovingPath = {
        from: '',
        to: ''
    }
    private movingPathSource = new BehaviorSubject<MovingPath>(this.movingPath);
    movingPathObs = this.movingPathSource.asObservable();

    genomicInput = this.createGenomic();
    private genomicInputSource = new BehaviorSubject<Genomic>(this.genomicInput);
    genomicInputObs = this.genomicInputSource.asObservable();

    clinicalInput = this.createClinical();
    private clinicalInputSource = new BehaviorSubject<Clinical>(this.clinicalInput);
    clinicalInputObs = this.clinicalInputSource.asObservable();

    armInput: Arm = {
        arm_name: '',
        arm_description: '',
        match: []
    };
    private armInputSource = new BehaviorSubject<Arm>(this.armInput);
    armInputObs = this.armInputSource.asObservable();

    subTypesOptions = {};
    allSubTypesOptions = [];
    subToMainMapping = {};
    mainTypesOptions = [{value: 'All Solid Tumors', label: 'All Solid Tumors'},
        {value: 'All Liquid Tumors', label: 'All Liquid Tumors'},
        {value: 'All Tumors', label: 'All Tumors'},
        {value: 'All Pediatric Tumors', label: 'All Pediatric Tumors'}];
    annotated_variants = {};
    trialList: Array<Trial> = [];
    trialsRef: AngularFireObject<any>;
    nctIdChosen = '';
    constructor(private connectionService: ConnectionService, public db: AngularFireDatabase) {
        this.nctIdChosenObs.subscribe(message => this.nctIdChosen = message);
        this.trialsRef = db.object('Trials');

        // prepare main types list
        this.connectionService.getMainType().subscribe((res) => {
                let mainTypeQueries = [];
                for (const item of res['data']) {
                    mainTypeQueries.push({
                        "exactMatch": true,
                        "query": item.name,
                        "type": "mainType"
                    });
                    this.mainTypesOptions.push({
                        value: item.name,
                        label: item.name
                    });
                }
                // prepare subtypes by maintype
                let queries =  {
                    "queries": mainTypeQueries
                };
            this.connectionService.getSubType(queries).subscribe((res) => {
                        let tempSubTypes = res['data'];
                        let currentSubtype = '';
                        let currentMaintype = '';
                        for (const items of tempSubTypes) {
                            for (const item of items) {
                                currentMaintype = item.mainType.name;
                                currentSubtype = item.name;
                                this.allSubTypesOptions.push({
                                    value: currentSubtype,
                                    label: currentSubtype
                                });
                                this.subToMainMapping[currentSubtype] = currentMaintype;
                                if (this.subTypesOptions[currentMaintype] == undefined) {
                                    this.subTypesOptions[currentMaintype] = [{
                                        value: currentSubtype,
                                        label: currentSubtype
                                    }];
                                } else {
                                    this.subTypesOptions[currentMaintype].push({
                                        value: currentSubtype,
                                        label: currentSubtype
                                    });
                                }
                            }
                            this.subTypesOptions[currentMaintype].sort(function(a, b) {
                                return a.value > b.value;
                            });
                            this.subTypesOptions[''] = this.allSubTypesOptions;
                        }
                    });
            });
        // prepare oncokb variant list
        this.connectionService.getOncoKBVariant().subscribe((res) => {
                const allAnnotatedVariants = res;
                for(const item of  allAnnotatedVariants) {
                    if (item['gene']['hugoSymbol']) {
                        if (this.annotated_variants[item['gene']['hugoSymbol']]) {
                            this.annotated_variants[item['gene']['hugoSymbol']].push(item['alteration']);
                        } else {
                            this.annotated_variants[item['gene']['hugoSymbol']] = [item['alteration']];
                        }
                    }
                }
                for(const key of _.keys(this.annotated_variants)) {
                    this.annotated_variants[key].sort();
                }
            });
    }
    createGenomic() {
        let genomicInput: Genomic;
        if (this.oncokb === true) {
            genomicInput = {
                hugo_symbol: '',
                annotated_variant: '',
                matching_examples: '',
                no_hugo_symbol: false,
                no_annotated_variant: false
            };
        } else {
            genomicInput = {
                hugo_symbol: '',
                annotated_variant: '',
                matching_examples: '',
                protein_change: '',
                wildcard_protein_change: '',
                variant_classification: '',
                variant_category: '',
                exon: '',
                cnv_call: '',
                wildtype: '',
                no_hugo_symbol: false,
                no_annotated_variant: false,
                no_matching_examples: false,
                no_protein_change: false,
                no_wildcard_protein_change: false,
                no_variant_classification: false,
                no_variant_category: false,
                no_exon: false,
                no_cnv_call: false
            }
        }
        return genomicInput;
    }
    createClinical() {
        let clinicalInput: Clinical= {
            age_numerical: '',
            oncotree_primary_diagnosis: '',
            main_type: '',
            sub_type: '',
            no_age_numerical: false,
            no_oncotree_primary_diagnosis: false
        };
        return clinicalInput;
    }
    createTrial() {
        let trial: Trial= {
            curation_status: '',
            archived: '',
            nct_id: '',
            long_title: '',
            short_title: '',
            phase: '',
            status: '',
            treatment_list: { step: [] }
        }
        return trial;
    }
    fetchTrials() {
        this.trialsRef.snapshotChanges().subscribe(action => {
            this.authorizedSource.next(true);
            this.trialList = [];
            for (const nctId of _.keys(action.payload.val())) {
                this.trialList.push(action.payload.val()[nctId]);
            }
            this.trialListSource.next(this.trialList);
            this.setTrialChosen(this.nctIdChosen);
        }, error => {
            this.authorizedSource.next(false);
        });
    }
    setTrialChosen(nctId: string) {
        this.nctIdChosenSource.next(nctId);
        for (const trial of this.trialList) {
            if (nctId === trial.nct_id) {
                if (_.isUndefined(trial['treatment_list'])) {
                    trial['treatment_list'] = {
                        step: [{
                            arm:  [],
                            match: []
                        }]
                    }
                } else {
                    if (_.isUndefined(trial['treatment_list'].step[0].arm)) {
                        trial['treatment_list'].step[0].arm = [];
                    } else {
                        _.each(trial['treatment_list'].step[0].arm, function(armItem) {
                            if (_.isUndefined(armItem.match)) {
                                armItem.match = [];
                            }
                        });
                    }
                    if (_.isUndefined(trial['treatment_list'].step[0].match)) {
                        trial['treatment_list'].step[0].match = [];
                    }
                }
                this.trialChosenSource.next(trial);
                break;
            }
        }
    }
    setGenomicInput(genomicInput: Genomic) {
        this.genomicInputSource.next(genomicInput);
    }
    setClinicalInput(clinicalInput: Clinical) {
        this.clinicalInputSource.next(clinicalInput);
    }
    setArmInput(armInput: Arm) {
        this.armInputSource.next(armInput);
    }
    getStyle(indent: number) {
        return { 'margin-left': (indent * 40) + 'px' };
    }
    getSubTypesOptions() {
        return this.subTypesOptions;
    }
    getSubToMainMapping() {
        return this.subToMainMapping;
    }
    getMainTypesOptions() {
        return this.mainTypesOptions;
    }
    getAllSubTypesOptions() {
        return this.allSubTypesOptions;
    }
    getOncokbVariants() {
        return this.annotated_variants;
    }
    getTrialRef(nctId: string) {
        return this.db.object('Trials/' + nctId + '/treatment_list/step/0');
    }
}
