import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { SERVER_API_URL } from '../app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConnectionService {
    frontEndOnly = environment.frontEndOnly ? environment.frontEndOnly : false;

    constructor(private http: HttpClient) { }

    getAPIUrl(type: string) {
        if (this.frontEndOnly) {
            switch (type) {
            case 'MainType':
                return 'http://oncokb.org/api/private/utils/oncotree/mainTypes';
            case 'SubType':
                return 'http://oncokb.org/api/private/utils/oncotree/subtypes';
            case 'OncoKBVariant':
                return 'http://oncokb.org/api/v1/variants';
            case 'GeneValidation':
                return 'http://mygene.info/v3/query?species=human&q=symbol:';
            case 'ClinicalTrials':
                return 'https://clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
            case 'ExampleValidation':
                return 'http://oncokb.org/api/v1/utils/match/variant?';
            }
        } else {
            switch (type) {
            case 'MainType':
                return SERVER_API_URL + 'proxy/http/oncokb.org/api/private/utils/oncotree/mainTypes';
            case 'SubType':
                return SERVER_API_URL + 'proxy/http/oncokb.org/api/private/utils/oncotree/subtypes';
            case 'OncoKBVariant':
                return SERVER_API_URL + 'proxy/http/oncokb.org/api/v1/variants';
            case 'GeneValidation':
                return SERVER_API_URL + 'proxy/http/mygene.info/v3/query?species=human&q=symbol:';
            case 'ClinicalTrials':
                return SERVER_API_URL + 'proxy/https/clinicaltrialsapi.cancer.gov/v1/clinical-trial/';
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

    getMainType() {
        return this.http.get(this.getAPIUrl('MainType'));
    }

    getSubType() {
        return this.http.get(this.getAPIUrl('SubType'));
    }

    getOncoKBVariant(): Observable<Array<any>> {
        return this.http.get<Array<any>>(this.getAPIUrl('OncoKBVariant'));
    }

    loadMongo(trial: any) {
        return this.http.post('trials/create', trial, { observe: 'response' });
    }
}
