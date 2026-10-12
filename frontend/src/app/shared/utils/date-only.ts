const BRAZILIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatBrazilianDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function toBrazilianDate(value: string | null | undefined): string {
  if (!value) return '';

  const match = ISO_DATE_PATTERN.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export function toIsoDate(value: string): string | null {
  const match = BRAZILIAN_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[3]);
  const month = Number(match[2]);
  const day = Number(match[1]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth =
    month === 2 ? (isLeapYear ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth) return null;

  return `${match[3]}-${match[2]}-${match[1]}`;
}
