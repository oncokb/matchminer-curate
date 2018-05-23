import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Clinical } from './clinical.model';
import * as _ from 'underscore';

@Component({
    selector: 'jhi-clinical',
    templateUrl: './clinical.component.html',
    styleUrls: ['clinical.scss']
})
export class ClinicalComponent implements OnInit {
    @Input() path = '';
    @Input() unit = {};
    @Input() type = '';
    validationMessage = '';
    indent = 1.2; // the relative indent between the clinical content with the title
    operationPool: {};
    clinicalInput: Clinical;
    subTypesOptions = this.trialService.getSubTypesOptions();
    validation = false;
    subToMainMapping = this.trialService.getSubToMainMapping();
    mainTypesOptions = this.trialService.getMainTypesOptions();
    currentSubTypeOptions = [];

    constructor(private trialService: TrialService) { }

    ngOnInit() {
        this.trialService.clinicalInputObs.subscribe(message => {
            this.clinicalInput = message;
        });
        this.trialService.operationPoolObs.subscribe(message => {
            this.operationPool = message;
        });
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    getMessageStyle() {
        if (this.validation === true) {
            return { 'color': 'green' };
        } else if (this.validation === false) {
            return { 'color': 'red' };
        }
    }
    validateAgeInput() {
        let isValidated = false;
        if(this.clinicalInput.age_numerical.includes(',')) {
            let ageGroups = this.clinicalInput.age_numerical.split(',');
            // Age input cannot only accepts age range groups greater than 2.
            if (ageGroups.length === 2) {
                let ageNumber0 = Number(ageGroups[0].match(/\d\d?$/));
                let ageNumber1 = Number(ageGroups[1].match(/\d\d?$/));
                // Do no allow age range like '>15, >=30' or '<=60, <40' or '<10, >60' or '>50, <20'
                if ((ageGroups[0].includes('>') && ageGroups[1].includes('>')) ||
                    (ageGroups[0].includes('<') && ageGroups[1].includes('<')) ||
                    (ageGroups[0].includes('<') && ageGroups[1].includes('>') && ageNumber0 <= ageNumber1) ||
                    (ageGroups[0].includes('>') && ageGroups[1].includes('<') && ageNumber0 >= ageNumber1)) {
                    this.setValidationMessage(false, 'Invalid Age Entry');
                    return;
                }
                ageGroups.forEach(age => {
                    isValidated = this.validateSingleAgeStr(age.trim());
                    if (!isValidated) {
                        this.setValidationMessage(false, 'Invalid Age Entry');
                        return;
                    }
                });
            } else {
                // Age input invalid format like ">=18,".
                this.setValidationMessage(false, 'Invalid Age Entry');
                return;
            }
        } else {
            // Allow age_numerical to be empty.
            if (_.isEmpty(this.clinicalInput.age_numerical)) {
                this.setValidationMessage(true, '');
                return;
            }
            isValidated = this.validateSingleAgeStr(this.clinicalInput.age_numerical);
            if (!isValidated) {
                this.setValidationMessage(false, 'Invalid Age Entry');
                return;
            }
        }
        if(isValidated) {
            this.setValidationMessage(true, 'Valid Age Entry');
        }
    }
    validateSingleAgeStr(age_numerical: string) {
        if (age_numerical.match(/^(>|>=|<|<=)\d\d?$/)) {
            return true;
        } else {
            return false;
        }
    }
    setValidationMessage(isPassed: boolean, message: string) {
        this.validationMessage = message;
        this.validation = isPassed;
        if (isPassed) {
            this.trialService.setHasErrorInputField(false);
        } else {
            // Disable "Add" or "Save" button
            this.trialService.setHasErrorInputField(true);
        }
    }
    onSingleSelected(option){
        if (_.isUndefined(option)) {
            this.clinicalInput.sub_type = '';
        } else if (option && this.clinicalInput.main_type !== this.subToMainMapping[option]) {
            this.clinicalInput.main_type = this.subToMainMapping[option];
        }
    }
    onSingleDeselectedMaintype() {
        this.clinicalInput.sub_type = '';
        this.clinicalInput.main_type = '';
    }
}
