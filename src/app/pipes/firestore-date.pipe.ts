import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'firestoreDate' })
export class FirestoreDatePipe implements PipeTransform {
  transform(value: any, format: string = 'medium'): string | null {
    const d = this.toDate(value);
    if (!d) return null;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    switch (format) {
      case 'short':
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      case 'medium':
        return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      default:
        return d.toLocaleString('pt-BR');
    }
  }

  private toDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    if (typeof v === 'number') return new Date(v);
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
}