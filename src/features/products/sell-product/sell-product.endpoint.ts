import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import { ProductModel } from "../product.model";
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
      const previousProduct = await ProductModel.findById(req.params.id).lean();
      const previousStock = previousProduct?.stock ?? 0;

      const command = new SellProductCommand(req.params.id, req.body.quantity);
      await commandBus.execute(command);

      const product = await ProductModel.findById(req.params.id).lean();

      res.json({
        success: true,
        data: {
          id: product?._id?.toString(),
          name: product?.name,
          previousStock,
          soldQuantity: req.body.quantity,
          newStock: product?.stock,
        },
      });
    },
  ),
];
