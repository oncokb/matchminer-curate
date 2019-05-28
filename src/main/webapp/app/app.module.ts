import './vendor.ts';

import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2Webstorage } from 'ngx-webstorage';
import { DataTablesModule } from 'angular-datatables';
import { JhiEventManager } from 'ng-jhipster';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { MatchminerCurateSharedModule, UserRouteAccessService } from './shared';
import { MatchminerCurateAppRoutingModule} from './app-routing.module';
import { MatchminerCurateHomeModule } from './home/home.module';
import { MatchminerCurateAdminModule } from './admin/admin.module';
import { MatchminerCurateAccountModule } from './account/account.module';
import { MatchminerCurateEntityModule } from './entities/entity.module';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import { AngularFireDatabaseModule } from '@angular/fire/database';
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
import { StateStorageService } from './shared/auth/state-storage.service';
// jhipster-needle-angular-add-module-import JHipster will add new module here
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
import { ConnectionService } from './service/connection.service';
import { MainutilService } from './service/mainutil.service';
import { DrugComponent } from './drug/drug.component';
import { MetaComponent } from './meta/meta.component';
import { MetaService } from './service/meta.service';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

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
        FormsModule,
        NgxDatatableModule
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
        DrugComponent,
        PanelComponent,
        MatchComponent,
        LoginComponent,
        ConverterComponent,
        MetaComponent
    ],
    providers: [
        ProfileService,
        PaginationConfig,
        UserRouteAccessService,
        TrialService,
        ConnectionService,
        EmailService,
        MainutilService,
        MetaService,
        UserRouteAccessService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [
                StateStorageService,
                Injector
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
            deps: [
                JhiEventManager
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [
                Injector
            ]
        }
    ],
    bootstrap: [ JhiMainComponent ]
})
export class MatchminerCurateAppModule {}
