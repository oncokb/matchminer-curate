import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Arm } from '../arm/arm.model';
import { Drug } from '../drug/drug.model';
import { MainutilService } from '../service/mainutil.service';
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
    oncokb: boolean;

    constructor(private trialService: TrialService, public mainutilService: MainutilService) {
        this.oncokb = this.trialService.oncokb;
    }

    ngOnInit() {
        this.trialService.operationPoolObs.subscribe((message) => {
            this.operationPool = message;
        });
        this.trialService.armInputObs.subscribe((message) => {
            this.armInput = message;
        });
    }
    unCheckRadio(key, event) {
        this.armInput[key] = this.mainutilService.unCheckRadio(this.armInput[key], event.target.value);
    }
    displayDrugName(drugs: Array<Drug>) {
        if (drugs && drugs.length > 0) {
            return drugs.map( (drug) => drug.name).join(', ');
        }
    }
}
