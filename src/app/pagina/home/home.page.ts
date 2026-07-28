import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FirebaseService, Produto } from '../../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    public nav: NavController,
    private fb: FirebaseService
  ) { }

  ngOnInit() {
    this.loadProdutos();
    this.loadCategorias();
  }

  openPage(url: string) {
    this.nav.navigateForward(url);
  }

  openProduct(p: Produto) {
    this.nav.navigateForward('/servicos', {
      queryParams: { id: p.id }
    });
  }

  selectCategory(cat: any) {
    this.categorias.forEach(c => c.active = false);
    cat.active = true;
    this.loadProdutosByCategoria(cat.nome);
  }

  loadProdutos() {
    this.fb.getProdutos().subscribe(prods => {
      this.produtos = prods;
      this.carregarSlides(prods);
    });
  }

  loadProdutosByCategoria(cat: string) {
    if (cat === 'Todos') {
      this.loadProdutos();
    } else {
      this.fb.getProdutosByCategoria(cat).subscribe(prods => {
        this.produtos = prods;
      });
    }
  }

  loadCategorias() {
    this.fb.getCategorias().subscribe(cats => {
      if (cats.length) {
        this.categorias = [
          { nome: 'Todos', icon: 'grid-outline', active: true, ativo: true },
          ...cats
        ];
      }
    });
  }

  carregarSlides(prods: Produto[]) {
    if (prods.length >= 3) {
      this.slides = prods.slice(0, 3).map(p => ({
        title: p.nome,
        subtitle: `R$ ${p.preco}`,
        cta: 'Ver Produto',
        link: '/servicos',
        bg: 'linear-gradient(135deg, #e884b0 0%, #d4a93f 100%)'
      }));
    }
  }

  categorias: any[] = [
    { nome: 'Todos', icon: 'grid-outline', active: true, ativo: true },
    { nome: 'Batons', icon: 'color-palette-outline', active: false, ativo: true },
    { nome: 'Bases', icon: 'sparkles-outline', active: false, ativo: true },
    { nome: 'Sombras', icon: 'diamond-outline', active: false, ativo: true },
    { nome: 'Corretivos', icon: 'eyedrop-outline', active: false, ativo: true },
    { nome: 'Gloss', icon: 'water-outline', active: false, ativo: true },
    { nome: 'Skincare', icon: 'leaf-outline', active: false, ativo: true }
  ];

  produtos: Produto[] = [];

  slides: any[] = [
    { title: 'Nova Coleção', subtitle: 'Descubra os produtos', cta: 'Ver Coleção', link: '/servicos', bg: 'linear-gradient(135deg, #e884b0 0%, #d4a93f 100%)' },
    { title: 'Leve 3 por R$ 79,90', subtitle: 'Escolha seus favoritos', cta: 'Ver Ofertas', link: '/servicos', bg: 'linear-gradient(135deg, #d4a93f 0%, #e884b0 100%)' },
    { title: 'Frete Grátis', subtitle: 'Em compras acima de R$ 150', cta: 'Aproveitar', link: '/servicos', bg: 'linear-gradient(135deg, #a8456b 0%, #e884b0 100%)' }
  ];
}