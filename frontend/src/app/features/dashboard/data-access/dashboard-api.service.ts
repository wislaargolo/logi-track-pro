import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../core/http/api-url.token';
import {
  TotalKilometersDto,
  TripsByCategoryDto,
  UpcomingMaintenanceDto,
  VehicleUtilizationRankingDto,
  CurrentMonthMaintenanceCostDto,
} from '../models/dashboard.dto';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/dashboard`;

  tripsByCategory() {
    return this.http.get<TripsByCategoryDto[]>(`${this.url}/trips-by-category`);
  }

  upcomingMaintenance() {
    return this.http.get<UpcomingMaintenanceDto[]>(`${this.url}/upcoming-maintenance`);
  }

  vehicleUtilizationRanking() {
    return this.http.get<VehicleUtilizationRankingDto[]>(`${this.url}/vehicle-utilization-ranking`);
  }

  currentMonthMaintenanceCost() {
    return this.http.get<CurrentMonthMaintenanceCostDto>(
      `${this.url}/current-month-maintenance-cost`,
    );
  }

  totalKilometers(vehicleId: number | null) {
    const params =
      vehicleId === null ? new HttpParams() : new HttpParams().set('vehicleId', vehicleId);
    return this.http.get<TotalKilometersDto>(`${this.url}/total-kilometers`, { params });
  }
}
