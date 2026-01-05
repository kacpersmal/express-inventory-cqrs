export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  readonly timestamp: string;

  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      details: this.details,
    };
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message = "Bad Request", code?: string, details?: unknown) {
    super(message, code, details);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(
    message = "Resource not found",
    code?: string,
    details?: unknown
  ) {
    super(message, code, details);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message = "Conflict", code?: string, details?: unknown) {
    super(message, code, details);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 422;
  readonly isOperational = true;

  constructor(message = "Validation failed", code?: string, details?: unknown) {
    super(message, code || "VALIDATION_ERROR", details);
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  constructor(
    message = "Internal server error",
    code?: string,
    details?: unknown
  ) {
    super(message, code, details);
  }
}
