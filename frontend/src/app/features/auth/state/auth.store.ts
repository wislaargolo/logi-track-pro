import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  Observable,
  Subject,
  defer,
  EMPTY,
  of,
  shareReplay,
  catchError,
  finalize,
  map,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { errorMessage } from '../../../core/http/api-error';
import { AuthApiService } from '../data-access/auth-api.service';
import { LoginRequestDto, UserDto } from '../models/auth.models';

export const ACCESS_TOKEN_KEY = 'logitrack_access_token';

export class AuthStorageError extends Error {
  constructor() {
    super('Não foi possível salvar a sessão neste navegador.');
    this.name = 'AuthStorageError';
  }
}

function readStoredToken(): string | null {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token?.trim() ? token : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(() => ({
    user: null,
    accessToken: readStoredToken(),
    initialized: false,
    loading: false,
    error: null,
  })),
  withComputed(({ user, accessToken }) => ({
    isAuthenticated: computed(() => user() !== null),
    hasToken: computed(() => accessToken() !== null),
  })),
  withMethods((store, api = inject(AuthApiService), destroyRef = inject(DestroyRef)) => {
    const cancelRestoration$ = new Subject<void>();
    let initialization$: Observable<UserDto | null> | null = null;

    function cancelRestoration() {
      cancelRestoration$.next();
      initialization$ = null;
    }

    function clearSession() {
      cancelRestoration();
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      } catch {
        // Clearing an in-memory session must work even when storage is unavailable.
      }
      patchState(store, {
        accessToken: null,
        user: null,
        initialized: true,
        loading: false,
        error: null,
      });
    }

    function initialize(): Observable<UserDto | null> {
      return defer(() => {
        if (initialization$) return initialization$;
        if (store.loading()) return of(store.user());
        if (store.initialized()) return of(store.user());
        if (!store.accessToken()) {
          patchState(store, { initialized: true });
          return of(null);
        }
        initialization$ = defer(() => {
          patchState(store, { loading: true, error: null });
          return api.me();
        }).pipe(
          takeUntil(cancelRestoration$),
          tap((user) => patchState(store, { user, initialized: true })),
          map((user): UserDto | null => user),
          catchError((error: unknown) => {
            if (
              typeof error === 'object' &&
              error !== null &&
              'status' in error &&
              error.status === 401
            ) {
              clearSession();
            } else {
              patchState(store, { initialized: true, error: errorMessage(error) });
            }
            return of(null);
          }),
          takeUntilDestroyed(destroyRef),
          finalize(() => {
            patchState(store, { loading: false });
            initialization$ = null;
          }),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
        return initialization$;
      });
    }

    return {
      initialize,
      retryInitialize(): Observable<UserDto | null> {
        return defer(() => {
          if (!initialization$ && store.error()) patchState(store, { initialized: false });
          return initialize();
        });
      },

      logout: clearSession,
      handleUnauthorized: clearSession,

      login(request: LoginRequestDto): Observable<UserDto> {
        return defer(() => {
          if (store.loading() && !initialization$) return EMPTY;
          cancelRestoration();
          patchState(store, { loading: true, error: null });
          return api.login(request).pipe(
            tap((response) => {
              try {
                localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
              } catch {
                throw new AuthStorageError();
              }
              patchState(store, {
                accessToken: response.accessToken,
                user: response.user,
                initialized: true,
              });
            }),
            map((response) => response.user),
            catchError((error: unknown) => {
              patchState(store, {
                error: error instanceof AuthStorageError ? error.message : errorMessage(error),
              });
              return throwError(() => error);
            }),
            finalize(() => patchState(store, { loading: false })),
          );
        }).pipe(takeUntilDestroyed(destroyRef));
      },
    };
  }),
);

export type AuthStore = InstanceType<typeof AuthStore>;
