import { Component, OnInit, Input } from '@angular/core';
import { TrialService } from '../service/trial.service';
import * as _ from 'underscore';
@Component({
  selector: 'jhi-match',
  templateUrl: './match.component.html',
  styleUrls: ['match.scss']
})
export class MatchComponent implements OnInit {
  @Input() match: Array<any>;
  @Input() base = 0;
  @Input() path = '';
  constructor(private trialService: TrialService) {
   }

  ngOnInit() {
  }
  getStyle(indent: number) {
    return this.trialService.getStyle(this.base + indent);
  }
  isValidMatch(unit: object) {
    return !_.isUndefined(unit);
  }
}
