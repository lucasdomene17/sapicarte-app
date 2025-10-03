// src/app/models/turno.model.ts

export type EstadoTurno = 'Disponible' | 'Reserva en curso' | 'Reservado';

export const ESTADO_TURNO = {
  Disponible: 'Disponible',
  ReservaEnCurso: 'Reserva en curso',
  Reservado: 'Reservado'
} as const;

export interface Turno {
  id?: string;            // ID del documento en Firestore
  fecha: string;          // Fecha en formato 'YYYY-MM-DD'
  hora: string;           // Hora en formato 'HH:mm'
  estado: EstadoTurno;    // Estado del turno
  personas?: number;      // Cantidad de personas (1 a 10)
  timestamp?: any;        // Fecha y hora de creación o modificación
  reservaEnCursoDesde?: string; // Fecha y hora de inicio de la reserva en curso
  reservaEnCursoHasta?: string; // Fecha y hora de fin de la reserva en curso
  timer?: any;
  timerDisplay?: string;
}
