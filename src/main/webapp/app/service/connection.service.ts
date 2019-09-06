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
                case 'OncoKBVariant':
                    return 'http://oncokb.org/api/v1/variants';
                case 'Genesets':
                    return 'http://oncokb.org/public/api/v1/genesets';
                case 'GeneValidation':
                    return 'http://mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
                case 'MskTrials':
                    return 'https://discover.mskcc.org:443/api/trials/';
                case 'ExampleValidation':
                    return 'http://oncokb.org/api/v1/utils/match/variant?';
            }
        } else {
            switch (type) {
                case 'MainType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/mainTypes?version=' + MainUtil.oncotreeVersion;
                case 'SubType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/tumorTypes/search';
                case 'OncoKBVariant':
                    return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/variants';
                case 'Genesets':
                    return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/genesets';
                case 'GeneValidation':
                    return SERVER_API_URL + 'proxy/http/mygene.info/v3/query?species=human&q=symbol:';
                case 'ClinicalTrials':
                    return SERVER_API_URL + 'proxy/https/clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
                case 'MskTrials':
                    return SERVER_API_URL + 'proxy/https/discover.mskcc.org:443/api/trials/';
                case 'ExampleValidation':
                    return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/utils/match/variant?';
            }
        }
    }

    validateGenomicGene(hugoSymbol: string) {
        return this.http.get(this.getAPIUrl('GeneValidation') + hugoSymbol);
    }

    validateGenomicExample(variantsTobeValidated: string) {
        return this.http.get(this.getAPIUrl('ExampleValidation') + variantsTobeValidated);
    }

    importTrials(tempTrial: string) {
        return this.http.get(this.getAPIUrl('ClinicalTrials') + tempTrial);
    }

    getTrialByProtocolNo(protocolNo: string) {
        return this.http.get(this.getAPIUrl('MskTrials') + protocolNo);
    }

    getMainType() {
        return this.http.get(this.getAPIUrl('MainType'));
    }

    getSubType(query: any) {
        return this.http.post(this.getAPIUrl('SubType'), query);
    }

    getOncoKBVariant(): Observable<Array<any>> {
        return this.http.get<Array<any>>(this.getAPIUrl('OncoKBVariant'));
    }

    getDrugs(query: string) {
        return this.http.get(this.getAPIUrl('Drugs') + `?name=${query}`);
    }

    getGenesets() {
        return this.http.get(this.getAPIUrl('Genesets'));
    }
    getGenesetById(id: number) {
        return this.http.get(this.getAPIUrl('Genesets') + `/${id}`);
    }
}
