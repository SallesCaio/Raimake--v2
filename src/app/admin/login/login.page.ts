import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class AdminLoginPage {
  loginForm: FormGroup;
  erro = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.erro = '';

    try {
      const { email, senha } = this.loginForm.value;
      await this.afAuth.signInWithEmailAndPassword(email, senha);
      
      // Salvar sessão no localStorage
      const expiry = Date.now() + SESSION_DURATION;
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('sessionExpiry', expiry.toString());
      
      this.router.navigate(['/admin/dashboard']);
    } catch (e: any) {
      this.erro = e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
        ? 'E-mail ou senha inválidos'
        : 'Erro ao fazer login. Tente novamente.';
    }
    this.loading = false;
  }
}