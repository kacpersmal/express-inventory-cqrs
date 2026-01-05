import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import { CustomerModel } from "../customer.model";
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
      await commandBus.execute(command);

      const customer = await CustomerModel.findOne({
        email: req.body.email,
      }).lean();

      res.status(201).json({
        success: true,
        data: {
          id: customer?._id?.toString(),
          name: customer?.name,
          email: customer?.email,
          region: customer?.region,
          createdAt: customer?.createdAt,
        },
      });
    },
  ),
];
