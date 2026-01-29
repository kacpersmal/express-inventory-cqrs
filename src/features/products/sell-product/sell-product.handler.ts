import type { ICommandHandler } from "@/infrastructure/cqrs";
import {
  EntityNotFoundError,
  InsufficientStockError,
} from "@/shared/errors/domain-errors";
import {
  type IProductReadRepository,
  type IProductWriteRepository,
  productReadRepository,
  productWriteRepository,
} from "../repositories";
import type {
  SellProductCommand,
  SellProductResult,
} from "./sell-product.schema";

export class SellProductHandler
  implements ICommandHandler<SellProductCommand, SellProductResult>
{
  constructor(
    private readonly readRepository: IProductReadRepository = productReadRepository,
    private readonly writeRepository: IProductWriteRepository = productWriteRepository,
  ) {}

  async execute(command: SellProductCommand): Promise<SellProductResult> {
    const { productId, quantity } = command;

    const product = await this.readRepository.findById(productId);

    if (!product) {
      throw new EntityNotFoundError("Product", productId);
    }

    if (product.stock < quantity) {
      throw new InsufficientStockError(
        productId,
        product.name,
        product.stock,
        quantity,
      );
    }

    const previousStock = product.stock;
    const updatedProduct = await this.writeRepository.updateStock(
      productId,
      -quantity,
    );

    return {
      id: product.id,
      name: product.name,
      previousStock,
      soldQuantity: quantity,
      newStock: updatedProduct?.stock ?? previousStock - quantity,
    };
  }
}
