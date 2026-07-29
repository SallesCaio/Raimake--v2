import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  // Menu byRaiMakes v1
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Catalogo', url: '/servicos', icon: 'bag-handle' },
    { title: 'Carrinho', url: '/agende', icon: 'cart' },
    { title: 'Contato', url: '/cadastro', icon: 'chatbubble' },
  ];

  isAdmin = false;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.checkAdminSession();
  }

  private checkAdminSession() {
    const session = localStorage.getItem('adminSession');
    const expiry = localStorage.getItem('sessionExpiry');
    
    if (session && expiry && Date.now() < parseInt(expiry, 10)) {
      this.isAdmin = true;
      this.appPages.push({ title: 'Dashboard', url: '/admin/dashboard', icon: 'speedometer' });
    }
  }
}