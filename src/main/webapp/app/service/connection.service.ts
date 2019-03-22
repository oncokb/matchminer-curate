import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { SERVER_API_URL } from '../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConnectionService {
    frontEndOnly = environment.frontEndOnly ? environment.frontEndOnly : false;
    oncotreeVersion = environment.oncotreeVersion ? environment.oncotreeVersion : 'oncotree_latest_stable';

    constructor(private http: HttpClient) { }

    getAPIUrl(type: string) {
        if (type === 'Drugs'){
            return 'https://clinicaltrialsapi.cancer.gov/v1/interventions';
        }
        if (this.frontEndOnly) {
            switch (type) {
                case 'MainType':
                    return 'http://oncotree.mskcc.org/api/mainTypes?version=' + this.oncotreeVersion;
                case 'SubType':
                    return 'http://oncotree.mskcc.org/api/tumorTypes/search';
                case 'OncoKBVariant':
                    return 'http://oncokb.org/api/v1/variants';
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
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/mainTypes?version=' + this.oncotreeVersion;
                case 'SubType':
                    return SERVER_API_URL + 'proxy/http/oncotree.mskcc.org/api/tumorTypes/search';
                case 'OncoKBVariant':
                    return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/variants';
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

    loadMongo(trial: any) {
        return this.http.post('trials/create', trial, { observe: 'response' });
    }
}
