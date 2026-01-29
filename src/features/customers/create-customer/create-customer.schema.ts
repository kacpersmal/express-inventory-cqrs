import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";
import type { CustomerDto } from "../repositories";

export const createCustomerBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  region: z.enum(["US", "EUROPE", "ASIA"]),
});

export type CreateCustomerBodyParams = z.infer<typeof createCustomerBodySchema>;

export class CreateCustomerCommand implements ICommand<CustomerDto> {
  readonly type = "CreateCustomerCommand";

  constructor(public readonly params: CreateCustomerBodyParams) {}
}
