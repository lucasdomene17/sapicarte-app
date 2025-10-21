import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { LoggerService } from '../../services/logger.service';
import { Turno, ESTADO_TURNO } from '../../models/turno.model';
import { FechaBonitaPipe } from '../../shared/pipes/fecha-bonita.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit, AfterViewInit {
  admin: boolean = false;
  readonly ESTADO = ESTADO_TURNO;

  turnos: Turno[] = [];
  fechaSeleccionada: string;//Date = new Date();
  temporizadores: { [hora: string]: number } = {};
  loadingTurnos = false;

  // mapas para llevar control de timers por turno (usar key segura, p. ej. fecha+hora)
  private intervals: { [key: string]: any } = {};
  public secondsLeft: { [key: string]: number } = {}; // segundos restantes por turno


  constructor(
    private turnosService: TurnosService, 
    private notificacionService: NotificacionesService, 
    private fechaBonitaPipe: FechaBonitaPipe,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.fechaSeleccionada = this.fechaInicial();//.toISOString().split('T')[0]; // hoy por defecto
    this.logger.log('Fecha inicial seleccionada:', this.fechaSeleccionada);
    this.cargarTurnos();
  }


  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }

  // --- cargar turnos
  cargarTurnos(): void {
    this.loadingTurnos = true;
    this.logger.log('Cargando turnos para la fecha:', this.formatearFecha(this.fechaSeleccionada));
    this.turnosService.getTurnosPorFecha(this.formatearFecha(this.fechaSeleccionada)).subscribe({

      next: (turnos) => {
        // limpiamos timers previos
        this.clearAllTimers();

        this.turnos = turnos;

        for (const turno of this.turnos) {
          if (turno.estado === ESTADO_TURNO.ReservaEnCurso) {
            const inicioMs = this.timestampToMs((turno as any).timestamp);
            this.logger.log('inicioMs:', inicioMs);
            if (!inicioMs) {
              this.logger.warn('Turno sin timestamp válido:', turno);
              continue;
            }

            const elapsedSec = Math.floor((Date.now() - inicioMs) / 1000);
            const durationSec = environment.duracionReservaEnCursoMin * 60;
            const remaining = durationSec - elapsedSec;

            if (remaining <= 0) {
              // ya venció: actualizar a Disponible (y limpiar timestamp)
              const tUpdate: Turno = { ...turno, estado: ESTADO_TURNO.Disponible, personas: 0, timestamp: null };
              this.turnosService.actualizarTurno(tUpdate);
            } else {
              // iniciar contador con segundos restantes
              this.startTimer(turno, remaining);
            }
          }
        }
        this.logger.log('Turnos cargados:', this.turnos);
        this.loadingTurnos = false;
      },
      error: (err) => {
        this.logger.error('Error al cargar turnos:', err);
        this.loadingTurnos = false;
        this.notificacionService.mostrar('Error al cargar los turnos', 'error');
      }
    });


  }

  actualizarFecha(nuevaFecha: string): void {
    this.fechaSeleccionada = nuevaFecha;
    this.cargarTurnos();
  }

  getTurnosDelDia(): Turno[] {
    return this.turnos;
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case ESTADO_TURNO.Disponible:
        return 'estado-disponible';
      case ESTADO_TURNO.ReservaEnCurso:
        return 'estado-reserva-en-curso';
      case ESTADO_TURNO.Reservado:
        return 'estado-reservado';
      default:
        return '';
    }
  }

  // --- reservarTurno: asegurarse de usar el valor puesto por el usuario
  reservarTurno(turno: Turno): void {
    if (turno.estado !== ESTADO_TURNO.Disponible) return;

    const personas = (turno.personas && turno.personas >= 1 && turno.personas <= 10) ? turno.personas : 1;

    const nuevoTurno: Turno = {
      ...turno,
      estado: ESTADO_TURNO.ReservaEnCurso,
      timestamp: new Date(), // da igual si es Date o Timestamp: el servicio convertirá correctamente
      personas
    };

    // actualizar en DB
    this.turnosService.actualizarTurno(nuevoTurno);

    // iniciar temporizador localmente con duración configurable
    this.startTimer(nuevoTurno, environment.duracionReservaEnCursoMin * 60);
  }

  obtenerLinkWhatsapp(turno: Turno): string {
    const fechaStr = this.fechaBonitaPipe.transform(this.fechaSeleccionada);//.toLocaleDateString('es-AR');
    //const fechaStr = this.formatearFecha(this.fechaSeleccionada);
    return `https://wa.me/${environment.whatsappNumber}?text=Hola!%20Quiero%20reservar%20el%20turno%20de%20las%20${turno.hora}%20el%20día%20${fechaStr}%20para%20${turno.personas}%20persona(s).`;
  }

  iniciarTemporizador(hora: string, minutos: number): void {
    this.temporizadores[hora] = minutos;

    const interval = setInterval(() => {
      this.temporizadores[hora]--;

      if (this.temporizadores[hora] <= 0) {
        clearInterval(interval);
        // Cambiar visualmente el estado si no se actualizó antes
        const turno = this.turnos.find((t) => t.hora === hora);
        if (turno) {
          turno.estado = ESTADO_TURNO.Disponible;
          turno.personas = 0;
          turno.timestamp = null;
          this.turnosService.actualizarTurno(turno);
        }
      }
    }, 60000); // 1 minuto
  }

  // --- mostrar tiempo en mm:ss
  obtenerTiempoRestante(turno: Turno): string {
    const key = this.timerKey(turno);
    const s = this.secondsLeft[key];
    if (!s && s !== 0) return '';
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }

  formatearFecha(fecha: string): string {
    this.logger.log('Formateando fecha:', fecha);
    //console.log('Fecha formateada:', fecha.toISOString().split('T')[0]);
    return fecha;//fecha.toISOString().split('T')[0];
  }

