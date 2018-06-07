import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TrialService } from '../../service/trial.service';
@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html'
})
export class JhiMainComponent implements OnInit {
    authorized = false;
    showHeader = false;
    showFooter = false;
    constructor(
        private titleService: Title,
        private router: Router,
        private trialService: TrialService
    ) {
        this.trialService.authorizedObs.subscribe(message => this.authorized = message);
        this.showHeader = this.trialService.showHeader;
        this.showFooter = this.trialService.showFooter;
    }

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = (routeSnapshot.data && routeSnapshot.data['pageTitle']) ? routeSnapshot.data['pageTitle'] : 'matchminerCurateApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
        });
    }
}
