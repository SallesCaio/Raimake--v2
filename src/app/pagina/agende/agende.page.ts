import { Component, OnInit } from '@angular/core';
import { CarrinhoService, ItemCarrinho } from '../../carrinho.service';

@Component({
  selector: 'app-agende',
  templateUrl: './agende.page.html',
  styleUrls: ['./agende.page.scss'],
})
export class AgendePage implements OnInit {
  itens: ItemCarrinho[] = [];
  total = 0;

  whatsapp = '5521970579631';

  constructor(private carrinho: CarrinhoService) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.atualizar();
  }

  atualizar() {
    this.itens = this.carrinho.listar();
    this.total = this.carrinho.total();
  }

  remover(id: string) {
    this.carrinho.remover(id);
    this.atualizar();
  }

  finalizarWhatsapp() {
    if (this.itens.length === 0) { return; }
    let msg = 'Olá! Quero fazer o pedido na byRaiMake:%0A%0A';
    this.itens.forEach((i) => {
      msg += `• ${i.nome} (x${i.qtd}) — R$ ${(i.preco * i.qtd).toFixed(2)}%0A`;
    });
    msg += `%0ATotal: R$ ${this.total.toFixed(2)}%0A%0A*Consulte disponibilidade e área de entrega*`;
    const url = `https://wa.me/${this.whatsapp}?text=${msg}`;
    window.open(url, '_blank');
  }
}