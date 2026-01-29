import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  type CreateCustomerBodyParams,
  CreateCustomerCommand,
  createCustomerBodySchema,
} from "./create-customer.schema";

export const createCustomerEndpoint = [
  validate(createCustomerBodySchema, "body"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, CreateCustomerBodyParams>,
      res: Response,
    ) => {
      const command = new CreateCustomerCommand(req.body);
      const customer = await commandBus.execute(command);

      res.status(201).json({
        success: true,
        data: customer,
      });
    },
  ),
];
