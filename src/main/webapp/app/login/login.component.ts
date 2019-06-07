import { Component } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { TrialService } from '../service/trial.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { MetaService } from '../service/meta.service';
@Component({
    selector: 'jhi-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    public user: Observable<firebase.User>;
    oncokb = environment['oncokb'] ? environment['oncokb'] : false;
    constructor(public afAuth: AngularFireAuth, private trialService: TrialService, private metaService: MetaService) {
        this.user = this.afAuth.authState;
        this.user.subscribe((res) => {
            if (res && res.uid) {
                this.trialService.fetchTrials();
                this.trialService.fetchAdditional();
                if (this.oncokb) {
                    this.metaService.fetchMetas();
                }
            }
        });
    }
    login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((res) => {
        }).catch((err) => {
            alert('Failed to log in');
        });
    }
    logout() {
        this.afAuth.auth.signOut().then((res) => {
        }).catch((err) => {
            console.log('Failed to log out');
        });
    }
}
