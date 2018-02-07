import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
@Component({
    selector: 'jhi-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['panel.scss']
})
export class PanelComponent implements OnInit {
    @Input() path = '';
    // used to manage the icons to be displayed
    @Input() type = '';
    @Input() unit = {};
    nctId = this.trialService.getNctIdChosen();
    finalPath = [];
    message = '';
    addNode = false;
    moving = false;
    nodeOptions: Array<string> = ['Genomic', 'Clinical', 'And', 'Or'];
    nodeType = '';
    selectedItems = [];
    pathPool = this.trialService.getPathpool();
    operationPool = this.trialService.getOperationPool();
    movingPath = this.trialService.getMovingPath();
    dataBlockToMove = {};
    currentPath = this.trialService.getCurrentPath();
    dropdownList = [
        { id: 1, itemName: 'Genomic' },
        { id: 2, itemName: 'Clinical' },
        { id: 3, itemName: 'And' },
        { id: 4, itemName: 'Or' }];
    clinicalInput = this.trialService.getClinicalInput();
    genomicInput = this.trialService.getGenomicInput();
    trialsCollection = this.trialService.getTrialsCollection();
    originalMatch = this.trialService.getChosenTrialJSON(this.nctId).treatment_list.step.match;
    originalArms = this.trialService.getChosenTrialJSON(this.nctId).treatment_list.step.arms;
    dataToModify = [];
    validGenomic = this.trialService.getValidGenomic();
    constructor(private trialService: TrialService) { }

