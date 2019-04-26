import { EventEmitter, Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Meta } from '../meta/meta.model';
import * as _ from 'lodash';

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

    setMetaCurated(protocolNo: string, data: object) {
        this.db.object('Meta/' + protocolNo).set(data).then((result) => {
        }).catch((error) => {
            console.log('Failed to save Meta' + protocolNo + ' to DB ', error);
        });
    }
    updateMeta(key: string, data: Meta) {
        this.db.object( 'Meta/' + data['protocol_no'] + '/' + key ).set( data[key] )
        .then((res) => {})
        .catch( ( error ) => {
            console.log(error);
        });
    }

    onMetaDestory() {
        const self = this;
        _.forEach(this.metasToUpdate, function(meta){
            self.updateMeta('precision_medicine', meta);
        });
    }

}
