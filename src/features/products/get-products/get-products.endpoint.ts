import type { Request, Response } from "express";
import { queryBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import {
  GetProductsQuery,
  type GetProductsQueryParams,
  getProductsQuerySchema,
} from "./get-products.schema";

export const getProductsEndpoint = [
  validate(getProductsQuerySchema, "query"),
  asyncHandler(
    async (
      req: Request<unknown, unknown, unknown, GetProductsQueryParams>,
      res: Response,
    ) => {
      const query = new GetProductsQuery(req.query);
      const result = await queryBus.execute(query);
      res.json({ success: true, data: result });
    },
  ),
];
