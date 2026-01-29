import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";
import type { OrderDto } from "../repositories";

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

export class CreateOrderCommand implements ICommand<OrderDto> {
  readonly type = "CreateOrderCommand";

  constructor(public readonly params: CreateOrderBodyParams) {}
}
