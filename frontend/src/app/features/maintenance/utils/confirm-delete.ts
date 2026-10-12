import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, switchMap } from 'rxjs';
import { DeleteMaintenanceDialog } from '../components/delete-maintenance-dialog';
import { MaintenanceDto } from '../models/maintenance.models';

export interface ConfirmMaintenanceDeleteOptions<TResult> {
  record: MaintenanceDto | null;
  isDeleting: () => boolean;
  deleteRecord: (id: number) => Observable<TResult | null>;
  isSuccessful: (result: TResult) => boolean;
  onSuccess: (result: TResult) => void;
}

export function confirmMaintenanceDelete<TResult>(
  dialog: MatDialog,
  snackBar: MatSnackBar,
  destroyRef: DestroyRef,
  options: ConfirmMaintenanceDeleteOptions<TResult>,
): void {
  const { record } = options;
  if (!record || options.isDeleting() || dialog.openDialogs.length > 0) return;

  dialog
    .open(DeleteMaintenanceDialog, {
      data: record,
      width: '440px',
      maxWidth: 'calc(100vw - 32px)',
    })
    .afterClosed()
    .pipe(
      filter((confirmed: unknown) => confirmed === true),
      switchMap(() => options.deleteRecord(record.id)),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe({
      next: (result) => {
        if (result === null || !options.isSuccessful(result)) return;
        snackBar.open('Manutenção excluída.', 'Fechar', { duration: 4000 });
        options.onSuccess(result);
      },
    });
}
