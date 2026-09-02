import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { Produto } from './firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export type PedidoStatus = 'pendente' | 'confirmado' | 'estornado' | 'cancelado';

export interface PedidoItem {
  id: string;
  nome: string;
  preco: number;
  img: string;
  qtd: number;
  subtotal: number;
}

export interface Pedido {
  id?: string;
  userId: string;
  produtos: PedidoItem[];
  total: number;
  status: 'pendente' | 'confirmado' | 'estornado' | 'cancelado';
  clienteTelefone: string;
  clienteNome: string;
  clienteEndereco: string;
  formaPagamento: 'Pix' | 'Dinheiro' | 'Cartão';
  desconto: number;
  totalComDesconto: number;
  mimo?: string;
  observacoes?: string;
  termosAceitosEm?: Date | null;
  expanded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly COLLECTION = 'pedidos';

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async criarPedido(pedido: Omit<Pedido, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const data = { ...pedido, createdAt: now, updatedAt: now };
    const ref = await this.firestore.collection(this.COLLECTION).add(data);
    return ref.id;
  }

  /** TRANSAÇÃO: READ → VALIDA → WRITE
   * Confirma venda, valida estoque, atualiza estoque + caixa + status
   */
  async confirmarVenda(id: string, valor: number): Promise<void> {
    const pedidoDoc = this.firestore.doc(`${this.COLLECTION}/${id}`);
    const snap = await pedidoDoc.get().toPromise();
    const pedido = snap?.data() as any;
    if (!pedido) throw new Error('Pedido não encontrado');

    const hoje = new Date().toISOString().slice(0, 10);
    const caixaRef = this.firestore.doc(`caixa/${hoje}`);
    const produtosRef = this.firestore.collection('produtos');

    await this.firestore.firestore.runTransaction(async (t: any) => {
      // FASE 1: READS
      const itens = (pedido.produtos || []).map((item: any) => ({
        item,
        snap: t.get(produtosRef.doc(item.id).ref),
      }));
      const [snapCaixa] = await Promise.all([t.get(caixaRef.ref)]);

      // FASE 2: VALIDAÇÕES
      const novosEstoques = await Promise.all(
        itens.map(async ({ item, snap }: { item: PedidoItem; snap: any }) => {
          const doc = await snap;
          if (!doc.exists) throw new Error(`Produto ${item.id} não encontrado`);
          const produto = doc.data() as Produto;
          const estoqueAtual = produto.estoque ?? 0;
          if (estoqueAtual < item.qtd) {
            throw new Error(`Estoque insuficiente para ${produto.nome}. Tem ${estoqueAtual}, precisa de ${item.qtd}.`);
          }
          return { id: item.id, novoEstoque: estoqueAtual - item.qtd };
        })
      );

      // FASE 3: WRITES
      for (const { id, novoEstoque } of novosEstoques) {
        t.set(produtosRef.doc(id).ref, { estoque: novoEstoque }, { merge: true });
      }

      const caixaAtual = snapCaixa.exists ? (snapCaixa.data()?.total || 0) : 0;
      t.set(caixaRef.ref, { total: caixaAtual + valor, updatedAt: new Date() }, { merge: true });
      t.update(pedidoDoc.ref, { status: 'confirmado' as PedidoStatus, updatedAt: new Date() });
    });
  }

