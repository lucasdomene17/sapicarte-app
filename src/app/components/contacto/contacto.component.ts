import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {
  whatsappNumber = environment.whatsappNumber;
  whatsappPretty = '+54 9 266 461 7371';
}
