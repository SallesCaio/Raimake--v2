import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  whatsapp = '5599999999999';
  instagram = 'raimake';

  constructor() { }

  ngOnInit() {}

  abrirWhatsapp() {
    window.open(`https://wa.me/${this.whatsapp}`, '_blank');
  }
  abrirInsta() {
    window.open(`https://instagram.com/${this.instagram}`, '_blank');
  }
}
