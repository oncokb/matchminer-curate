import { Component, ViewChild } from '@angular/core';
import { TrialService } from '../service/trial.service';
import * as _ from 'lodash';
import { Meta } from './meta.model';
import MainUtil from '../service/mainutil';
import { MetaService } from '../service/meta.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';

@Component({
    selector: 'jhi-meta',
    templateUrl: './meta.component.html',
    styleUrls: ['meta.scss']
})

export class MetaComponent {
    oncokb = MainUtil.oncokb;
    @ViewChild(DatatableComponent) table: DatatableComponent;
    loadingIndicator = true;
    rows = [];
    temp = [];
    statusOptions = this.trialService.statusOptions;

    constructor(private trialService: TrialService, public metaService: MetaService) {
        this.metaService.metaListObs.subscribe( ( result ) => {
            if (result.length > 0) {
                this.rows = [...result];
                this.temp = [...result];
                if (this.loadingIndicator) {
                    this.loadingIndicator = false;
                }
            }
        });
    }

    updateValue(key: string, event: any, data: Meta, rowIndex) {
        if (key === 'precision_medicine') {
            const originalData = _.clone(data);
            data[key] = MainUtil.uncheckRadio(data[key], event.target.value);
            if (originalData[key] !== data[key]) {
                this.metaService.updateMetaRecord(key, data);
                this.rows[rowIndex][key] = data[key];
            }
        } else if (data[key] !== event.target.value) {
            data[key] = event.target.value;
            this.metaService.updateMetaRecord(key, data);
            this.rows[rowIndex][key] = event.target.value;
        }
        this.rows = [...this.rows];
    }
    updateFilter(event) {
        const val = event.target.value.toLowerCase();
        // filter our data
        const temp = this.temp.filter(function(d) {
            return JSON.stringify(d).toLowerCase().indexOf(val) !== -1 || !val;
        });
        // update the rows
        this.rows = temp;
        // Whenever the filter changes, always go back to the first page
        this.table.offset = 0;
    }
    download() {
        const content = [];
        const headers = ['Protocol No', 'Nct Id', 'Status', 'Title', 'Precision Medicine', 'Curated'];
        content.push(headers.join('\t'));
        this.rows.map((row) => {
            content.push([row['protocol_no'], row['nct_id'], row['status'], row['title'].replace(/\n/g, ''), row['precision_medicine'], row['curated']].join('\t'));
        });
        const blob = new Blob([content.join('\n')], {
            type: 'text/plain;charset=utf-8;',
        });
        saveAs(blob, 'MetaTable.xls');
    }
}
