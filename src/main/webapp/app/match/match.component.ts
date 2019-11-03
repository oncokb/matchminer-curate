import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import MainUtil from '../service/mainutil';

@Component({
  selector: 'jhi-match',
  templateUrl: './match.component.html',
  styleUrls: ['match.scss']
})

export class MatchComponent implements OnInit {
  @Input() match: Array<any>;
  @Input() base = 0;
  @Input() path = '';

  constructor() {}

  ngOnInit() {}

  getStyle(indent: number) {
    return MainUtil.getStyle(this.base + indent);
  }

  isValidMatch(unit: object) {
    return !_.isUndefined(unit);
  }
}
