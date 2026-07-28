import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Produto {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  img?: string;
  imagem?: string;
  categoria: string;
  promo?: string;
  isNew?: boolean;
  ativo: boolean;
  createdAt: Date;
  estoque?: number;
  preco_custo?: number;
  destaque?: boolean;
}

export interface Categoria {
  id?: string;
  nome: string;
  icon: string;
  ativo: boolean;
  active?: boolean;
}

export interface Pedido {
  id?: string;
  userId: string;
  produtos: any[];
  total: number;
  status: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) { }

  getProdutos(): Observable<Produto[]> {
    return this.firestore.collection<Produto>('produtos', ref => 
      ref.where('ativo', '==', true).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  getProdutoById(id: string): Observable<Produto | undefined> {
    return this.firestore.doc<Produto>(`produtos/${id}`).valueChanges();
  }

  getProdutosByCategoria(categoria: string): Observable<Produto[]> {
    return this.firestore.collection<Produto>('produtos', ref => 
      ref.where('ativo', '==', true)
         .where('categoria', '==', categoria)
         .orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  getCategorias(): Observable<Categoria[]> {
    return this.firestore.collection<Categoria>('categorias', ref => 
      ref.where('ativo', '==', true)
    ).valueChanges({ idField: 'id' });
  }

  createPedido(pedido: Pedido): Promise<any> {
    return this.firestore.collection('pedidos').add({
      ...pedido,
      createdAt: new Date()
    });
  }

  getPedidosByUser(userId: string): Observable<Pedido[]> {
    return this.firestore.collection<Pedido>('pedidos', ref => 
      ref.where('userId', '==', userId).orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  login(email: string, password: string): Promise<any> {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  getCurrentUser(): Observable<any> {
    return this.auth.authState;
  }

  uploadImage(file: File, path: string): Promise<string> {
    const ref = this.storage.ref(path);
    const task = ref.put(file);
    return task.then(snapshot => snapshot.ref.getDownloadURL());
  }
}