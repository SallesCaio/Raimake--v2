import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Catalogo', url: '/servicos', icon: 'bag-handle' },
    { title: 'Carrinho', url: '/agende', icon: 'cart' },
    { title: 'Contato', url: '/cadastro', icon: 'chatbubble' },
  ];

  isAdmin = false;
  private authSub?: Subscription;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.checkAdminSession();
    this.listenAuthState();
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  private checkAdminSession() {
    const session = localStorage.getItem('adminSession');
    const expiry = localStorage.getItem('sessionExpiry');
    
    if (session && expiry && Date.now() < parseInt(expiry, 10)) {
      this.isAdmin = true;
      this.addDashboardMenu();
    }
  }

  private listenAuthState() {
    this.authSub = this.auth.isLoggedIn().subscribe(loggedIn => {
      if (loggedIn) {
        this.checkAdminSession();
      } else {
        this.isAdmin = false;
        this.removeDashboardMenu();
      }
    });
  }

  private addDashboardMenu() {
    if (!this.appPages.some(p => p.url === '/admin/dashboard')) {
      this.appPages.push({ title: 'Dashboard', url: '/admin/dashboard', icon: 'speedometer' });
    }
  }

  private removeDashboardMenu() {
    const idx = this.appPages.findIndex(p => p.url === '/admin/dashboard');
    if (idx !== -1) {
      this.appPages.splice(idx, 1);
    }
  }
}