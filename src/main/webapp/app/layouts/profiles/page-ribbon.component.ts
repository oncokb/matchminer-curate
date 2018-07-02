import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'jhi-page-ribbon',
    template: `<div class="ribbon" *ngIf="ribbonEnv"><a href="">{{ribbonEnv}}</a></div>`,
    styleUrls: [
        'page-ribbon.scss'
    ]
})
export class PageRibbonComponent implements OnInit {
    ribbonEnv: string;

    constructor() {}

    ngOnInit() {}
}
