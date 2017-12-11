import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
@Component({
    selector: 'jhi-genomic',
    templateUrl: './genomic.component.html',
    styleUrls: ['genomic.scss']
})
export class GenomicComponent implements OnInit {
    @Input() indent = 0;
    @Input() path = '';
    @Input() unit = {};
    pathPool = this.trialService.getPathpool();
    modificationInput = this.trialService.getModificationInput();
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    getStyle() {
        return { 'margin-left': (this.indent * 20) + 'px' };
    }
}
