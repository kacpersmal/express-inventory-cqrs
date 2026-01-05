import type { Request, Response } from "express";
import mongoose from "mongoose";
import { commandBus } from "@/infrastructure/cqrs";
import { asyncHandler } from "@/shared/errors";
import { validate } from "@/shared/middleware";
import { OrderModel } from "../order.model";
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
      await commandBus.execute(command);

      const order = await OrderModel.findOne({
        customerId: new mongoose.Types.ObjectId(req.body.customerId),
      })
        .sort({ createdAt: -1 })
        .lean();

      res.status(201).json({
        success: true,
        data: {
          id: order?._id?.toString(),
          customerId: order?.customerId?.toString(),
          items: order?.items?.map((item) => ({
            productId: item.productId?.toString(),
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          subtotal: order?.subtotal,
          discountType: order?.discountType,
          discountPercentage: order?.discountPercentage,
          discountAmount: order?.discountAmount,
          regionAdjustment: order?.regionAdjustment,
          finalTotal: order?.finalTotal,
          createdAt: order?.createdAt,
        },
      });
    },
  ),
];
