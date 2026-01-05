import type { ZodError } from "zod";
import { config } from "../config";
import type { AppError } from "./app-errors";

export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    details?: unknown;
    stack?: string;
  };
}

function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error && "statusCode" in error && "isOperational" in error
  );
}

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as ZodError).issues)
  );
}

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export function formatError(error: Error | AppError | ZodError): ErrorResponse {
  const isDev = config.isDev;

  if (isZodError(error)) {
    return {
      success: false,
      error: {
        name: "ValidationError",
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        statusCode: 422,
        timestamp: new Date().toISOString(),
        details: formatZodError(error),
        ...(isDev && { stack: error.stack }),
      },
    };
  }

  if (isAppError(error)) {
    return {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        details: error.details,
        ...(isDev && { stack: error.stack }),
      },
    };
  }

  return {
    success: false,
    error: {
      name: isDev ? error.name : "InternalServerError",
      message: isDev ? error.message : "An unexpected error occurred",
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(isDev && { stack: error.stack }),
    },
  };
}

export function getStatusCode(error: Error | AppError): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  if (isZodError(error)) {
    return 422;
  }
  return 500;
}
