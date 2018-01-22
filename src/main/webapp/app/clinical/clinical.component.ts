import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
@Component({
    selector: 'jhi-clinical',
    templateUrl: './clinical.component.html',
    styleUrls: ['clinical.scss']
})
export class ClinicalComponent implements OnInit {
    @Input() indent = 0;
    @Input() path = '';
    @Input() unit = {};
    pathPool = this.trialService.getPathpool();
    modificationInput = this.trialService.getModificationInput();
    mainTypes = this.trialService.getMainTypes();
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
}
