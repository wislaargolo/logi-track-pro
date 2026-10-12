import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, defer, delay, EMPTY, finalize, map, of } from 'rxjs';
import { errorMessage } from '../../../core/http/api-error';
import { PagedResponseDto } from '../../../core/models/paged-response.dto';
import { withAsyncLoad } from '../../../shared/state/async-load';
import { MaintenanceApiService } from '../data-access/maintenance-api.service';
import { MaintenanceDto, MaintenanceListQuery } from '../models/maintenance.models';

export interface MaintenanceDeletionResult {
  query: MaintenanceListQuery;
  pageChanged: boolean;
}

interface ListState {
  response: PagedResponseDto<MaintenanceDto> | null;
  query: MaintenanceListQuery;
  error: string | null;
  loading: boolean;
  deletingId: number | null;
  deleteError: string | null;
}

const LIST_UPDATE_DELAY_MS = 120;

export const MaintenanceListStore = signalStore(
  withState<ListState>({
    response: null,
    error: null,
    loading: false,
    deletingId: null,
    deleteError: null,
    query: { page: 0, size: 20, sort: ['startDate,asc', 'id,asc'], filter: {} },
  }),

  withComputed(({ query }) => ({
    sortField: computed(() => query().sort[0]?.split(',')[0] ?? 'startDate'),
    sortDirection: computed<'asc' | 'desc'>(() =>
      query().sort[0]?.endsWith('desc') ? 'desc' : 'asc',
    ),
    hasFilters: computed(() => Object.keys(query().filter).length > 0),
  })),

  withMethods((store, api = inject(MaintenanceApiService), destroyRef = inject(DestroyRef)) => {
    const load = withAsyncLoad<MaintenanceListQuery, PagedResponseDto<MaintenanceDto>>(
      (query) => api.findAll(query).pipe(delay(LIST_UPDATE_DELAY_MS)),
      {
        start: (query) => {
          patchState(store, { query, error: null, loading: true });
        },
        success: (response) => patchState(store, { response, loading: false }),
        failure: (_error, error) => patchState(store, { error, loading: false }),
      },
    );

    function deleteMaintenance(id: number) {
      return defer(() => {
        if (store.deletingId() !== null) return EMPTY;
        patchState(store, { deletingId: id, deleteError: null });
        return api.delete(id).pipe(
          map((): MaintenanceDeletionResult => {
            const query = store.query();
            const rows = store.response()?.content;
            const pageChanged = query.page > 0 && rows?.length === 1 && rows[0].id === id;
            const nextQuery = pageChanged ? { ...query, page: query.page - 1 } : query;
            if (pageChanged) patchState(store, { query: nextQuery, response: null });
            else load(nextQuery);
            return { query: nextQuery, pageChanged };
          }),
          catchError((error: unknown) => {
            patchState(store, { deleteError: errorMessage(error) });
            return of(null);
          }),
          finalize(() => patchState(store, { deletingId: null })),
        );
      }).pipe(takeUntilDestroyed(destroyRef));
    }

    return {
      load,

      retry: () => load(store.query()),
      delete: deleteMaintenance,
    };
  }),
);
