import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type RestockProductBody,
  RestockProductCommand,
  type RestockProductParams,
  restockProductBodySchema,
  restockProductParamsSchema,
} from "./restock-product.schema";

export const restockProductEndpoint = [
  validate(restockProductParamsSchema, "params"),
  validate(restockProductBodySchema, "body"),
  asyncHandler(
    async (
      req: Request<RestockProductParams, unknown, RestockProductBody>,
      res: Response,
    ) => {
      const command = new RestockProductCommand(
        req.params.id,
        req.body.quantity,
      );
      const result = await commandBus.execute(command);

      res.json({
        success: true,
        data: result,
      });
    },
  ),
];
