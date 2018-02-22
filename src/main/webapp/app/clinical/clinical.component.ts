import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
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
    operationPool = this.trialService.getOperationPool();
    clinicalInput = this.trialService.getClinicalInput();
    subTypesOptions = this.trialService.getSubTypesOptions();
    validation = this.trialService.getValidation();
    subToMainMapping = this.trialService.getSubToMainMapping();
    mainTypesOptions = this.trialService.getMainTypesOptions();

    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    getMessageStyle() {
        if (this.validation['clinicalAge'] === true) {
            return { 'color': 'green' };
        } else if (this.validation['clinicalAge'] === false) {
            return { 'color': 'red' };
        }
    }
    validateAgeInput() {
        if (this.clinicalInput.age_numerical.match(/^(>|>=|<|<=)?[0-9][0-9]$/)) {
            this.validationMessage = 'Valid Age Entry';
            this.validation['clinicalAge'] = true;
        } else {
            this.validationMessage = 'Invalid Age Entry';
            this.validation['clinicalAge'] = false;
        }
    }
    onSingleSelected(option){
        if (option.value && this.clinicalInput.main_type !== this.subToMainMapping[option.value]) {
            this.clinicalInput.main_type = this.subToMainMapping[option.value]; 
        }
    }
    onSingleDeselectedMaintype() {
        this.clinicalInput.sub_type = '';
        this.clinicalInput.main_type = '';
    }
    onSingleDeselectedSubtype() {
        this.clinicalInput.sub_type = '';
    }
}
