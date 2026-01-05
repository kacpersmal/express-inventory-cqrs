import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";

export const createProductBodySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(50),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0),
  category: z.string().min(1).max(50),
});

export type CreateProductBodyParams = z.infer<typeof createProductBodySchema>;

export interface CreateProductResult {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export class CreateProductCommand implements ICommand {
  readonly type = "CreateProductCommand";

  constructor(public readonly params: CreateProductBodyParams) {}
}
