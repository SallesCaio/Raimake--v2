import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CarrinhoService } from '../../carrinho.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  whatsapp = '5521970579631';
  instagram = 'byraimakes';
  entrega = 'Galeão - Ilha do Governador e arredores';
  cartQtd = 0;
  cartTotal = 0;

  constructor(
    public nav: NavController,
    private carrinho: CarrinhoService
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.cartQtd = this.carrinho.qtdTotal();
    this.cartTotal = this.carrinho.total();
  }

  openPage(url: string) {
    this.nav.navigateForward(url);
  }

  abrirWhatsapp() {
    window.open(`https://wa.me/${this.whatsapp}`, '_blank');
  }

  abrirInsta() {
    window.open(`https://instagram.com/${this.instagram}`, '_blank');
  }
}