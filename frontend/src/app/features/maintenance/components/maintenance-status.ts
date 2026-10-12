import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MAINTENANCE_STATUS_OPTIONS } from '../models/maintenance.models';

const labels = new Map<string, string>(
  MAINTENANCE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

const tones = new Map<string, string>([
  ['PENDENTE', 'pending'],
  ['EM_REALIZACAO', 'active'],
  ['CONCLUIDA', 'complete'],
]);

@Component({
  selector: 'app-maintenance-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './maintenance-status.html',
  styleUrl: './maintenance-status.scss',
})
export class MaintenanceStatusComponent {
  readonly status = input<string | null>(null);
  readonly display = computed(() => {
    const status = this.status();
    if (status === null || status === '') return { label: 'Não informado', tone: 'empty' };
    return { label: labels.get(status) ?? status, tone: tones.get(status) ?? 'legacy' };
  });
}
