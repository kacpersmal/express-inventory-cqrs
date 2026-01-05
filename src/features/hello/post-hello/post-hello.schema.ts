import { z } from "zod/v3";
import type { ICommand } from "@/infrastructure/cqrs";

export const postHelloBodySchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
});

export type PostHelloBodyParams = z.infer<typeof postHelloBodySchema>;

export interface PostHelloCommandResult {
  greeting: string;
  echo: string;
  timestamp: string;
}

export class PostHelloCommand implements ICommand {
  readonly type = "PostHelloCommand";

  constructor(public readonly params: PostHelloBodyParams) {}
}
