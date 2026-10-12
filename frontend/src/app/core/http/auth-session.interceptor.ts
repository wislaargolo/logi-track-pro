import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api-url.token';
import { AuthStore } from '../../features/auth/state/auth.store';

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = inject(API_URL);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const { apiRequest, loginRequest, meRequest } = classifyUrl(request.url, apiUrl);

  const token = authStore.accessToken();
  const authenticatedRequest =
    apiRequest && !loginRequest && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        apiRequest &&
        !loginRequest &&
        !meRequest
      ) {
        authStore.handleUnauthorized();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      return throwError(() => error);
    }),
  );
};

function classifyUrl(requestUrl: string, apiUrl: string) {
  try {
    const origin = globalThis.location?.origin ?? 'http://localhost';
    const api = new URL(apiUrl, origin);
    const target = new URL(requestUrl, origin);

    const apiPath = api.pathname.replace(/\/$/, '');
    const targetPath = target.pathname.replace(/\/$/, '');
    const sameOrigin = target.origin === api.origin;

    return {
      apiRequest: sameOrigin && (targetPath === apiPath || targetPath.startsWith(`${apiPath}/`)),
      loginRequest: sameOrigin && targetPath === `${apiPath}/auth/login`,
      meRequest: sameOrigin && targetPath === `${apiPath}/auth/me`,
    };
  } catch {
    return { apiRequest: false, loginRequest: false, meRequest: false };
  }
}
