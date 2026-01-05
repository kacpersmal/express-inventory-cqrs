import mongoose from "mongoose";
import { CustomerModel } from "@/features/customers/customer.model";
import { ProductModel } from "@/features/products/product.model";
import type { ICommandHandler } from "@/infrastructure/cqrs";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { calculatePricing, type OrderItem } from "@/shared/services";
import { OrderModel } from "../order.model";
import type { CreateOrderCommand } from "./create-order.schema";

export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  async execute(command: CreateOrderCommand): Promise<void> {
    const { customerId, products } = command.params;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      throw new NotFoundError(
        `Customer with id ${customerId} not found`,
        "CUSTOMER_NOT_FOUND",
        { customerId },
      );
    }

    const orderItems: OrderItem[] = [];
    const productUpdates: { productId: string; quantity: number }[] = [];

    for (const item of products) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        throw new NotFoundError(
          `Product with id ${item.productId} not found`,
          "PRODUCT_NOT_FOUND",
          { productId: item.productId },
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          "INSUFFICIENT_STOCK",
          {
            productId: item.productId,
            productName: product.name,
            availableStock: product.stock,
            requestedQuantity: item.quantity,
          },
        );
      }

      orderItems.push({
        productId: product._id.toString(),
        productName: product.name,
        category: product.category,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      productUpdates.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const pricing = calculatePricing(orderItems, customer.region);

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const update of productUpdates) {
          await ProductModel.findByIdAndUpdate(
            update.productId,
            { $inc: { stock: -update.quantity } },
            { session },
          );
        }

        const order = new OrderModel({
          customerId: new mongoose.Types.ObjectId(customerId),
          items: orderItems.map((item) => ({
            productId: new mongoose.Types.ObjectId(item.productId),
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
          subtotal: pricing.subtotal,
          discountType: pricing.discount?.type ?? null,
          discountPercentage: pricing.discount?.percentage ?? 0,
          discountAmount: pricing.discountAmount,
          regionAdjustment: pricing.regionAdjustment,
          finalTotal: pricing.finalTotal,
        });

        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
  }
}
