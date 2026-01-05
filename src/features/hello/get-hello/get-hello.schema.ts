import { z } from "zod/v3";
import type { IQuery } from "@/infrastructure/cqrs";

export const getHelloQuerySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type GetHelloQueryParams = z.infer<typeof getHelloQuerySchema>;

export interface GetHelloQueryResult {
  greeting: string;
}

export class GetHelloQuery implements IQuery<GetHelloQueryResult> {
  readonly type = "GetHelloQuery";

  constructor(public readonly params: GetHelloQueryParams) {}
}
