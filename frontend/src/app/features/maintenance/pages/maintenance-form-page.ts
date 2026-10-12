import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { filter, map } from 'rxjs';
import { VehicleSearchStore } from '../../vehicles/state/vehicle-search.store';
import { MaintenanceForm } from '../components/maintenance-form/maintenance-form';
import { UpdateMaintenanceDto } from '../models/maintenance.models';
import { MaintenanceFormStore } from '../state/maintenance-form.store';

@Component({
  selector: 'app-maintenance-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MaintenanceForm,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [MaintenanceFormStore, VehicleSearchStore],
  templateUrl: './maintenance-form-page.html',
  styleUrl: './maintenance-form-page.scss',
})
export class MaintenanceFormPage {
  readonly store = inject(MaintenanceFormStore);
  readonly vehicleStore = inject(VehicleSearchStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.store.load(this.route.paramMap.pipe(map((params) => params.get('id'))));
  }

  retry(): void {
    this.store.retry();
  }

  cancel(): void {
    if (!this.store.submitting()) void this.router.navigate(['/manutencoes']);
  }

  save(dto: UpdateMaintenanceDto): void {
    const editing = this.store.editing();
    this.store
      .save(dto)
      .pipe(filter((record) => record !== null))
      .subscribe({
        next: () => {
          this.snackBar.open(editing ? 'Manutenção atualizada.' : 'Manutenção criada.', 'Fechar', {
            duration: 4000,
          });
          void this.router.navigate(['/manutencoes']);
        },
      });
  }
}
