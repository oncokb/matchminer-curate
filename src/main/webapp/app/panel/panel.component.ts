
import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import * as _ from 'underscore';
import { Genomic } from '../genomic/genomic.model';
import { Clinical } from '../clinical/clinical.model';
import { MovingPath } from './movingPath.model';
import { Arm } from '../arm/arm.model';
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
    @Input() arm = false;
    finalPath = [];
    message = '';
    addNode = false;
    moving = false;
    nodeOptions: Array<string> = ['Genomic', 'Clinical', 'And', 'Or'];
    nodeType = '';
    selectedItems = [];
    operationPool: {};
    movingPath: MovingPath;
    dataBlockToMove = {};
    currentPath = '';
    dropdownList = [
        { id: 1, itemName: 'Genomic' },
        { id: 2, itemName: 'Clinical' }];
    armInput: Arm;
    originalMatch = [];
    originalArms = [];
    dataToModify = [];
    allSubTypesOptions = this.trialService.getAllSubTypesOptions();
    subToMainMapping = this.trialService.getSubToMainMapping();
    mainTypesOptions = this.trialService.getMainTypesOptions(); 
    isPermitted = true; 
    nctIdChosen:string;
    trialChosen: {};
    genomicInput: Genomic;
    clinicalInput: Clinical;
    clinicalFields = ['age_numerical', 'oncotree_primary_diagnosis'];
    genomicFields = ['hugo_symbol', 'annotated_variant', 'matching_examples', 'protein_change', 'wildcard_protein_change',
    'variant_classification', 'variant_category', 'exon', 'cnv_call', 'wildtype'];
    oncokbGenomicFields = ['hugo_symbol', 'annotated_variant'];
    oncokb: boolean;
            
    constructor(private trialService: TrialService) { 
    }

    ngOnInit() {
        this.trialService.nctIdChosenObs.subscribe(message => this.nctIdChosen = message);
        this.trialService.trialChosenObs.subscribe(message => {
            this.trialChosen = message;
            this.originalMatch = this.trialChosen['treatment_list'].step[0].match;
            this.originalArms = this.trialChosen['treatment_list'].step[0].arm;
        });
        this.trialService.genomicInputObs.subscribe(message => {
            this.genomicInput = message;
        });
        this.trialService.clinicalInputObs.subscribe(message => {
            this.clinicalInput = message;
        });
        this.trialService.operationPoolObs.subscribe(message => {
            this.operationPool = message;
        });
        this.trialService.currentPathObs.subscribe(message => {
            this.currentPath = message;
        });
        this.trialService.movingPathObs.subscribe(message => {
            this.movingPath = message;
        });
        this.trialService.armInputObs.subscribe(message => {
            this.armInput = message;
        });
        this.oncokb = this.trialService.oncokb;
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
            result = confirm('This will delete the entire section. Are you sure you want to proceed?');
        }
        let hasEmptyFields = this.checkEmptyFields(this.nodeType);
        if (result && !hasEmptyFields) {
            if (this.arm === true) {
                this.modifyArmGroup(type);
            } else {
                this.preparePath();
                this.modifyData(this.dataToModify, this.finalPath, type);  
            }
            this.saveBacktoDB();
        }
    }
    checkTrialGenomicFields(obj: any) {
        let genomicFieldsToCheck = this.oncokbGenomicFields;
        if (!this.oncokb) {
            genomicFieldsToCheck = _.without(this.genomicFields, 'matching_examples');
        } 
        for (const key of genomicFieldsToCheck) {
            if (!_.isUndefined(obj[key]) && obj[key].length > 0) {
                return false;
        }
        
        return true;
    }
    checkTrialClinicalFields(obj: any) {
        // Check clinical input fields
        // TODO: Remove sub_type and main_type after we remove main_type input field
        let clinicalFieldsToCheck = _.union(this.clinicalFields, ['sub_type', 'main_type']);
        for (const key of this.clinicalFields) {
            if (!_.isUndefined(obj[key]) && obj[key].length > 0) {
                return false;
            }
        }
        return true;
    }
    checkEmptyFields(type: string) {
        // Check genomic input fields
        let emptyFields = [];
        let hasEmptyFields = false;
        switch (type) {
        case 'Genomic':
            if (this.checkTrialGenomicFields(this.genomicInput)) {
                emptyFields.push('Genomic');
            }
            break;
        case 'Clinical':
            if (this.checkTrialClinicalFields(this.clinicalInput)) {
                emptyFields.push('Clinical');
            }
            break;
        case 'And':
        case 'Or':
            for (let item of this.selectedItems) {
                switch (item.itemName) {
                    case 'Genomic':
                        if (this.checkTrialGenomicFields(this.genomicInput)) {
                            emptyFields.push('Genomic');
                        }
                        break;
                    case 'Clinical':
                        if (this.checkTrialClinicalFields(this.clinicalInput)) {
                            emptyFields.push('Clinical');
                        }
                        break;
                }
            }
            break;
        }
        if (emptyFields.length > 0) {
            hasEmptyFields = true;
            emptyFields = _.uniq(emptyFields);
            let warnMessage = "Please enter information in " + emptyFields.join(' and ');
            if (emptyFields.length > 1) {
                warnMessage += ' sections!';
            } else {
                warnMessage += ' section!';
            }
            alert(warnMessage);
        }
        return hasEmptyFields;
    }
    saveBacktoDB() {
        this.trialService.getTrialRef(this.nctIdChosen).set({
            arm: this.originalArms,
            match: this.originalMatch
        }).then(result => {
            this.clearInput();
        }).catch(error => {
            console.log('Failed to save to DB ', error);
        });
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
                        obj[path[0]]['genomic'] = this.prepareGenomicData();
                    } else if (obj[path[0]].hasOwnProperty('clinical')) {
                        obj[path[0]]['clinical'] = this.prepareClinicalData();
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
        this.clearNodeInput();
    }
    clearNodeInput() {
        this.trialService.setGenomicInput(this.trialService.createGenomic());
        this.trialService.setClinicalInput(this.trialService.createClinical());
    }
    clearInputForm(keys: Array<string>, type: string) {
        if (type === 'Genomic') {
            for (let key of keys) {
                this.genomicInput[key] = '';
                this.genomicInput['no_'+key] = false;
            }    
        } else if (type === 'Clinical') {
            for (let key of keys) {
                this.clinicalInput[key] = '';
                this.clinicalInput['no_'+key] = false;
            }    
        } else if (type === 'arm') {
            for (let key of keys) {
                this.armInput[key] = '';
            } 
        }
    }
    getOncotree() {
        let oncotree_primary_diagnosis = '';
        if (this.clinicalInput.sub_type) {
            oncotree_primary_diagnosis = this.clinicalInput.sub_type;
        }else if (this.clinicalInput.main_type) {
            oncotree_primary_diagnosis = this.clinicalInput.main_type;
        }
        return oncotree_primary_diagnosis;
    }
    prepareClinicalData() {
        this.clinicalInput['oncotree_primary_diagnosis'] = this.getOncotree();
        let clinicalToSave = _.clone(this.clinicalInput);
        delete clinicalToSave['main_type'];
        delete clinicalToSave['sub_type'];
        this.prepareSectionByField('clinical', clinicalToSave);
        return clinicalToSave;
    }
    prepareGenomicData() {
        let genomicToSave = _.clone(this.genomicInput);
        this.prepareSectionByField('genomic', genomicToSave);
        return genomicToSave;
    }
    prepareSectionByField(type: string, nodeData: object) {
        let keysToCheck = [];
        if (type === 'clinical') {
            keysToCheck = this.clinicalFields;
        } else if (type === 'genomic') {
            keysToCheck = this.genomicFields;
        }
        for (const key of keysToCheck) {
            // remove empty fields
            if (!_.isUndefined(nodeData[key]) && nodeData[key].length === 0) {
                delete nodeData[key];
            }
            // apply not logic
            if (nodeData['no_' + key]) {
                nodeData[key] = '!' + nodeData[key];
            }   
            delete nodeData['no_' + key];     
        } 
    }
    addNewNode(obj: Array<any>) {
        if (_.isEmpty(this.dataBlockToMove)) {
            switch (this.nodeType) {
                case 'Genomic':
                    obj.push({
                        genomic: this.prepareGenomicData()
                    });
                    break;
                case 'Clinical':
                    obj.push({
                        clinical: this.prepareClinicalData()
                    });
                    break;
                case 'And':
                case 'Or':
                    let tempObj1: any = [];
                    for (let item of this.selectedItems) {
                        switch (item.itemName) {
                            case 'Genomic':
                                tempObj1.push({
                                    genomic: this.prepareGenomicData()
                                });
                                break;
                            case 'Clinical':
                                tempObj1.push({
                                    clinical: this.prepareClinicalData()
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
    editNode() { 
        this.operationPool['currentPath'] = this.path;
        this.operationPool['editing'] = true;
        if (this.unit.hasOwnProperty('genomic')) {
            this.trialService.setGenomicInput(_.clone(this.unit['genomic']));
            this.setNotLogic('genomic');
        } else if (this.unit.hasOwnProperty('clinical')) {
            this.trialService.setClinicalInput(_.clone(this.unit['clinical']));
            this.setNotLogic('clinical');
            this.setOncotree();
        } else if (this.unit.hasOwnProperty('arm_name')) {
            let armToAdd: Arm = {
                arm_name: this.unit['arm_name'],
                arm_description: this.unit['arm_description'],
                match: this.unit['match']
            };
            this.trialService.setArmInput(armToAdd);
        }
    }
    setOncotree() {
        let oncotree_primary_diagnosis = this.clinicalInput['oncotree_primary_diagnosis'];
        this.clinicalInput['sub_type'] = '';
        this.clinicalInput['main_type'] = '';
        let isSubtype = false;
        for (let item of this.allSubTypesOptions) {
            if (item.value === oncotree_primary_diagnosis) {
                this.clinicalInput['sub_type'] = oncotree_primary_diagnosis;
                this.clinicalInput['main_type'] = this.subToMainMapping[oncotree_primary_diagnosis];
                isSubtype = true;
            }
        }
        if (isSubtype === false) {
            for (let item of this.mainTypesOptions) {
                if (item.value === oncotree_primary_diagnosis) {
                    this.clinicalInput['main_type'] = oncotree_primary_diagnosis;
                }
            }
        }
    }
    setNotLogic(type: string) {
        if (type === 'clinical') {
            for(const key of this.clinicalFields) {
                if (!_.isUndefined(this.clinicalInput[key]) && this.clinicalInput[key].startsWith('!')) {
                    this.clinicalInput['no_' + key] = true;
                    this.clinicalInput[key] = this.clinicalInput[key].substr(1);
                }
            }
        } else if (type === 'genomic') {
            for(const key of this.genomicFields) {
                if (!_.isUndefined(this.genomicInput[key]) && this.genomicInput[key].startsWith('!')) {
                    this.genomicInput['no_' + key] = true;
                    this.genomicInput[key] = this.genomicInput[key].substr(1);
                }
            }
        }
        
    }
    preAddNode() {
        this.addNode = true;
        if (this.arm === true) {
            this.clearInputForm(['arm_name', 'arm_description'], 'arm');
        }
    }
    moveNode() {
        if (this.operationPool['relocate'] === true) {
            this.operationPool['currentPath'] = '';
            this.operationPool['relocate'] = false;
        } else {
            this.operationPool['currentPath'] = this.path;
            this.operationPool['relocate'] = true;
            this.movingPath.from = this.path;
        }
    }
    cancelModification() {
        this.operationPool['currentPath'] = '';
        this.operationPool['editing'] = false;
    }
    saveModification() {
        this.operationPool['currentPath'] = '';
        this.operationPool['editing'] = false;
        this.modifyNode('update');
    }
    dropDownNode() {
        this.operationPool['relocate'] = false;
        this.operationPool['currentPath'] = '';
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
        this.saveBacktoDB();
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
    isNestedInside(currentPath: string, destinationPath: string) {
        let currentPathArr = currentPath.split(',');
        let destinationPathArr = destinationPath.split(',');
        let isInside = true;
        if (currentPathArr.length < destinationPathArr.length) {
            _.some(currentPathArr, function(item, index) {
                if (item !== destinationPathArr[index]) {
                    isInside = false;
                    return true;
                }
            });
        } else {
            isInside = false;
        }
        return isInside;
    }
    // when user try to move a section, we hide all icons except the relocate icon to avoid distraction. Among which, there are two cases the destination icons are hidden
    // 1) The section is the current chosen one to move around.
    // 2) The section is inside the current chosen section.
    displayDestination() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('destination') !== -1 && this.operationPool['relocate'] === true 
        && this.operationPool['currentPath'] !== this.path && !this.isNestedInside(this.operationPool['currentPath'], this.path);
    }
    displayPencil() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('edit') !== -1 && this.operationPool['relocate'] !== true && this.operationPool['currentPath'] !== this.path;
    }
    displayAdd() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('add') !== -1 && this.operationPool['relocate'] !== true;
    }
    // There are three cases we display the trash icon
    // 1) when the page is first loaded
    // 2) when the item is not the current editing one
    displayTrash() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('delete') !== -1 && (this.operationPool['relocate'] !== true && this.operationPool['editing'] !== true
        || this.operationPool['editing'] === true && this.operationPool['currentPath'] !== this.path);
    }
    // There are three cases we display the move icon
    // 1) when the page is first loaded
    // 2) when the item is not the current editing one
    // 3) when the item is the one we chose to move around
    displayMove() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('relocate') !== -1 && (this.operationPool['relocate'] !== true && this.operationPool['editing'] !== true
        || this.operationPool['editing'] === true && this.operationPool['currentPath'] !== this.path
        || this.operationPool['relocate'] === true && this.operationPool['currentPath'] === this.path);
    }
    displayExchange() {
        if (this.isPermitted === false) return false;
        return this.type.indexOf('exchange') !== -1 && this.operationPool['relocate'] !== true;
    }
    modifyArmGroup(type) {
        if (type === 'add') {
            let armToAdd: Arm = {
                arm_name: this.armInput.arm_name,
                arm_description: this.armInput.arm_description,
                match: []
            };
            this.originalArms.push(armToAdd);
        } else if (type === 'delete') {
            const tempIndex = Number(this.path.split(',')[1].trim());
            this.originalArms.splice(tempIndex, 1);
        } else if (type === 'update') {
            const tempIndex = this.path.split(',')[1].trim();
            this.originalArms[tempIndex].arm_name = this.armInput['arm_name'];
            this.originalArms[tempIndex].arm_description = this.armInput['arm_description'];
        }
    }
}
