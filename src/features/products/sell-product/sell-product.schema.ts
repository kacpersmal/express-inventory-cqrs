import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";

export const sellProductParamsSchema = z.object({
  id: z.string().min(1),
});

export const sellProductBodySchema = z.object({
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export type SellProductParams = z.infer<typeof sellProductParamsSchema>;
export type SellProductBody = z.infer<typeof sellProductBodySchema>;

export interface SellProductResult {
  id: string;
  name: string;
  previousStock: number;
  soldQuantity: number;
  newStock: number;
}

export class SellProductCommand implements ICommand<SellProductResult> {
  readonly type = "SellProductCommand";

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}
