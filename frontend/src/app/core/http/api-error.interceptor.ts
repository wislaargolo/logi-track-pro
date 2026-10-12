import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, DEFAULT_API_ERROR_MESSAGE } from './api-error';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }
      if (error.status < 400 || error.status >= 500) {
        return throwError(() => new ApiError(DEFAULT_API_ERROR_MESSAGE, error.status));
      }
      const body: unknown = error.error;
      const problem =
        typeof body === 'object' && body !== null && !Array.isArray(body)
          ? (body as Record<string, unknown>)
          : {};
      const detail = problem['detail'];
      const message =
        typeof detail === 'string' && detail.trim() ? detail.trim() : DEFAULT_API_ERROR_MESSAGE;

      const rawErrors = problem['errors'];
      const errors: unknown[] = Array.isArray(rawErrors) ? rawErrors : [];
      const fieldErrors: { field: string; message: string }[] = [];

      for (const entry of errors) {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
          continue;
        }
        const { field, message } = entry as Record<string, unknown>;
        if (
          typeof field === 'string' &&
          field.trim() &&
          typeof message === 'string' &&
          message.trim()
        ) {
          fieldErrors.push({ field: field.trim(), message: message.trim() });
        }
      }

      return throwError(() => new ApiError(message, error.status, fieldErrors));
    }),
  );
