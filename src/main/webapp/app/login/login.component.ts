import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { TrialService } from '../service/trial.service';
@Component({
    selector: 'jhi-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    public user: Observable<firebase.User>;
    constructor(public afAuth: AngularFireAuth, private trialService: TrialService) {
        this.user = this.afAuth.authState;
        this.user.subscribe((res) => {
            if (res && res.uid) {
                this.trialService.fetchTrials();
                this.trialService.fetchAdditional();
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
