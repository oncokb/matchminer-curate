import './vendor.ts';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ng2-webstorage';
import { MatchMinerCurateSharedModule, UserRouteAccessService } from './shared';
import { MatchMinerCurateHomeModule } from './home/home.module';
import { MatchMinerCurateAdminModule } from './admin/admin.module';
import { MatchMinerCurateAccountModule } from './account/account.module';
import { MatchMinerCurateEntityModule } from './entities/entity.module';
import { customHttpProvider } from './blocks/interceptor/http.provider';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import {
    JhiMainComponent,
    LayoutRoutingModule,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    ErrorComponent
} from './layouts';
import { TrialComponent } from './trial/trial.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { MatchComponent } from './match/match.component';
import { NodeComponent } from './node/node.component';
import { TrialService } from './service/trial.service';
import { AuthService } from './service/auth.service';
import { GenomicComponent } from './genomic/genomic.component';
import { ClinicalComponent } from './clinical/clinical.component';
import { LoginComponent } from './login/login.component';
import { environment } from './environments/environment';
@NgModule({
    imports: [
        BrowserModule,
        LayoutRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-' }),
        MatchMinerCurateSharedModule,
        MatchMinerCurateHomeModule,
        MatchMinerCurateAdminModule,
        MatchMinerCurateAccountModule,
        MatchMinerCurateEntityModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularMultiSelectModule
    ],
    declarations: [
        JhiMainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        FooterComponent,
        TrialComponent,
        MatchComponent,
        NodeComponent,
        GenomicComponent,
        ClinicalComponent,
        LoginComponent
    ],
    providers: [
        ProfileService,
        customHttpProvider(),
        PaginationConfig,
        UserRouteAccessService,
        TrialService,
        AuthService
    ],
    bootstrap: [JhiMainComponent]
})
export class MatchMinerCurateAppModule { }
