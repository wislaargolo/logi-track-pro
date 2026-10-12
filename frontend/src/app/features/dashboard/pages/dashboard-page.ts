import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { DateOnlyPipe } from '../../../shared/pipes/date-only.pipe';
import { VehicleSearchStore } from '../../vehicles/state/vehicle-search.store';
import { VehicleDto } from '../../vehicles/models/vehicle.dto';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '../state/dashboard.store';
import { categoryRows, formatNumber, monthLabel } from '../models/dashboard.models';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    DateOnlyPipe,
    BrlPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  providers: [DashboardStore, VehicleSearchStore],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  readonly store = inject(DashboardStore);
  readonly vehicleSearch = inject(VehicleSearchStore);

  readonly searchControl = new FormControl<string | VehicleDto>('', { nonNullable: true });
  readonly displayVehicle = (value: string | VehicleDto | null): string =>
    value === null
      ? ''
      : typeof value === 'string'
        ? value
        : `${value.licensePlate} · ${value.model}`;

  searchVehicles() {
    const value = this.searchControl.value;
    const term = typeof value === 'string' ? value : value.licensePlate;
    this.vehicleSearch.search(term.slice(0, 100));
  }

  onVehicleInput() {
    if (this.store.selectedVehicle()) this.store.selectVehicle(null);
    this.searchVehicles();
  }

  selectVehicle(vehicle: VehicleDto | null) {
    this.searchControl.setValue(vehicle ?? '');
    this.store.selectVehicle(vehicle);
  }

  readonly monthLabel = monthLabel;
  readonly formatNumber = formatNumber;
  readonly categories = computed(() => categoryRows(this.store.trips().data ?? []));
  readonly noTrips = computed(() => this.categories().every((row) => row.count === 0));

  constructor() {
    this.store.load();
  }
}
