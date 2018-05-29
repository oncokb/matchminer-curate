import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import  * as YAML from '../../../../../node_modules/js-yaml/index.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { NgModel } from '@angular/forms';
import { Trial } from '../trial/trial.model';

@Component({
    selector: 'jhi-converter',
    templateUrl: './converter.component.html',
    styleUrls: ['converter.scss']
})

export class ConverterComponent implements OnInit, AfterViewInit {
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    trialList: Array<Trial> = [];
    nctIdList = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    fileType: string = 'JSON';
    @ViewChild('selectModel') private selectModel: NgModel;

    constructor(private trialService: TrialService) {
        this.trialService.trialListObs.subscribe(message => {
            this.trialList = message;
            this.nctIdList = _.map(this.trialList, function(trial){
                return trial.nct_id;
            });
            this.rerender();
        });
    }
    ngOnInit(): void {
        this.dtOptions = {
            paging: false,
            scrollY: '300'
        };
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    rerender(): void {
        if (!_.isUndefined(this.dtElement)) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                // Destroy the table first
                dtInstance.destroy();
                // Call the dtTrigger to rerender again
                this.dtTrigger.next();
            });
        }
    }
    downloadSingleTrial(nctId: string, type: string) {
        this.trialService.fetchTrialById(nctId).then((trialJson) => {
            if (!_.isEmpty(trialJson)) {
                let data = '';
                if (type === 'json') {
                    data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trialJson, null, 2));
                } else if (type === 'yaml') {
                    data = "text/x-yaml;charset=utf-8," + encodeURIComponent(YAML.safeDump(trialJson));
                }

                let a = document.createElement('a');
                a.href = 'data:' + data;
                a.download = nctId + '.' + type;
                a.click();
            } else {
                alert("Download trial " + nctId + " failed!");
            }
        });
    }
    downloadMultipleTrials() {

    }
    downloadAllTrials() {

    }
    uploadFiles() {

    }
}