    ngOnInit() {
    }
    preparePath(pathParameter?: string) {
        const pathStr = pathParameter ? pathParameter : this.path;
        const pathArr = _.without(pathStr.split(','), '');
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
        // validate the need to proceed
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
            case 'remove':
                // different condition check between and/or node and genomic/clinical node
                if (path.length === 2 && (path[1] === 'and' || path[1] === 'or') || path.length === 1) {
                    if (type === 'remove') {
                        this.dataBlockToMove = _.clone(obj[path[0]]);
                        obj[path[0]].toBeRemoved = true;
                    } else {
                        obj.splice(Number(path[0]), 1);
                    }
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
            case 'exchange':
                if (path.length === 2) {
                    this.exchangeLogic(obj[path[0]]);
                } else {
                    const index = path.shift();
                    this.modifyData(obj[index], path, type);
                }
                break;    
            default:
                break;
        }
    }
    clearInput() {
        this.selectedItems = [];
        this.addNode = false;
        this.nodeType = '';
    }
    clearInputForm(keys: Array<string>, type: string) {
        if (type === 'Genomic') {
            for (let key of keys) {
                this.trialService.setGenomicInput(key, '');
                this.trialService.setGenomicInput('no_'+key, false);
            }    
        } else if (type === 'Clinical') {
            for (let key of keys) {
                this.trialService.setClinicalInput(key, '');
                this.trialService.setClinicalInput('no_'+key, false);
            }    
        } 
    }
    clearNodeInput() {
        if (this.nodeType === 'Genomic') {
            this.clearInputForm(['hugo_symbol', 'oncokb_variant', 'matching_examples', 'protein_change', 'wildcard_protein_change', 'variant_classification', 'variant_category', 'exon', 'cnv_call'], this.nodeType);
            this.trialService.setGenomicInput('wildtype', '');
        } else if (this.nodeType === 'Clinical') {
            this.clearInputForm(['age_numerical', 'oncotree_diagnosis'], this.nodeType);
            this.trialService.setClinicalInput('main_type', '');
            this.trialService.setClinicalInput('sub_type', '');
        }
    }
    getGenomicValue(key: string) {
        if (this.genomicInput['no_' + key] === true) {
            return '!' + this.genomicInput[key];
        } else {
            return this.genomicInput[key];
        }
    }
    getClinicalValue(key: string) {
        if (this.clinicalInput['no_' + key] === true) {
            return '!' + (key === 'oncotree_diagnosis' ? this.getOncotree() : this.clinicalInput[key]);
        } else {
            return (key === 'oncotree_diagnosis' ? this.getOncotree() : this.clinicalInput[key]);
        }
    }
    getOncotree() {
        let oncotree_diagnosis = '';
        if (this.clinicalInput.sub_type) {
            oncotree_diagnosis = this.clinicalInput.sub_type;
        }else if (this.clinicalInput.main_type) {
            oncotree_diagnosis = this.clinicalInput.main_type;
        }
        return oncotree_diagnosis;
    }
    addNewNode(obj: Array<any>) {
        if (_.isEmpty(this.dataBlockToMove)) {
            switch (this.nodeType) {
                case 'Genomic':
                    obj.push({
                        genomic: {
                            hugo_symbol: this.getGenomicValue('hugo_symbol'),
                            oncokb_variant: this.getGenomicValue('oncokb_variant'),
                            matching_examples: this.getGenomicValue('matching_examples'),
                            protein_change: this.getGenomicValue('protein_change'),
                            wildcard_protein_change: this.getGenomicValue('wildcard_protein_change'),
                            variant_classification: this.getGenomicValue('variant_classification'),
                            variant_category: this.getGenomicValue('variant_category'),
                            exon: this.getGenomicValue('exon'),
                            cnv_call: this.getGenomicValue('cnv_call'),
                            wildtype: this.getGenomicValue('wildtype')
                        }
                    });
                    break;
                case 'Clinical':
                    obj.push({
                        clinical: {
                            age_numerical: this.getClinicalValue('age_numerical'),
                            oncotree_diagnosis: this.getClinicalValue('oncotree_diagnosis'),
                            main_type: this.clinicalInput.main_type,
                            sub_type: this.clinicalInput.sub_type
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
                                        hugo_symbol: this.getGenomicValue('hugo_symbol'),
                                        oncokb_variant: this.getGenomicValue('oncokb_variant'),
                                        matching_examples: this.getGenomicValue('matching_examples'),
                                        protein_change: this.getGenomicValue('protein_change'),
                                        wildcard_protein_change: this.getGenomicValue('wildcard_protein_change'),
                                        variant_classification: this.getGenomicValue('variant_classification'),
                                        variant_category: this.getGenomicValue('variant_category'),
                                        exon: this.getGenomicValue('exon'),
                                        cnv_call: this.getGenomicValue('cnv_call'),
                                        wildtype: this.getGenomicValue('wildtype')
                                    }
                                });
                                break;
                            case 'Clinical':
                                tempObj1.push({
                                    clinical: {
                                        age_numerical: this.getClinicalValue('age_numerical'),
                                        oncotree_diagnosis: this.getClinicalValue('oncotree_diagnosis'),
                                        main_type: this.clinicalInput.main_type,
                                        sub_type: this.clinicalInput.sub_type
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
        } else {
            obj.push(this.dataBlockToMove);
        }
        obj.sort(this.sortModifiedArray);
    }
    updateNode(obj: any, type: string) {
        if (type === 'genomic') {
            obj['genomic'] = {
                hugo_symbol: this.getGenomicValue('hugo_symbol'),
                oncokb_variant: this.getGenomicValue('oncokb_variant'),
                matching_examples: this.getGenomicValue('matching_examples'),
                protein_change: this.getGenomicValue('protein_change'),
                wildcard_protein_change: this.getGenomicValue('wildcard_protein_change'),
                variant_classification: this.getGenomicValue('variant_classification'),
                variant_category: this.getGenomicValue('variant_category'),
                exon: this.getGenomicValue('exon'),
                cnv_call: this.getGenomicValue('cnv_call'),
                wildtype: this.genomicInput.wildtype
            };
        } else if (type === 'clinical') {
            obj['clinical'] = {
                age_numerical: this.getClinicalValue('age_numerical'),
                oncotree_diagnosis: this.getClinicalValue('oncotree_diagnosis'),
                main_type: this.clinicalInput.main_type,
                sub_type: this.clinicalInput.sub_type,
            }
        }
    }
    exchangeLogic(obj: any) {
        if (obj.hasOwnProperty('or')) {
            obj['and'] = obj['or'];
            delete obj['or'];
        } else if (obj.hasOwnProperty('and')) {
            obj['or'] = obj['and'];
            delete obj['and'];
        }
    }
    sortModifiedArray(a: object, b: object) {
        const keys = ['genomic', 'clinical', 'and', 'or'];
        return keys.indexOf(Object.keys(a)[0]) - keys.indexOf(Object.keys(b)[0]);
    }
    setEditOriginalValues(keys: Array<any>, type: string) {
        if (type === 'genomic') {
            for (let key of keys) {
                if (this.unit['genomic'][key][0] === '!') {
                    this.trialService.setGenomicInput(key, this.unit['genomic'][key].slice(1));
                    this.trialService.setGenomicInput('no_'+key, true);    
                } else {
                    this.trialService.setGenomicInput(key, this.unit['genomic'][key]);
                    this.trialService.setGenomicInput('no_'+key, false);
                }
            }
        } else if (type === 'clinical') {
            for (let key of keys) {
                if (this.unit['clinical'][key][0] === '!') {
                    this.trialService.setClinicalInput(key, this.unit['clinical'][key].slice(1));
                    this.trialService.setClinicalInput('no_'+key, true);    
                } else {
                    this.trialService.setClinicalInput(key, this.unit['clinical'][key]);
                    this.trialService.setClinicalInput('no_'+key, false);
                }
            }
        }
    }
    editNode() {
        this.validGenomic.splice(0, this.validGenomic.length);
        this.validGenomic.push(true);
        this.pathPool.splice(0, this.pathPool.length);
        this.pathPool.push(this.path);
        if (this.unit.hasOwnProperty('genomic')) {
            this.setEditOriginalValues(['hugo_symbol', 'oncokb_variant', 'matching_examples', 'protein_change', 'wildcard_protein_change', 'variant_classification', 'variant_category', 'exon', 'cnv_call', 'wildtype'], 'genomic');
        } else if (this.unit.hasOwnProperty('clinical')) {
            this.setEditOriginalValues(['age_numerical', 'oncotree_diagnosis'], 'clinical');
            this.trialService.setClinicalInput('main_type', this.unit['clinical']['main_type']);
            this.trialService.setClinicalInput('sub_type', this.unit['clinical']['sub_type']);
        }
    }
    preAddNode() {
        this.validGenomic.splice(0, this.validGenomic.length);
        this.validGenomic.push(false);
        this.addNode = true;
    }
    moveNode() {
        if (this.operationPool[0] === 'move') {
            this.pathPool.splice(0, this.pathPool.length);
            this.operationPool.splice(0, this.operationPool.length);
        } else {
            this.pathPool.splice(0, this.pathPool.length);
            this.pathPool.push(this.path);
            this.operationPool.splice(0, this.operationPool.length);
            this.operationPool.push('move');
            this.movingPath.from = this.path;
        }

    }
    cancelModification() {
        this.pathPool.splice(0, this.pathPool.length);
    }
    saveModification() {
        this.pathPool.splice(0, this.pathPool.length);
        this.modifyNode('update');
    }
    dropDownNode() {
        this.operationPool.splice(0, this.operationPool.length);
        this.pathPool.splice(0, this.pathPool.length);
        this.movingPath.to = this.path;
        // find the data to be moved and mark it as to be removed.
        // We can't remove it at this step because it will upset the path for the destination node
        this.preparePath(this.movingPath.from);
        this.modifyData(this.dataToModify, this.finalPath, 'remove');
        //add the data to destination node
        this.preparePath(this.movingPath.to);
        this.modifyData(this.dataToModify, this.finalPath, 'add');
        //remove the original data that has been moved to the destination
        this.removeOriginalNode(this.originalMatch);
        for (let arm of this.originalArms) {
            this.removeOriginalNode(arm.match);
        }
        this.dataBlockToMove = {};
        this.trialsCollection.doc(this.nctId).update({
            treatment_list: {
                step: {
                    arms: this.originalArms,
                    match: this.originalMatch
                }
            }
        });
    }
    removeOriginalNode(match: Array<any>) {
        let itemsToRemove = [];
        for (let item of match) {
            if (item.toBeRemoved === true) {
                itemsToRemove.push(item);
            }
        }
        for (let item of itemsToRemove) {
            match.splice(match.indexOf(item), 1);
        }
        for (let item of match) {
            if (_.keys(item).indexOf('and') !== -1) {
                this.removeOriginalNode(item['and']);
            } else if (_.keys(item).indexOf('or') !== -1) {
                this.removeOriginalNode(item['or']);
            }
        }
    }
    displayDestination() {
        const tempResult = this.type.indexOf('move') !== -1 && this.operationPool.length > 0 && this.pathPool.length > 0 && this.pathPool.indexOf(this.path) === -1;
        let result = tempResult;
        if (tempResult) {
            this.preparePath();
            result = (['and', 'or'].indexOf(this.finalPath[this.finalPath.length - 1]) !== -1);
        }
        return result;
    }
    displayPencil() {
        return this.operationPool.indexOf('move') === -1 && this.type.indexOf('edit') !== -1 && this.pathPool.indexOf(this.path) === -1;
    }
    displayAdd() {
        return this.operationPool.indexOf('move') === -1 && this.type.indexOf('add') !== -1;
    }
    displayTrash() {
        return this.operationPool.indexOf('move') === -1 && this.type.indexOf('delete') !== -1;
    }
    displayMove() {
        return this.type.indexOf('move') !== -1 && this.pathPool.length === 0 || this.pathPool.indexOf(this.path) !== -1;
    }
    displayExchange() {
        return this.operationPool.indexOf('move') === -1 && this.type.indexOf('exchange') !== -1;
    }
}
