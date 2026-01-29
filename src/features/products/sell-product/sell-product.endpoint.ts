import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type SellProductBody,
  SellProductCommand,
  type SellProductParams,
  sellProductBodySchema,
  sellProductParamsSchema,
} from "./sell-product.schema";

export const sellProductEndpoint = [
  validate(sellProductParamsSchema, "params"),
  validate(sellProductBodySchema, "body"),
  asyncHandler(
    async (
      req: Request<SellProductParams, unknown, SellProductBody>,
      res: Response,
    ) => {
      const command = new SellProductCommand(req.params.id, req.body.quantity);
      const result = await commandBus.execute(command);

      res.json({
        success: true,
        data: result,
      });
    },
  ),
];
