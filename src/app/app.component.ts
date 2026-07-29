import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // Menu byRaiMakes v1
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Catalogo', url: '/servicos', icon: 'bag-handle' },
    { title: 'Carrinho', url: '/agende', icon: 'cart' },
    { title: 'Contato', url: '/cadastro', icon: 'chatbubble' },
  ];
  constructor() {}
}
