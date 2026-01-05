import type { ICommandHandler } from "@/infrastructure/cqrs";
import { NotFoundError } from "@/shared/errors";
import { ProductModel } from "../product.model";
import type {
  RestockProductCommand,
  RestockProductResult,
} from "./restock-product.schema";

export class RestockProductHandler
  implements ICommandHandler<RestockProductCommand>
{
  private result: RestockProductResult | null = null;

  async execute(command: RestockProductCommand): Promise<void> {
    const { productId, quantity } = command;

    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundError(
        `Product with id ${productId} not found`,
        "PRODUCT_NOT_FOUND",
        { productId },
      );
    }

    const previousStock = product.stock;
    product.stock += quantity;
    await product.save();

    this.result = {
      id: product._id.toString(),
      name: product.name,
      previousStock,
      addedQuantity: quantity,
      newStock: product.stock,
    };
  }

  getResult(): RestockProductResult | null {
    return this.result;
  }
}
