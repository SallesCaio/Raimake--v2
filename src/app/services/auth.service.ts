import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async login(email: string, senha: string) {
    return this.afAuth.signInWithEmailAndPassword(email, senha);
  }

  logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['/home']);
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this.afAuth.authState.then(user => !!user);
  }
}