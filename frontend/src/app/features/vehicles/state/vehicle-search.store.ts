import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounce, distinctUntilChanged, map, of, pipe, tap, timer } from 'rxjs';
import { VehicleApiService } from '../data-access/vehicle-api.service';
import { VehicleDto } from '../models/vehicle.dto';
import { withAsyncLoad } from '../../../shared/state/async-load';

export const VehicleSearchStore = signalStore(
  withState({
    vehicles: [] as VehicleDto[],
    loading: false,
    error: null as string | null,
    searchTerm: '',
  }),

  withMethods((store, api = inject(VehicleApiService)) => {
    const load = withAsyncLoad<string, VehicleDto[]>(
      (term) => api.search(term).pipe(map((response) => response.content)),
      {
        start: () => patchState(store, { vehicles: [], loading: true, error: null }),
        success: (vehicles) => patchState(store, { vehicles, loading: false }),
        failure: (_error, error) => patchState(store, { error, loading: false }),
      },
    );

    return {
      search: rxMethod<string>(
        pipe(
          map((term) => term.trim()),
          tap((searchTerm) => patchState(store, { searchTerm })),
          debounce((term) => (term ? timer(250) : of(term))),
          distinctUntilChanged(),
          tap((term) => load(term)),
        ),
      ),
      retry: () => load(store.searchTerm()),
    };
  }),
);
