import type { ICommandHandler } from "@/infrastructure/cqrs";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { ProductModel } from "../product.model";
import type {
  SellProductCommand,
  SellProductResult,
} from "./sell-product.schema";

export class SellProductHandler implements ICommandHandler<SellProductCommand> {
  private result: SellProductResult | null = null;

  async execute(command: SellProductCommand): Promise<void> {
    const { productId, quantity } = command;

    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundError(
        `Product with id ${productId} not found`,
        "PRODUCT_NOT_FOUND",
        { productId },
      );
    }

    if (product.stock < quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        "INSUFFICIENT_STOCK",
        {
          productId,
          availableStock: product.stock,
          requestedQuantity: quantity,
        },
      );
    }

    const previousStock = product.stock;
    product.stock -= quantity;
    await product.save();

    this.result = {
      id: product._id.toString(),
      name: product.name,
      previousStock,
      soldQuantity: quantity,
      newStock: product.stock,
    };
  }

  getResult(): SellProductResult | null {
    return this.result;
  }
}
