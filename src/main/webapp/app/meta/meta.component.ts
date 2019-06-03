import { Component, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { TrialService } from '../service/trial.service';
import * as _ from 'lodash';
import { Meta } from './meta.model';
import { MainutilService } from '../service/mainutil.service';
import { MetaService } from '../service/meta.service';
import { environment } from '../environments/environment';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';

@Component({
    selector: 'jhi-meta',
    templateUrl: './meta.component.html',
    styleUrls: ['meta.scss']
})

export class MetaComponent implements OnDestroy {
    oncokb = environment['oncokb'] ? environment['oncokb'] : false;
    @ViewChild(DatatableComponent) table: DatatableComponent;
    loadingIndicator = true;
    rows = [];
    temp = [];
    editing = {};
    statusOptions = this.trialService.statusOptions;

    constructor(private trialService: TrialService, public mainutilService: MainutilService, public metaService: MetaService) {
        this.trialService.fetchMetas().then((result) => {
            if (Array.isArray(result)) {
                this.rows = result;
                this.temp = [...result];
                this.loadingIndicator = false;
            }
        });
    }

    ngOnDestroy(): void {
        // Update meta in firebase when a user redirects to another page.
        this.metaService.onDestroyEvent.emit('Meta');
    }

    @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
        // Update meta in firebase when a user refreshes or closes the page.
        this.metaService.onDestroyEvent.emit('Meta');
    }

    updateValue(key: string, event: any, data: Meta, rowIndex) {
        if (key === 'precision_medicine') {
            const updatedValue = this.updatePrecisionMedicine(key, event, data);
            this.rows[rowIndex][key] = updatedValue;
        } else if (data[key] !== event.target.value) {
            data[key] = event.target.value;
            this.metaService.metasToUpdate[data['protocol_no']] = data;
            this.rows[rowIndex][key] = event.target.value;
        }
        this.editing[rowIndex + '-' + key] = false;
        this.rows = [...this.rows];
    }

    updatePrecisionMedicine(key: string, event: any, data: Meta) {
        const originalData = _.clone(data);
        data[key] = this.mainutilService.unCheckRadio(data[key], event.target.value);
        if (originalData[key] !== data[key]) {
            this.metaService.metasToUpdate[data['protocol_no']] = data;
        }
        return data[key];
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
