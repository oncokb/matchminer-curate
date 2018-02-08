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
    pathPool = this.trialService.getPathpool();
    operationPool = this.trialService.getOperationPool();
    clinicalInput = this.trialService.getClinicalInput();
    subTypesOptions = this.trialService.getSubTypesOptions();
    validClinical = this.trialService.getValidClinical();
    subToMainMapping = this.trialService.getSubToMainMapping();
    mainTypesOptions = this.trialService.getMainTypesOptions();

    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    getMessageStyle() {
        if (this.validClinical[0] === true) {
            return { 'color': 'green' };
        } else if (this.validClinical[0] === false) {
            return { 'color': 'red' };
        }
    }
    validateAgeInput() {
        if (this.clinicalInput.age_numerical.match(/^(>|>=|<|<=)?[0-9][0-9]$/)) {
            this.validationMessage = 'Valid Age Entry';
            this.validClinical.splice(0, this.validClinical.length);
            this.validClinical.push(true);
        } else {
            this.validationMessage = 'Invalid Age Entry';
            this.validClinical.splice(0, this.validClinical.length);
            this.validClinical.push(false);
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
