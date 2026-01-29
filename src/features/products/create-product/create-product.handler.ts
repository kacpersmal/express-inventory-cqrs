import type { ICommandHandler } from "@/infrastructure/cqrs";
import {
  type IProductWriteRepository,
  type ProductDto,
  productWriteRepository,
} from "../repositories";
import type { CreateProductCommand } from "./create-product.schema";

export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, ProductDto>
{
  constructor(
    private readonly writeRepository: IProductWriteRepository = productWriteRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductDto> {
    const { name, description, price, stock, category } = command.params;

    const product = await this.writeRepository.create({
      name,
      description,
      price,
      stock,
      category,
    });

    return product;
  }
}
