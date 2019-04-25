import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { Meta } from './meta.model';
import { MainutilService } from '../service/mainutil.service';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'jhi-meta',
    templateUrl: './meta.component.html',
    styleUrls: ['meta.scss']
})

export class MetaComponent implements OnInit, AfterViewInit {
    @ViewChild(DataTableDirective) private dtElement: DataTableDirective;
    @ViewChild( 'selectModel' ) private selectModel: NgModel;
    isPermitted = this.trialService.isPermitted;
    metaList: Array<Meta> = [];
    metaInput: Meta;
    originalMeta: Meta;
    statusOptions = this.trialService.getStatusOptions();
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    tableDestroied = false;
    nctIdMessage = {
        content: '',
        color: ''
    };

    constructor(private trialService: TrialService, public mainutilService: MainutilService) {
        this.trialService.metaListObs.subscribe((message) => {
            this.metaList = message;
            this.rerender();
        });
    }
    ngOnInit(): void {
        this.dtOptions = {
            paging: false,
            scrollY: '400',
            columns: [
                { 'width': '20%' },
                { 'width': '10%' },
                null,
                null,
                null,
                null
            ]
        };
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
    unCheckRadio(key, event) {
        this.metaInput[key] = this.mainutilService.unCheckRadio(this.metaInput[key], event.target.value);
        if (this.originalMeta[key] !== this.metaInput[key]) {
            this.updateMeta(key);
        }
    }
    clickMetaRow(meta: any) {
        this.originalMeta = _.clone(meta);
        this.metaInput = meta;
    }
    updateMeta(key: string) {
        if (key === 'nct_id') {
            this.updateNctId();
        } else {
            const metaToUpdate = {};
            metaToUpdate[key] = this.metaInput[key];
            this.trialService.getRef( 'Meta/' + this.metaInput['protocol_no'] ).update( metaToUpdate )
            .then((res) => {})
            .catch( ( error ) => {
                console.log(error);
                this.metaInput[key] = this.originalMeta[key];
            });
        }
    }
    updateNctId() {
        if ( this.metaInput['nct_id'].match( /^NCT\d+$/g ) ) {
            const result = confirm('Are you sure to update NCT ID to ' + this.metaInput['nct_id'] + '?');
            if (result) {
                this.trialService.getRef( 'Meta/' + this.metaInput['protocol_no'] ).update( {nct_id: this.metaInput['nct_id']} )
                .then((res) => {
                    this.nctIdMessage.content = 'Update NCT ID successfully.';
                    this.nctIdMessage.color = 'green';
                })
                .catch( ( error ) => {
                    this.nctIdMessage.content = 'Failed to update NCT ID.';
                    this.nctIdMessage.color = 'red';
                    this.metaInput['nct_id'] = this.originalMeta['nct_id'];
                } );
            }
        } else {
            this.nctIdMessage.content = 'NCT ID should follow the format: NCTxxxxxxx. (x:digit)';
            this.nctIdMessage.color = 'red';
            this.metaInput['nct_id'] = this.originalMeta['nct_id'];
        }
    }
    clearMessage(type: string) {
        if (type === 'nct_id') {
            this.nctIdMessage.content = '';
            this.nctIdMessage.color = '';
        }
    }
}
