import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
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
    constructor(private trialService: TrialService) { 
    }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
}
