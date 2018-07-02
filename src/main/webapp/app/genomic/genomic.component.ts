import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Genomic } from './genomic.model';
import * as _ from 'underscore';

@Component({
    selector: 'jhi-genomic',
    templateUrl: './genomic.component.html',
    styleUrls: ['genomic.scss']
})

export class GenomicComponent implements OnInit {
    @Input() path = '';
    @Input() unit = {};
    @Input() type = '';
    indent = 1.2; // the relative indent between the genomic content with the title
    operationPool: {};
    genomicInput: Genomic;
    variant_categorys = ['Mutation', 'Copy Number Variation', 'Structural Variation', 'Any Variation'];
    variant_classifications = ['In_Frame_Del', 'In_Frame_Ins', 'Missense_Mutation', 'Nonsense_Mutation', 'Nonstop_Mutation',
    'Del_Ins', 'Frameshift', 'Frame_Shift_Del', 'Frame_Shift_Ins', 'Frameshift_mutation',
    'Inframe_Indel', 'Initiator_Codon', 'Intron', 'intron', 'Intron_mutation',
    'Missense and Splice_Region', 'RNA', 'Silent', 'Splice_Acceptor', 'Splice_Donor', 'Splice_Region',
    'Splice_Site', 'Splice_Lost', 'Translation_Start_Site', 'coding_sequence', 'intergenic_variant',
    'protein_altering', 'splice site_mutation', 'stop_retained', 'synonymous', '3\'UTR', '3_prime_UTR',
    '5\'Flank', '5\'UTR', '5\'UTR_mutation', '5_prime_UTR'];
    annotated_variants = this.trialService.getOncokbVariants();
    oncokb = this.trialService.oncokb;
    validationMessage = {
        gene: '',
        example: ''
    };
    geneValidation = false;
    exampleValidation = false;
    displayOptionalFields = false;

    search = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .distinctUntilChanged()
        .map((term) => (term.length < 1 || _.isUndefined(this.annotated_variants[this.genomicInput.hugo_symbol])) ? []
            : this.annotated_variants[this.genomicInput.hugo_symbol]
            .filter((v) => v.toLowerCase().indexOf(term.split(',').slice(-1)[0].trim().toLowerCase()) > -1)
            .slice(0, 10));
    selectAnnotatedVariant($event) {
        if (this.genomicInput.annotated_variant.includes(',')) {
            $event.preventDefault();
            const variantArray = this.genomicInput.annotated_variant.split(',').slice(0, -1);
            variantArray.push($event.item);
            this.genomicInput.annotated_variant = variantArray.join(',');
        }
    }
    constructor(private trialService: TrialService, public http: Http) {
    }
    ngOnInit() {
        this.trialService.genomicInputObs.subscribe((message) => {
            this.genomicInput = message;
        });
        this.trialService.operationPoolObs.subscribe((message) => {
            this.operationPool = message;
        });
        let optionalFields = ['ms_status', 'mmr_status'];
        if (!this.oncokb) {
            optionalFields = optionalFields.concat(['display_name', 'fusion_partner_hugo_symbol']);
        }
        _.some(optionalFields, function(key) {
            if (!_.isEmpty(this.unit) && this.unit.genomic[key]) {
                this.displayOptionalFields = true;
            }
        }, this);
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    // This validation function will be executed the moment the input box lose focus
    validateGenomicGene() {
        // hugo_symbol can be empty.
        if (_.isEmpty(this.genomicInput.hugo_symbol)) {
            this.validationMessage['gene'] = '';
            this.geneValidation = true;
            this.trialService.setHasErrorInputField(false);
            return;
        }
        this.http.get(this.trialService.getAPIUrl('GeneValidation') + this.genomicInput.hugo_symbol)
        .subscribe((res: Response) => {
           const result = res.json();
           if (result.hits.length > 0) {
                this.validationMessage['gene'] = 'Valid gene';
                this.geneValidation = true;
               this.trialService.setHasErrorInputField(false);
           } else {
                this.validationMessage['gene'] = 'Invalid gene';
                this.geneValidation = false;
               // Disable "Add" or "Save" button
               this.trialService.setHasErrorInputField(true);
           }
        });
    }
    validateGenomicExample() {
        if (this.genomicInput.hugo_symbol && this.genomicInput.annotated_variant && this.genomicInput.matching_examples) {
            const variantsTobeValidated = 'hugoSymbol=' + this.genomicInput.hugo_symbol + '&variant=' +
                this.genomicInput.annotated_variant + '&examples=' + this.genomicInput.matching_examples;
            this.http.get(this.trialService.getAPIUrl('ExampleValidation') + variantsTobeValidated)
            .subscribe((res: Response) => {
                const result = res.json();
                if (result[this.genomicInput.matching_examples] === true) {
                    this.validationMessage['example'] = 'Valid';
                    this.exampleValidation = true;
                } else {
                    this.validationMessage['example'] = 'Invalid';
                    this.exampleValidation = false;
                }
            });
        }
    }
    getMessageStyle(type) {
        const result = (type === 'gene' ? this.geneValidation : this.exampleValidation);
        return result === true ? { 'color': 'green' } : { 'color': 'red' };
    }
    getDisplayContent(key: string) {
        return this.trialService.getNodeDisplayContent(key, this.unit['genomic']);
    }
    collapse() {
        if (this.displayOptionalFields) {
            this.displayOptionalFields = false;
        } else {
            this.displayOptionalFields = true;
        }
    }
    unCheckRadio(event) {
        if (event.target.value === this.genomicInput.wildtype) {
            this.genomicInput.wildtype = '';
        }
    }

}
