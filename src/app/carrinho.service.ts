import { Injectable } from '@angular/core';

// Modelo de item do carrinho
export interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  img: string;
  qtd: number;
}

// Serviço de carrinho (v1: localStorage, sem servidor)
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private chave = 'raimake_carrinho';
  private itens: ItemCarrinho[] = [];

  constructor() {
    this.carregar();
  }

  // Lê do localStorage
  private carregar() {
    const raw = localStorage.getItem(this.chave);
    this.itens = raw ? JSON.parse(raw) : [];
  }

  // Salva no localStorage
  private salvar() {
    localStorage.setItem(this.chave, JSON.stringify(this.itens));
  }

  listar(): ItemCarrinho[] {
    return this.itens;
  }

  total(): number {
    return this.itens.reduce((soma, i) => soma + i.preco * i.qtd, 0);
  }

  qtdTotal(): number {
    return this.itens.reduce((soma, i) => soma + i.qtd, 0);
  }

  // Adiciona ou incrementa
  adicionar(item: ItemCarrinho) {
    const existente = this.itens.find((i) => i.id === item.id);
    if (existente) {
      existente.qtd += 1;
    } else {
      this.itens.push({ ...item, qtd: 1 });
    }
    this.salvar();
  }

  remover(id: string) {
    this.itens = this.itens.filter((i) => i.id !== id);
    this.salvar();
  }

  limpar() {
    this.itens = [];
    this.salvar();
  }
}
