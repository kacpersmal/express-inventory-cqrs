import type { ICommandHandler } from "@/infrastructure/cqrs";
import { logger } from "@/shared/logger";
import type { PostHelloCommand } from "./post-hello.schema";

export class PostHelloHandler implements ICommandHandler<PostHelloCommand> {
  private lastResult: {
    greeting: string;
    echo: string;
    timestamp: string;
  } | null = null;

  async execute(command: PostHelloCommand): Promise<void> {
    const { name, message } = command.params;

    this.lastResult = {
      greeting: `Hello, ${name}!`,
      echo: message,
      timestamp: new Date().toISOString(),
    };

    logger.info({ result: this.lastResult }, "PostHello command executed");
  }

  getLastResult() {
    return this.lastResult;
  }
}
