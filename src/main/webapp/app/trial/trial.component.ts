import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import MainUtil from '../service/mainutil';
import * as _ from 'lodash';
import { Additional, Message, Trial } from './trial.model';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../service/connection.service';
import { MetaService } from '../service/meta.service';
import { Meta } from '../meta/meta.model';
import { saveAs } from 'file-saver';

@Component( {
    selector: 'jhi-trial',
    templateUrl: './trial.component.html',
    styleUrls: [ 'trial.scss' ]
} )

export class TrialComponent implements OnInit, AfterViewInit {
    oncokb = MainUtil.oncokb;
    isPermitted = MainUtil.isPermitted;
    @ViewChild( DataTableDirective )
    dtElement: DataTableDirective;
    trialsToImport = '';
    nctIdChosen = '';
    messages: string[] = [];
    trialList: Trial[] = [];
    trialChosen: Trial;
    additionalInput: Additional;
    additionalChosen: Additional;
    additionalsObject = {};
    noteEditable = false;
    trialListIds: string[] = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    hideArchived = 'Yes';
    statusOptions = this.trialService.getStatusOptions();
    originalTrial = {};
    protocolNoMessage: Message = {
        content: '',
        color: ''
    };
    protocolAccessedMessage: Message = {
        content: '',
        color: ''
    };
    @ViewChild( 'selectModel' ) private selectModel: NgModel;

    constructor( private trialService: TrialService, private metaService: MetaService, public db: AngularFireDatabase,
        private connectionService: ConnectionService, private router: Router ) {
        this.trialService.nctIdChosenObs.subscribe( ( message ) => this.nctIdChosen = message );
        this.trialService.trialChosenObs.subscribe( ( message ) => this.trialChosen = message );
        this.trialService.trialListObs.subscribe( ( message ) => {
            this.trialList = message;
            this.trialListIds = this.trialService.trialListIds;
            this.rerender();
        } );
        this.trialService.additionalChosenObs.subscribe( ( message ) => this.additionalChosen = message );
        this.trialService.additionalObs.subscribe( ( message ) => {
            this.additionalsObject = message;
        } );
    }
    ngOnInit(): void {
        $.fn[ 'dataTable' ].ext.search.push( ( settings, data ) => {
            if ( this.hideArchived === 'Yes' && data[ 5 ] === 'Yes' ) {
                return false;
            } else if ( this.hideArchived === 'No' && data[ 5 ] === 'No' ) {
                return false;
            } else {
                return true;
            }
        } );
        this.dtOptions = {
            paging: true,
            scrollY: '300',
            columns: [
                { 'width': '15%' },
                { 'width': '10%' },
                { 'width': '15%' },
                { 'width': '40%' },
                { 'width': '10%' },
                { 'width': '10%' }
            ]
        };
        this.nctIdChosen = '';
        this.trialChosen = MainUtil.createTrial();
        this.messages = [];
        if ( this.router.url.includes( 'NCT' ) ) {
            const urlArray = this.router.url.split( '/' );
            const nctId = urlArray[ 2 ];
            let protocolNo = '';
            if (urlArray.length > 3) {
                protocolNo = urlArray[ 3 ];
            }
            if (this.trialListIds.includes(nctId)) {
                this.curateTrial( nctId );
            } else {
                this.importTrialsFromNct(nctId, {protocol_no : protocolNo});
            }

        }
    }
    importTrials() {
        this.messages = [];
        this.clearMessages();
        const newTrials: Array<string> = this.trialsToImport.split( ',' );
        let nctId = '';
        for ( const newTrial of newTrials ) {
            const tempTrial = newTrial.trim();
            if ( tempTrial.length === 0 ) {
                continue;
            } else if ( tempTrial.match( /(NCT|nct)[0-9]+/g ) ) {
                nctId = tempTrial;
                if ( this.trialListIds.includes( tempTrial ) ) {
                    if (!this.isRedownloadTrial(tempTrial)) {
                        continue;
                    }
                }
                this.importTrialsFromNct(nctId);
            } else if ( tempTrial.match( /^\d+-\d+$/g ) && this.oncokb) {
                this.connectionService.getTrialByProtocolNo( tempTrial ).subscribe( ( res ) => {
                    nctId = res['tds_data']['nct_id'];
                    if ( this.trialListIds.includes( nctId ) ) {
                        if (!this.isRedownloadTrial(tempTrial + '/' + nctId)) {
                            return;
                        }
                    }
                    const mskInfo = {
                        protocol_no: res['msk_id'],
                        principal_investigator: {
                            full_name: res['tds_data']['primary_investigator']['full_name'],
                            credentials: res['tds_data']['primary_investigator']['credentials'],
                            email: res['tds_data']['primary_investigator']['email'],
                            url: res['tds_data']['primary_investigator']['msk_url']
                        }
                    };
                    this.importTrialsFromNct(nctId, mskInfo);
                }, ( error ) => {
                    this.messages.push( tempTrial + ' not found' );
                });
            } else {
                this.messages.push( tempTrial + ' is invalid trial format' );
                continue;
            }
        }
        this.trialsToImport = '';
    }

