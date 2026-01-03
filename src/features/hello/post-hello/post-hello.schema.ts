import { z } from "zod/v3";

export const postHelloBodySchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
});

export type PostHelloBody = z.infer<typeof postHelloBodySchema>;
