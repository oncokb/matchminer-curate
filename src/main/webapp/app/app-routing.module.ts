import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConverterComponent } from './converter/converter.component';
import { errorRoute, navbarRoute } from './layouts';
import { TrialComponent } from './trial/trial.component';
import { DEBUG_INFO_ENABLED } from './app.constants';
import { MetaComponent } from './meta/meta.component';

const LAYOUT_ROUTES: Routes = [
    navbarRoute,
    { path: 'trials', component: TrialComponent },
    { path: 'data', component: ConverterComponent },
    { path: 'meta', component: MetaComponent },
    { path: 'trials/:nctId', component: TrialComponent },
    { path: 'trials/:nctId/:protocolNo', component: TrialComponent },
    ...errorRoute
];

@NgModule({
    imports: [
        RouterModule.forRoot(LAYOUT_ROUTES, { useHash: true , enableTracing: DEBUG_INFO_ENABLED })
    ],
    exports: [
        RouterModule
    ]
})
export class MatchminerCurateAppRoutingModule {}
