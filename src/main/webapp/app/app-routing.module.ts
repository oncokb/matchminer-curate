import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { errorRoute } from './layouts';
import { navbarRoute } from "./layouts/navbar/navbar.route";
import { ConverterComponent } from "./converter/converter.component";
import { TrialComponent } from "./trial/trial.component";


const LAYOUT_ROUTES: Routes = [
    navbarRoute,
    { path: 'trials', component: TrialComponent },
    { path: 'data', component: ConverterComponent },
    { path: 'trials/:id', component: TrialComponent },
    ...errorRoute
];

@NgModule({
    imports: [
        RouterModule.forRoot(LAYOUT_ROUTES, { useHash: true })
    ],
    exports: [
        RouterModule
    ]
})
export class MatchminerCurateAppRoutingModule {}
