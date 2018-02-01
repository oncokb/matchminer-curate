import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Http, Response } from '@angular/http';
import { environment } from '../environments/environment';
import { SERVER_API_URL } from '../app.constants';

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
    pathPool = this.trialService.getPathpool();
    operationPool = this.trialService.getOperationPool();
    genomicInput = this.trialService.getGenomicInput();
    variant_categorys = ['Mutation', 'Copy Number Variation', 'Structural Variation', 'Any Variation'];
    variant_classifications = ['In_Frame_Del', 'In_Frame_Ins', 'Missense_Mutation', 'Nonsense_Mutation', 'Nonstop_Mutation',
    'Del_Ins', 'Frameshift', 'Frame_Shift_Del','Frame_Shift_Ins', 'Frameshift_mutation',
    'Inframe_Indel', 'Initiator_Codon', 'Intron', 'intron', 'Intron_mutation',
    'Missense and Splice_Region', 'RNA', 'Silent', 'Splice_Acceptor', 'Splice_Donor', 'Splice_Region',
    'Splice_Site', 'Splice_Lost', 'Translation_Start_Site', 'coding_sequence', 'intergenic_variant',
    'protein_altering', 'splice site_mutation', 'stop_retained', 'synonymous', "3'UTR", "3_prime_UTR",
    "5'Flank", "5'UTR", "5'UTR_mutation", "5_prime_UTR"];
    wiltypes = [true, false];
    oncokb_variants = this.trialService.getOncokbVariants();
    oncokb = environment.oncokb ? environment.oncokb : false;
    validationMessage = '';
    validGenomic = this.trialService.getValidGenomic();
    constructor(private trialService: TrialService, public http: Http) { 
    }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
    // This validation function will be executed the moment the input box lose focus
    validateGenomicSection() {
        this.http.get(SERVER_API_URL + 'proxy/http/mygene.info/v3/query?species=human&q=symbol:' + this.genomicInput.hugo_symbol)
        .subscribe((res: Response) => {
           const result = res.json();
           if (result.hits.length > 0) {
                this.validationMessage = 'Valid gene';
                this.validGenomic.splice(0, this.validGenomic.length);
                this.validGenomic.push(true);
           } else {
                this.validationMessage = 'Invalid gene';
                this.validGenomic.splice(0, this.validGenomic.length);
                this.validGenomic.push(false);
           }  
        });
    }
    getMessageStyle() {
        if (this.validGenomic[0] === true) {
            return { 'color': 'green' };
        } else if (this.validGenomic[0] === false) {
            return { 'color': 'red' };
        }
    }
}
