import type { ICommandHandler } from "@/infrastructure/cqrs";
import { EntityNotFoundError } from "@/shared/errors/domain-errors";
import {
  type IProductReadRepository,
  type IProductWriteRepository,
  productReadRepository,
  productWriteRepository,
} from "../repositories";
import type {
  RestockProductCommand,
  RestockProductResult,
} from "./restock-product.schema";

export class RestockProductHandler
  implements ICommandHandler<RestockProductCommand, RestockProductResult>
{
  constructor(
    private readonly readRepository: IProductReadRepository = productReadRepository,
    private readonly writeRepository: IProductWriteRepository = productWriteRepository,
  ) {}

  async execute(command: RestockProductCommand): Promise<RestockProductResult> {
    const { productId, quantity } = command;

    const product = await this.readRepository.findById(productId);

    if (!product) {
      throw new EntityNotFoundError("Product", productId);
    }

    const previousStock = product.stock;
    const updatedProduct = await this.writeRepository.updateStock(
      productId,
      quantity,
    );

    return {
      id: product.id,
      name: product.name,
      previousStock,
      addedQuantity: quantity,
      newStock: updatedProduct?.stock ?? previousStock + quantity,
    };
  }
}
