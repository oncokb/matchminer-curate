import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Additional, Trial } from '../trial/trial.model';
import { Genomic } from '../genomic/genomic.model';
import { Clinical } from '../clinical/clinical.model';
import { MovingPath } from '../panel/movingPath.model';
import { Arm } from '../arm/arm.model';
import * as _ from 'lodash';
import { environment } from '../environments/environment';
import { EmailService } from './email.service';
import { ConnectionService } from './connection.service';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { catchError, map } from 'rxjs/operators';
import { Meta } from '../meta/meta.model';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';

@Injectable()
export class TrialService {
    oncokb = environment['oncokb'] ? environment['oncokb'] : false;
    oncotreeVersion = environment.oncotreeVersion ? environment.oncotreeVersion : 'oncotree_latest_stable';
    isPermitted = environment.isPermitted ? environment.isPermitted : false;

    private nctIdChosenSource = new BehaviorSubject<string>('');
    nctIdChosenObs = this.nctIdChosenSource.asObservable();

    trial = this.createTrial();
    private trialChosenSource = new BehaviorSubject<Trial>(this.trial);
    trialChosenObs = this.trialChosenSource.asObservable();

    private trialListSource = new BehaviorSubject<Array<Trial>>([]);
    trialListObs = this.trialListSource.asObservable();

    additional = this.createAdditional();
    private additionalChosenSource = new BehaviorSubject<Additional>(this.additional);
    additionalChosenObs = this.additionalChosenSource.asObservable();

    private additionalSource = new BehaviorSubject<object>([]);
    additionalObs = this.additionalSource.asObservable();

    private authorizedSource = new BehaviorSubject<boolean>(false);
    authorizedObs = this.authorizedSource.asObservable();

    private operationPoolSource = new BehaviorSubject<object>({});
    operationPoolObs = this.operationPoolSource.asObservable();

    private currentPathSource = new BehaviorSubject<string>('');
    currentPathObs = this.currentPathSource.asObservable();

    movingPath: MovingPath = {
        from: '',
        to: ''
    };
    private movingPathSource = new BehaviorSubject<MovingPath>(this.movingPath);
    movingPathObs = this.movingPathSource.asObservable();

    genomicInput = this.createGenomic();
    private genomicInputSource = new BehaviorSubject<Genomic>(this.genomicInput);
    genomicInputObs = this.genomicInputSource.asObservable();

    clinicalInput = this.createClinical();
    private clinicalInputSource = new BehaviorSubject<Clinical>(this.clinicalInput);
    clinicalInputObs = this.clinicalInputSource.asObservable();

    hasErrorInputField = false;
    private hasErrorInputFieldSource = new BehaviorSubject<boolean>(this.hasErrorInputField);
    hasErrorInputFieldObs = this.hasErrorInputFieldSource.asObservable();

    armInput: Arm = {
        arm_code: '',
        arm_description: '',
        arm_internal_id: '',
        arm_suspended: '',
        arm_type: '',
        arm_eligibility: '',
        arm_info: '',
        drugs: [],
        match: []
    };
    private armInputSource = new BehaviorSubject<Arm>(this.armInput);
    armInputObs = this.armInputSource.asObservable();

    subTypesOptions = {};
    allSubTypesOptions = [];
    subToMainMapping = {};
    mainTypesOptions = ['All Solid Tumors', 'All Liquid Tumors', 'All Tumors', 'All Pediatric Tumors'];
    statusOptions = ['Active', 'Administratively Complete', 'Approved', 'Closed to Accrual', 'Closed to Accrual and Intervention',
    'Complete', 'Enrolling by Invitation', 'In Review', 'Open to Accrual', 'Temporarily Closed to Accrual', 'Temporarily Closed to Accrual and Intervention',
    'Withdrawn'];
    annotated_variants = {};
    trialList: Array<Trial> = [];
    trialsRef: AngularFireObject<any>;
    additionalObject = {};
    additionalRef: AngularFireObject<any>;
    metaRef: AngularFireObject<any>;
    nctIdChosen = '';
    errorList: Array<object> = [];

