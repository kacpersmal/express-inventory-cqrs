import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type CreateOrderBodyParams,
  CreateOrderCommand,
  createOrderBodySchema,
} from "./create-order.schema";

export const createOrderEndpoint = [
  validate(createOrderBodySchema, "body"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, CreateOrderBodyParams>,
      res: Response,
    ) => {
      const command = new CreateOrderCommand(req.body);
      const order = await commandBus.execute(command);

      res.status(201).json({
        success: true,
        data: order,
      });
    },
  ),
];
