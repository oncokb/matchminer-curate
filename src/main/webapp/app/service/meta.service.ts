import { EventEmitter, Injectable } from '@angular/core';
import { Meta } from '../meta/meta.model';
import * as _ from 'lodash';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class MetaService {
    onDestroyEvent: EventEmitter<string> = new EventEmitter();
    metasToUpdate: any = {};

    constructor(public db: AngularFireDatabase) {
        this.onDestroyEvent.subscribe((data) => {
            if (!_.isEmpty(this.metasToUpdate)) {
                this.onMetaDestory();
            }
        });
    }

    setMetaCurated(data: Meta) {
        const metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        this.db.object('Meta/' + metaId).set(data).then((result) => {
        }).catch((error) => {
            console.log('Failed to save Meta' + metaId + ' to DB ', error);
        });
    }
    updateMeta(data: Meta) {
        const metaId = data.protocol_no.length > 0 ? data.protocol_no : data.nct_id;
        this.db.object( 'Meta/' + metaId).set( data )
        .then((res) => {})
        .catch( ( error ) => {
            console.log('Failed to update Meta ' + metaId + ' to DB ', error);
        });
    }

    onMetaDestory() {
        const self = this;
        _.forEach(this.metasToUpdate, function(meta){
            self.updateMeta(meta);
        });
    }

}
