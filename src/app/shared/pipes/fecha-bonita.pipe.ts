import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'fechaBonita', pure: true })
@Injectable({ providedIn: 'root' })
export class FechaBonitaPipe implements PipeTransform {
  transform(value: string | Date | any): string {
    if (!value) return '';

    let d: Date;

    if (typeof value === 'string') {
      // Caso seguro para "YYYY-MM-DD"
      const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const [, y, mo, da] = m;
        d = new Date(+y, +mo - 1, +da);  // medianoche local
      } else {
        d = new Date(value);             // otros formatos (con hora)
      }
    } else if (value instanceof Date) {
      d = value;
    } else if (value?.toDate) {
      d = value.toDate();                // Firestore Timestamp
    } else {
      return '';
    }

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
}

