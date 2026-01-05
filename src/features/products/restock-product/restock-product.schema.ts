import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";

export const restockProductParamsSchema = z.object({
  id: z.string().min(1),
});

export const restockProductBodySchema = z.object({
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export type RestockProductParams = z.infer<typeof restockProductParamsSchema>;
export type RestockProductBody = z.infer<typeof restockProductBodySchema>;

export interface RestockProductResult {
  id: string;
  name: string;
  previousStock: number;
  addedQuantity: number;
  newStock: number;
}

export class RestockProductCommand implements ICommand {
  readonly type = "RestockProductCommand";

  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}
}
