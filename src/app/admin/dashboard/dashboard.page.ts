import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  stats: { icon: string; value: string; label: string }[] = [];
  totalProdutos = 0;
  estoqueBaixo = 0;
  totalVendas = 0;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarStats();
  }

  carregarStats() {
    this.firestore.collection('produtos', ref => ref.where('ativo', '==', true))
      .valueChanges()
      .subscribe((produtos: any[]) => {
        this.totalProdutos = produtos.length;
        this.estoqueBaixo = produtos.filter(p => p.estoque < 10).length;
        this.atualizarStats();
      });

    this.firestore.collection('pedidos')
      .valueChanges()
      .subscribe((pedidos: any[]) => {
        this.totalVendas = pedidos.length;
        this.atualizarStats();
      });
  }

  atualizarStats() {
    this.stats = [
      { icon: 'cube-outline', value: String(this.totalProdutos), label: 'Total Produtos' },
      { icon: 'alert-circle-outline', value: String(this.estoqueBaixo), label: 'Estoque Baixo' },
      { icon: 'cash-outline', value: String(this.totalVendas), label: 'Pedidos' },
      { icon: 'people-outline', value: String(this.totalProdutos), label: 'Em Destaque' },
    ];
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/admin/login']);
  }
}