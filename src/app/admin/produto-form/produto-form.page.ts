import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

interface ProdutoData {
  nome: string;
  descricao: string;
  preco: number;
  preco_custo: number;
  estoque: number;
  categoria: string;
  imagem: string;
  destaque: boolean;
  ativo: boolean;
  updatedAt: Date;
  createdAt?: Date;
}

@Component({
  selector: 'app-admin-produto-form',
  templateUrl: './produto-form.page.html',
  styleUrls: ['./produto-form.page.scss'],
})
export class AdminProdutoFormPage implements OnInit {
  produtoForm: FormGroup;
  editando = false;
  produtoId: string | null = null;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  erro = '';
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      preco: ['', [Validators.required, Validators.min(0.01)]],
      preco_custo: [''],
      estoque: [0, Validators.min(0)],
      categoria: [''],
      destaque: [false]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.produtoId = id;
      this.carregarProduto(id);
    }
  }

  carregarProduto(id: string) {
    this.firestore.doc(`produtos/${id}`).valueChanges().subscribe((prod: any) => {
      if (prod) {
        this.produtoForm.patchValue({
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco,
          preco_custo: prod.preco_custo,
          estoque: prod.estoque,
          categoria: prod.categoria,
          destaque: prod.destaque || false
        });
        this.previewUrl = prod.imagem;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  calcularVenda() {
    const custo = parseFloat(this.produtoForm.get('preco_custo')?.value) || 0;
    const venda = this.produtoForm.get('preco');
    if (custo > 0 && (!venda?.value || venda.value === '')) {
      venda?.setValue((custo * 1.20).toFixed(2));
    }
  }

  async salvar() {
    if (this.produtoForm.invalid) {
      this.erro = 'Preencha todos os campos obrigatórios';
      return;
    }

    this.salvando = true;
    this.erro = '';
    const formData = this.produtoForm.value;

    try {
      // Upload imagem se houver
      let imagemUrl = this.previewUrl || '';
      if (this.selectedFile) {
        const filePath = `produtos/${Date.now()}_${this.selectedFile.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, this.selectedFile);
        await task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              imagemUrl = url;
              this.salvarDados(formData, imagemUrl);
            });
          })
        ).toPromise();
      } else {
        this.salvarDados(formData, imagemUrl);
      }
    } catch (e: any) {
      this.erro = e.message || 'Erro ao salvar produto';
      this.salvando = false;
    }
  }

  private async salvarDados(formData: any, imagemUrl: string) {
    const dados: ProdutoData = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      preco_custo: parseFloat(formData.preco_custo) || 0,
      estoque: parseInt(formData.estoque) || 0,
      categoria: formData.categoria || 'Geral',
      imagem: imagemUrl,
      destaque: formData.destaque || false,
      ativo: true,
      updatedAt: new Date()
    };

    try {
      if (this.editando && this.produtoId) {
        await this.firestore.doc(`produtos/${this.produtoId}`).update(dados);
      } else {
        dados['createdAt'] = new Date();
        await this.firestore.collection('produtos').add(dados);
      }
      this.router.navigate(['/admin/produtos']);
    } catch (e: any) {
      this.erro = e.message || 'Erro ao salvar';
      this.salvando = false;
    }
  }
}