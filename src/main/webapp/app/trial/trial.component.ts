import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
import { Trial } from './trial.model';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../service/connection.service';

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
  statusOptions = this.trialService.getStatusOptions();
  originalTrialStatus = '';
  frontEndOnly = this.trialService.frontEndOnly;
  isPermitted = this.trialService.isPermitted;
  mongoMessage = {
    content: '',
    color: ''
  };
  @ViewChild('selectModel') private selectModel: NgModel;

  constructor(private trialService: TrialService, public db: AngularFireDatabase, private connectionService: ConnectionService, private router: Router ) {
    this.trialService.nctIdChosenObs.subscribe((message) => this.nctIdChosen = message);
    this.trialService.trialChosenObs.subscribe((message) => this.trialChosen = message);
    this.trialService.trialListObs.subscribe((message) => {
        this.trialList = message;
        this.nctIdList = _.map(this.trialList, function(trial) {
            return trial.nct_id;
        });
        this.rerender();
    });
  }
  ngOnInit(): void {
    $.fn['dataTable'].ext.search.push((settings, data) => {
        if (this.hideArchived === 'Yes' && data[4] === 'Yes') {
            return false;
        } else if (this.hideArchived === 'No' && data[4] === 'No') {
            return false;
        } else {
            return true;
        }
    });
    this.dtOptions = {
        paging: false,
        scrollY: '300'
    };
      if (this.router.url.includes('NCT')) {
          const nctId = this.router.url.split('/').slice(-1)[0];
          this.curateTrial(nctId);
      }
  }
  importTrials() {
    this.messages = [];
    this.mongoMessage.content = '';
    const newTrials: Array<string>  = this.trialsToImport.split(',');
    let setChosenTrial = false;
    let result = true;
    for (const newTrial of newTrials) {
        const tempTrial = newTrial.trim();
        if (tempTrial.length === 0) {
            continue;
        }
        if (!tempTrial.match(/NCT[0-9]+/g)) {
            this.messages.push(tempTrial + ' is invalid trial format');
            continue;
        }
        if (this.nctIdList.indexOf(tempTrial) !== -1) {
            result = confirm('Trial ' + tempTrial + ' has been loaded in database. ' +
                'Are you sure you want to overwrite this trial by loading file ' + tempTrial + '?');
        }
        if (!result) {
            continue;
        }
        this.connectionService.importTrials(tempTrial).subscribe((res) => {
            const trialInfo = res;
            const armsInfo: any = [];
            _.each(trialInfo['arms'], function(arm) {
                if (arm.arm_description !== null) {
                    armsInfo.push({
                        arm_description: arm.arm_name,
                        arm_info: arm.arm_description,
                        match: []
                    });
                }
            });
            const trial: Trial = {
                curation_status: 'In progress',
                archived: 'No',
                nct_id: trialInfo['nct_id'],
                long_title: trialInfo['official_title'],
                short_title: trialInfo['brief_title'],
                phase: trialInfo['phase']['phase'],
                status: trialInfo['current_trial_status'],
                treatment_list: {
                    step: [{
                        arm:  armsInfo,
                        match: []
                    }]
                }
            };
            this.db.object('Trials/' + trialInfo['nct_id']).set(trial).then((response) => {
                this.messages.push('Successfully imported ' + trialInfo['nct_id']);
                if (setChosenTrial === false) {
                    this.nctIdChosen = trialInfo['nct_id'];
                    this.trialService.setTrialChosen(this.nctIdChosen);
                    this.originalTrialStatus = this.trialChosen['status'];
                    setChosenTrial = true;
                }
            }).catch((error) => {
                this.messages.push('Fail to save to database ' + tempTrial);
            });
        }, (error) => {
            this.messages.push(tempTrial + ' not found');
        });
    }
      this.trialsToImport = '';
  }
    updateStatus(type: string) {
        if (type === 'curation') {
            this.db.object('Trials/' + this.nctIdChosen).update({
                curation_status: this.trialChosen['curation_status']
            }).then((result) => {
                console.log('success saving curation status');
            }).catch((error) => {
                console.log('error', error);
            });
        } else if (type === 'archive') {
            this.db.object('Trials/' + this.nctIdChosen).update({
                archived: this.trialChosen['archived']
            }).then((result) => {
                console.log('success saving archive status');
                if (this.trialChosen['archived'] === 'Yes') {
                    this.curateTrial('');
                }
            }).catch((error) => {
                console.log('error', error);
            });
        } else if (type === 'hideArchived') {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.draw();
            });
        }
    }
  curateTrial(nctId: string) {
      this.mongoMessage.content = '';
      this.trialService.setTrialChosen(nctId);
      this.originalTrialStatus = this.trialChosen['status'];
      document.querySelector('#trialDetail').scrollIntoView();
  }
  getStatus(status: string) {
    return status === 'Completed' ? { 'color': 'green' } : { 'color': 'red' };
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
  updateTrialStatusInDB() {
    if (this.originalTrialStatus !== this.trialChosen['status']) {
        this.trialService.getTrialRef(this.nctIdChosen, 'status').set(this.trialChosen['status']).then((result) => {
            console.log('Save to DB Successfully!');
        }).catch((error) => {
            console.log('Failed to save to DB ', error);
            const errorMessage = 'Sorry, the trial status is failed to save to database.';
            this.trialService.saveErrors(
                errorMessage,
                {
                    nctId: this.trialChosen['nct_id'],
                    oldContent: 'trial status: ' + this.originalTrialStatus,
                    newContent: 'trial status: ' + this.trialChosen['status']
                },
                error
            );
            alert(errorMessage);
            // Rollback the trial status in ng-select option
            this.selectModel.reset(this.originalTrialStatus);
            this.trialChosen['status'] = this.originalTrialStatus;
        });
    }
  }

  loadMongo() {
    this.mongoMessage.content = 'Loading the trial ......';
    this.mongoMessage.color = '#ffc107';
    this.connectionService.loadMongo(this.trialChosen).subscribe((res) => {
        if (res.status === 200) {
            if (this.trialChosen['archived'] === 'Yes') {
                // Remove archived trials from database
                alert('This archived trial has been removed from database.');
                return;
            }
            this.mongoMessage.content = 'Send trial ' + this.nctIdChosen + ' successfully!';
            this.mongoMessage.color = 'green';
        }
    }, (error) => {
        this.mongoMessage.content = 'Request for sending trial ' + this.nctIdChosen + ' failed!';
        this.mongoMessage.color = 'red';
        return Observable.throw(error);
    });
  }
}
