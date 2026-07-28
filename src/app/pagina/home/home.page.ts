import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FirebaseService, Produto, Categoria } from '../../services/firebase.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    public nav: NavController,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.loadProdutos();
    this.loadCategorias();
  }

  // Navegação simples entre páginas
  openPage(url: string) {
    this.nav.navigateForward(url);
  }

  // Abrir produto
  openProduct(produto: Produto) {
    this.nav.navigateForward('/servicos', {
      queryParams: { id: produto.id }
    });
  }

  // Selecionar categoria
  selectCategory(cat: any) {
    this.categorias.forEach(c => c.active = false);
    cat.active = true;
    this.loadProdutosByCategoria(cat.nome);
  }

  // Carregar produtos do Firebase
  loadProdutos() {
    this.firebaseService.getProdutos().subscribe(produtos => {
      this.produtos = produtos;
    });
  }

  // Carregar produtos por categoria
  loadProdutosByCategoria(categoria: string) {
    if (categoria === 'Todos') {
      this.loadProdutos();
    } else {
      this.firebaseService.getProdutosByCategoria(categoria).subscribe(produtos => {
        this.produtos = produtos;
      });
    }
  }

  // Carregar categorias do Firebase
  loadCategorias() {
    this.firebaseService.getCategorias().subscribe(categorias => {
      this.categorias = [
        { nome: 'Todos', icon: 'grid-outline', active: true, ativo: true },
        ...categorias
      ];
    });
  }

  // Categorias (Sephora style)
  categorias: any[] = [
    { nome: 'Todos', icon: 'grid-outline', active: true, ativo: true },
    { nome: 'Batons', icon: 'color-palette-outline', active: false, ativo: true },
    { nome: 'Bases', icon: 'sparkles-outline', active: false, ativo: true },
    { nome: 'Sombras', icon: 'diamond-outline', active: false, ativo: true },
    { nome: 'Corretivos', icon: 'eyedrop-outline', active: false, ativo: true },
    { nome: 'Gloss', icon: 'water-outline', active: false, ativo: true },
    { nome: 'Skincare', icon: 'leaf-outline', active: false, ativo: true }
  ];

  // Produtos reais (fotos do usuário)
  produtos: Produto[] = [
    {
      id: '1',
      nome: 'Corretivo True Skin',
      descricao: 'Corretivo de alta cobertura',
      preco: 49.90,
      img: 'assets/img/CorretivoTrueSkin.jpeg',
      promo: '-20%',
      isNew: false,
      categoria: 'Corretivos',
      ativo: true,
      createdAt: new Date()
    },
    {
      id: '2',
      nome: 'Gel Facial Preto',
      descricao: 'Gel limpeza facial profunda',
      preco: 39.90,
      img: 'assets/img/GelFacialPreta.jpeg',
      promo: undefined,
      isNew: true,
      categoria: 'Skincare',
      ativo: true,
      createdAt: new Date()
    },
    {
      id: '3',
      nome: 'Gel Facial Verde',
      descricao: 'Gel hidratante facial',
      preco: 45.90,
      img: 'assets/img/GelFacialVerd.jpeg',
      promo: undefined,
      isNew: false,
      categoria: 'Skincare',
      ativo: true,
      createdAt: new Date()
    },
    {
      id: '4',
      nome: 'Gloss Ruby Rose',
      descricao: 'Gloss labial com brilho',
      preco: 29.90,
      img: 'assets/img/GlossRubyRose.jpeg',
      promo: '-15%',
      isNew: false,
      categoria: 'Gloss',
      ativo: true,
      createdAt: new Date()
    },
    {
      id: '5',
      nome: 'Lápis de Olho',
      descricao: 'Lápis macio e duradouro',
      preco: 19.90,
      img: 'assets/img/Lapis.jpeg',
      promo: undefined,
      isNew: false,
      categoria: 'Sombras',
      ativo: true,
      createdAt: new Date()
    },
    {
      id: '6',
      nome: 'Pó Banana',
      descricao: 'Pó compacto translúcido',
      preco: 59.90,
      img: 'assets/img/PodeBanana.jpeg',
      promo: 'Novo',
      isNew: true,
      categoria: 'Bases',
      ativo: true,
      createdAt: new Date()
    }
  ];
}