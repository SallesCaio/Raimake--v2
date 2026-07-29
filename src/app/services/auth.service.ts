import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }
}