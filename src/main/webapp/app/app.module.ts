import './vendor.ts';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ngx-webstorage';
import { DataTablesModule } from 'angular-datatables';

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
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

// customized coponent
import { TrialComponent } from './trial/trial.component';
import { GenomicComponent } from './genomic/genomic.component';
import { ClinicalComponent } from './clinical/clinical.component';
import { ArmComponent } from './arm/arm.component';
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
import { EmailService } from './service/email.service';
import { ConverterComponent } from './converter/converter.component';
import { ConnectionService } from "./service/connection.service";

@NgModule({
    imports: [
        BrowserModule,
        DataTablesModule,
        MatchminerCurateAppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-'}),
        MatchminerCurateSharedModule,
        MatchminerCurateHomeModule,
        MatchminerCurateAdminModule,
        MatchminerCurateAccountModule,
        MatchminerCurateEntityModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        NgSelectModule,
        FormsModule
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
        ArmComponent,
        PanelComponent,
        MatchComponent,
        LoginComponent,
        ConverterComponent
    ],
    providers: [
        ProfileService,
        customHttpProvider(),
        PaginationConfig,
        UserRouteAccessService,
        TrialService,
        ConnectionService
    ],
    bootstrap: [ JhiMainComponent ]
})
export class MatchminerCurateAppModule {}
