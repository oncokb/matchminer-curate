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
        if (this.clinicalInput.age_numerical.match(/^(>|>=|<|<=)?[0-9][0-9]$/)) {
            this.validationMessage = 'Valid Age Entry';
            this.validation = true;
        } else {
            this.validationMessage = 'Invalid Age Entry';
            this.validation = false;
        }
    }
    onSingleSelected(option){
        if (!_.isUndefined(option)) {
            this.clinicalInput.sub_type = '';
        } else {
            if (option && this.clinicalInput.main_type !== this.subToMainMapping[option]) {
                this.clinicalInput.main_type = this.subToMainMapping[option]; 
            }
        }
    }
    onSingleDeselectedMaintype() {
        this.clinicalInput.sub_type = '';
        this.clinicalInput.main_type = '';
    }
}
