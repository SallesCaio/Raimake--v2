import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { Produto } from '../../services/firebase.service';
import { Cliente } from '../../services/cliente.service';

/** Converte valor de createdAt do Firestore (Date | Timestamp | number | null) para Date legítimo. */
function parseCreatedAt(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v.toDate === 'function') return v.toDate();
  return null;
}

interface VendaPeriodo {
  dia: string;
  data: Date;
  valor: number;
}

interface PedidoStatusCount {
  status: string;
  count: number;
}

interface TopProduto {
  nome: string;
  qtd: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  // Navegação
  aba = 'visao';
  subAba = 'pedidos';
  subCatalogo = 'produtos';
  periodo = '7d';

  // Estados de carregamento
  carregandoPedidos = true;
  carregandoFeedbacks = true;

  // Streams
  pedidosStream$: Observable<Pedido[]>;
  feedbacksStream$: Observable<any[]>;

  // Pedidos paginados
  pedidosPaginados: Pedido[] = [];
  totalPaginas = 1;
  pagina = 1;

  // Stats
  receitaTotal = 0;
  vendasHoje = 0;
  vendasMes = 0;
  pedidosConfirmados = 0;
  pedidosCancelados = 0;
  clientesNovos = 0;
  clientesRecorrentes = 0;
  descontosConcedidos = 0;
  ticketMedio = 0;
  totalVendas = 0;
  pedidosPendentes = 0;
  maiorVenda = 0;
  notaMedia = 0;
  caixaHoje = 0;
  caixaPix = 0;
  caixaDinheiro = 0;
  caixaCartao = 0;
  produtosAtivos = 0;
  estoqueBaixo = 0;
  semEstoque = 0;
  produtoMaisVendido = '';
  categoriaMaisVendida = '';
  totalClientes = 0;
  maiorClienteValor: string | number = 0;

  // Gráficos
  vendasPorPeriodo: VendaPeriodo[] = [];
  pedidosPorStatus: PedidoStatusCount[] = [];
  top5Produtos: TopProduto[] = [];
  pedidosDoDiaSel: Pedido[] = [];
  totalDoDiaSel = 0;
  diaSel: Date | null = null;
  maxVendaPeriodo = 0;
  maxStatus = 1;
  maxTop5 = 1;

  // Cards expansíveis
  cardAberto = '';

  // Modais
  confirmarPedidoAlvo: Pedido | null = null;
  confirmarTitulo = '';
  confirmarMensagem = '';
  confirmando = false;

  acaoPedido: Pedido | null = null;
  acaoTitulo = '';
  acaoMensagem = '';
  acaoExecutando = false;
  acaoTipo: 'cancelar' | 'estornar' = 'cancelar';

  private _produtosCache: Produto[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private pedidoService: PedidoService,
    private router: Router
  ) {
    this.pedidosStream$ = this.pedidoService.getAllPedidos();
    this.feedbacksStream$ = this.firestore.collection<any>('feedbacks', ref =>
      ref.orderBy('createdAt', 'desc')
    ).valueChanges();
  }

  ngOnInit() {
    this.carregarCaixaHoje();
    this.carregarProdutos();
    this.carregarClientes();

    this.pedidosStream$.pipe(take(1)).subscribe(pedidos => {
      this.carregandoPedidos = false;
      this.atualizarStats(pedidos);
      this.pedidosPaginados = this.paginar(pedidos);
      this.totalPaginas = Math.ceil(pedidos.length / 10) || 1;
      this.gerarGraficos(pedidos);
    });

    this.feedbacksStream$.pipe(take(1)).subscribe(feedbacks => {
      this.carregandoFeedbacks = false;
      const fs = (feedbacks || []) as any[];
      this.notaMedia = fs.length ? fs.reduce((s: number, f: any) => s + (f.nota || 0), 0) / fs.length : 0;
    });
  }

  async carregarCaixaHoje() {
    const hoje = new Date().toISOString().slice(0, 10);
    try {
      const snap = await this.firestore.doc(`caixa/${hoje}`).get().toPromise();
      this.caixaHoje = (snap?.exists ? (snap.data() as any)?.total : 0) || 0;
    } catch {
      this.caixaHoje = 0;
    }
  }

  async carregarProdutos() {
    try {
      const snap = await this.firestore.collection('produtos', ref => ref.where('ativo', '==', true)).get().toPromise();
      const p = (snap?.docs?.map((d: any) => d.data()) as Produto[]) || [];
      this.produtosAtivos = p.length;
      this.estoqueBaixo = p.filter(x => x.estoque !== undefined && x.estoque > 0 && x.estoque <= 5).length;
      this.semEstoque = p.filter(x => x.estoque !== undefined && x.estoque <= 0).length;
      this._produtosCache = p;
    } catch {
      this.produtosAtivos = 0;
      this.estoqueBaixo = 0;
      this.semEstoque = 0;
    }
  }

