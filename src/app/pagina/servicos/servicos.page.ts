import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CarrinhoService, ItemCarrinho } from '../../carrinho.service';

@Component({
  selector: 'app-servicos',
  templateUrl: './servicos.page.html',
  styleUrls: ['./servicos.page.scss'],
})
export class ServicosPage implements OnInit {
  // Catálogo com imagens reais enviadas (produto1..4)
  // Nomes genéricos — ajustar conforme o conteúdo real das fotos
  produtos = [
    { id: 'p1', nome: 'Kit Beauty Essencial', preco: 89.9, img: '/assets/produtos/produto1.png', cat: 'Kits' },
    { id: 'p2', nome: 'Paleta Glamour', preco: 79.9, img: '/assets/produtos/produto2.png', cat: 'Sombras' },
    { id: 'p3', nome: 'Coleção Radiante', preco: 99.9, img: '/assets/produtos/produto3.png', cat: 'Looks' },
    { id: 'p4', nome: 'Box Premium Make', preco: 119.9, img: '/assets/produtos/produto4.png', cat: 'Premium' },
  ];

  constructor(
    private carrinho: CarrinhoService,
    private toast: ToastController,
  ) { }

  ngOnInit() {}

  // Adiciona ao carrinho e avisa
  async add(p: any) {
    const item: ItemCarrinho = {
      id: p.id, nome: p.nome, preco: p.preco, img: p.img, qtd: 1,
    };
    this.carrinho.adicionar(item);
    const t = await this.toast.create({
      message: `${p.nome} adicionado`,
      duration: 1200,
      color: 'success',
      position: 'bottom',
    });
    await t.present();
  }
}
