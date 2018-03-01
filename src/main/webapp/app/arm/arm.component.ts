import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
@Component({
    selector: 'jhi-arm',
    templateUrl: './arm.component.html',
    styleUrls: ['arm.scss']
})
export class ArmComponent implements OnInit {
    @Input() type = '';
    @Input() unit = {};
    @Input() path = '';
    armInput = this.trialService.getArmInput();
    operationPool = this.trialService.getOperationPool();
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }

}