  /** TRANSAÇÃO: reversão de estoque + caixa + status = estornado */
  async estornarPedido(id: string): Promise<void> {
    const pedidoDoc = this.firestore.doc(`${this.COLLECTION}/${id}`);
    const snap = await pedidoDoc.get().toPromise();
    const pedido = snap?.data() as any;
    if (!pedido) throw new Error('Pedido não encontrado');

    const hoje = new Date().toISOString().slice(0, 10);
    const caixaRef = this.firestore.doc(`caixa/${hoje}`);
    const produtosRef = this.firestore.collection('produtos');

    await this.firestore.firestore.runTransaction(async (t: any) => {
      // FASE 1: READS
      const itens = (pedido.produtos || []).map((item: any) => ({
        item,
        snap: t.get(produtosRef.doc(item.id).ref),
      }));
      const [snapCaixa] = await Promise.all([t.get(caixaRef.ref)]);

      // FASE 2: WRITES (reverte estoque + caixa)
      const promessasEstoque = itens.map(async ({ item, snap }: { item: PedidoItem; snap: any }) => {
        const doc = await snap;
        if (!doc.exists) return null;
        const produto = doc.data() as Produto;
        const estoqueAtual = produto.estoque ?? 0;
        const novoEstoque = estoqueAtual + item.qtd;
        t.set(produtosRef.doc(item.id).ref, { estoque: novoEstoque }, { merge: true });
        return null;
      });
      await Promise.all(promessasEstoque);

      const caixaAtual = snapCaixa.exists ? (snapCaixa.data()?.total || 0) : 0;
      const reversao = Math.max(0, caixaAtual - (pedido.totalComDesconto || pedido.total || 0));
      t.set(caixaRef.ref, { total: reversao, updatedAt: new Date() }, { merge: true });
      t.update(pedidoDoc.ref, { status: 'estornado' as PedidoStatus, updatedAt: new Date() });
    });
  }

  /** CANCELAMENTO: bypass admin (userId === 'admin') ou dono do pedido */
  async cancelarPedido(id: string, userId: string): Promise<void> {
    const docRef = this.firestore.doc<Pedido>(`${this.COLLECTION}/${id}`);
    const snap = await docRef.get().toPromise();
    const pedido = snap?.data();
    if (!pedido) throw new Error('Pedido não encontrado');
    if (userId === 'admin' || pedido.userId === userId) {
      docRef.update({ status: 'cancelado' as PedidoStatus, updatedAt: new Date() });
    } else {
      throw new Error('Não autorizado a cancelar este pedido');
    }
  }

  /** Atualiza status genérico (para uso futuro) */
  async atualizarStatus(id: string, status: PedidoStatus): Promise<void> {
    await this.firestore.doc(`${this.COLLECTION}/${id}`).update({ status, updatedAt: new Date() });
  }

  /** Consultas */
  getPedido(id: string): Observable<Pedido | undefined> {
    return this.firestore.doc<Pedido>(`${this.COLLECTION}/${id}`).valueChanges();
  }

  getPedidosPorStatus(status: PedidoStatus): Observable<Pedido[]> {
    return this.firestore.collection<Pedido>(this.COLLECTION, ref =>
      ref.where('status', '==', status).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  getAllPedidos(): Observable<Pedido[]> {
    return this.firestore.collection<Pedido>(this.COLLECTION, ref =>
      ref.orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  getPedidosPendentes(): Observable<Pedido[]> {
    return this.getPedidosPorStatus('pendente');
  }

  getPedidosConfirmados(): Observable<Pedido[]> {
    return this.getPedidosPorStatus('confirmado');
  }

  getPedidosEstornados(): Observable<Pedido[]> {
    return this.getPedidosPorStatus('estornado');
  }

  getPedidosCancelados(): Observable<Pedido[]> {
    return this.getPedidosPorStatus('cancelado');
  }

  /** Métricas de dashboard */
  getEstatisticas(pedidos: Pedido[]): {
    totalPedidos: number;
    totalVendas: number;
    vendasMes: number;
    ticketMedio: number;
    porStatus: Record<string, number>;
  } {
    const totalPedidos = pedidos.length;
    const totalVendas = pedidos.reduce((sum: number, p: Pedido) => sum + (p.totalComDesconto || 0), 0);

    const mesAtual = new Date();
    mesAtual.setDate(1);
    mesAtual.setHours(0, 0, 0, 0);
    const vendasMes = pedidos
      .filter((p: Pedido) => p.createdAt ? p.createdAt >= mesAtual : false)
      .reduce((sum: number, p: Pedido) => sum + (p.totalComDesconto || 0), 0);

    const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

    const porStatus: Record<string, number> = {};
    pedidos.forEach((p: Pedido) => {
      porStatus[p.status] = (porStatus[p.status] || 0) + 1;
    });

    return { totalPedidos, totalVendas, vendasMes, ticketMedio, porStatus };
  }
}
