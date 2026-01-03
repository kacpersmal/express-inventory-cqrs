import { z } from "zod/v3";

export const getHelloQuerySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type GetHelloQuery = z.infer<typeof getHelloQuerySchema>;
