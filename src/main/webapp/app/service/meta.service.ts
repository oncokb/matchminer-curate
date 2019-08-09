import { Injectable } from '@angular/core';
import { Meta } from '../meta/meta.model';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';

@Injectable()
export class MetaService {
    private authorizedSource = new BehaviorSubject<boolean>(false);
    private metaListSource = new BehaviorSubject<Array<Meta>>([]);
    metaListObs = this.metaListSource.asObservable();
    metaRef: AngularFireObject<any>;
    metaList: Array<Meta> = [];
    metaListIds: string[] = [];

    constructor(public db: AngularFireDatabase) {
        this.metaRef = db.object('Meta');
    }

    fetchMetas() {
        this.metaRef.snapshotChanges().subscribe( ( action ) => {
            this.authorizedSource.next(true);
            this.metaList = [];
            for (const id of _.keys(action.payload.val())) {
                this.metaListIds.push(id);
                this.metaList.push(action.payload.val()[id]);
            }
            this.metaListSource.next(this.metaList);
        }, ( error ) => {
            this.authorizedSource.next( false );
        } );
    }

    setMetaRecord(data: Meta) {
        let metaId = '';
        if (this.metaListIds.includes(data.protocol_no)) {
            metaId = data.protocol_no;
        } else if (this.metaListIds.includes(data.nct_id)) {
            metaId = data.nct_id;
        } else {
            metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        }
        this.db.object( 'Meta/' + metaId).set( data )
        .then((res) => {})
        .catch( ( error ) => {
            console.log('Failed to update Meta ' + metaId + ' to DB ', error);
        });
    }

    updateMetaRecord(key: string, data: Meta) {
        const metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        this.db.object( 'Meta/' + metaId + '/' + key).set( data[key] )
        .then((res) => {})
        .catch( ( error ) => {
            console.log('Failed to update Meta ' + metaId + ' to DB ', error);
        });
    }

}
