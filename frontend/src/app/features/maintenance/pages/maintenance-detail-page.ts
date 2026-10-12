import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { map } from 'rxjs';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { DateOnlyPipe } from '../../../shared/pipes/date-only.pipe';
import { MaintenanceStatusComponent } from '../components/maintenance-status';
import { MaintenanceDetailStore } from '../state/maintenance-detail.store';
import { confirmMaintenanceDelete } from '../utils/confirm-delete';

@Component({
  selector: 'app-maintenance-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BrlPipe,
    DateOnlyPipe,
    MaintenanceStatusComponent,
  ],
  providers: [MaintenanceDetailStore],
  templateUrl: './maintenance-detail-page.html',
  styleUrl: './maintenance-detail-page.scss',
})
export class MaintenanceDetailPage {
  readonly store = inject(MaintenanceDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.store.load(this.route.paramMap.pipe(map((params) => params.get('id'))));
  }

  retry(): void {
    this.store.retry();
  }

  confirmDelete(): void {
    confirmMaintenanceDelete(this.dialog, this.snackBar, this.destroyRef, {
      record: this.store.record(),
      isDeleting: () => this.store.deletingId() !== null,
      deleteRecord: (id) => this.store.delete(id),
      isSuccessful: (deleted) => deleted,
      onSuccess: () => void this.router.navigate(['/manutencoes']),
    });
  }
}
