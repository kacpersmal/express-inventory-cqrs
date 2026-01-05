import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";

export const createOrderBodySchema = z.object({
  customerId: z.string().min(1),
  products: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Order must contain at least one product"),
});

export type CreateOrderBodyParams = z.infer<typeof createOrderBodySchema>;

export interface OrderItemResult {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderResult {
  id: string;
  customerId: string;
  items: OrderItemResult[];
  subtotal: number;
  discountType: string | null;
  discountPercentage: number;
  discountAmount: number;
  regionAdjustment: number;
  finalTotal: number;
  createdAt: string;
}

export class CreateOrderCommand implements ICommand {
  readonly type = "CreateOrderCommand";

  constructor(public readonly params: CreateOrderBodyParams) {}
}
