import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withAsyncLoad } from '../../../shared/state/async-load';
import { DashboardApiService } from '../data-access/dashboard-api.service';
import { VehicleDto } from '../../vehicles/models/vehicle.dto';
import {
  TotalKilometersDto,
  TripsByCategoryDto,
  UpcomingMaintenanceDto,
  VehicleUtilizationRankingDto,
  CurrentMonthMaintenanceCostDto,
} from '../models/dashboard.dto';
interface Report<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const initialReport = <T>(): Report<T> => ({ data: null, loading: false, error: null });

export const DashboardStore = signalStore(
  withState({
    selectedVehicle: null as VehicleDto | null,
    kilometers: initialReport<TotalKilometersDto>(),
    trips: initialReport<TripsByCategoryDto[]>(),
    upcoming: initialReport<UpcomingMaintenanceDto[]>(),
    ranking: initialReport<VehicleUtilizationRankingDto[]>(),
    cost: initialReport<CurrentMonthMaintenanceCostDto>(),
  }),

  withMethods((store, api = inject(DashboardApiService)) => {
    const retryKilometers = withAsyncLoad<void, TotalKilometersDto>(
      () => api.totalKilometers(store.selectedVehicle()?.id ?? null),
      {
        start: () => patchState(store, { kilometers: { data: null, loading: true, error: null } }),
        success: (data) => patchState(store, { kilometers: { data, loading: false, error: null } }),
        failure: (_error, error) =>
          patchState(store, { kilometers: { data: null, loading: false, error } }),
      },
    );

    const retryTrips = withAsyncLoad<void, TripsByCategoryDto[]>(() => api.tripsByCategory(), {
      start: () => patchState(store, { trips: { data: null, loading: true, error: null } }),
      success: (data) => patchState(store, { trips: { data, loading: false, error: null } }),
      failure: (_error, error) =>
        patchState(store, { trips: { data: null, loading: false, error } }),
    });

    const retryUpcoming = withAsyncLoad<void, UpcomingMaintenanceDto[]>(
      () => api.upcomingMaintenance(),
      {
        start: () => patchState(store, { upcoming: { data: null, loading: true, error: null } }),
        success: (data) => patchState(store, { upcoming: { data, loading: false, error: null } }),
        failure: (_error, error) =>
          patchState(store, { upcoming: { data: null, loading: false, error } }),
      },
    );

    const retryRanking = withAsyncLoad<void, VehicleUtilizationRankingDto[]>(
      () => api.vehicleUtilizationRanking(),
      {
        start: () => patchState(store, { ranking: { data: null, loading: true, error: null } }),
        success: (data) => patchState(store, { ranking: { data, loading: false, error: null } }),
        failure: (_error, error) =>
          patchState(store, { ranking: { data: null, loading: false, error } }),
      },
    );

    const retryCost = withAsyncLoad<void, CurrentMonthMaintenanceCostDto>(
      () => api.currentMonthMaintenanceCost(),
      {
        start: () => patchState(store, { cost: { data: null, loading: true, error: null } }),
        success: (data) => patchState(store, { cost: { data, loading: false, error: null } }),
        failure: (_error, error) =>
          patchState(store, { cost: { data: null, loading: false, error } }),
      },
    );

    return {
      selectVehicle(vehicle: VehicleDto | null) {
        patchState(store, { selectedVehicle: vehicle });
        retryKilometers();
      },

      retryKilometers,
      retryTrips,
      retryUpcoming,
      retryRanking,
      retryCost,

      load() {
        retryKilometers();
        retryTrips();
        retryUpcoming();
        retryRanking();
        retryCost();
      },
    };
  }),
);
