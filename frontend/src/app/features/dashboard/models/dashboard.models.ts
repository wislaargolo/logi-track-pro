import { TripsByCategoryDto } from './dashboard.dto';

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export const formatNumber = (value: number): string => numberFormatter.format(value);

export function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) return month;
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`));
}

export function categoryRows(data: TripsByCategoryDto[]) {
  const maximum = Math.max(0, ...data.map((row) => row.tripCount));
  return (['LEVE', 'PESADO'] as const).map((type) => {
    const count = data.find((row) => row.vehicleType === type)?.tripCount ?? 0;
    return {
      label: type === 'LEVE' ? 'Leve' : 'Pesado',
      count,
      width: maximum > 0 ? (count / maximum) * 100 : 0,
    };
  });
}
