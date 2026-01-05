import { InternalServerError, ConflictError } from "@/shared/errors";

export class CommandNotRegisteredError extends InternalServerError {
  constructor(commandType: string) {
    super(
      `Command handler not registered for command: ${commandType}`,
      "COMMAND_NOT_REGISTERED",
      { commandType }
    );
  }
}

export class QueryNotRegisteredError extends InternalServerError {
  constructor(queryType: string) {
    super(
      `Query handler not registered for query: ${queryType}`,
      "QUERY_NOT_REGISTERED",
      { queryType }
    );
  }
}

export class DuplicateHandlerError extends ConflictError {
  constructor(type: string, handlerType: "command" | "query") {
    super(
      `${handlerType} handler already registered for type: ${type}`,
      "DUPLICATE_HANDLER",
      { type, handlerType }
    );
  }
}
