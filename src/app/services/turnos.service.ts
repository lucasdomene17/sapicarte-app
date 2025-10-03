// src/app/services/turnos.service.ts
import { Injectable } from '@angular/core';
//import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore, Timestamp, collection, CollectionReference, DocumentReference, query, where, getDocs, addDoc, orderBy, updateDoc, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { map, switchMap } from 'rxjs/operators';
import { Turno, ESTADO_TURNO } from '../models/turno.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  constructor(private firestore: Firestore) { }

  // Obtener todos los turnos en estado "Reserva en curso"
  getTurnosEnCurso(): Observable<Turno[]> {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(turnosRef, where('estado', '==', ESTADO_TURNO.ReservaEnCurso));
    return collectionData(q, { idField: 'id' }) as Observable<Turno[]>;
  }

getTurnosConfirmados(): Observable<Turno[]> {
  const turnosRef = collection(this.firestore, 'turnos');
  const q = query(turnosRef, where('estado', '==', ESTADO_TURNO.Reservado));

  return collectionData(q, { idField: 'id' }).pipe(
    map((turnos: Turno[]) => {
      const ahora = new Date();

      return turnos.filter(turno => {
        if (!turno.fecha || !turno.hora) return false;

        // Parsear fecha y hora del turno
        const [anio, mes, dia] = turno.fecha.split('-').map(Number);
        const [hora, minuto] = turno.hora.split(':').map(Number);
        const fechaTurno = new Date(anio, mes - 1, dia, hora, minuto);

        // Mostrar solo si es hoy o futuro Y si todavía no pasó
        return fechaTurno >= ahora;
      });
    })
  );
}


  // Confirmar un turno (cambiar a "Reservado")
  confirmarTurno(turno: Turno): void {
    if (!turno.id) return;

    const turnoRef = doc(this.firestore, `turnos/${turno.id}`);
    updateDoc(turnoRef, { estado: ESTADO_TURNO.Reservado })
      .then(() => console.log('Turno confirmado'))
      .catch(error => console.error('Error al confirmar turno:', error));
  }


  volverTurno(turno: Turno): void {
    if (!turno.id) return;

    const turnoRef = doc(this.firestore, `turnos/${turno.id}`);
    updateDoc(turnoRef, { estado: ESTADO_TURNO.Disponible, personas: 0 })
      .then(() => console.log('Turno Disponible nuevamente'))
      .catch(error => console.error('Error al volver turno:', error));
  }


  getTurnosPorFecha(fecha: string): Observable<Turno[]> {
    console.log(`📅 Obteniendo turnos para la fecha: ${fecha}`);

    // Documento fijo para obtener la hora del servidor
    const clockRef = doc(this.firestore, '_serverTime', 'clock');

    return from(
      setDoc(clockRef, { now: serverTimestamp() }) // siempre sobreescribe el mismo doc
    ).pipe(
      switchMap(() => getDoc(clockRef)), // leer la hora del servidor
      map(docSnap => {
        const serverDate = docSnap.data()?.now?.toDate() as Date;
        console.log(`Hora del servidor: ${serverDate}`);
        return serverDate;
      }),
      switchMap(serverNow => {
        // Consulta de turnos
        const turnosRef = collection(this.firestore, 'turnos');
        console.log(`Fecha solicitada: ${fecha}`);
        const q = query(
          turnosRef,
          where('fecha', '==', fecha),
          orderBy('hora')
        );
        console.log(`Turnos encontrados para ${fecha}:`, q);
        return collectionData(q, { idField: 'id' }).pipe(
          map((turnos: Turno[]) => {
            if (fecha === this.formatDate(serverNow)) {
              const currentMinutes = serverNow.getHours() * 60 + serverNow.getMinutes();

              return turnos.filter(t => {
                const [hora, minutos] = t.hora.split(':').map(Number);
                const turnoMinutes = hora * 60 + minutos;
                return turnoMinutes - currentMinutes >= environment.anticipacionMinimaHoras * 60; // anticipación configurable
              });
            }
            return turnos;
          })
        );
      })
    );
  }


  // Actualizar turno (estructura anidada por fecha y hora)

  actualizarTurno(turno: Turno): void {
    const turnosRef = collection(this.firestore, 'turnos');
    const q = query(
      turnosRef,
      where('fecha', '==', turno.fecha),
      where('hora', '==', turno.hora)
    );

    getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const docRef = doc(this.firestore, 'turnos', querySnapshot.docs[0].id);
          return updateDoc(docRef, {
            estado: turno.estado,
            personas: turno.personas,
            timestamp: serverTimestamp()
          });
        } else {
          console.warn('No se encontró el turno para actualizar');
        }
      })
      .then(() => {
        console.log(`Turno ${turno.hora} del ${turno.fecha} actualizado correctamente.`);
      })
      .catch((error) => {
        console.error('Error al actualizar el turno:', error);
      });
  }

  // Crear turno (estructura plana)
  crearTurno(turno: Turno): Promise<any> {
    const turnosRef = collection(this.firestore, 'turnos');
    return addDoc(turnosRef, turno)
      .then(docRef => {
        console.log('Turno creado con ID:', docRef.id);
        return docRef;
      })
      .catch(error => {
        console.error('Error al crear turno:', error);
        throw error;
      });
  }

  // Eliminar turno (estructura plana)
  eliminarTurno(id: string): Promise<void> {
    const turnoRef = doc(this.firestore, `turnos/${id}`);
    return deleteDoc(turnoRef)
      .then(() => console.log(`Turno con ID ${id} eliminado`))
      .catch(error => {
        console.error('Error al eliminar turno:', error);
        throw error;
      });
  }

  // Generar turnos del mes actual
  async generarTurnosDelMes() {
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    const horarios = environment.horariosTurnos;

    const turnosRef = collection(this.firestore, 'turnos');

    for (let dia = hoy.getDate(); dia <= 31; dia++) {
      const fecha = new Date(anio, mes, dia);
      if (fecha.getMonth() !== mes) break;

      for (const hora of horarios) {
        await addDoc(turnosRef, {
          fecha: fecha.toISOString().split('T')[0],
          hora,
          estado: ESTADO_TURNO.Disponible,
          personas: 0,
          timestamp: Timestamp.fromDate(
            new Date(`${fecha.toISOString().split('T')[0]}T${hora}`)
          ),
        });
      }
    }

    console.log('Turnos generados correctamente para este mes.');
  }

  // Generar turnos para los próximos 3 meses sin duplicados
  async generarTurnosProximosTresMeses() {
    console.log('Generando turnos para los próximos 3 meses...');
    const hoy = new Date();
    const horarios = environment.horariosTurnos;

    const turnosRef = collection(this.firestore, 'turnos');

    for (let mesOffset = 0; mesOffset < 3; mesOffset++) {
      const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
      const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset + 1, 0); // último día del mes

      for (let dia = 1; dia <= fechaFin.getDate(); dia++) {
        const fecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), dia);
        const fechaStr = fecha.toISOString().split('T')[0];

        for (const hora of horarios) {
          // Consultar si ya existe un turno con esa fecha y hora
          const existingQuery = query(
            turnosRef,
            where('fecha', '==', fechaStr),
            where('hora', '==', hora)
          );
          const existingSnap = await getDocs(existingQuery);
          if (!existingSnap.empty) {
            console.log(`Ya existe un turno para ${fechaStr} a las ${hora}`);
            continue;
          } else {
            console.log(`No existe un turno para ${fechaStr} a las ${hora}`);
          }

          console.log(`Generando turno para ${fechaStr} a las ${hora}`);
          // Agregar nuevo turno
          await addDoc(turnosRef, {
            fecha: fechaStr,
            hora,
            estado: ESTADO_TURNO.Disponible,
            personas: 0,
            timestamp: Timestamp.fromDate(new Date(`${fechaStr}T${hora}:00`))
          });
          console.log(`Turno generado: ${fechaStr} a las ${hora}`);
        }
      }
    }

    console.log('✅ Turnos generados para los próximos 3 meses.');
  }


  async getTurnos() {
    console.log('Obteniendo turnos...');
    try {
      const snapshot = await getDocs(collection(this.firestore, 'turnos'));
      snapshot.forEach(doc => {
        console.log('🔍 Turno:', doc.id, doc.data());
      });
    } catch (error) {
      console.error('❌ Error al leer turnos:', error);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}


