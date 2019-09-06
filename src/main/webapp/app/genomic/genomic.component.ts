import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Genomic } from './genomic.model';
import * as _ from 'lodash';
import { ConnectionService } from '../service/connection.service';
import { MainutilService } from '../service/mainutil.service';
import { Geneset } from './geneset.model';

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
    oncokb = MainUtil.oncokb;
    validationMessage = {
        gene: '',
        example: ''
    };
    geneValidation = false;
    exampleValidation = false;
    genesetOptions = this.trialService.getGenesetsOptions();
    disableHugoSymbol = false;

    search = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .distinctUntilChanged()
        .map((term) => (term.length < 1 || _.isUndefined(this.annotated_variants[this.genomicInput.hugo_symbol])) ? []
            : this.annotated_variants[this.genomicInput.hugo_symbol]
            .filter((v) => v.toLowerCase().indexOf(term.split(',').slice(-1)[0].trim().toLowerCase()) > -1)
            .slice(0, 10))
    selectAnnotatedVariant($event) {
        if (this.genomicInput.annotated_variant.includes(',')) {
            $event.preventDefault();
            const variantArray = this.genomicInput.annotated_variant.split(',').slice(0, -1);
            variantArray.push($event.item);
            this.genomicInput.annotated_variant = variantArray.join(',');
        }
    }

    constructor(private trialService: TrialService, public connectionService: ConnectionService) {}

    ngOnInit() {
        this.trialService.genomicInputObs.subscribe((message) => {
            this.genomicInput = message;
            if (this.genomicInput.geneset_id) {
                this.disableHugoSymbol = true;
            }
        });
        this.trialService.operationPoolObs.subscribe((message) => {
            this.operationPool = message;
        });
    }
    getStyle() {
        return MainUtil.getStyle(this.indent);
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
        this.connectionService.validateGenomicGene(this.genomicInput.hugo_symbol).subscribe((result) => {
           if (result['hits'].length > 0) {
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
            this.connectionService.validateGenomicExample(variantsTobeValidated).subscribe((result) => {
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
    unCheckRadio(key, event) {
        this.genomicInput[key] = MainUtil.uncheckRadio(this.genomicInput[key], event.target.value);
    }
    changeGeneset() {
        if (this.genomicInput.geneset_id) {
            this.disableHugoSymbol = true;
            const selectedGenesetOption = _.some(this.genesetOptions, (option) => option.id === this.genomicInput.geneset_id);
            this.genomicInput.hugo_symbol = selectedGenesetOption.genes.join(', ');
            this.genomicInput.geneset = selectedGenesetOption.name;
            this.genomicInput.annotated_variant = 'Oncogenic Mutations';
        } else {
            this.disableHugoSymbol = false;
            this.genomicInput.geneset = null;
            this.genomicInput.hugo_symbol = '';
            this.genomicInput.annotated_variant = '';
        }
    }
    getGenesetById(id: number, key: string) {
        this.connectionService.getGenesetById(id).subscribe((res: Geneset) => {
            if (key === 'genes') {
                const selectedGenesetOption = _.some(this.genesetOptions, (option) => option.id === id);
                return selectedGenesetOption.genes.join(', ');
            }
            return res[key];
        });
    }
}
