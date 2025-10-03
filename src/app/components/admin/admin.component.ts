import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  turnosEnCurso: Turno[] = [];
  turnosConfirmados: Turno[] = [];
  turnosConfirmadosAgrupados: { [categoria: string]: Turno[] } = {};

  constructor(private turnosService: TurnosService, private notificacionService: NotificacionesService, private authService: AuthService) { }

  ngOnInit(): void {

            this.authService.user$.subscribe(user => {
      console.log("UID", user.uid);
    });

    this.turnosService.getTurnosEnCurso().subscribe(turnos => {
      this.turnosEnCurso = turnos;
    });
    this.turnosService.getTurnosConfirmados().subscribe(turnos => {
      this.turnosConfirmadosAgrupados = this.agruparPorFecha(turnos);
    });

  }

  async confirmarGeneracionTurnos() {



    const confirmado = await this.notificacionService.confirmar(
    '¿Seguro que querés generar los turnos para los próximos 3 meses?'
  );

  if (confirmado) {
    this.generarTurnos();
    this.notificacionService.mostrar('Turnos generados para los próximos 3 meses.', 'exito');
  }
}

  confirmarTurno(turno: Turno): void {
    this.turnosService.confirmarTurno(turno);
  }

  volverTurno(turno: Turno): void {
    this.turnosService.volverTurno(turno);
  }

  generarTurnos() {
    this.turnosService.generarTurnosProximosTresMeses();//getTurnos();//testEscritura();
  }

  private agruparPorFecha(turnos: Turno[]): { [categoria: string]: Turno[] } {
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const grupos: { [categoria: string]: Turno[] } = {
      'Hoy': [],
      'Mañana': [],
      'Próximos días': []
    };

    turnos.forEach(t => {
      const [anio, mes, dia] = t.fecha.split('-').map(Number);
      const fechaTurno = new Date(anio, mes - 1, dia);

      if (
        fechaTurno.getFullYear() === hoy.getFullYear() &&
        fechaTurno.getMonth() === hoy.getMonth() &&
        fechaTurno.getDate() === hoy.getDate()
      ) {
        grupos['Hoy'].push(t);
      } else if (
        fechaTurno.getFullYear() === mañana.getFullYear() &&
        fechaTurno.getMonth() === mañana.getMonth() &&
        fechaTurno.getDate() === mañana.getDate()
      ) {
        grupos['Mañana'].push(t);
      } else if (fechaTurno > mañana) {
        grupos['Próximos días'].push(t);
      }
    });

    return grupos;
  }
}
