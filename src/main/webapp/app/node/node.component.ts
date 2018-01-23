import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
@Component({
    selector: 'jhi-node',
    templateUrl: './node.component.html',
    styleUrls: ['node.scss']
})
export class NodeComponent implements OnInit {
    @Input() path = '';
    @Input() type = '';
    @Input() unit = {};
    nctId = this.trialService.getNctIdChosen();
    finalPath = [];
    message = '';
    addNode = false;
    nodeOptions: Array<string> = ['Genomic', 'Clinical', 'And', 'Or'];
    nodeType = '';
    selectedItems = [];
    pathPool = this.trialService.getPathpool();
    dropdownList = [
        { id: 1, itemName: 'Genomic' },
        { id: 2, itemName: 'Clinical' },
        { id: 3, itemName: 'And' },
        { id: 4, itemName: 'Or' }];
    // input = {
    //     hugo_symbol: '',
    //     oncokb_variant: '',
    //     protein_change: '',
    //     wildcard_protein_change: '',
    //     variant_classification: '',
    //     variant_category: '',
    //     exon: '',
    //     cnv_call: '',
    //     wildtype: '',
    //     age_numerical: '',
    //     oncotree_diagnosis: ''
    // }
    modificationInput = this.trialService.getModificationInput();
    input = this.trialService.getInput();
    trialsCollection = this.trialService.getTrialsCollection();
    originalMatch = this.trialService.getChosenTrialJSON(this.nctId).treatment_list.step.match;
    originalArms = this.trialService.getChosenTrialJSON(this.nctId).treatment_list.step.arms;
    dataToModify = [];
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    preparePath() {
        const pathArr = _.without(this.path.split(','), '');
        let locationToChange: any = [];
        if (pathArr[0] === 'match') {
            locationToChange = this.originalMatch;
            this.dataToModify = this.originalMatch;
            pathArr.shift();
        } else if (pathArr[0] === 'arm') {
            locationToChange = this.originalArms[pathArr[1]].match;
            this.dataToModify = this.originalArms[pathArr[1]].match;
            pathArr.shift();
            pathArr.shift();
        }
        this.message = '';
        this.finalPath = [];
        for (let i = 0; i < pathArr.length; i++) {
            const point = pathArr[i].trim();
            this.finalPath.push(point);
            if (point.length > 0 && locationToChange[point]) {
                locationToChange = locationToChange[point];
                if (locationToChange.and) {
                    locationToChange = locationToChange.and;
                    this.finalPath.push('and');
                } else if (locationToChange.or) {
                    locationToChange = locationToChange.or;
                    this.finalPath.push('or');
                } else {
                    // case: the first time add nodes to match under each arm
                    //this.dataToModify = this.dataToModify[point].match;
                }
            }
        }
    }
    modifyNode(type: string) {
        let result = true;
        if (type === 'delete') {
            result = confirm('Are you sure you want to delte this section?');
        }
        if (result) {
            this.preparePath();
            this.modifyData(this.dataToModify, this.finalPath, type);
            this.trialsCollection.doc(this.nctId).update({
                treatment_list: {
                    step: {
                        arms: this.originalArms,
                        match: this.originalMatch
                    }
                }
            });
        }
    }
    modifyData(obj: Array<any>, path: Array<string>, type: string) {
        switch (type) {
            case 'delete':
                // different condition check between and/or node and genomic/clinical node
                if (path.length === 2 && (path[1] === 'and' || path[1] === 'or') || path.length === 1) {
                    obj.splice(Number(path[0]), 1);
                } else {
                    const index = path.shift();
                    this.modifyData(obj[index], path, type);
                }
                break;
            case 'update':
                if (path.length === 1) {
                    if (obj[path[0]].hasOwnProperty('genomic')) {
                        this.updateNode(obj[path[0]], 'genomic');
                    } else if (obj[path[0]].hasOwnProperty('clinical')) {
                        this.updateNode(obj[path[0]], 'clinical');
                    }
                } else {
                    const index = path.shift();
                    this.modifyData(obj[index], path, type);
                }
                break;
            case 'add':
                if (path.length === 0) {
                    this.addNewNode(obj);
                } else if (path.length === 1) {
                    if (obj.hasOwnProperty('and')) {
                        this.addNewNode(obj['and']);
                    } else if (obj.hasOwnProperty('or')) {
                        this.addNewNode(obj['or']);
                    }
                } else {
                    const index = path.shift();
                    this.modifyData(obj[index], path, type);
                }
                break;
        }
    }
    clearInput() {
        this.selectedItems = [];
        this.addNode = false;
        this.nodeType = '';
        this.input = {
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
    }
    addNewNode(obj: Array<any>) {
        switch (this.nodeType) {
            case 'Genomic':
                obj.push({
                    genomic: {
                        hugo_symbol: this.input.hugo_symbol,
                        oncokb_variant: this.input.oncokb_variant,
                        protein_change: this.input.protein_change,
                        wildcard_protein_change: this.input.wildcard_protein_change,
                        variant_classification: this.input.variant_classification,
                        variant_category: this.input.variant_category,
                        exon: this.input.exon,
                        cnv_call: this.input.cnv_call,
                        wildtype: this.input.wildtype
                    }
                });
                break;
            case 'Clinical':
                obj.push({
                    clinical: {
                        age_numerical: this.input.age_numerical,
                        oncotree_diagnosis: this.input.oncotree_diagnosis
                    }
                });
                break;
            case 'And':
            case 'Or':
                let tempObj1: any = [];
                for (let item of this.selectedItems) {
                    switch (item.itemName) {
                        case 'Genomic':
                            tempObj1.push({
                                genomic: {
                                    hugo_symbol: this.input.hugo_symbol,
                                    oncokb_variant: this.input.oncokb_variant,
                                    protein_change: this.input.protein_change,
                                    wildcard_protein_change: this.input.wildcard_protein_change,
                                    variant_classification: this.input.variant_classification,
                                    variant_category: this.input.variant_category,
                                    exon: this.input.exon,
                                    cnv_call: this.input.cnv_call,
                                    wildtype: this.input.wildtype
                                }
                            });
                            break;
                        case 'Clinical':
                            tempObj1.push({
                                clinical: {
                                    age_numerical: this.input.age_numerical,
                                    oncotree_diagnosis: this.input.oncotree_diagnosis
                                }
                            });
                            break;
                        case 'And':
                            tempObj1.push({
                                and: []
                            });
                            break;
                        case 'Or':
                            tempObj1.push({
                                or: []
                            });
                            break;
                    }
                }
                let tempObj2: any = {};
                if (this.nodeType === 'And') {
                    tempObj2.and = tempObj1;
                } else if (this.nodeType === 'Or') {
                    tempObj2.or = tempObj1;
                }
                obj.push(tempObj2);
                break;

        }
        obj.sort(this.sortModifiedArray);
    }
    updateNode(obj: any, type: string) {
        if (type === 'genomic') {
            obj['genomic'] = {
                hugo_symbol: this.modificationInput.hugo_symbol,
                oncokb_variant: this.modificationInput.oncokb_variant,
                protein_change: this.modificationInput.protein_change,
                wildcard_protein_change: this.modificationInput.wildcard_protein_change,
                variant_classification: this.modificationInput.variant_classification,
                variant_category: this.modificationInput.variant_category,
                exon: this.modificationInput.exon,
                cnv_call: this.modificationInput.cnv_call,
                wildtype: this.modificationInput.wildtype
            };
        } else if (type === 'clinical') {
            obj['clinical'] = {
                age_numerical: this.modificationInput.age_numerical,
                oncotree_diagnosis: this.modificationInput.oncotree_diagnosis
            }
        }
    }
    sortModifiedArray(a: object, b: object) {
        const keys = ['genomic', 'clinical', 'and', 'or'];
        return keys.indexOf(Object.keys(a)[0]) - keys.indexOf(Object.keys(b)[0]);
    }
    editNode() {
        if (this.pathPool.indexOf(this.path) === -1) {
            this.pathPool.push(this.path);
        }
        if (this.unit.hasOwnProperty('genomic')) {
            this.trialService.setModificationInput(this.unit['genomic'], 'genomic');
        } else if (this.unit.hasOwnProperty('clinical')) {
            this.trialService.setModificationInput(this.unit['clinical'], 'clinical');
        }
    }
    cancelModification() {
        this.pathPool.splice(this.pathPool.indexOf(this.path), 1);
    }
    saveModification() {
        this.pathPool.splice(this.pathPool.indexOf(this.path), 1);
        this.modifyNode('update');
    }

}
