import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'lodash';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { Meta } from './meta.model';
import { MainutilService } from '../service/mainutil.service';
import { MetaService } from '../service/meta.service';

@Component({
    selector: 'jhi-meta',
    templateUrl: './meta.component.html',
    styleUrls: ['meta.scss']
})

export class MetaComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(DataTableDirective) private dtElement: DataTableDirective;
    isPermitted = this.trialService.isPermitted;
    metaList: Array<Meta> = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    dataLoaded = false;
    tableDestroied = false;

    constructor(private trialService: TrialService, public mainutilService: MainutilService, public metaService: MetaService) {
        this.trialService.fetchMetas().then((result) => {
            if (Array.isArray(result) && result.length > 0) {
                this.metaList = result;
                this.rerender();
                this.dataLoaded = true;
            }
        });
    }
    ngOnInit(): void {
        this.dtOptions = {
            paging: true,
            scrollY: '70vh',
            columns: [
                { 'width': '20%' },
                { 'width': '10%' },
                { 'width': '15%' },
                { 'width': '45%' },
                { 'width': '5%' },
                { 'width': '5%' }
            ]
        };
    }
    ngOnDestroy(): void {
        // Update meta in firebase when user leave the page.
        this.metaService.onDestroyEvent.emit('Meta');
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    rerender(): void {
        this.tableDestroied = false;
        if (!_.isUndefined(this.dtElement)) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                if (!this.tableDestroied) {
                    dtInstance.destroy();
                    // Call the dtTrigger to rerender again
                    this.dtTrigger.next();
                    this.tableDestroied = true;
                }
            });
        }
    }
    unCheckRadio(key: string, event: any, data: Meta) {
        const originalData = _.clone(data);
        data[key] = this.mainutilService.unCheckRadio(data[key], event.target.value);
        if (originalData[key] !== data[key]) {
            this.metaService.metasToUpdate[data['protocol_no']] = data;
        }
    }
}
