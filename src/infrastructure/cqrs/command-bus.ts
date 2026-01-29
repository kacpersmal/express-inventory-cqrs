import { logger } from "../../shared/logger";
import { CommandNotRegisteredError, DuplicateHandlerError } from "./errors";
import type {
  CommandHandlerClass,
  ICommand,
  ICommandHandler,
} from "./interfaces";

export class CommandBus {
  private static instance: CommandBus;
  private handlers = new Map<
    string,
    ICommandHandler<ICommand<unknown>, unknown>
  >();

  private constructor() {}

  static getInstance(): CommandBus {
    if (!CommandBus.instance) {
      CommandBus.instance = new CommandBus();
    }
    return CommandBus.instance;
  }

  register<TCommand extends ICommand<TResult>, TResult = void>(
    commandType: string,
    HandlerClass: CommandHandlerClass<TCommand, TResult>,
    dependencies: unknown[] = [],
  ): void {
    if (this.handlers.has(commandType)) {
      throw new DuplicateHandlerError(commandType, "command");
    }

    const handler = new HandlerClass(...dependencies);
    this.handlers.set(
      commandType,
      handler as ICommandHandler<ICommand<unknown>, unknown>,
    );
    logger.info({ commandType }, "Command handler registered");
  }

  async execute<TResult>(command: ICommand<TResult>): Promise<TResult> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      throw new CommandNotRegisteredError(command.type);
    }

    logger.debug({ commandType: command.type }, "Executing command");

    try {
      const result = await handler.execute(command);
      logger.debug(
        { commandType: command.type },
        "Command executed successfully",
      );
      return result as TResult;
    } catch (error) {
      logger.error(
        { err: error, commandType: command.type },
        "Command execution failed",
      );
      throw error;
    }
  }

  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const commandBus = CommandBus.getInstance();