fechaInicial(): string {
  const fecha = new Date();
  const opciones = {
    year: 'numeric' as const,
    month: '2-digit' as const,
    day: '2-digit' as const,
    timeZone: 'America/Argentina/Buenos_Aires'
  };
  
  const formateador = new Intl.DateTimeFormat('es-AR', opciones);
  const partes = formateador.formatToParts(fecha);
  
  const dia = partes.find(p => p.type === 'day').value;
  const mes = partes.find(p => p.type === 'month').value;
  const anio = partes.find(p => p.type === 'year').value;
  
  return `${anio}-${mes}-${dia}`;
}

  // helper para generar key (evita colisiones si hay mismos horarios en distintos días)
  private timerKey(turno: Turno): string {
    return `${turno.fecha}__${turno.hora}`;
  }

  // --- convertidor robusto de timestamp a milisegundos
  private timestampToMs(turnoTimestamp: any): number | null {
    this.logger.log('timestampToMs input:', turnoTimestamp);
    if (!turnoTimestamp) return null;

    // Firestore Timestamp (tiene .seconds)
    if (turnoTimestamp.seconds !== undefined) {
      const seconds = Number(turnoTimestamp.seconds);
      const nanos = Number(turnoTimestamp.nanoseconds || 0);
      return seconds * 1000 + Math.floor(nanos / 1e6);
    }

    // SDK Timestamp-like con toDate()
    if (typeof turnoTimestamp.toDate === 'function') {
      return turnoTimestamp.toDate().getTime();
    }

    // si es number (ms)
    if (typeof turnoTimestamp === 'number') {
      // detectemos si es seconds (ej: 169...) o ms (13 dígitos)
      return turnoTimestamp > 1e12 ? turnoTimestamp : turnoTimestamp * 1000;
    }

    // si es string ISO
    const parsed = Date.parse(turnoTimestamp);
    if (!isNaN(parsed)) return parsed;

    return null;
  }

  // --- iniciar temporizador por segundo
  private startTimer(turno: Turno, initialSeconds: number) {
    const key = this.timerKey(turno);

    // limpiar si había uno previo
    if (this.intervals[key]) {
      clearInterval(this.intervals[key]);
      delete this.intervals[key];
    }

    this.secondsLeft[key] = initialSeconds;

    this.intervals[key] = setInterval(() => {
      this.secondsLeft[key] -= 1;

      // actualizar la vista (Angular detectará)
      if (this.secondsLeft[key] <= 0) {
        clearInterval(this.intervals[key]);
        delete this.intervals[key];
        delete this.secondsLeft[key];

        // actualizar turno en DB a Disponible
        const tUpdate: Turno = {
          ...turno,
          estado: ESTADO_TURNO.Disponible,
          personas: 0,
          timestamp: null
        };
        this.turnosService.actualizarTurno(tUpdate);
      }
    }, 1000); // cada segundo
  }

  // --- limpiar todos los timers
  private clearAllTimers() {
    for (const k of Object.keys(this.intervals)) {
      clearInterval(this.intervals[k]);
      delete this.intervals[k];
    }
    this.intervals = {};
    this.secondsLeft = {};
  }


}
