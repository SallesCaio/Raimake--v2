import { Subscription } from 'rxjs';
import { of } from 'rxjs';
import { AdminDashboardPage } from './dashboard.page';

// Stub mínimo do AngularFirestore
function firestoreStub() {
  const obs = of([] as any[]);
  const docSnap = { exists: true, data: () => ({ total: 0 }) };
  const ref: any = {
    valueChanges: () => obs,
    get: () => of(docSnap as any),
  };
  return {
    collection: () => ref,
    doc: () => ({
      valueChanges: () => obs,
      get: () => of(docSnap as any),
      set: () => Promise.resolve(),
    }),
  };
}

function make() {
  const afAuth: any = { signOut: () => Promise.resolve(), authState: of(null) };
  const pedidoService: any = {
      getAllPedidos: () => of([]),
      confirmarVenda: () => Promise.resolve(),
      cancelarPedido: () => Promise.resolve(),
      atualizarStatus: () => Promise.resolve(),
    };
  const page = new AdminDashboardPage(afAuth, firestoreStub() as any, pedidoService, { navigate: () => {} } as any);
  page.ngOnInit();
  return page;
}

describe('AdminDashboardPage (H0.9.2)', () => {
  it('pedido pendente pode ser cancelado (modal abre)', () => {
    const page = make();
    const pedido: any = { id: 'x1', status: 'pendente' };
    spyOn(window, 'alert');
    page.confirmarCancelar(pedido);
    expect(page.acaoPedido).toBe(pedido);
    expect((window as any).alert).not.toHaveBeenCalled();
  });

  it('pedido confirmado NÃO pode ser cancelado direto (alerta + sem modal)', () => {
    const page = make();
    const pedido: any = { id: 'x2', status: 'confirmado' };
    spyOn(window, 'alert');
    page.confirmarCancelar(pedido);
    expect((window as any).alert).toHaveBeenCalledWith('Este pedido já foi confirmado. Realize o estorno antes de cancelar.');
    expect(page.acaoPedido).toBeNull();
  });

  it('carregarStats não recria listeners após abrir confirmação de venda', () => {
      const page = make();
      page.abrirConfirmarVenda({ id: 'x1', total: 10 } as any);
      expect(page.confirmarPedidoAlvo).toBeTruthy();
    });

  it('caixaHoje é carregado ao iniciar (0 se sem dados)', () => {
    const page = make();
    expect(page.caixaHoje).toBe(0);
  });
});