import { z } from "zod/v3";
import type { IQuery } from "@/infrastructure/cqrs";

export const getProductsQuerySchema = z.object({
  category: z.string().max(50).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export type GetProductsQueryParams = z.infer<typeof getProductsQuerySchema>;

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsQueryResult {
  products: ProductDto[];
  total: number;
}

export class GetProductsQuery implements IQuery<GetProductsQueryResult> {
  readonly type = "GetProductsQuery";

  constructor(public readonly params: GetProductsQueryParams) {}
}