    isRedownloadTrial(id: string) {
        return confirm( 'Trial ' + id + ' has been loaded in database. ' +
                'Are you sure you want to overwrite this trial by loading file ' + id + '?' );
    }

    importTrialsFromNct(nctId: string, extraInfo?: object) {
        let setChosenTrial = false;
        this.connectionService.importTrials( nctId ).subscribe( ( res ) => {
            const trialInfo = res;
            const armsInfo: any = [];
            _.forEach( trialInfo[ 'arms' ], function( arm ) {
                if ( arm.arm_description !== null ) {
                    armsInfo.push( {
                        arm_description: MainUtil.normalizeText(arm.arm_name),
                        arm_info: arm.arm_description,
                        drugs: [[]],
                        match: []
                    } );
                }
            } );
            const trial: Trial = {
                curation_status: 'In progress',
                archived: 'No',
                protocol_no: '',
                nct_id: trialInfo[ 'nct_id' ],
                principal_investigator: {
                    full_name: trialInfo[ 'principal_investigator' ]
                },
                long_title: trialInfo[ 'official_title' ],
                short_title: trialInfo[ 'brief_title' ],
                phase: trialInfo[ 'phase' ][ 'phase' ],
                status: trialInfo[ 'current_trial_status' ],
                treatment_list: {
                    step: [ {
                        arm: armsInfo,
                        match: []
                    } ]
                }
            };
            if (extraInfo) {
                _.forEach(extraInfo, (value, key) => {
                    trial[key] = value;
                });
            }
            this.db.object( 'Trials/' + trial.nct_id ).set( trial ).then( ( response ) => {
                this.messages.push( 'Successfully imported ' + trial.nct_id );
                if (this.oncokb) {
                    const metaRecord: Meta = {
                        protocol_no: trial.protocol_no,
                        nct_id: trial.nct_id,
                        title: trial.long_title,
                        status: trial.status,
                        precision_medicine: 'YES',
                        curated: 'YES'
                    };
                    this.metaService.setMetaRecord(metaRecord);
                }
                if ( setChosenTrial === false ) {
                    this.nctIdChosen = trial.nct_id;
                    this.trialService.setTrialChosen( this.nctIdChosen );
                    this.originalTrial = _.clone(this.trialChosen);
                    setChosenTrial = true;
                }
            } ).catch( ( error ) => {
                this.messages.push( 'Fail to save to database ' + nctId );
            } );
        }, ( error ) => {
            this.messages.push( nctId + ' not found' );
        } );
    }
    updateStatus( type: string ) {
        if ( type === 'curation' ) {
            this.db.object( 'Trials/' + this.nctIdChosen ).update( {
                curation_status: this.trialChosen[ 'curation_status' ]
            } ).then( ( result ) => {
                console.log( 'success saving curation status' );
            } ).catch( ( error ) => {
                console.log( 'error', error );
            } );
        } else if ( type === 'archive' ) {
            this.db.object( 'Trials/' + this.nctIdChosen ).update( {
                archived: this.trialChosen[ 'archived' ]
            } ).then( ( result ) => {
                console.log( 'success saving archive status' );
                if ( this.trialChosen[ 'archived' ] === 'Yes' ) {
                    this.curateTrial( '' );
                }
            } ).catch( ( error ) => {
                console.log( 'error', error );
            } );
        } else if ( type === 'hideArchived' ) {
            this.dtElement.dtInstance.then( ( dtInstance: DataTables.Api ) => {
                dtInstance.draw();
            } );
        }
    }
    curateTrial( nctId: string ) {
        this.clearMessages();
        this.clearAdditional();
        this.trialService.setTrialChosen( nctId );
        this.trialService.setAdditionalChosen( nctId );
        this.originalTrial = _.clone(this.trialChosen);
        document.querySelector( '#trialDetail' ).scrollIntoView();
    }
    clearAdditional() {
        this.additionalChosen = { note: '' };
    }
    getStatus( status: string ) {
        let color = '';
        if (status === 'Completed') {
            color = 'green';
        } else if (status === 'In progress') {
            color = 'red';
        } else {
            color = '#3E8ACC';
        }
        return { 'color': color };
    }
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    rerender(): void {
        if ( ! _.isUndefined( this.dtElement ) ) {
            this.dtElement.dtInstance.then( ( dtInstance: DataTables.Api ) => {
                // Destroy the table first
                dtInstance.destroy();
                // Call the dtTrigger to rerender again
                this.dtTrigger.next();
            } );
        }
    }
    updateTrialStatusInDB() {
        if ( this.originalTrial['status'] !== this.trialChosen[ 'status' ] ) {
            this.trialService.getRef( 'Trials/' + this.nctIdChosen + '/status' ).set( this.trialChosen[ 'status' ] ).then( ( result ) => {
                console.log( 'Save to DB Successfully!' );
            } ).catch( ( error ) => {
                console.log( 'Failed to save to DB ', error );
                const errorMessage = 'Sorry, the trial status is failed to save to database.';
                this.trialService.saveErrors(
                    errorMessage,
                    {
                        nctId: this.trialChosen[ 'nct_id' ],
                        oldContent: 'trial status: ' + this.originalTrial[ 'status' ],
                        newContent: 'trial status: ' + this.trialChosen[ 'status' ]
                    },
                    error
                );
                alert( errorMessage );
                // Rollback the trial status in ng-select option
                this.selectModel.reset( this.originalTrial[ 'status' ] );
                this.trialChosen[ 'status' ] = this.originalTrial[ 'status' ];
            } );
        }
    }
    editNote() {
        this.noteEditable = true;
        // We have to use _.clone to make a copy of additionalChosen.
        // Otherwise, its value will be effected by additionalInput when we make changes but not save them.
        const additionalToEdit = _.clone( this.additionalChosen );
        this.additionalInput = additionalToEdit;
    }
    updateNote() {
        this.trialService.getRef( 'Additional/' + this.nctIdChosen + '/note' ).set( this.additionalInput.note ).then( ( result ) => {
            console.log( 'Save Additional Info to DB Successfully!' );
            this.cancelUpdateNote();
            this.trialService.setAdditionalChosen( this.nctIdChosen );
        } ).catch( ( error ) => {
            console.log( 'Failed to save Additional Info to DB ', error );
            const errorMessage = 'Sorry, the Additional Info is failed to save to database.';
            alert( errorMessage );
        } );
    }
    cancelUpdateNote() {
        this.noteEditable = false;
    }
    updateProtocolNo() {
        if (this.originalTrial['protocol_no'] !== this.trialChosen['protocol_no']) {
            if ( this.trialChosen['protocol_no'].match( /^\d+-\d+$/g ) ) {
                const result = confirm('Are you sure to update Protocol No. to ' + this.trialChosen['protocol_no'] + '?');
                if (result) {
                    this.trialService.getRef( 'Trials/' + this.nctIdChosen ).update( {protocol_no: this.trialChosen['protocol_no']} )
                    .then((res) => {
                        this.protocolNoMessage = {
                            content: 'Update Protocol No. successfully.',
                            color: 'green'
                        };
                    })
                    .catch( ( error ) => {
                        this.protocolNoMessage = {
                            content: 'Failed to update Protocol No.',
                            color: 'red'
                        };
                        this.trialChosen['protocol_no'] = this.originalTrial['protocol_no'];
                    } );
                }
            } else {
                this.protocolNoMessage = {
                    content: 'Protocol No. should follow the format: number-number.',
                    color: 'red'
                };
                this.trialChosen['protocol_no'] = this.originalTrial['protocol_no'];
            }
        }
    }
    clearMessages() {
        const emptyMessage: Message = {
            content: '',
            color: ''
        };
        this.protocolAccessedMessage = emptyMessage;
        this.protocolNoMessage = emptyMessage;
    }
    clearMessageByName(name: string) {
        if (name === 'protocolAccessed') {
            this.protocolAccessedMessage = {
                content: '',
                color: ''
            };
        } else if (name === 'protocolNo') {
            this.protocolNoMessage = {
                content: '',
                color: ''
            };
        }
    }
    download() {
        const content = [];
        const headers = ['Nct Id', 'Protocol No', 'Status', 'Title', 'Curation Status', 'Archived'];
        content.push(headers.join('\t'));
        this.trialList.map((row) => {
            content.push([row['nct_id'], row['protocol_no'], row['status'], row['short_title'].replace(/\n/g, ''), row['curation_status'], row['archived']].join('\t'));
        });
        const blob = new Blob([content.join('\n')], {
            type: 'text/plain;charset=utf-8;',
        });
        saveAs(blob, 'TrialTable.xls');
    }
    updateProtocolAccessedDate() {
        const nowTimestamp = MainUtil.updateTimestampByToday();
        this.trialService.getRef( 'Trials/' + this.nctIdChosen ).update( {protocol_accessed: nowTimestamp} )
        .then((res) => {
            this.trialChosen.protocol_accessed = nowTimestamp;
            this.clearMessageByName('protocolAccessed');
        })
        .catch( ( error ) => {
            this.protocolAccessedMessage = {
                content: 'Failed to update Last Update.',
                color: 'red'
            };
        });
    }
}
