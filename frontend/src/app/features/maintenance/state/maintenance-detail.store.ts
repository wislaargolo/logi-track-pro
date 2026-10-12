import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ApiError, errorMessage } from '../../../core/http/api-error';
import { catchError, defer, EMPTY, finalize, map, of } from 'rxjs';
import { MaintenanceApiService } from '../data-access/maintenance-api.service';
import { MaintenanceDto } from '../models/maintenance.models';
import { withAsyncLoad } from '../../../shared/state/async-load';

interface DetailState {
  record: MaintenanceDto | null;
  loading: boolean;
  requestedId: string | null;
  error: string | null;
  notFound: boolean;
  deletingId: number | null;
  deleteError: string | null;
}

export const MaintenanceDetailStore = signalStore(
  withState<DetailState>({
    record: null,
    loading: false,
    requestedId: null,
    error: null,
    notFound: false,
    deletingId: null,
    deleteError: null,
  }),

  withMethods((store, api = inject(MaintenanceApiService), destroyRef = inject(DestroyRef)) => {
    const load = withAsyncLoad<string | null, MaintenanceDto>(
      (raw) => (raw === null ? EMPTY : api.findById(Number(raw))),
      {
        start: (raw) =>
          patchState(store, {
            requestedId: raw,
            record: null,
            error: null,
            notFound: false,
            loading: raw !== null,
          }),
        success: (record) => patchState(store, { record, loading: false }),
        failure: (rawError, error) =>
          patchState(store, {
            error,
            loading: false,
            notFound: rawError instanceof ApiError && rawError.status === 404,
          }),
      },
    );

    function deleteMaintenance(id: number) {
      return defer(() => {
        if (store.deletingId() !== null) return EMPTY;
        patchState(store, { deletingId: id, deleteError: null });
        return api.delete(id).pipe(
          map(() => true),
          catchError((error: unknown) => {
            patchState(store, { deleteError: errorMessage(error) });
            return of(false);
          }),
          finalize(() => patchState(store, { deletingId: null })),
        );
      }).pipe(takeUntilDestroyed(destroyRef));
    }

    return {
      load,

      retry: () => load(store.requestedId()),
      delete: deleteMaintenance,
    };
  }),
);
