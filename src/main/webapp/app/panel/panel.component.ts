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
    constructor(private trialService: TrialService) {}

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
            default:
                break;       
        }
    }
    clearInput() {
        this.selectedItems = [];
        this.addNode = false;
        this.nodeType = '';
    }
    clearNodeInput() {
        if (this.nodeType === 'Genomic') {
            this.trialService.setGenomicInput('hugo_symbol', '');
            this.trialService.setGenomicInput('oncokb_variant', '');
            this.trialService.setGenomicInput('protein_change', '');
            this.trialService.setGenomicInput('wildcard_protein_change', '');
            this.trialService.setGenomicInput('variant_classification', '');
            this.trialService.setGenomicInput('variant_category', '');
            this.trialService.setGenomicInput('exon', '');
            this.trialService.setGenomicInput('cnv_call', '');
            this.trialService.setGenomicInput('wildtype', '');
        } else if (this.nodeType === 'Clinical') {
            this.trialService.setClinicalInput('age_numerical', '');
            this.trialService.setClinicalInput('oncotree_diagnosis', '');
            this.trialService.setClinicalInput('main_type', '');
            this.trialService.setClinicalInput('sub_type', '');
        }
    }
    addNewNode(obj: Array<any>) {
        if (_.isEmpty(this.dataBlockToMove)) {
            switch (this.nodeType) {
                case 'Genomic':
                    obj.push({
                        genomic: {
                            hugo_symbol: this.genomicInput.hugo_symbol,
                            oncokb_variant: this.genomicInput.oncokb_variant,
                            protein_change: this.genomicInput.protein_change,
                            wildcard_protein_change: this.genomicInput.wildcard_protein_change,
                            variant_classification: this.genomicInput.variant_classification,
                            variant_category: this.genomicInput.variant_category,
                            exon: this.genomicInput.exon,
                            cnv_call: this.genomicInput.cnv_call,
                            wildtype: this.genomicInput.wildtype
                        }
                    });
                    break;
                case 'Clinical':
                    obj.push({
                        clinical: {
                            age_numerical: this.clinicalInput.age_numerical,
                            oncotree_diagnosis: this.clinicalInput.oncotree_diagnosis,
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
                                        hugo_symbol: this.genomicInput.hugo_symbol,
                                        oncokb_variant: this.genomicInput.oncokb_variant,
                                        protein_change: this.genomicInput.protein_change,
                                        wildcard_protein_change: this.genomicInput.wildcard_protein_change,
                                        variant_classification: this.genomicInput.variant_classification,
                                        variant_category: this.genomicInput.variant_category,
                                        exon: this.genomicInput.exon,
                                        cnv_call: this.genomicInput.cnv_call,
                                        wildtype: this.genomicInput.wildtype
                                    }
                                });
                                break;
                            case 'Clinical':
                                tempObj1.push({
                                    clinical: {
                                        age_numerical: this.clinicalInput.age_numerical,
                                        oncotree_diagnosis: this.clinicalInput.oncotree_diagnosis,
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
                hugo_symbol: this.genomicInput.hugo_symbol,
                oncokb_variant: this.genomicInput.oncokb_variant,
                protein_change: this.genomicInput.protein_change,
                wildcard_protein_change: this.genomicInput.wildcard_protein_change,
                variant_classification: this.genomicInput.variant_classification,
                variant_category: this.genomicInput.variant_category,
                exon: this.genomicInput.exon,
                cnv_call: this.genomicInput.cnv_call,
                wildtype: this.genomicInput.wildtype
            };
        } else if (type === 'clinical') {
            obj['clinical'] = {
                age_numerical: this.clinicalInput.age_numerical,
                oncotree_diagnosis: this.clinicalInput.oncotree_diagnosis,
                main_type: this.clinicalInput.main_type,
                sub_type: this.clinicalInput.sub_type,
            }
        }
    }
    sortModifiedArray(a: object, b: object) {
        const keys = ['genomic', 'clinical', 'and', 'or'];
        return keys.indexOf(Object.keys(a)[0]) - keys.indexOf(Object.keys(b)[0]);
    }
    editNode() {
        this.pathPool.splice(0, this.pathPool.length);
        this.pathPool.push(this.path);
        if (this.unit.hasOwnProperty('genomic')) {
            this.trialService.setGenomicInput('hugo_symbol', this.unit['genomic']['hugo_symbol']);
            this.trialService.setGenomicInput('oncokb_variant', this.unit['genomic']['oncokb_variant']);
            this.trialService.setGenomicInput('protein_change', this.unit['genomic']['protein_change']);
            this.trialService.setGenomicInput('wildcard_protein_change', this.unit['genomic']['wildcard_protein_change']);
            this.trialService.setGenomicInput('variant_classification', this.unit['genomic']['variant_classification']);
            this.trialService.setGenomicInput('variant_category', this.unit['genomic']['variant_category']);
            this.trialService.setGenomicInput('exon', this.unit['genomic']['exon']);
            this.trialService.setGenomicInput('cnv_call', this.unit['genomic']['cnv_call']);
            this.trialService.setGenomicInput('wildtype', this.unit['genomic']['wildtype']);
        } else if (this.unit.hasOwnProperty('clinical')) {
            this.trialService.setClinicalInput('age_numerical', this.unit['clinical']['age_numerical']);
            this.trialService.setClinicalInput('oncotree_diagnosis', this.unit['clinical']['oncotree_diagnosis']);
            this.trialService.setClinicalInput('main_type', this.unit['clinical']['main_type']);
            this.trialService.setClinicalInput('sub_type', this.unit['clinical']['sub_type']);
        }
    }
    moveNode() {
        this.pathPool.splice(0, this.pathPool.length);
        this.pathPool.push(this.path);
        this.operationPool.splice(0, this.operationPool.length);
        this.operationPool.push('move');
        this.movingPath.from = this.path;
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
        for(let arm of this.originalArms) {
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
            result = (['and', 'or'].indexOf(this.finalPath[this.finalPath.length-1]) !== -1);
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
}
