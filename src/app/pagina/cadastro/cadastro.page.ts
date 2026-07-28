import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  whatsapp = '5521970579631';
  instagram = 'byraimakes';
  entrega = 'Galeão - Ilha do Governador e arredores';

  constructor() { }

  ngOnInit() {}

  abrirWhatsapp() {
    window.open(`https://wa.me/${this.whatsapp}`, '_blank');
  }

  abrirInsta() {
    window.open(`https://instagram.com/${this.instagram}`, '_blank');
  }
}