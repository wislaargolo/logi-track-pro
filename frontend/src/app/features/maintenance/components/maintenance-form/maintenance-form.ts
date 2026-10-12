import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import type { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  MAINTENANCE_STATUS_OPTIONS,
  MaintenanceDto,
  UpdateMaintenanceDto,
} from '../../models/maintenance.models';
import { currencyPrecision } from '../../utils/currency-precision.validator';
import { VehicleDto } from '../../../vehicles/models/vehicle.dto';
import {
  formatBrazilianDateInput,
  toBrazilianDate,
  toIsoDate,
} from '../../../../shared/utils/date-only';

type ErrorMessageResolver = (control: AbstractControl) => string | null;
type DateField = 'startDate' | 'expectedEndDate';

function validBrazilianDate(control: AbstractControl): ValidationErrors | null {
  return !control.value || toIsoDate(control.value) !== null ? null : { dateFormat: true };
}

@Component({
  selector: 'app-maintenance-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
  ],
  templateUrl: './maintenance-form.html',
  styleUrl: './maintenance-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceForm {
  readonly statusOptions = MAINTENANCE_STATUS_OPTIONS;
  readonly initialValue = input<MaintenanceDto | null>(null);
  readonly vehicles = input<VehicleDto[]>([]);
  readonly submitting = input(false);
  readonly serverErrors = input<{ field: string; message: string }[]>([]);
  readonly vehiclesLoading = input(false);
  readonly vehicleError = input<string | null>(null);
  readonly vehicleRetry = output<void>();
  readonly vehicleSearch = output<string>();
  readonly submitted = output<UpdateMaintenanceDto>();

  readonly searchControl = new FormControl<string | VehicleDto>('', { nonNullable: true });
  readonly displayVehicle = (value: string | VehicleDto): string =>
    typeof value === 'string' ? value : value.licensePlate;
  readonly form = new FormGroup(
    {
      vehicleId: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      startDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, validBrazilianDate],
      }),
      expectedEndDate: new FormControl('', {
        nonNullable: true,
        validators: validBrazilianDate,
      }),
      serviceType: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(100),
          (control) => (control.value.trim() ? null : { required: true }),
        ],
      }),
      observation: new FormControl('', {
        nonNullable: true,
        validators: Validators.maxLength(1000),
      }),
      estimatedCost: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(99999999.99),
        currencyPrecision,
      ]),
      status: new FormControl<string | null>('PENDENTE', [
        Validators.required,
        (control) =>
          control.value == null ||
          MAINTENANCE_STATUS_OPTIONS.some((option) => option.value === control.value)
            ? null
            : { unsupportedStatus: true },
      ]),
    },
    {
      validators: (group) => {
        const { startDate, expectedEndDate } = group.value;
        const startDateIso = toIsoDate(startDate ?? '');
        const expectedEndDateIso = toIsoDate(expectedEndDate ?? '');
        return startDateIso && expectedEndDateIso && expectedEndDateIso < startDateIso
          ? { dateOrder: true }
          : null;
      },
    },
  );

  readonly vehicleErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.errorFor('vehicleId') !== null || this.vehicleError() !== null,
  };

  readonly expectedEndDateErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.errorFor('expectedEndDate') !== null,
  };

  private readonly fieldErrorResolvers = new Map<string, ErrorMessageResolver>([
    ['vehicleId', () => 'Selecione um veículo da lista.'],
    [
      'startDate',
      (control) =>
        control.hasError('dateFormat') ? 'Use o formato dd/mm/yyyy.' : 'Informe a data de início.',
    ],
    [
      'serviceType',
      (control) =>
        control.hasError('maxlength')
          ? 'Use no máximo 100 caracteres.'
          : 'Informe o tipo de manutenção.',
    ],
    [
      'observation',
      (control) => (control.hasError('maxlength') ? 'Use no máximo 1000 caracteres.' : null),
    ],
    [
      'expectedEndDate',
      (control) => (control.hasError('dateFormat') ? 'Use o formato dd/mm/yyyy.' : null),
    ],
    [
      'estimatedCost',
      (control) => {
        if (control.hasError('required')) return 'Informe o custo estimado.';
        if (control.hasError('min') || control.hasError('max'))
          return 'Informe um custo entre R$ 0,00 e R$ 99.999.999,99.';
        return 'Use no máximo duas casas decimais.';
      },
    ],
    ['status', () => 'Selecione um status válido.'],
  ]);

  errorFor(field: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[field];
    if (control.hasError('server')) return control.getError('server') as string;
    if (field === 'expectedEndDate' && control.touched && this.form.hasError('dateOrder'))
      return 'O término não pode ser anterior ao início.';
    if (!control.touched || !control.invalid) return null;
    return this.fieldErrorResolvers.get(field)?.(control) ?? null;
  }

  formatDateInput(field: DateField): void {
    const control = this.form.controls[field];
    const formatted = formatBrazilianDateInput(control.value);
    if (formatted !== control.value) control.setValue(formatted, { emitEvent: false });
  }

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const status = this.statusOptions.find((option) => option.value === value.status)?.value;
    const startDate = toIsoDate(value.startDate);
    const expectedEndDate = value.expectedEndDate ? toIsoDate(value.expectedEndDate) : null;
    if (
      value.vehicleId == null ||
      value.estimatedCost == null ||
      !status ||
      !startDate ||
      (value.expectedEndDate !== '' && !expectedEndDate)
    )
      return;
    this.submitted.emit({
      vehicleId: value.vehicleId,
      startDate,
      expectedEndDate,
      serviceType: value.serviceType.trim(),
      observation: value.observation === '' ? null : value.observation,
      estimatedCost: value.estimatedCost,
      status,
    });
  }

  onVehicleInput(): void {
    this.form.controls.vehicleId.setValue(null);
    this.form.controls.vehicleId.markAsTouched();
    this.searchVehicles();
  }

  searchVehicles(): void {
    this.vehicleSearch.emit(this.displayVehicle(this.searchControl.value));
  }

  selectVehicle(vehicle: VehicleDto): void {
    this.form.controls.vehicleId.setValue(vehicle.id);
    this.searchControl.setValue(vehicle.licensePlate, { emitEvent: false });
  }

  constructor() {
    effect(() => {
      if (this.submitting()) {
        this.form.disable({ emitEvent: false });
        this.searchControl.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
        this.searchControl.enable({ emitEvent: false });
      }
    });

    effect(() => {
      for (const error of this.serverErrors()) {
        const control = this.form.get(error.field);
        if (control) {
          control.setErrors({ ...control.errors, server: error.message });
          control.markAsTouched();
        }
      }
    });

    effect(() => {
      const value = this.initialValue();
      if (!value) return;
      this.form.reset({
        vehicleId: value.vehicleId,
        startDate: toBrazilianDate(value.startDate),
        expectedEndDate: toBrazilianDate(value.expectedEndDate),
        serviceType: value.serviceType ?? '',
        observation: value.observation ?? '',
        estimatedCost: value.estimatedCost,
        status: value.status,
      });
      this.searchControl.setValue(value.licensePlate ?? '', { emitEvent: false });
    });
  }
}
