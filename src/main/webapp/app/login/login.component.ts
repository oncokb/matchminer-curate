import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { TrialService } from '../service/trial.service';
import { environment } from '../environments/environment';
@Component({
    selector: 'jhi-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    public user: Observable<firebase.User>;
    status = this.trialService.getStatus();

    constructor(public afAuth: AngularFireAuth, private trialService: TrialService) {
        this.user = this.afAuth.authState;
        this.user.subscribe((res) => {
            if (res && res.uid) {
                if (environment.whiteList.indexOf(res.email) === -1) {
                    alert('Sorry, you do not have the permission to login');
                    this.logout();
                } else {
                    this.status['login'] = true;
                }
            } else {
                this.status['login'] = false;
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
