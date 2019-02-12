import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConverterComponent } from './converter/converter.component';
import { errorRoute, navbarRoute } from './layouts';
import { TrialComponent } from './trial/trial.component';
import { DEBUG_INFO_ENABLED } from './app.constants';

const LAYOUT_ROUTES: Routes = [
    navbarRoute,
    { path: 'trials', component: TrialComponent },
    { path: 'data', component: ConverterComponent },
    { path: 'trials/:id', component: TrialComponent },
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
