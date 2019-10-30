import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Clinical } from './clinical.model';
import * as _ from 'lodash';
import MainUtil from '../service/mainutil';

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

    constructor(private trialService: TrialService) { }

    ngOnInit() {
        this.trialService.clinicalInputObs.subscribe((message) => {
            this.clinicalInput = message;
        });
        this.trialService.operationPoolObs.subscribe((message) => {
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
        if (this.clinicalInput.age_numerical.includes(',')) {
            const ageGroups = this.clinicalInput.age_numerical.split(',');
            // Age input cannot only accepts age range groups greater than 2.
            if (ageGroups.length === 2) {
                const ageNumber = this.clinicalInput.age_numerical.match(/\d+(\.?\d+)?/g).map(function(v) { return Number(v); });
                // Do no allow age range like '>15, >=30' or '<=60, <40' or '<10, >60' or '>50, <20'
                if ((ageGroups[0].includes('>') && ageGroups[1].includes('>')) ||
                    (ageGroups[0].includes('<') && ageGroups[1].includes('<')) ||
                    (ageGroups[0].includes('<') && ageGroups[1].includes('>') && ageNumber[0] <= ageNumber[1]) ||
                    (ageGroups[0].includes('>') && ageGroups[1].includes('<') && ageNumber[0] >= ageNumber[1])) {
                    this.setValidationMessage(false, 'Invalid Age Entry');
                    return;
                }
                ageGroups.forEach((age) => {
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
        if (isValidated) {
            this.setValidationMessage(true, 'Valid Age Entry');
        }
    }
    validateSingleAgeStr(age_numerical: string) {
        if (age_numerical.match(/^(>|>=|<|<=)\d+(\.?\d+)?$/)) {
            const ageNumber = age_numerical.match(/\d+(\.?\d+)?/g).map(function(v) { return Number(v); });
            if ( ageNumber[0] >= 0 && ageNumber[0] <= 100 ) {
                return true;
            }
        }
        return false;
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
    onSingleSelected(option) {
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
    getDisplayContent(key: string) {
        return this.trialService.getNodeDisplayContent(key, this.unit['clinical']);
    }
    unCheckRadio(key, event) {
        this.clinicalInput[key] = MainUtil.uncheckRadio(this.clinicalInput[key], event.target.value);
    }
}
