import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { TrialService } from '../service/trial.service';
import * as _ from 'lodash';
import { Additional, Trial } from './trial.model';
import '../../../../../node_modules/jquery/dist/jquery.js';
import '../../../../../node_modules/datatables.net/js/jquery.dataTables.js';
import { Subject } from 'rxjs/Subject';
import { DataTableDirective } from 'angular-datatables';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../service/connection.service';
import { MetaService } from '../service/meta.service';

@Component( {
    selector: 'jhi-trial',
    templateUrl: './trial.component.html',
    styleUrls: [ 'trial.scss' ]
} )

export class TrialComponent implements OnInit, AfterViewInit {
    @ViewChild( DataTableDirective )
    dtElement: DataTableDirective;
    trialsToImport = '';
    nctIdChosen = '';
    messages: Array<string> = [];
    trialList: Array<Trial> = [];
    trialChosen = {};
    additionalInput: Additional;
    additionalChosen: Additional;
    additionalsObject = {};
    noteEditable = false;
    nctIdList = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    hideArchived = 'Yes';
    statusOptions = this.trialService.getStatusOptions();
    originalTrial = {};
    isPermitted = this.trialService.isPermitted;
    protocolNoMessage = {
        content: '',
        color: ''
    };
    mongoMessage = {
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
            this.nctIdList = _.map( this.trialList, function( trial ) {
                return trial.nct_id;
            } );
            this.rerender();
        } );
        this.trialService.additionalChosenObs.subscribe( ( message ) => this.additionalChosen = message );
        this.trialService.additionalObs.subscribe( ( message ) => {
            this.additionalsObject = message;
        } );
    }
    ngOnInit(): void {
        $.fn[ 'dataTable' ].ext.search.push( ( settings, data ) => {
            if ( this.hideArchived === 'Yes' && data[ 4 ] === 'Yes' ) {
                return false;
            } else if ( this.hideArchived === 'No' && data[ 4 ] === 'No' ) {
                return false;
            } else {
                return true;
            }
        } );
        this.dtOptions = {
            paging: false,
            scrollY: '300',
            columns: [
                { 'width': '16%' },
                { 'width': '10%' },
                null,
                null,
                null,
                null
            ]
        };
        if ( this.router.url.includes( 'NCT' ) ) {
            const urlArray = this.router.url.split( '/' );
            const nctId = urlArray[ 2 ];
            let protocolNo = '';
            if (urlArray.length > 3) {
                protocolNo = urlArray[ 3 ];
            }
            if (this.nctIdList.includes(nctId)) {
                this.curateTrial( nctId );
            } else {
                this.importTrialsFromNct(nctId, protocolNo);
            }

        }
    }
    importTrials() {
        this.messages = [];
        // this.mongoMessage.content = '';
        this.protocolNoMessage.content = '';
        const newTrials: Array<string> = this.trialsToImport.split( ',' );
        let result = true;
        let nctId = '';
        let protocolNo = '';
        for ( const newTrial of newTrials ) {
            const tempTrial = newTrial.trim();
            if ( tempTrial.length === 0 ) {
                continue;
            }
            if ( this.nctIdList.indexOf( tempTrial ) !== - 1 ) {
                result = confirm( 'Trial ' + tempTrial + ' has been loaded in database. ' +
                    'Are you sure you want to overwrite this trial by loading file ' + tempTrial + '?' );
            }
            if ( ! result ) {
                continue;
            }
            if ( tempTrial.match( /NCT[0-9]+/g ) ) {
                nctId = tempTrial;
                this.importTrialsFromNct(nctId, '');
            } else if ( tempTrial.match( /^\d+-\d+$/g ) ) {
                this.connectionService.getTrialByProtocolNo( tempTrial ).subscribe( ( res ) => {
                    protocolNo = res['msk_id'];
                    nctId = res['tds_data']['nct_id'];
                    this.importTrialsFromNct(nctId, protocolNo);
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

    importTrialsFromNct(nctId: string, protocolNo: string) {
        let setChosenTrial = false;
        this.connectionService.importTrials( nctId ).subscribe( ( res ) => {
            const trialInfo = res;
            const armsInfo: any = [];
            _.forEach( trialInfo[ 'arms' ], function( arm ) {
                if ( arm.arm_description !== null ) {
                    armsInfo.push( {
                        arm_description: arm.arm_name,
                        arm_info: arm.arm_description,
                        match: []
                    } );
                }
            } );
            const trial: Trial = {
                curation_status: 'In progress',
                archived: 'No',
                protocol_no: protocolNo,
                nct_id: trialInfo[ 'nct_id' ],
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
            this.db.object( 'Trials/' + trialInfo[ 'nct_id' ] ).set( trial ).then( ( response ) => {
                this.messages.push( 'Successfully imported ' + trialInfo[ 'nct_id' ] );
                if (protocolNo.length > 0) {
                    const metaRecord = {
                        protocol_no: protocolNo,
                        nct_id: trialInfo[ 'nct_id' ],
                        title: trialInfo[ 'brief_title' ],
                        status: trialInfo[ 'current_trial_status' ],
                        precision_medicine: 'YES',
                        curated: 'YES'
                    };
                    this.metaService.setMetaCurated(protocolNo, metaRecord);
                }
                if ( setChosenTrial === false ) {
                    this.nctIdChosen = trialInfo[ 'nct_id' ];
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
        // this.mongoMessage.content = '';
        this.protocolNoMessage.content = '';
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
        if ( this.trialChosen['protocol_no'].match( /^\d+-\d+$/g ) ) {
            const result = confirm('Are you sure to update Protocol No. to ' + this.trialChosen['protocol_no'] + '?');
            if (result) {
                this.trialService.getRef( 'Trials/' + this.nctIdChosen ).update( {protocol_no: this.trialChosen['protocol_no']} )
                .then((res) => {
                    this.protocolNoMessage.content = 'Update Protocol No. successfully.';
                    this.protocolNoMessage.color = 'green';
                })
                .catch( ( error ) => {
                    this.protocolNoMessage.content = 'Failed to update Protocol No.';
                    this.protocolNoMessage.color = 'red';
                    this.trialChosen['protocol_no'] = this.originalTrial['protocol_no'];
                } );
            }
        } else {
            this.protocolNoMessage.content = 'Protocol No. should follow the format: number-number.';
            this.protocolNoMessage.color = 'red';
            this.trialChosen['protocol_no'] = this.originalTrial['protocol_no'];
        }
    }
    clearMessage(type: string) {
        if (type === 'protocol_no') {
            this.protocolNoMessage.content = '';
            this.protocolNoMessage.color = '';
        }
    }
    loadMongo() {
        this.mongoMessage.content = 'Loading the trial ......';
        this.mongoMessage.color = '#ffc107';
        this.connectionService.loadMongo( this.trialChosen ).subscribe( ( res ) => {
            if ( res.status === 200 ) {
                if ( this.trialChosen[ 'archived' ] === 'Yes' ) {
                    // Remove archived trials from database
                    alert( 'This archived trial has been removed from database.' );
                    return;
                }
                this.mongoMessage.content = 'Send trial ' + this.nctIdChosen + ' successfully!';
                this.mongoMessage.color = 'green';
            }
        }, ( error ) => {
            this.mongoMessage.content = 'Request for sending trial ' + this.nctIdChosen + ' failed!';
            this.mongoMessage.color = 'red';
            return Observable.throw( error );
        } );
    }
}
