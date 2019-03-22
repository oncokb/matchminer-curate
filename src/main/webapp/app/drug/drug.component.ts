import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Drug, NcitDrug } from '../drug/drug.model';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
    selector: 'jhi-drug',
    templateUrl: './drug.component.html',
    styleUrls: ['drug.scss']
})

export class DrugComponent implements OnInit {
    @Input() armInput = {};
    drugsOptionsLoading = false;
    selectedDrugs: Array<any> = [];
    drugInput = new EventEmitter<string>();
    drugsOptions: Array<Drug> = [];

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
        this.trialService.armInputObs.subscribe((message) => {
            this.armInput = message;
            this.selectedDrugs = this.armInput['drugs'];
        });
    }

    saveDrugs() {
        this.armInput['drugs'] = this.selectedDrugs.map((drug: any) => typeof drug === 'string' ? { 'name': drug } : drug);
    }
}
