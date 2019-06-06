import { Injectable } from '@angular/core';
import { Meta } from '../meta/meta.model';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class MetaService {

    constructor(public db: AngularFireDatabase) {}

    createMetaRecord(data: Meta) {
        const metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        this.db.object( 'Meta/' + metaId).set( data )
        .then((res) => {})
        .catch( ( error ) => {
            console.log('Failed to update Meta ' + metaId + ' to DB ', error);
        });
    }

    updateMeta(key: string, data: Meta) {
        const metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        this.db.object( 'Meta/' + metaId + '/' + key).set( data[key] )
        .then((res) => {})
        .catch( ( error ) => {
            console.log('Failed to update Meta ' + metaId + ' to DB ', error);
        });
    }

}
