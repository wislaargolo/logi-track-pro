import { ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkOverlayOrigin, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { portuguesePaginatorIntl } from '../../../core/i18n/paginator-intl';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { DateOnlyPipe } from '../../../shared/pipes/date-only.pipe';
import {
  formatBrazilianDateInput,
  toBrazilianDate,
  toIsoDate,
} from '../../../shared/utils/date-only';
import { MaintenanceStatusComponent } from '../components/maintenance-status';
import { MaintenanceListStore } from '../state/maintenance-list.store';
import { confirmMaintenanceDelete } from '../utils/confirm-delete';
import { currencyPrecision } from '../utils/currency-precision.validator';
import { PAGE_SIZES, queryFromParams, queryToParams } from '../data-access/maintenance-query';
import {
  MAINTENANCE_STATUS_OPTIONS,
  MaintenanceDto,
  MaintenanceFilterDto,
  MaintenanceListQuery,
} from '../models/maintenance.models';

function orderedRanges(control: AbstractControl): ValidationErrors | null {
  const value = control.value as {
    startDateFrom: string;
    startDateTo: string;
    estimatedCostMin: number | null;
    estimatedCostMax: number | null;
  };
  const errors: ValidationErrors = {};
  const startDateFrom = toIsoDate(value.startDateFrom);
  const startDateTo = toIsoDate(value.startDateTo);
  if (startDateFrom && startDateTo && startDateFrom > startDateTo) errors['dateRange'] = true;
  if (
    value.estimatedCostMin !== null &&
    value.estimatedCostMax !== null &&
    value.estimatedCostMin > value.estimatedCostMax
  )
    errors['costRange'] = true;
  return Object.keys(errors).length ? errors : null;
}

function validBrazilianDate(control: AbstractControl): ValidationErrors | null {
  return !control.value || toIsoDate(control.value) !== null ? null : { dateFormat: true };
}

const costFilterValidators = [
  Validators.min(-99999999.99),
  Validators.max(99999999.99),
  currencyPrecision,
];

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-maintenance-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIcon,
    A11yModule,
    OverlayModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    BrlPipe,
    DateOnlyPipe,
    MaintenanceStatusComponent,
  ],
  providers: [
    MaintenanceListStore,
    { provide: MatPaginatorIntl, useFactory: portuguesePaginatorIntl },
  ],
  templateUrl: './maintenance-list-page.html',
  styleUrl: './maintenance-list-page.scss',
})
export class MaintenanceListPage {
  readonly store = inject(MaintenanceListStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly columns = [
    'vehicle',
    'serviceType',
    'startDate',
    'expectedEndDate',
    'estimatedCost',
    'status',
    'actions',
  ];
  readonly pageSizes = PAGE_SIZES;
  readonly statuses = MAINTENANCE_STATUS_OPTIONS;
  readonly displayStatus = (value: string | null): string =>
    this.statuses.find((status) => status.value === value)?.label ?? value ?? '';
  readonly filterOrigin = viewChild.required<CdkOverlayOrigin>('filterOrigin');
  readonly filterPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];
  filterOpen = false;

  readonly filters = new FormGroup(
    {
      search: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(100)],
      }),
      status: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
      startDateFrom: new FormControl('', { nonNullable: true, validators: validBrazilianDate }),
      startDateTo: new FormControl('', { nonNullable: true, validators: validBrazilianDate }),
      estimatedCostMin: new FormControl<number | null>(null, costFilterValidators),
      estimatedCostMax: new FormControl<number | null>(null, costFilterValidators),
    },
    { validators: orderedRanges },
  );

  constructor() {
    this.filters.controls.search.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.applySearch(search));

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const query = queryFromParams(params);
      this.filters.reset(
        {
          search: query.filter.search ?? '',
          status: query.filter.status ?? '',
          startDateFrom: toBrazilianDate(query.filter.startDateFrom),
          startDateTo: toBrazilianDate(query.filter.startDateTo),
          estimatedCostMin: query.filter.estimatedCostMin ?? null,
          estimatedCostMax: query.filter.estimatedCostMax ?? null,
        },
        { emitEvent: false },
      );
      this.store.load(query);
    });
  }

  applyFilters(): void {
    this.filters.markAllAsTouched();
    if (this.filters.invalid) return;
    const value = this.filters.getRawValue();
    const filter: MaintenanceFilterDto = {};
    for (const key of ['search', 'status'] as const) {
      const text = value[key].trim();
      if (text) filter[key] = text;
    }

    for (const key of ['startDateFrom', 'startDateTo'] as const) {
      const date = toIsoDate(value[key]);
      if (date) filter[key] = date;
    }

    for (const key of ['estimatedCostMin', 'estimatedCostMax'] as const) {
      if (value[key] !== null) filter[key] = value[key];
    }
    this.navigate({ ...this.store.query(), filter, page: 0 });
    this.closeFilters();
  }

  resetFilters(): void {
    this.filters.reset(undefined, { emitEvent: false });
  }

  clearFiltersAndApply(): void {
    this.resetFilters();
    this.navigate({ ...this.store.query(), filter: {}, page: 0 });
  }

  toggleFilters(): void {
    if (this.filterOpen) this.closeFilters();
    else this.filterOpen = true;
  }

  closeFilters(): void {
    this.filterOpen = false;
  }

  changePage(event: PageEvent): void {
    this.navigate({ ...this.store.query(), page: event.pageIndex, size: event.pageSize });
  }

  changeSort(sort: Sort): void {
    const field = sort.direction ? sort.active : 'startDate';
    const direction = sort.direction || 'asc';
    this.navigate({
      ...this.store.query(),
      page: 0,
      sort: field === 'id' ? [`id,${direction}`] : [`${field},${direction}`, `id,${direction}`],
    });
  }

  retry(): void {
    this.store.retry();
  }

  formatDateInput(field: 'startDateFrom' | 'startDateTo'): void {
    const control = this.filters.controls[field];
    const formatted = formatBrazilianDateInput(control.value);
    if (formatted !== control.value) control.setValue(formatted, { emitEvent: false });
  }

  private applySearch(search: string): void {
    const currentSearch = this.filters.controls.search.value.trim();
    if (this.filters.controls.search.invalid || search !== currentSearch) return;

    const query = this.store.query();
    if ((query.filter.search ?? '') === search) return;

    const filter = { ...query.filter };
    if (search) filter.search = search;
    else delete filter.search;
    this.navigate({ ...query, filter, page: 0 });
  }

  confirmDelete(record: MaintenanceDto): void {
    confirmMaintenanceDelete(this.dialog, this.snackBar, this.destroyRef, {
      record,
      isDeleting: () => this.store.deletingId() !== null,
      deleteRecord: (id) => this.store.delete(id),
      isSuccessful: () => true,
      onSuccess: (result) => {
        if (result.pageChanged) this.navigate(result.query);
      },
    });
  }

  private navigate(query: MaintenanceListQuery): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: queryToParams(query) });
  }
}
