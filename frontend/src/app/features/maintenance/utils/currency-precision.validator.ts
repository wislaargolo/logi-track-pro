import { ValidatorFn } from '@angular/forms';

export const currencyPrecision: ValidatorFn = (control) => {
  const value = control.value;
  if (value == null) return null;
  return typeof value === 'number' && Number.isFinite(value) && Number(value.toFixed(2)) === value
    ? null
    : { precision: true };
};
