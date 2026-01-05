import { z } from "zod/v3";
import type { IQuery } from "@/infrastructure/cqrs";
import type { CustomerRegion } from "../customer.model";

export const getCustomersQuerySchema = z.object({
  region: z.enum(["US", "EUROPE", "ASIA"]).optional(),
});

export type GetCustomersQueryParams = z.infer<typeof getCustomersQuerySchema>;

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  region: CustomerRegion;
  createdAt: string;
}

export interface GetCustomersQueryResult {
  customers: CustomerDto[];
  total: number;
}

export class GetCustomersQuery implements IQuery<GetCustomersQueryResult> {
  readonly type = "GetCustomersQuery";

  constructor(public readonly params: GetCustomersQueryParams) {}
}
