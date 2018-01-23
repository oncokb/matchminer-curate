import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../service/auth.service';
@Component({
  selector: 'jhi-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  public user: Observable<firebase.User>;
  constructor(public afAuth: AngularFireAuth, private authService: AuthService) {
    this.user = this.afAuth.authState;
    this.user.map(user => user && user.uid !== undefined)
    .subscribe(success => this.authService.setIsLoggedIn(success));
  }
  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    //this.authService.login();
  }
  logout() {
     this.afAuth.auth.signOut();
    //this.authService.logout();
  }
}
