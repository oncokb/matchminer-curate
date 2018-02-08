import './vendor.ts';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ngx-webstorage';

import { MatchminerCurateSharedModule, UserRouteAccessService } from './shared';
import { MatchminerCurateAppRoutingModule} from './app-routing.module';
import { MatchminerCurateHomeModule } from './home/home.module';
import { MatchminerCurateAdminModule } from './admin/admin.module';
import { MatchminerCurateAccountModule } from './account/account.module';
import { MatchminerCurateEntityModule } from './entities/entity.module';
import { customHttpProvider } from './blocks/interceptor/http.provider';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {SelectModule} from 'angular2-select';

// customized coponent
import { TrialComponent } from './trial/trial.component';
import { GenomicComponent } from './genomic/genomic.component';
import { ClinicalComponent } from './clinical/clinical.component';
import { PanelComponent } from './panel/panel.component';
import { MatchComponent } from './match/match.component';
import { LoginComponent } from './login/login.component';

import { TrialService } from './service/trial.service';
import { environment } from './environments/environment';
import {
    JhiMainComponent,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    ErrorComponent
} from './layouts';

@NgModule({
    imports: [
        BrowserModule,
        MatchminerCurateAppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-'}),
        MatchminerCurateSharedModule,
        MatchminerCurateHomeModule,
        MatchminerCurateAdminModule,
        MatchminerCurateAccountModule,
        MatchminerCurateEntityModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularMultiSelectModule,
        SelectModule
    ],
    declarations: [
        JhiMainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        FooterComponent,
        TrialComponent,
        GenomicComponent,
        ClinicalComponent,
        PanelComponent,
        MatchComponent,
        LoginComponent
    ],
    providers: [
        ProfileService,
        customHttpProvider(),
        PaginationConfig,
        UserRouteAccessService,
        TrialService
    ],
    bootstrap: [ JhiMainComponent ]
})
export class MatchminerCurateAppModule {}
