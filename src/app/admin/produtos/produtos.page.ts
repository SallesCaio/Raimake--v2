import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
})
export class AdminProdutosPage implements OnInit {
  produtos: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private alert: AlertController
  ) {}

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

  async excluir(id: string, nome: string) {
    const a = await this.alert.create({
      header: 'Excluir Produto',
      message: `Tem certeza que deseja excluir <strong>${nome}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive',
          handler: async () => {
            await this.firestore.doc(`produtos/${id}`).delete();
            this.carregar();
          }
        }
      ]
    });
    await a.present();
  }
}