  async carregarClientes() {
    try {
      const snap = await this.firestore.collection('clientes', ref => ref.orderBy('valorTotal', 'desc')).get().toPromise();
      const c = (snap?.docs?.map((d: any) => ({ ...d.data(), telefone: d.id })) as Cliente[]) || [];
      this.totalClientes = c.length;
      this.clientesNovos = c.filter(x => (x.totalPedidos || 0) <= 1).length;
      this.clientesRecorrentes = c.filter(x => (x.totalPedidos || 0) > 1).length;
      const top = c.slice().sort((a, b) => (b.valorTotal || 0) - (a.valorTotal || 0))[0];
      this.maiorClienteValor = top ? (top.nome || top.telefone) : 0;
    } catch {
      this.totalClientes = 0;
      this.clientesNovos = 0;
      this.clientesRecorrentes = 0;
      this.maiorClienteValor = 0;
    }
  }

  paginar(pedidos: Pedido[]): Pedido[] {
    const inicio = (this.pagina - 1) * 10;
    return pedidos.slice(inicio, inicio + 10);
  }

  paginaAnterior() {
    if (this.pagina > 1) {
      this.pagina--;
      const todos = this.pedidosPaginados;
      this.pedidosPaginados = this.paginar(todos);
    }
  }

  paginaProxima() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      const inicio = (this.pagina - 1) * 10;
      this.pedidosStream$.pipe(map(pedidos => pedidos.slice(inicio, inicio + 10))).subscribe(p => this.pedidosPaginados = p);
    }
  }

  atualizarStats(pedidos: Pedido[]) {
    this.totalVendas = pedidos.length;
    this.pedidosConfirmados = pedidos.filter(p => p.status === 'confirmado').length;
    this.pedidosCancelados = pedidos.filter(p => p.status === 'cancelado').length;
    this.pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const confirmadosHoje = pedidos.filter(p => {
      if (!p.createdAt) return false;
      const c = parseCreatedAt(p.createdAt);
      if (!c) return false;
      return c >= hoje && p.status === 'confirmado';
    });
    this.vendasHoje = confirmadosHoje.reduce((s, p) => s + (p.totalComDesconto || 0), 0);

    const mes = new Date();
    mes.setDate(1);
    mes.setHours(0, 0, 0, 0);
    const doMes = pedidos.filter(p => {
      const c = parseCreatedAt(p.createdAt);
      return c ? c >= mes : false;
    });
    this.vendasMes = doMes.filter(p => p.status === 'confirmado').reduce((s, p) => s + (p.totalComDesconto || 0), 0);

    const confirmados = pedidos.filter(p => p.status === 'confirmado');
    this.receitaTotal = confirmados.reduce((s, p) => s + (p.totalComDesconto || 0), 0);
    this.maiorVenda = confirmados.length > 0 ? Math.max(0, ...(confirmados.map(p => p.totalComDesconto || 0))) : 0;
    this.ticketMedio = this.pedidosConfirmados > 0 ? this.receitaTotal / this.pedidosConfirmados : 0;

    // Por modalidade
    this.caixaPix = confirmados.filter(p => p.formaPagamento === 'Pix').reduce((s, p) => s + (p.totalComDesconto || 0), 0);
    this.caixaDinheiro = confirmados.filter(p => p.formaPagamento === 'Dinheiro').reduce((s, p) => s + (p.totalComDesconto || 0), 0);
    this.caixaCartao = confirmados.filter(p => p.formaPagamento === 'Cartão').reduce((s, p) => s + (p.totalComDesconto || 0), 0);

    this.pedidosPorStatus = [
      { status: 'pendente', count: this.pedidosPendentes },
      { status: 'confirmado', count: this.pedidosConfirmados },
      { status: 'estornado', count: pedidos.filter(p => p.status === 'estornado').length },
      { status: 'cancelado', count: this.pedidosCancelados },
    ];
    this.maxStatus = Math.max(1, ...this.pedidosPorStatus.map(s => s.count));

    this.descontosConcedidos = confirmados.reduce((s, p) => s + (p.desconto || 0), 0);
  }

  gerarGraficos(pedidos: Pedido[]) {
    // Vendas por período
    const mapa: Record<string, number> = {};
    pedidos.filter(p => p.status === 'confirmado').forEach(p => {
      const d = parseCreatedAt(p.createdAt);
      const key = d ? d.toISOString().slice(0, 10) : '';
      if (key) mapa[key] = (mapa[key] || 0) + (p.totalComDesconto || 0);
    });

    const periodoDias = this.periodo === '7d' ? 7 : this.periodo === '30d' ? 30 : 30;
    const hoje = new Date();
    let dias: VendaPeriodo[] = [];
    for (let i = periodoDias - 1; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dias.push({
        dia: d.getDate() + '/' + (d.getMonth() + 1),
        data: d,
        valor: mapa[key] || 0,
      });
    }
    this.vendasPorPeriodo = dias;
    this.maxVendaPeriodo = Math.max(1, ...dias.map(d => d.valor));

    // Top 5 produtos
    const produtos: Record<string, number> = {};
    pedidos.filter(p => p.status === 'confirmado').forEach(p => {
      p.produtos?.forEach((item: any) => {
        produtos[item.nome] = (produtos[item.nome] || 0) + item.qtd;
      });
    });
    this.top5Produtos = Object.entries(produtos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, qtd]) => ({ nome, qtd }));
    this.maxTop5 = Math.max(1, ...this.top5Produtos.map(p => p.qtd));

    // Produto e categoria mais vendidos
    const mapCat: Record<string, string> = {};
    for (const pr of this._produtosCache) mapCat[pr.nome] = pr.categoria || '';
    const porProd: Record<string, number> = {};
    const porCat: Record<string, number> = {};
    pedidos.filter(p => p.status === 'confirmado').forEach(p => {
      p.produtos?.forEach((item: any) => {
        porProd[item.nome] = (porProd[item.nome] || 0) + item.qtd;
        const cat = mapCat[item.nome];
        if (cat) porCat[cat] = (porCat[cat] || 0) + item.qtd;
      });
    });
    this.produtoMaisVendido = Object.keys(porProd).sort((a, b) => porProd[b] - porProd[a])[0] || '';
    this.categoriaMaisVendida = Object.keys(porCat).sort((a, b) => porCat[b] - porCat[a])[0] || '';
  }

  selecionarDia(d: VendaPeriodo) {
    this.diaSel = d.data;
    this.pedidosStream$.pipe(map(pedidos => pedidos.filter(p => {
      if (!p.createdAt) return false;
      const c = parseCreatedAt(p.createdAt);
      if (!c) return false;
      const key = c.toISOString().slice(0, 10);
      return key === d.data.toISOString().slice(0, 10);
    }))).subscribe(pedidos => {
      this.pedidosDoDiaSel = pedidos;
      this.totalDoDiaSel = pedidos.reduce((s, p) => s + (p.totalComDesconto || 0), 0);
    });
  }

  toggleCard(tipo: string) {
    this.cardAberto = this.cardAberto === tipo ? '' : tipo;
  }

  async logout() {
    await this.afAuth['signOut']();
    this.router.navigate(['/admin/login']);
  }

  abrirConfirmarVenda(p: Pedido) {
    this.confirmarPedidoAlvo = p;
    this.confirmarTitulo = 'Confirmar esta venda?';
    this.confirmarMensagem = `Pedido #${(p.id || '').slice(-6).toUpperCase()} — R$${(p.totalComDesconto || p.total).toFixed(2)}`;
  }

  async executarConfirmarVenda() {
    if (!this.confirmarPedidoAlvo) return;
    this.confirmando = true;
    try {
      await this.pedidoService.confirmarVenda(this.confirmarPedidoAlvo.id!, this.confirmarPedidoAlvo.totalComDesconto || this.confirmarPedidoAlvo.total);
      this.confirmarPedidoAlvo = null;
    } catch (e: any) {
      console.error('Erro ao confirmar venda:', e);
      alert('Erro ao confirmar venda: ' + e.message);
    } finally {
      this.confirmando = false;
    }
  }

  confirmarCancelar(p: Pedido) {
    if (p.status === 'confirmado') {
      alert('Este pedido já foi confirmado. Realize o estorno antes de cancelar.');
      return;
    }
    this.acaoTipo = 'cancelar';
    this.acaoPedido = p;
    this.acaoTitulo = 'Cancelar Pedido';
    this.acaoMensagem = `Confirmar cancelamento do pedido #${(p.id || '').slice(-6).toUpperCase()}?`;
  }

  confirmarEstornar(p: Pedido) {
    if (p.status !== 'confirmado') {
      alert('Somente pedidos confirmados podem ser estornados.');
      return;
    }
    this.acaoTipo = 'estornar';
    this.acaoPedido = p;
    this.acaoTitulo = 'Estornar Pedido';
    this.acaoMensagem = `Confirmar estorno do pedido #${(p.id || '').slice(-6).toUpperCase()}?`;
  }

  async executarAcao() {
    if (!this.acaoPedido) return;
    this.acaoExecutando = true;
    const id = this.acaoPedido.id!;
    try {
      if (this.acaoTipo === 'cancelar') {
        await this.pedidoService.cancelarPedido(id, 'admin');
      } else {
        await this.pedidoService.estornarPedido(id);
      }
      this.acaoPedido = null;
    } catch (e: any) {
      console.error('Erro ao executar ação:', e);
      alert('Erro: ' + e.message);
    } finally {
      this.acaoExecutando = false;
    }
  }
}