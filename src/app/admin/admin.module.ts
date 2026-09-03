import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginPage } from './login/login.page';
import { AdminDashboardPage } from './dashboard/dashboard.page';
import { AdminProdutosPage } from './produtos/produtos.page';
import { AdminProdutoFormPage } from './produto-form/produto-form.page';
import { PedidoService } from '../services/pedido.service';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminRoutingModule,
    AngularFireStorageModule,
    PipesModule
  ],
  declarations: [
    AdminLoginPage,
    AdminDashboardPage,
    AdminProdutosPage,
    AdminProdutoFormPage
  ],
  providers: [PedidoService]
})
export class AdminModule { }