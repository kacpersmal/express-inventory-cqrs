import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type CreateProductBodyParams,
  CreateProductCommand,
  createProductBodySchema,
} from "./create-product.schema";

export const createProductEndpoint = [
  validate(createProductBodySchema, "body"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, CreateProductBodyParams>,
      res: Response,
    ) => {
      const command = new CreateProductCommand(req.body);
      const product = await commandBus.execute(command);

      res.status(201).json({
        success: true,
        data: product,
      });
    },
  ),
];
