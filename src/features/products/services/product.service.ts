import type { IUnitOfWork } from "@/infrastructure/repositories";
import {
  type IProductReadRepository,
  type IProductWriteRepository,
  type ProductForOrderDto,
  productReadRepository,
  productWriteRepository,
} from "../repositories";

export interface IProductService {
  getProductForOrder(productId: string): Promise<ProductForOrderDto | null>;
  decrementStock(
    productId: string,
    quantity: number,
    uow?: IUnitOfWork,
  ): Promise<void>;
}

export class ProductService implements IProductService {
  constructor(
    private readonly readRepository: IProductReadRepository = productReadRepository,
    private readonly writeRepository: IProductWriteRepository = productWriteRepository,
  ) {}

  async getProductForOrder(
    productId: string,
  ): Promise<ProductForOrderDto | null> {
    return this.readRepository.getProductForOrder(productId);
  }

  async decrementStock(
    productId: string,
    quantity: number,
    uow?: IUnitOfWork,
  ): Promise<void> {
    if (uow) {
      this.writeRepository.setUnitOfWork(uow);
    }
    await this.writeRepository.updateStock(productId, -quantity);
  }
}

export const productService = new ProductService();
