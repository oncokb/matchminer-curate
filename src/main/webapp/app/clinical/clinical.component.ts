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
    indent = 1.2; // the relative indent between the clinical content with the title
    pathPool = this.trialService.getPathpool();
    operationPool = this.trialService.getOperationPool();
    clinicalInput = this.trialService.getClinicalInput();
    mainTypes = this.trialService.getMainTypes();
    subTypes = this.trialService.getSubTypes();
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    setOncotreeDiagnosis(value: string) {
        this.trialService.setClinicalInput('oncotree_diagnosis', value);
    }
}
