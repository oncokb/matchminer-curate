import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Trial } from '../trial/trial.model';
import { Http, Response } from '@angular/http';
import * as _ from 'underscore';
@Injectable()
export class TrialService {
    trialsCollection: AngularFirestoreCollection<Trial>;
    trialList = [];
    nctIdList: Array<string> = [];
    trialChosen: Observable<Trial[]>;
    nctIdChosen = '';
    pathPool: Array<string> = [];
    modificationInput = {
        hugo_symbol: '',
        oncokb_variant: '',
        protein_change: '',
        wildcard_protein_change: '',
        variant_classification: '',
        variant_category: '',
        exon: '',
        cnv_call: '',
        wildtype: '',
        age_numerical: '',
        oncotree_diagnosis: ''
    }
    mainTypes = [];
    oncokb_variants = {};
    constructor(public afs: AngularFirestore, public http: Http) {
        this.trialsCollection = afs.collection<Trial>('Trials');
        this.trialsCollection.snapshotChanges().map(changes => {
            return changes.map(a => {
                const data = a.payload.doc.data() as Trial;
                return data;
            });
        }).subscribe(trials => {
            for (const trial of trials) {
                if (this.nctIdList.indexOf(trial.nct_id) === -1) {
                    this.nctIdList.push(trial.nct_id);
                }
            }
            this.trialList = trials;
        });
        // prepare main types list
        this.http.get('http://oncotree.mskcc.org/oncotree/api/mainTypes')
        .subscribe((res: Response) => {
            for (const item of res.json().data) {
                this.mainTypes.push(item.name);
            }
            this.mainTypes = _.uniq(this.mainTypes);
        });
        // prepare oncokb variant list
        this.http.get('http://oncokb.org/api/v1/utils/allAnnotatedVariants')
        .subscribe((res: Response) => {
           const allAnnotatedVariants = res.json();
           for(const item of  allAnnotatedVariants) {
                if (item['gene']) {
                    if (this.oncokb_variants[item['gene']]) {
                        this.oncokb_variants[item['gene']].push(item['variant']);
                    } else {
                        this.oncokb_variants[item['gene']] = [item['variant']];
                    }
                }     
           }
           for(const key of _.keys(this.oncokb_variants)) {
                this.oncokb_variants[key].sort();
           }
        });
    }
    getNctIdList() {
        return this.nctIdList;
    }
    getTrialList() {
        return this.trialList;
    }
    getTrialsCollection() {
        return this.trialsCollection;
    }
    getChosenTrialDoc(nctId: string) {
        return this.afs.collection<Trial>('Trials', ref => ref.where('nct_id', '==', nctId)).valueChanges();
    }
    getChosenTrialJSON(nctId: string) {
        for (const currentTrial of this.trialList) {
            if (currentTrial.nct_id === nctId) {
                return currentTrial;
            }
        }
    }
    setNctIdChosen(nctId: string) {
        this.nctIdChosen = nctId;
    }
    getNctIdChosen() {
        return this.nctIdChosen;
    }
    getPathpool() {
        return this.pathPool;
    }
    getModificationInput() {
        return this.modificationInput;
    }
    setModificationInput(obj: any, type: string) {
        if (type === 'genomic') {
            this.modificationInput.hugo_symbol = obj.hugo_symbol;
            this.modificationInput.oncokb_variant = obj.oncokb_variant;
            this.modificationInput.protein_change = obj.protein_change;
            this.modificationInput.wildcard_protein_change = obj.wildcard_protein_change;
            this.modificationInput.variant_classification = obj.variant_classification;
            this.modificationInput.variant_category = obj.variant_category;
            this.modificationInput.exon = obj.exon;
            this.modificationInput.cnv_call = obj.cnv_call;
            this.modificationInput.wildtype = obj.wildtype;
        } else if (type === 'clinical') {
            this.modificationInput.age_numerical = obj.age_numerical;
            this.modificationInput.oncotree_diagnosis = obj.oncotree_diagnosis;
        }
    }
    getStyle(indent: number) {
        return { 'margin-left': (indent * 30) + 'px' };
    }
    getMainTypes() {
        return this.mainTypes;
    }
    getOncokbVariants() {
        return this.oncokb_variants;
    }
}
