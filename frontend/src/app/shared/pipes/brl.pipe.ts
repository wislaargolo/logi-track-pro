import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brl' })
export class BrlPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  transform(value: number | null): string {
    return value === null ? 'Não informado' : this.formatter.format(value);
  }
}
