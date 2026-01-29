import type { IQueryHandler } from "@/infrastructure/cqrs";
import {
  type IProductReadRepository,
  productReadRepository,
} from "../repositories";
import type {
  GetProductsQuery,
  GetProductsQueryResult,
} from "./get-products.schema";

export class GetProductsHandler
  implements IQueryHandler<GetProductsQuery, GetProductsQueryResult>
{
  constructor(
    private readonly readRepository: IProductReadRepository = productReadRepository,
  ) {}

  async execute(query: GetProductsQuery): Promise<GetProductsQueryResult> {
    const { category, minPrice, maxPrice } = query.params;

    const filter = { category, minPrice, maxPrice };

    const [products, total] = await Promise.all([
      this.readRepository.findAll(filter),
      this.readRepository.count(filter),
    ]);

    return {
      products,
      total,
    };
  }
}
