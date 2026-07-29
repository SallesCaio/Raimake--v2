import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
})
export class AdminProdutosPage implements OnInit {
  produtos: any[] = [];

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.firestore.collection('produtos',
      ref => ref.where('ativo', '==', true).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' }).subscribe(prods => {
      this.produtos = prods;
    });
  }
}