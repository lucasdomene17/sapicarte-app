import { Component, OnInit } from '@angular/core';
import { NotificacionesService, Notificacion } from '../../services/notificaciones.service';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css']
})
export class AlertaComponent implements OnInit {
  notificacion: Notificacion | null = null;
  visible = false;

  constructor(private notificaciones: NotificacionesService) {}

  ngOnInit() {
    this.notificaciones.notificacion$.subscribe(notif => {
      this.notificacion = notif;
      this.visible = true;

      if (notif.tipo !== 'confirmacion') {
        // Mensajes normales se cierran solos
        setTimeout(() => this.visible = false, 3000);
      }
    });
  }

  aceptar() {
    if (this.notificacion?.resolver) {
      this.notificacion.resolver(true);
    }
    this.cerrar();
  }

  cancelar() {
    if (this.notificacion?.resolver) {
      this.notificacion.resolver(false);
    }
    this.cerrar();
  }

  cerrar() {
    this.visible = false;
    this.notificacion = null;
  }
}
