import type { Request, Response } from "express";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import { ProductModel } from "../product.model";
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
      await commandBus.execute(command);

      const product = await ProductModel.findOne({ name: req.body.name })
        .sort({ createdAt: -1 })
        .lean();

      res.status(201).json({
        success: true,
        data: {
          id: product?._id?.toString(),
          name: product?.name,
          description: product?.description,
          price: product?.price,
          stock: product?.stock,
          category: product?.category,
          createdAt: product?.createdAt,
        },
      });
    },
  ),
];
