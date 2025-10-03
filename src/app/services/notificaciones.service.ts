import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacion {
  tipo: 'info' | 'error' | 'exito' | 'confirmacion';
  mensaje: string;
  resolver?: (valor: boolean) => void; // <-- Para las confirmaciones
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private notificacionSubject = new Subject<Notificacion>();
  notificacion$ = this.notificacionSubject.asObservable();

  // Mostrar mensaje normal
  mostrar(mensaje: string, tipo: 'info' | 'error' | 'exito') {
    this.notificacionSubject.next({ tipo, mensaje });
  }

  // Mostrar confirmación
  confirmar(mensaje: string): Promise<boolean> {
    return new Promise(resolve => {
      this.notificacionSubject.next({
        tipo: 'confirmacion',
        mensaje,
        resolver: resolve
      });
    });
  }
}

