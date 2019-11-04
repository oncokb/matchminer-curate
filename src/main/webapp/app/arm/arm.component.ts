import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Arm } from '../arm/arm.model';
import { Drug } from '../drug/drug.model';
import MainUtil from '../service/mainutil';

@Component({
    selector: 'jhi-arm',
    templateUrl: './arm.component.html',
    styleUrls: ['arm.scss']
})
export class ArmComponent implements OnInit {
    @Input() type = '';
    @Input() unit = {};
    @Input() path = '';
    operationPool: {};
    armInput: Arm;
    oncokb = MainUtil.oncokb;

    constructor(private trialService: TrialService) {}

    ngOnInit() {
        this.trialService.operationPoolObs.subscribe((message) => {
            this.operationPool = message;
        });
        this.trialService.armInputObs.subscribe((message) => {
            this.armInput = message;
        });
    }
    unCheckRadio(key, event) {
        this.armInput[key] = MainUtil.uncheckRadio(this.armInput[key], event.target.value);
    }
    displayDrugName(drugGroup: Drug[]) {
        return drugGroup.map((drug) => drug.name).join(' + ');
    }
    addDrugGroup() {
        this.armInput.drugs.push([]);
    }
}