    constructor(public connectionService: ConnectionService, public db: AngularFireDatabase, private emailService: EmailService) {
        this.nctIdChosenObs.subscribe((message) => this.nctIdChosen = message);
        this.trialsRef = db.object('Trials');
        this.additionalRef = db.object('Additional');
        this.metaRef = db.object('Meta');

        // prepare main types list
        this.connectionService.getMainType().subscribe((res: Array<string>) => {
            this.mainTypesOptions = this.mainTypesOptions.concat(res);
            const mainTypeQueries = [];
            for (const item of res) {
                mainTypeQueries.push({
                    'query': item,
                    'version': this.oncotreeVersion,
                    'type': 'mainType'
                });
            }
            // prepare subtypes by maintype
            const queries =  {
                'queries': mainTypeQueries
            };
            this.connectionService.getSubType(queries).subscribe((response: Array<any>) => {
                let currentSubtype = '';
                let currentMaintype = '';
                for (const items of response) {
                    for (const item of items) {
                        currentMaintype = item.mainType;
                        currentSubtype = item.name;
                        this.allSubTypesOptions.push(currentSubtype);
                        this.subToMainMapping[currentSubtype] = currentMaintype;
                        if (_.isUndefined(this.subTypesOptions[currentMaintype])) {
                            this.subTypesOptions[currentMaintype] = [currentSubtype];
                        } else {
                            this.subTypesOptions[currentMaintype].push(currentSubtype);
                        }
                    }
                    this.subTypesOptions[currentMaintype].sort(function(a, b) {
                        return a > b;
                    });
                    this.subTypesOptions[''] = this.allSubTypesOptions;
                }
            }, (error: HttpErrorResponse) => {
                this.getErrorResponse(error, 'subtype');
            });
        }, (error: HttpErrorResponse) => {
            this.getErrorResponse(error, 'main type');
        });
        // prepare oncokb variant list
        this.connectionService.getOncoKBVariant().subscribe((res) => {
           const allAnnotatedVariants = res;
           for (const item of  allAnnotatedVariants) {
                if (item['gene']['hugoSymbol']) {
                    if (this.annotated_variants[item['gene']['hugoSymbol']]) {
                        this.annotated_variants[item['gene']['hugoSymbol']].push(item['alteration']);
                    } else {
                        this.annotated_variants[item['gene']['hugoSymbol']] = [item['alteration']];
                    }
                }
           }
           for (const key of _.keys(this.annotated_variants)) {
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
                germline: '',
                no_hugo_symbol: false,
                no_annotated_variant: false,
            };
        } else {
            genomicInput = {
                hugo_symbol: '',
                annotated_variant: '',
                matching_examples: '',
                germline: '',
                protein_change: '',
                wildcard_protein_change: '',
                variant_classification: '',
                variant_category: '',
                exon: '',
                cnv_call: '',
                wildtype: '',
                no_hugo_symbol: false,
                no_annotated_variant: false,
                no_protein_change: false,
                no_wildcard_protein_change: false,
                no_variant_classification: false,
                no_variant_category: false,
                no_exon: false,
                no_cnv_call: false
            };
        }
        return genomicInput;
    }
    createClinical() {
        const clinicalInput: Clinical = {
            age_numerical: '',
            oncotree_primary_diagnosis: '',
            main_type: '',
            sub_type: '',
            no_oncotree_primary_diagnosis: false
        };
        return clinicalInput;
    }
    createTrial() {
        const trial: Trial = {
            curation_status: '',
            archived: '',
            nct_id: '',
            protocol_no: '',
            long_title: '',
            short_title: '',
            phase: '',
            status: '',
            treatment_list: { step: [] }
        };
        return trial;
    }
    createAdditional() {
        const additional: Additional = {
            note: ''
        };
        return additional;
    }
    fetchTrials() {
        this.trialsRef.snapshotChanges().subscribe((action) => {
            this.authorizedSource.next(true);
            this.trialList = [];
            for (const nctId of _.keys(action.payload.val())) {
                this.trialList.push(action.payload.val()[nctId]);
            }
            this.trialListSource.next(this.trialList);
            this.setTrialChosen(this.nctIdChosen);
        }, (error) => {
            this.authorizedSource.next(false);
        });
    }
    fetchMetas() {
        const metaList: Array<Meta> = [];
        return new Promise((resolve, reject) => {
            this.metaRef.snapshotChanges().subscribe( ( action ) => {
                for (const id of _.keys(action.payload.val())) {
                    metaList.push(action.payload.val()[id]);
                }
                this.authorizedSource.next( true );
                resolve(metaList);
            }, ( error ) => {
                this.authorizedSource.next( false );
                reject(metaList);
            } );
        });
    }
    fetchAdditional() {
        this.additionalRef.snapshotChanges().subscribe((action) => {
            this.authorizedSource.next(true);
            for (const nctId of _.keys(action.payload.val())) {
                this.additionalObject[nctId] = action.payload.val()[nctId];
            }
            this.additionalSource.next(this.additionalObject);
        }, (error) => {
            this.authorizedSource.next(false);
        });
    }

    fetchTrialById(id: string) {
        return new Promise((resolve, reject) => {
            this.db.object('Trials/' + id).valueChanges().subscribe((trial: any) => {
                resolve(trial);
            }, (error) => {
                console.log('Fetch trial by id failed!', error);
                reject({});
            });
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
                    };
                } else {
                    if (_.isUndefined(trial['treatment_list'].step[0].arm)) {
                        trial['treatment_list'].step[0].arm = [];
                    } else {
                        _.forEach(trial['treatment_list'].step[0].arm, function(armItem) {
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
    setAdditionalChosen(nctId: string) {
        if (!_.isUndefined(this.additionalObject[nctId])) {
            this.additionalChosenSource.next(this.additionalObject[nctId]);
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
    setHasErrorInputField(hasErrorInputField: boolean) {
        this.hasErrorInputFieldSource.next(hasErrorInputField);
    }
    getStyle(indent: number) {
        return { 'margin-left': (indent * 40) + 'px' };
    }
    getStatusOptions() {
        return this.statusOptions;
    }
    getSubTypesOptions() {
        return this.subTypesOptions;
    }
    loadDrugsOptions(query: string) {
        // prepare drugs list
        return this.connectionService.getDrugs(query).pipe(
            catchError(() => of([])),
            map((rsp) =>  rsp['terms']),
        );
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
    getRef(path: string) {
        return this.db.object(path);
    }
    saveTrialById(id: string, data: object) {
        return new Promise((resolve, reject) => {
            this.db.object('Trials/' + id).set(data).then((result) => {
                console.log('Save trial ' + id + ' successfully!');
                resolve(true);
            }).catch((error) => {
                console.log('Failed to save trial' + id + ' to DB ', error);
                reject(false);
            });
        });
    }
    saveErrors(info: string, content: object, error: object) {
        if (info.includes('failed') && info.includes('database')) {
            this.emailService.sendEmail({
                sendTo: environment.devEmail,
                subject: info,
                content: 'Content: \n' + JSON.stringify(content) + '\n\n Error: \n' + JSON.stringify(error)
            });
        } else {
            this.errorList.push({
                'info': info,
                'content': content,
                'error': error
            });
        }
    }
    getNodeDisplayContent(key: string, node: object) {
        let result = '';
        if (node['no_' + key]) {
            result += '!';
        }
        if (node[key]) {
            result += node[key];
        }
        return result;
    }
    getErrorResponse(error: HttpErrorResponse, type: string) {
        if (error.status === 400) {
            alert('Sorry, your query is invalid.');
        } else if (error.status === 404) {
            alert('Sorry, we cannot find ' + type + '.');
        } else if (error.status === 503) {
            alert('Sorry, required data source is unavailable now.');
        } else {
            this.emailService.sendEmail({
                sendTo: environment.devEmail,
                subject: 'Matchminer Curate http request failed.',
                content: 'Error: \n' + JSON.stringify(error)
            });
            alert('Sorry, unexpected error happens. Our development team has been notified.');
        }
    }
}
