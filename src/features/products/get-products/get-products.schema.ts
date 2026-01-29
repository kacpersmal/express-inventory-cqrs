import { z } from "zod/v3";
import type { IQuery } from "@/infrastructure/cqrs";
import type { ProductDto } from "../repositories";

export const getProductsQuerySchema = z.object({
  category: z.string().max(50).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export type GetProductsQueryParams = z.infer<typeof getProductsQuerySchema>;

export interface GetProductsQueryResult {
  products: ProductDto[];
  total: number;
}

export class GetProductsQuery implements IQuery<GetProductsQueryResult> {
  readonly type = "GetProductsQuery";

  constructor(public readonly params: GetProductsQueryParams) {}
}
