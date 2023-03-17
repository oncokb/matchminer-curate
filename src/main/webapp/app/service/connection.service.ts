import { Injectable } from '@angular/core';
import { SERVER_API_URL } from '../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import MainUtil from './mainutil';

@Injectable()
export class ConnectionService {

    constructor(private http: HttpClient) { }

    getAPIUrl(type: string) {
        if (type === 'Drugs') {
            return 'https://clinicaltrialsapi.cancer.gov/v1/interventions';
        }
        if (MainUtil.frontEndOnly) {
            switch (type) {
                case 'MainType':
                    return 'http://oncotree.mskcc.org/api/mainTypes?version=' + MainUtil.oncotreeVersion;
                case 'SubType':
                    return 'http://oncotree.mskcc.org/api/tumorTypes/search';
                case 'GeneValidation':
                    return 'http://mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
            }
        } else {
            switch (type) {
                case 'MainType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/mainTypes?version=' + MainUtil.oncotreeVersion;
                case 'SubType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/tumorTypes/search';
                case 'GeneValidation':
                    return SERVER_API_URL + 'proxy/http/mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return SERVER_API_URL + 'proxy/https/clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
            }
        }
    }

    validateGenomicGene(hugoSymbol: string) {
        return this.http.get(this.getAPIUrl('GeneValidation') + hugoSymbol);
    }

    importTrials(tempTrial: string) {
        return this.http.get(this.getAPIUrl('ClinicalTrials') + tempTrial);
    }

    getMainType() {
        return this.http.get(this.getAPIUrl('MainType'));
    }

    getSubType(query: any) {
        return this.http.post(this.getAPIUrl('SubType'), query);
    }

    getDrugs(query: string) {
        return this.http.get(this.getAPIUrl('Drugs') + `?name=${query}`);
    }
}
