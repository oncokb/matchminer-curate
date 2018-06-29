import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Arm } from '../arm/arm.model';
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

    constructor(private trialService: TrialService) {
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
    unCheckRadio(event) {
        if (event.target.value === this.armInput.arm_suspended) {
            this.armInput.arm_suspended = '';
        }
    }

}
