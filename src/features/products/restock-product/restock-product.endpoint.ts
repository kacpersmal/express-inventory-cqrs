import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import { ProductModel } from "../product.model";
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
      const previousProduct = await ProductModel.findById(req.params.id).lean();
      const previousStock = previousProduct?.stock ?? 0;

      const command = new RestockProductCommand(
        req.params.id,
        req.body.quantity,
      );
      await commandBus.execute(command);

      const product = await ProductModel.findById(req.params.id).lean();

      res.json({
        success: true,
        data: {
          id: product?._id?.toString(),
          name: product?.name,
          previousStock,
          addedQuantity: req.body.quantity,
          newStock: product?.stock,
        },
      });
    },
  ),
];
