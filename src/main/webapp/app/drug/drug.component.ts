import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Drug, NcitDrug } from '../drug/drug.model';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Arm } from '../arm/arm.model';
import MainUtil from '../service/mainutil';

@Component({
    selector: 'jhi-drug',
    templateUrl: './drug.component.html',
    styleUrls: ['drug.scss']
})

export class DrugComponent implements OnInit {
    @Input() armInput: Arm = MainUtil.createArm();
    @Input() drugGroupIndex = 0;
    drugsOptionsLoading = false;
    drugInput = new EventEmitter<string>();
    drugsOptions: Drug[] = [];

    constructor(private trialService: TrialService) {
        this.drugInput.pipe(
            debounceTime(200),
            switchMap((term) => {
                this.drugsOptionsLoading = true;
                return this.trialService.loadDrugsOptions(term);
            })
        ).subscribe((items) => {
            this.drugsOptions = items.map((drug: NcitDrug) => {
                const drugOption: Drug = {
                    ncit_code: drug.codes.join(', '),
                    name: drug.name,
                    synonyms: drug.synonyms.join(', ')
                };
                return drugOption;
            });
            this.drugsOptionsLoading = false;
        }, (err) => {
            this.drugsOptions = [];
            this.drugsOptionsLoading = false;
        });
    }

    ngOnInit() {
        this.trialService.armInputObs.subscribe((message: Arm) => {
            this.armInput = message;
        });
    }

    removeDrugGroup() {
        this.armInput.drugs.splice(this.drugGroupIndex, 1);
    }
}
