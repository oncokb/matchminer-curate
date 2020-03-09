import * as _ from 'lodash';
import { Genomic } from '../genomic/genomic.model';
import { Clinical } from '../clinical/clinical.model';
import { Additional, Trial } from '../trial/trial.model';
import { environment } from '../environments/environment';
import { Arm } from '../arm/arm.model';
import { Drug } from '../drug/drug.model';

export default class MainUtil {
    static oncokb: boolean = environment['oncokb'] ? environment['oncokb'] : false;
    static oncotreeVersion: string = environment.oncotreeVersion ? environment.oncotreeVersion : 'oncotree_latest_stable';
    static isPermitted: boolean = environment.isPermitted ? environment.isPermitted : false;
    static frontEndOnly = environment.frontEndOnly ? environment.frontEndOnly : false;
    static devEmail = environment.devEmail;

    static uncheckRadio(input: string, value: string) {
        if (value === input) {
            value = '';
        }
        return value;
    }
    static normalizeText(content: string) {
        if (MainUtil.isAllUpperCase(content)) {
            return content.split(' ').map((str) => _.capitalize(str)).join(' ');
        }
        return content;
    }
    static isAllUpperCase(str: string) {
        return str.toUpperCase() === str;
    }
    static updateTimestampByToday() {
        return new Date().getTime();
    }
    static createGenomic(): Genomic {
        let genomicInput: Genomic;
        if (this.oncokb) {
            genomicInput = {
                hugo_symbol: '',
                annotated_variant: '',
                matching_examples: '',
                germline: '',
                no_hugo_symbol: false,
                no_annotated_variant: false,
            };
        } else {
            genomicInput = {
                hugo_symbol: '',
                annotated_variant: '',
                matching_examples: '',
                germline: '',
                protein_change: '',
                wildcard_protein_change: '',
                variant_classification: '',
                variant_category: '',
                exon: '',
                cnv_call: '',
                wildtype: '',
                no_hugo_symbol: false,
                no_annotated_variant: false,
                no_protein_change: false,
                no_wildcard_protein_change: false,
                no_variant_classification: false,
                no_variant_category: false,
                no_exon: false,
                no_cnv_call: false
            };
        }
        return genomicInput;
    }
    static createClinical(): Clinical {
        const clinicalInput: Clinical = {
            age_numerical: '',
            oncotree_primary_diagnosis: '',
            main_type: '',
            sub_type: '',
            no_oncotree_primary_diagnosis: false
        };
        return clinicalInput;
    }
    static createTrial(): Trial {
        const trial: Trial = {
            curation_status: '',
            archived: '',
            nct_id: '',
            protocol_no: '',
            long_title: '',
            short_title: '',
            phase: '',
            status: '',
            treatment_list: { step: [] }
        };
        return trial;
    }
    static createAdditional(): Additional {
        const additional: Additional = {
            note: ''
        };
        return additional;
    }
    static createDrug(): Drug {
        const drug: Drug = {
            name: ''
        };
        return drug;
    }
    static createArm(): Arm {
        const arm: Arm = {
            arm_code: '',
            arm_description: '',
            arm_internal_id: '',
            arm_suspended: '',
            arm_type: '',
            arm_eligibility: '',
            arm_info: '',
            drugs: [[]],
            match: []
        };
        return arm;
    }

    static getStyle(indent: number) {
        return { 'margin-left': (indent * 40) + 'px' };
    }
}
