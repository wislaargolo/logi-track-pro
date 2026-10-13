import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, defer, EMPTY, finalize, of } from 'rxjs';
import { ApiError, errorMessage } from '../../../core/http/api-error';
import { MaintenanceApiService } from '../data-access/maintenance-api.service';
import { MaintenanceDto, UpdateMaintenanceDto } from '../models/maintenance.models';
import { withAsyncLoad } from '../../../shared/state/async-load';

interface FormState {
  initialValue: MaintenanceDto | null;
  requestedId: string | null;
  loading: boolean;
  loadError: string | null;
  notFound: boolean;
  submitting: boolean;
  saveError: string | null;
  serverErrors: { field: string; message: string }[];
}

export const MaintenanceFormStore = signalStore(
  withState<FormState>({
    initialValue: null,
    requestedId: null,
    loading: false,
    loadError: null,
    notFound: false,
    submitting: false,
    saveError: null,
    serverErrors: [],
  }),
  withComputed(({ requestedId }) => ({ editing: computed(() => requestedId() !== null) })),

  withMethods((store, api = inject(MaintenanceApiService), destroyRef = inject(DestroyRef)) => {
    const load = withAsyncLoad<string | null, MaintenanceDto | null>(
      (raw) => (raw === null ? EMPTY : api.findById(Number(raw))),
      {
        start: (raw) =>
          patchState(store, {
            requestedId: raw,
            initialValue: null,
            loading: raw !== null,
            loadError: null,
            notFound: false,
            saveError: null,
            serverErrors: [],
          }),
        success: (initialValue) =>
          patchState(store, {
            initialValue,
            loading: false,
          }),
        failure: (rawError, error) =>
          patchState(store, {
            loadError: error,
            loading: false,
            notFound: rawError instanceof ApiError && rawError.status === 404,
          }),
      },
    );

    function saveMaintenance(dto: UpdateMaintenanceDto) {
      return defer(() => {
        if (store.submitting() || store.loading() || store.loadError()) return EMPTY;

        const id = store.requestedId() === null ? null : Number(store.requestedId());
        patchState(store, { submitting: true, saveError: null, serverErrors: [] });

        return (id === null ? api.create(dto) : api.update(id, dto)).pipe(
          catchError((error: unknown) => {
            patchState(store, {
              saveError: errorMessage(error),
              serverErrors: error instanceof ApiError ? error.fieldErrors : [],
            });
            return of(null);
          }),
          finalize(() => patchState(store, { submitting: false })),
        );
      }).pipe(takeUntilDestroyed(destroyRef));
    }

    return {
      load,

      retry: () => load(store.requestedId()),
      save: saveMaintenance,
    };
  }),
);
