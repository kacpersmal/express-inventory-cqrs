import type { ICommandHandler } from "@/infrastructure/cqrs";
import { BadRequestError } from "@/shared/errors";
import { ProductModel } from "../product.model";
import type {
  CreateProductCommand,
  CreateProductResult,
} from "./create-product.schema";

export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  private result: CreateProductResult | null = null;

  async execute(command: CreateProductCommand): Promise<void> {
    const { name, description, price, stock, category } = command.params;

    if (price <= 0) {
      throw new BadRequestError("Price must be positive", "INVALID_PRICE", {
        price,
      });
    }

    const product = new ProductModel({
      name,
      description,
      price,
      stock,
      category,
    });

    await product.save();

    this.result = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt.toISOString(),
    };
  }

  getResult(): CreateProductResult | null {
    return this.result;
  }
}
