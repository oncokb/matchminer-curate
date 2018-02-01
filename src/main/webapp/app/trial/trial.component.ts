import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import * as _ from 'underscore';
import { Trial } from './trial.model';
import { SERVER_API_URL } from '../app.constants';

@Component({
  selector: 'jhi-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['trial.scss']
})
export class TrialComponent {
  trialsCollection = this.trialService.getTrialsCollection();
  trialChosen: Observable<Trial[]>;
  nctIdList = this.trialService.getNctIdList();
  trialList = this.trialService.getTrialList();
  trialsToImport = '';
  nctIdChosen = '';
  messages: Array<string> = [];
  isLoggedIn = this.trialService.getLoginStatus();
  constructor(public http: Http, public afs: AngularFirestore, private trialService: TrialService) {}

  importTrials() {
    this.messages = [];
    const newTrials: Array<string>  = this.trialsToImport.split(',');
    for (const newTrial of newTrials) {
        const tempTrial = newTrial.trim();
        if (tempTrial.length === 0) {
            continue;
        }
        if (this.nctIdList.indexOf(tempTrial) !== -1) {
            this.messages.push(tempTrial + ' already imported');
            continue;
        }
        this.http.get(SERVER_API_URL + 'proxy/https/clinicaltrialsapi.cancer.gov/v1/clinical-trial/' + tempTrial)
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
                   nct_id: trialInfo.nct_id,
                   long_title: trialInfo.official_title,
                   short_title: trialInfo.brief_title,
                   phase: trialInfo.phase.phase,
                   status: trialInfo.current_trial_status,
                   treatment_list: {
                       step: {
                           arms:  armsInfo,
                           match: []
                       }
                   }
               };
           this.trialsCollection.doc(trialInfo.nct_id).set(trial);
           this.messages.push('Successfully imported ' + trialInfo.nct_id);
        });
    }
    this.trialsToImport = '';
  }

  curateTrial() {
    this.trialService.setNctIdChosen(this.nctIdChosen);
    this.trialChosen = this.trialService.getChosenTrialDoc(this.nctIdChosen);
  }
}
