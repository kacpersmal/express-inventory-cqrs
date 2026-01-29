import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import type { AppError } from "./app-errors";
import { formatError, getStatusCode } from "./error-formatter";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const errorResponse = formatError(err);
  const statusCode = getStatusCode(err);

  if (statusCode >= 500) {
    req.log.error(
      {
        err,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
      },
      "Internal server error",
    );
  } else if (statusCode >= 400) {
    req.log.warn(
      {
        error: errorResponse.error,
        url: req.url,
        method: req.method,
      },
      "Client error",
    );
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(404).json({
    success: false,
    error: {
      name: "NotFoundError",
      message: `Route ${req.method} ${req.path} not found`,
      code: "ROUTE_NOT_FOUND",
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

export const setupGracefulShutdown = (server: {
  close: (callback: () => void) => void;
}) => {
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown`);

    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

export const setupProcessHandlers = () => {
  process.on("unhandledRejection", (reason: Error | unknown) => {
    logger.error({ err: reason }, "Unhandled promise rejection");
    throw reason;
  });

  process.on("uncaughtException", (error: Error) => {
    logger.error({ err: error }, "Uncaught exception");
    process.exit(1);
  });
};
