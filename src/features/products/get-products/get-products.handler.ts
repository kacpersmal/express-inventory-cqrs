import type { IQueryHandler } from "@/infrastructure/cqrs";
import { ProductModel } from "../product.model";
import type {
  GetProductsQuery,
  GetProductsQueryResult,
  ProductDto,
} from "./get-products.schema";

export class GetProductsHandler
  implements IQueryHandler<GetProductsQuery, GetProductsQueryResult>
{
  async execute(query: GetProductsQuery): Promise<GetProductsQueryResult> {
    const { category, minPrice, maxPrice } = query.params;

    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        (filter.price as Record<string, number>).$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (filter.price as Record<string, number>).$lte = maxPrice;
      }
    }

    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    const total = await ProductModel.countDocuments(filter);

    const productDtos: ProductDto[] = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return {
      products: productDtos,
      total,
    };
  }
}
