import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaintenanceDto } from '../models/maintenance.models';

@Component({
  selector: 'app-delete-maintenance-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title class="delete-dialog-title">Excluir manutenção?</h2>
    <mat-dialog-content class="delete-dialog-content">
      <p>
        <strong>{{ record.serviceType ?? 'Manutenção não informada' }}</strong
        ><br />{{ record.licensePlate ?? 'Veículo não informado' }}
      </p>
      <p>Essa ação é permanente e não pode ser desfeita.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-button
        class="app-button app-button--tertiary"
        type="button"
        [mat-dialog-close]="false"
        cdkFocusInitial
      >
        Cancelar
      </button>
      <button
        mat-flat-button
        class="app-button app-button--destructive"
        type="button"
        [mat-dialog-close]="true"
      >
        Excluir manutenção
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .delete-dialog-title {
      font-family: var(--font-family-sans);
      font-size: var(--font-size-subtitle);
      line-height: var(--font-line-height-subtitle);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--font-letter-spacing-heading);
      margin: 0;
    }

    .delete-dialog-content p {
      font-family: var(--font-family-sans);
      font-size: var(--font-size-body);
      line-height: var(--font-line-height-body);
      font-weight: var(--font-weight-regular);
      letter-spacing: 0px;
      margin: 0 0 var(--space-4);
    }

    .delete-dialog-content p:last-child {
      color: var(--muted);
      margin-bottom: 0;
    }
  `,
})
export class DeleteMaintenanceDialog {
  readonly record = inject<MaintenanceDto>(MAT_DIALOG_DATA);
}
