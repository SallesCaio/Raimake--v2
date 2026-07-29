import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
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

  showCheckout = false;
  clienteTelefone = '';
  clienteNome = '';
  clienteEndereco = '';
  clientePagamento = 'Pix';

  constructor(
    private carrinho: CarrinhoService,
    public nav: NavController
  ) { }

  ngOnInit() {}

  openPage(url: string) {
    this.nav.navigateForward(url);
  }

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

  abrirCheckout() {
    if (this.itens.length === 0) return;
    this.showCheckout = true;
  }

  confirmarPedido() {
    if (!this.clienteTelefone || this.itens.length === 0) return;

    const desconto = this.clientePagamento === 'Pix' || this.clientePagamento === 'Dinheiro';
        const valorFinal = desconto ? this.total * 0.9 : this.total;
        let msg = '🛍️ *NOVO PEDIDO - byRaiMakes*%0A%0A';
        msg += `👤 *Cliente:* ${this.clienteNome || 'Nao informado'}%0A`;
        msg += `📞 *Tel:* ${this.clienteTelefone}%0A`;
        msg += `📍 *Endereco:* ${this.clienteEndereco || 'Nao informado'}%0A`;
        msg += `💳 *Pagamento:* ${this.clientePagamento}%0A%0A`;
        msg += '📋 *Itens:*%0A';
        this.itens.forEach((i) => {
          msg += `  • ${i.nome} (x${i.qtd}) — R$ ${(i.preco * i.qtd).toFixed(2)}%0A`;
        });
        msg += `%0A💰 *Subtotal:* R$ ${this.total.toFixed(2)}%0A`;
        if (desconto) {
          msg += `🎉 *Desconto ${this.clientePagamento} (10%):* -R$ ${(this.total * 0.1).toFixed(2)}%0A`;
        }
    msg += `✅ *Total a pagar:* R$ ${valorFinal.toFixed(2)}%0A%0A`;
    msg += '_Consulte disponibilidade e area de entrega_';

    const url = `https://wa.me/${this.whatsapp}?text=${msg}`;
    window.open(url, '_blank');

    this.carrinho.limpar();
    this.showCheckout = false;
    this.atualizar();
  }
}