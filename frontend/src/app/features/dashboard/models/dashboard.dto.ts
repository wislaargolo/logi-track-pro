export interface TotalKilometersDto {
  vehicleId: number | null;
  totalKm: number;
}
export interface TripsByCategoryDto {
  vehicleType: 'LEVE' | 'PESADO';
  tripCount: number;
}
export interface VehicleUtilizationRankingDto {
  vehicleId: number;
  licensePlate: string;
  model: string;
  totalKm: number;
}
export interface CurrentMonthMaintenanceCostDto {
  month: string;
  estimatedCost: number;
}
export interface UpcomingMaintenanceDto {
  id: number;
  vehicleId: number | null;
  licensePlate: string | null;
  model: string | null;
  startDate: string;
  serviceType: string | null;
  estimatedCost: number | null;
  status: string | null;
}
