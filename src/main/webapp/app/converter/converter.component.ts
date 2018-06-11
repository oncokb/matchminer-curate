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
import * as JSZip from '../../../../../node_modules/jszip/dist/jszip.js';
import * as FileSaver from '../../../../../node_modules/file-saver/FileSaver.js';

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
    selectedDownloadIdList: Array<string> = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    fileType: string = 'json';
    filesToUpload: Array<any> = [];
    uploadFailedFileList: Array<string> = [];
    uploadMessage: object = {
        content: '',
        color: ''
    };
    tableDestroied: boolean = false;
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
    downloadSingleTrial(nctId: string, type: string) {
        this.trialService.fetchTrialById(nctId).then((trialJson) => {
            if (!_.isEmpty(trialJson)) {
                let data = '';
                if (type === 'json') {
                    data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trialJson, null, 2));
                } else if (type === 'yml') {
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
    downloadTrials(isAll: boolean) {
        let zip = new JSZip();
        let folderName = 'Trials';
        let zipFolder = zip.folder(folderName);
        if (isAll) {
            this.createTrialZipFile(this.nctIdList, zipFolder, true);
        } else if (this.selectedDownloadIdList.length > 0) {
            this.createTrialZipFile(this.selectedDownloadIdList, zipFolder, false);
        }
        zip.generateAsync({type:"blob"}).then(function (content) {
            FileSaver.saveAs(content, folderName + '.zip');
        }, function (err) {
            console.log(err);
        });
    }
    createTrialZipFile(idList:Array<string>, zipFolder:any, isAll?: boolean) {
        let content = '';
        if (isAll) {
            _.each(this.trialList, function(trialJson){
                let nctId = trialJson['nct_id'];
                if ( this.fileType === 'json' ) {
                    content = JSON.stringify( trialJson, null, 2 );
                } else {
                    content = YAML.safeDump( trialJson );
                }
                // create a folder and a file
                zipFolder.file( nctId + '.' + this.fileType, content);
            }, this);
        } else {
            _.each(idList, function(nctId) {
                _.each(this.trialList, function(trialJson){
                    if (nctId === trialJson['nct_id']) {
                        if ( this.fileType === 'json' ) {
                            content = JSON.stringify( trialJson, null, 2 );
                        } else {
                            content = YAML.safeDump( trialJson );
                        }
                        // create a folder and a file
                        zipFolder.file( nctId + '.' + this.fileType, content);
                    }
                }, this);
            }, this);
        }
    }
    uploadFiles() {
        let result = true;
        this.uploadFailedFileList = [];
        _.each(this.filesToUpload, function(file) {
            let fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = (e) => {
                let trialJson = '';
                if (file.name.includes('json')) {
                    trialJson = JSON.parse(fileReader.result);
                } else {
                    trialJson = YAML.safeLoad(fileReader.result);
                }
                let nctId = trialJson['nct_id'];
                trialJson['curation_status'] = 'In progress';
                trialJson['archived'] = 'No';
                // Check if this trial has been loaded. If yes, ask user if overwrite current trial.
                if (this.nctIdList.includes(nctId)) {
                    result = confirm('Trial ' + nctId + ' has been loaded in database. ' +
                        'Are you sure you want to overwrite this trial by loading file ' + file.name + '?');
                }
                if (result) {
                    this.trialService.saveTrialById(nctId, trialJson).then((res) => {
                        if (!res) {
                            this.uploadFailedFileList.push(file.name);
                        }
                        if (file.name === this.filesToUpload[this.filesToUpload.length -1].name) {
                            if(_.isEmpty(this.uploadFailedFileList)) {
                                this.uploadMessage['content'] = 'Upload files successfully!';
                                this.uploadMessage['color'] = 'green';
                            } else {
                                this.uploadMessage['content'] = 'Sorry, files ' + this.uploadFailedFileList.join(', ') +
                                    ' are failed to upload. Please check file format or try it later!';
                                this.uploadMessage['color'] = 'red';
                            }
                        }
                    });
                }
            };
        }, this);
    }
    fileChanged($event) {
        this.uploadMessage['content'] = '';
        this.filesToUpload = $event.target.files;
    }
}
