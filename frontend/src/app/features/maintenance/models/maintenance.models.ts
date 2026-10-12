export type MaintenanceStatus = 'PENDENTE' | 'EM_REALIZACAO' | 'CONCLUIDA';

export const MAINTENANCE_STATUS_OPTIONS: {
  value: MaintenanceStatus;
  label: string;
}[] = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_REALIZACAO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
];

export interface MaintenanceDto {
  id: number;
  vehicleId: number | null;
  licensePlate: string | null;
  model: string | null;
  startDate: string | null;
  expectedEndDate: string | null;
  serviceType: string | null;
  observation: string | null;
  estimatedCost: number | null;
  status: string | null;
}

export interface CreateMaintenanceDto {
  vehicleId: number;
  startDate: string;
  expectedEndDate: string | null;
  serviceType: string;
  observation: string | null;
  estimatedCost: number;
  status?: MaintenanceStatus;
}

export interface UpdateMaintenanceDto extends CreateMaintenanceDto {
  status: MaintenanceStatus;
}

export interface MaintenanceFilterDto {
  search?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
}

export interface MaintenanceListQuery {
  page: number;
  size: number;
  sort: readonly string[];
  filter: MaintenanceFilterDto;
}
