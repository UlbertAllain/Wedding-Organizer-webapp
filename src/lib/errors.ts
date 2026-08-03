export type HttpStatus = 400 | 401 | 403 | 404 | 409 | 422 | 503;

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: HttpStatus = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, status: 401 | 403 = 401) {
    super(message, status);
    this.name = "AuthError";
  }
}
