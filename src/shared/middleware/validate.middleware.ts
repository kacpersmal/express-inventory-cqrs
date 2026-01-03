import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod/v3";

export const validate =
  (schema: AnyZodObject, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    next();
  };
