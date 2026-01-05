import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";
import type { CustomerRegion } from "../customer.model";

export const createCustomerBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  region: z.enum(["US", "EUROPE", "ASIA"]),
});

export type CreateCustomerBodyParams = z.infer<typeof createCustomerBodySchema>;

export interface CreateCustomerResult {
  id: string;
  name: string;
  email: string;
  region: CustomerRegion;
  createdAt: string;
}

export class CreateCustomerCommand implements ICommand {
  readonly type = "CreateCustomerCommand";

  constructor(public readonly params: CreateCustomerBodyParams) {}
}
