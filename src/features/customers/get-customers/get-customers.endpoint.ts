import type { Request, Response } from "express";
import { queryBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  GetCustomersQuery,
  type GetCustomersQueryParams,
  getCustomersQuerySchema,
} from "./get-customers.schema";

export const getCustomersEndpoint = [
  validate(getCustomersQuerySchema, "query"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, unknown, GetCustomersQueryParams>,
      res: Response,
    ) => {
      const query = new GetCustomersQuery(req.query);
      const result = await queryBus.execute(query);
      res.json({ success: true, data: result });
    },
  ),
];
