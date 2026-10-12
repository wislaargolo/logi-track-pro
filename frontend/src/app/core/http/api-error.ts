export const DEFAULT_API_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError && error.message.trim()
    ? error.message
    : DEFAULT_API_ERROR_MESSAGE;
}
