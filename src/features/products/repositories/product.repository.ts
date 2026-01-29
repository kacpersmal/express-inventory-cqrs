import type { ClientSession } from "mongoose";
import type { IUnitOfWork } from "@/infrastructure/repositories";
import { ProductModel } from "../product.model";
import type {
  CreateProductData,
  IProductReadRepository,
  IProductWriteRepository,
  ProductDto,
  ProductFilter,
  ProductForOrderDto,
  UpdateProductData,
} from "./product.repository.interface";

function toProductDto(product: InstanceType<typeof ProductModel>): ProductDto {
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export class ProductReadRepository implements IProductReadRepository {
  async findById(id: string): Promise<ProductDto | null> {
    const product = await ProductModel.findById(id);
    return product ? toProductDto(product) : null;
  }

  async findByIds(ids: string[]): Promise<ProductDto[]> {
    const products = await ProductModel.find({ _id: { $in: ids } });
    return products.map(toProductDto);
  }

  async findAll(filter?: ProductFilter): Promise<ProductDto[]> {
    const query = this.buildFilter(filter);
    const products = await ProductModel.find(query).sort({ createdAt: -1 });
    return products.map(toProductDto);
  }

  async count(filter?: ProductFilter): Promise<number> {
    const query = this.buildFilter(filter);
    return ProductModel.countDocuments(query);
  }

  async getProductForOrder(id: string): Promise<ProductForOrderDto | null> {
    const product = await ProductModel.findById(id).select(
      "_id name price stock category",
    );
    if (!product) return null;

    return {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
    };
  }

  private buildFilter(filter?: ProductFilter): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (!filter) return query;

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) {
        (query.price as Record<string, number>).$gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        (query.price as Record<string, number>).$lte = filter.maxPrice;
      }
    }

    return query;
  }
}

export class ProductWriteRepository implements IProductWriteRepository {
  private session: ClientSession | null = null;

  setUnitOfWork(uow: IUnitOfWork): void {
    this.session = uow.getSession();
  }

  async create(data: CreateProductData): Promise<ProductDto> {
    const product = new ProductModel(data);
    await product.save({ session: this.session ?? undefined });
    return toProductDto(product);
  }

  async updateStock(
    id: string,
    stockDelta: number,
  ): Promise<ProductDto | null> {
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { $inc: { stock: stockDelta } },
      { new: true, session: this.session ?? undefined },
    );
    return product ? toProductDto(product) : null;
  }

  async update(
    id: string,
    data: UpdateProductData,
  ): Promise<ProductDto | null> {
    const product = await ProductModel.findByIdAndUpdate(id, data, {
      new: true,
      session: this.session ?? undefined,
    });
    return product ? toProductDto(product) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id, {
      session: this.session ?? undefined,
    });
    return result !== null;
  }
}

export const productReadRepository = new ProductReadRepository();
export const productWriteRepository = new ProductWriteRepository();
