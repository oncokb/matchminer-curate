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
    mainTypes = this.trialService.getMainTypes();
    subTypes = this.trialService.getSubTypes();
    validClinical = this.trialService.getValidClinical();
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
}
