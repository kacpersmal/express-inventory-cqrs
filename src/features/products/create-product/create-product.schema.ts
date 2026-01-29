import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";
import type { ProductDto } from "../repositories";

export const createProductBodySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(50),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0),
  category: z.string().min(1).max(50),
});

export type CreateProductBodyParams = z.infer<typeof createProductBodySchema>;

export class CreateProductCommand implements ICommand<ProductDto> {
  readonly type = "CreateProductCommand";

  constructor(public readonly params: CreateProductBodyParams) {}
}
