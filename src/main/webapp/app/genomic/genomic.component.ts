import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import { Http, Response } from '@angular/http';
import * as _ from 'underscore';
@Component({
    selector: 'jhi-genomic',
    templateUrl: './genomic.component.html',
    styleUrls: ['genomic.scss']
})
export class GenomicComponent implements OnInit {
    @Input() indent = 0;
    @Input() path = '';
    @Input() unit = {};
    pathPool = this.trialService.getPathpool();
    modificationInput = this.trialService.getModificationInput();
    variant_categorys = ['Mutation', 'Copy Number Variation', 'Structural Variation', 'Any Variation'];
    variant_classifications = ['In_Frame_Del', 'In_Frame_Ins', 'Missense_Mutation', 'Nonsense_Mutation', 'Nonstop_Mutation',
    'Del_Ins', 'Frameshift', 'Frame_Shift_Del','Frame_Shift_Ins', 'Frameshift_mutation',
    'Inframe_Indel', 'Initiator_Codon', 'Intron', 'intron', 'Intron_mutation',
    'Missense and Splice_Region', 'RNA', 'Silent', 'Splice_Acceptor', 'Splice_Donor', 'Splice_Region',
    'Splice_Site', 'Splice_Lost', 'Translation_Start_Site', 'coding_sequence', 'intergenic_variant',
    'protein_altering', 'splice site_mutation', 'stop_retained', 'synonymous', "3'UTR", "3_prime_UTR",
    "5'Flank", "5'UTR", "5'UTR_mutation", "5_prime_UTR"];
    wiltypes = [true, false];
    oncokb_variants = {};
    constructor(private trialService: TrialService, public http: Http) { 
        this.http.get('http://oncokb.org/api/v1/utils/allAnnotatedVariants')
        .subscribe((res: Response) => {
           const allAnnotatedVariants = res.json();
           for(const item of  allAnnotatedVariants) {
                if (item['gene']) {
                    if (this.oncokb_variants[item['gene']]) {
                        this.oncokb_variants[item['gene']].push(item['variant']);
                    } else {
                        this.oncokb_variants[item['gene']] = [item['variant']];
                    }
                }     
           }
           for(const key of _.keys(this.oncokb_variants)) {
                this.oncokb_variants[key].sort();
           }
        });
    }

    ngOnInit() {
    }
    getStyle() {
        return this.trialService.getStyle(this.indent);
    }
}
