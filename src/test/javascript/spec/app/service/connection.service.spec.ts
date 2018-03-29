import { TestBed, async } from '@angular/core/testing';
import {ConnectionService} from '../../../../../main/webapp/app/service/connection.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

describe('Service Tests', () => {

    describe('Connection Service', () => {
        let service: ConnectionService;
        let httpMock: HttpTestingController;
        let httpClient: HttpClient;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ HttpClientTestingModule ],
                providers: [ConnectionService]
            });
            service = TestBed.get(ConnectionService);
            httpMock = TestBed.get(HttpTestingController);
            httpClient = TestBed.get(HttpClient);
        }));

        afterEach(() => {
            // verify there are no unsatisfied requests in the mockHttp queue
            httpMock.verify();
        });

        describe('connection service methods', () => {
            it('validateGenomicGene: Test "BRAF" should call correct URL and return correct response.', () => {
                const dummyResult = {
                    'max_score': 88.08151,
                    'took': 7,
                    'total': 1,
                    'hits': [
                        {
                            '_id': '673',
                            '_score': 88.08151,
                            'entrezgene': 673,
                            'name': 'B-Raf proto-oncogene, serine/threonine kinase',
                            'symbol': 'BRAF',
                            'taxid': 9606
                        }
                    ]
                };
                service.validateGenomicGene('BRAF').subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res).toEqual(dummyResult);
                });
                const requestUrl = service.getAPIUrl('GeneValidation') + 'BRAF';
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('GET');
                req.flush(dummyResult);

            });

            it('validateGenomicExample: Test "hugoSymbol=KIT&variant=D327N&examples=D327N" should return {"D327N": true}.', () => {
                const dummyResult = {'D327N': true};
                const variantsTobeValidated = 'hugoSymbol=KIT&variant=D327N&examples=D327N';
                service.validateGenomicExample(variantsTobeValidated).subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res).toEqual(dummyResult);
                });
                const requestUrl = service.getAPIUrl('ExampleValidation') + variantsTobeValidated;
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('GET');
                req.flush(dummyResult);
            });

            it('importTrials: Test trial "NCT02057133" should return trial content.', () => {
                const nctId = 'NCT02057133';
                const dummyResult = {
                    'nci_id': 'NCI-2016-00230',
                    'nct_id': 'NCT02561962',
                    'protocol_id': '20130314',
                    'current_trial_status': 'Active',
                    'brief_title': 'A Phase 1 Study in Subjects With Relapsed or Refractory Multiple Myeloma',
                    'official_title': 'A Phase 1 First in Human Study Evaluating the Safety, Tolerability, ' +
                                      'Pharmacokinetics and Pharmacodynamics of AMG 224 in Subjects With Relapsed ' +
                                      'or Refractory Multiple Myeloma',
                    'keywords': [
                        'Multiple Myeloma',
                        'Relapsed Multiple Myeloma',
                        'Refractory Multiple Myeloma'
                    ],
                    'brief_summary': 'This is a first in human phase 1 multicenter open label study in subjects ' +
                                     'with relapsed or refractory multiple myeloma.',
                    'detail_description': 'This is a first in human phase 1 multicenter open label study to evaluate ' +
                                          'the safety and\n      tolerability of AMG 224 in subjects with relapsed ' +
                                          'or refractory multiple myeloma. The study\n      will be conducted in 2 ' +
                                          'parts. Part 1 is the dose-exploration and part 2 is the\n      ' +
                                          'dose-expansion. Study medication will be administered once every 3 ' +
                                          'weeks by IV.',
                    'lead_org': 'Amgen, Inc.',
                    'minimum_target_accrual_number': 60,
                    'number_of_arms': 1,
                    'arms': [
                        {
                            'arm_name': 'Arm not specified',
                            'arm_type': null,
                            'arm_description': null,
                            'interventions': [
                                {
                                    'intervention_name': 'Antineoplastic Agent',
                                    'intervention_type': 'Drug',
                                    'intervention_code': 'C274',
                                    'intervention_description': null,
                                    'parents': [
                                        'C1909'
                                    ],
                                    'inclusion_indicator': 'TRIAL',
                                    'synonyms': [],
                                    'intervention_category': 'Agent'
                                }
                            ]
                        }
                    ]
                };
                service.importTrials(nctId).subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res).toEqual(dummyResult);
                });
                const requestUrl = service.getAPIUrl('ClinicalTrials') + nctId;
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('GET');
                req.flush(dummyResult);
            });

            it('getMainType: get Main Type list.', () => {
                const dummyResult = {
                    meta: {
                        error_type: null,
                        code: 200,
                        erro_message: null
                    },
                    data: [{
                        id: null,
                        name: 'Mastocytosis'
                    }, {
                        id: null,
                        name: 'CNS Cancer'
                    }, {
                        id: null,
                        name: 'Sex Cord Stromal Tumor'
                    }, {
                        id: null,
                        name: 'Salivary Gland Cancer'
                    }, {
                        id: null,
                        name: 'Breast Cancer, NOS'
                    }]
                };
                service.getMainType().subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res['meta']['code']).toEqual(200);
                    expect(res['data'].length).toBeGreaterThan(0);
                });
                const requestUrl = service.getAPIUrl('MainType');
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('GET');
                req.flush(dummyResult);
            });

            it('getSubType: Test "hugoSymbol=KIT&variant=D327N&examples=D327N" should return {"D327N": true}.', () => {
                const mockQuery = {
                    'exactMatch': true,
                    'query': 'Breast Cancer, NOS',
                    'type': 'mainType'
                };
                const dummyResult = {
                    'data': [{
                        'NCI': ['c12971'],
                        'UMLS': ['C0006141'],
                        'children': {},
                        'code': 'BREAST',
                        'color': 'HotPink',
                        'deprecated': false,
                        'history': [],
                        'id': null,
                        'level': 1,
                        'links': null,
                        'mainType': { 'id': null, 'name': 'Breast Cancer, NOS'},
                        'name': 'Breast',
                        'parent': 'TISSUE',
                        'tissue': 'Breast'
                    }]
                };
                service.getSubType(mockQuery).subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res).toEqual(dummyResult);
                });
                const requestUrl = service.getAPIUrl('SubType');
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('POST');
                req.flush(dummyResult);
            });

            it('getOncoKBVariant: get OncoKB Variant list.', () => {
                const dummyResult = [{
                    'gene': {
                        'entrezGeneId': 2066,
                        'hugoSymbol': 'ERBB4',
                        'name': 'erb-b2 receptor tyrosine kinase 4',
                        'oncogene': true,
                        'curatedIsoform': 'ENST00000342788',
                        'curatedRefSeq': 'NM_005235.2',
                        'geneAliases': ['ALS19', 'p180erbB4', 'HER4'],
                        'tsg': false
                    },
                    'consequence': {
                        'term': 'missense_variant',
                        'isGenerallyTruncating': false,
                        'description': 'A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved'
                    },
                    'alteration': 'A287S',
                    'name': 'A287S',
                    'refResidues': 'A',
                    'proteinStart': 287,
                    'proteinEnd': 287,
                    'variantResidues': 'S'
                }];
                // queue up the http request in the mockHttp request queue
                service.getOncoKBVariant().subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res).toEqual(dummyResult);
                });
                const requestUrl = service.getAPIUrl('OncoKBVariant');
                // verify that there is now one (and only one) request queued up
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('GET');
                // satisfy the pending request in the mockHttp request queue
                req.flush(dummyResult);
            });

            it('loadMongo: load a trial into MongoDB', () => {
                const dummyTrial = {
                    'trial': {
                        'long_title': 'A Phase 1 First in Human Study Evaluating the Safety, Tolerability, ' +
                                      'Pharmacokinetics and Pharmacodynamics of AMG 224 in Subjects With Relapsed ' +
                                      'or Refractory Multiple Myeloma',
                        'nct_id': 'NCT02561962',
                        'phase': 'I',
                        'short_title': 'A Phase 1 Study in Subjects With Relapsed or Refractory Multiple Myeloma',
                        'status': 'Active',
                        'treatment_list': {
                            'step': [{
                                'arm': [],
                                'match': [{
                                    'and': [{
                                        'genomic': {
                                            'cnv_call': '',
                                            'exon': '',
                                            'hugo_symbol': 'BRAF',
                                            'matching_examples': '',
                                            'oncokb_variant': 'p.D143G',
                                            'protein_change': '',
                                            'variant_category': '',
                                            'variant_classification': '',
                                            'wildcard_protein_change': '',
                                            'wildtype': ''
                                        }
                                    }, {
                                        'clinical': {
                                            'age_numerical': '>=18',
                                            'oncotree_diagnosis': 'All Liquid Tumors'
                                        }
                                    }]
                                }]
                            }]
                        }
                    }
                };
                // queue up the http request in the mockHttp request queue
                service.loadMongo(dummyTrial).subscribe((res) => {
                    expect(res).toBeDefined();
                    expect(res.status).toEqual(200);
                });
                const requestUrl = 'trials/create';
                // verify that there is now one (and only one) request queued up
                const req = httpMock.expectOne(`${requestUrl}`);
                expect(req.request.method).toBe('POST');
                // satisfy the pending request in the mockHttp request queue
                req.flush({});
            });

            it('can test for 404 error', () => {
                const emsg = 'deliberate 404 error';
                const testUrl = 'fakeUrl';
                httpClient.get(testUrl).subscribe(
                    (data) => fail('should have failed with the 404 error'),
                    (error: HttpErrorResponse) => {
                        expect(error.status).toEqual(404, 'status');
                        expect(error.error).toEqual(emsg, 'message');
                    }
                );
                const req = httpMock.expectOne(testUrl);
                // Respond with mock error
                req.flush(emsg, { status: 404, statusText: 'Not Found' });
            });

            it('can test for network error', () => {
                const emsg = 'simulated network error';
                const testUrl = 'fakeUrl';
                httpClient.get(testUrl).subscribe(
                    (data) => fail('should have failed with the network error'),
                    (error: HttpErrorResponse) => {
                        expect(error.error.message).toEqual(emsg, 'message');
                    }
                );
                const req = httpMock.expectOne(testUrl);
                // Create mock ErrorEvent, raised when something goes wrong at the network level.
                // Connection timeout, DNS error, offline, etc
                const errorEvent = new ErrorEvent('so sad', {
                    message: emsg,
                    // The rest of this is optional and not used.
                    // Just showing that you could provide this too.
                    filename: 'ConnectionService.ts',
                    lineno: 42,
                    colno: 21
                });
                // Respond with mock error
                req.error(errorEvent);
            });
        });
    });
});
