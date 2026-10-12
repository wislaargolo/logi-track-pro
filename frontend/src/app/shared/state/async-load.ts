import { rxMethod, type RxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, defer, EMPTY, Observable, pipe, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/http/api-error';

export interface AsyncLoadHandlers<Input, Output> {
  start: (input: Input) => void;
  success: (value: Output) => void;
  failure: (error: unknown, message: string) => void;
}

export function withAsyncLoad<Input, Output>(
  loader: (input: Input) => Observable<Output>,
  handlers: AsyncLoadHandlers<Input, Output>,
): RxMethod<Input> {
  return rxMethod<Input>(
    pipe(
      switchMap((input) => {
        handlers.start(input);
        return defer(() => loader(input)).pipe(
          tap((value) => handlers.success(value)),
          catchError((error: unknown) => {
            handlers.failure(error, errorMessage(error));
            return EMPTY;
          }),
        );
      }),
    ),
  );
}
