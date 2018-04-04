import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
import { Trial } from './trial.model';
import { SERVER_API_URL } from '../app.constants';

@Component({
  selector: 'jhi-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['trial.scss']
})
export class TrialComponent {
  trialsToImport = '';
  nctIdChosen = '';
  messages: Array<string> = [];
  trialList = [];
  trialChosen = {};
  nctIdList = [];
  constructor(public http: Http, private trialService: TrialService, public db: AngularFireDatabase) {
    this.trialService.trialChosenObs.subscribe(message => this.trialChosen = message);
    this.trialService.trialListObs.subscribe(message => {
        this.trialList = message;
        this.nctIdList = _.map(this.trialList, function(trial){
            return trial.nct_id;
        });
    });
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
        this.http.get(this.trialService.getAPIUrl('ClinicalTrials') + tempTrial)
        .subscribe((res: Response) => {
           const trialInfo = res.json();
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
  updateCuationStatus() {
    this.db.object('Trials/' + this.nctIdChosen).update({
        curation_status: this.trialChosen['curation_status']
    }).then(result => {
        console.log('success saving curation status');
    }).catch(error => {
        console.log('error', error);
    });
  }
  curateTrial() {
      this.trialService.setTrialChosen(this.nctIdChosen);
  }
}
