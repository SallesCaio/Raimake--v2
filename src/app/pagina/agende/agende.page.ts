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

  // Número do WhatsApp (substituir pelo real, só dígitos, com DDI)
  whatsapp = '5599999999999';

  constructor(private carrinho: CarrinhoService) { }

  ngOnInit() {}

  // Atualiza a view quando entra na página
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

  // Gera mensagem e abre o WhatsApp
  finalizarWhatsapp() {
    if (this.itens.length === 0) { return; }
    let msg = 'Olá! Quero fazer o pedido na RaiMake:%0A%0A';
    this.itens.forEach((i) => {
      msg += `• ${i.nome} (x${i.qtd}) — R$ ${(i.preco * i.qtd).toFixed(2)}%0A`;
    });
    msg += `%0ATotal: R$ ${this.total.toFixed(2)}%0A%0AObrigada!`;
    const url = `https://wa.me/${this.whatsapp}?text=${msg}`;
    window.open(url, '_blank');
  }
}
