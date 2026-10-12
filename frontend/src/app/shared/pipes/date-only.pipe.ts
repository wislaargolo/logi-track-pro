import { Pipe, PipeTransform } from '@angular/core';
import { toBrazilianDate } from '../utils/date-only';

@Pipe({ name: 'dateOnly' })
export class DateOnlyPipe implements PipeTransform {
  transform(value: string | null): string {
    if (value === null || value === '') return 'Não informado';
    return toBrazilianDate(value);
  }
}
