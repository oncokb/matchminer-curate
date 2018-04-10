import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
import { Trial } from './trial.model';
import * as $ from 'jquery';
import "../../../../../node_modules/jquery/dist/jquery.js";
import "../../../../../node_modules/datatables.net/js/jquery.dataTables.js";
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { ConnectionService } from '../service/connection.service'

@Component({
    selector: 'jhi-trial',
    templateUrl: './trial.component.html',
    styleUrls: ['trial.scss']
})
export class TrialComponent implements OnInit, AfterViewInit {
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    trialsToImport = '';
    nctIdChosen = '';
    messages: Array<string> = [];
    trialList: Array<Trial> = [];
    trialChosen = {};
    nctIdList = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    hideArchived = 'Yes';
    mongoMessage: string;
    mongoMessageColor: string;
    production: boolean;

    constructor(private connectionService: ConnectionService, private trialService: TrialService, public db: AngularFireDatabase) {
        this.production = this.connectionService.getProduction();
        this.trialService.trialChosenObs.subscribe(message => this.trialChosen = message);
        this.trialService.trialListObs.subscribe(message => {
            this.trialList = message;
            this.nctIdList = _.map(this.trialList, function (trial) {
                return trial.nct_id;
            });
            this.rerender();
        });
    }

    ngOnInit(): void {
        $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
            if (this.hideArchived === 'Yes' && data[4] === 'Yes') {
                return false;
            } else {
                return true;
            }
        });
        this.dtOptions = {
            paging: false,
            scrollY: '300'
        };
    }

    importTrials() {
        this.messages = [];
        const newTrials: Array<string>  = this.trialsToImport.split(',');
        let setChosenTrial = false;
        for (const newTrial of newTrials) {
            const tempTrial = newTrial.trim();
            if (tempTrial.length === 0) {
                continue;
            }
            if (this.nctIdList.indexOf(tempTrial) !== -1) {
                this.messages.push(tempTrial + ' already imported');
                continue;
            }
            if (!tempTrial.match(/NCT[0-9]+/g)) {
                this.messages.push(tempTrial + ' is invalid trial format');
                continue;
            }
            this.connectionService.importTrials(tempTrial).subscribe((res) => {
                        const trialInfo = res;
                        let armsInfo:any = [];
                        _.each(trialInfo.arms, function(arm) {
                            if (arm.arm_type !== null && arm.arm_description !== null) {
                                armsInfo.push({
                                    arm_name: arm.arm_name,
                                    arm_type: arm.arm_type,
                                    arm_description: arm.arm_description,
                                    match: []
                                });
                            }
                        });
                        const trial: Trial = {
                            curation_status: 'In progress',
                            archived: 'No',
                            nct_id: trialInfo.nct_id,
                            long_title: trialInfo.official_title,
                            short_title: trialInfo.brief_title,
                            phase: trialInfo.phase.phase,
                            status: trialInfo.current_trial_status,
                            treatment_list: {
                                step: [{
                                    arm:  armsInfo,
                                    match: []
                                }]
                            }
                        };
                        this.db.object('Trials/' + trialInfo.nct_id).set(trial).then(result => {
                            this.messages.push('Successfully imported ' + trialInfo.nct_id);
                            if (setChosenTrial === false) {
                                this.nctIdChosen = trialInfo.nct_id;
                                this.trialService.setTrialChosen(this.nctIdChosen);
                                setChosenTrial = true;
                            }
                        }).catch(error => {
                            this.messages.push('Fail to save to database ' + tempTrial);
                        });

                    },
                    error => {
                        this.messages.push(tempTrial + ' not found');
                    }
                );
        }
        this.trialsToImport = '';
    }

    updateStatus(type: string) {
        if (type === 'curation') {
            this.db.object('Trials/' + this.nctIdChosen).update({
                curation_status: this.trialChosen['curation_status']
            }).then(result => {
                console.log('success saving curation status');
            }).catch(error => {
                console.log('error', error);
            });
        } else if (type === 'archive') {
            this.db.object('Trials/' + this.nctIdChosen).update({
                archived: this.trialChosen['archived']
            }).then(result => {
                console.log('success saving archive status');
                if (this.trialChosen['archived'] === 'Yes') {
                    this.curateTrial('');
                }
            }).catch(error => {
                console.log('error', error);
            });
        } else if (type === 'hideArchived') {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.draw();
            });
        }
    }

    curateTrial(nctId: string) {
        this.mongoMessage = "";
        this.trialService.setTrialChosen(nctId);
        document.querySelector('#trialDetail').scrollIntoView();
    }

    getStatus(status: string) {
        return status === 'Completed' ? {'color': 'green'} : {'color': 'red'};
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }

    rerender(): void {
        if (!_.isUndefined(this.dtElement)) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                // Call the dtTrigger to rerender again
                this.dtTrigger.next();
            });
        }
    }

    loadMongo() {
        this.mongoMessage = "Loading the trial ......";
        this.mongoMessageColor = '#ffc107';
        let trial = {
            'trial': this.trialChosen
        }
        this.connectionService.loadMongo(trial).subscribe((res) => {
            if (res.status === 200) {
                this.mongoMessage = 'Send trial ' + this.nctIdChosen + ' successfully!';
                this.mongoMessageColor = 'green';
            }
        }, (error) => {
            this.mongoMessage = 'Request for sending trial ' + this.nctIdChosen + ' failed!';
            this.mongoMessageColor = 'red';
            return Observable.throw(error);
        });
    }
}
