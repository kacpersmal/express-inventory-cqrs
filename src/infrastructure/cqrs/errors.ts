export class CommandNotRegisteredError extends Error {
  constructor(commandType: string) {
    super(`Command handler not registered for command: ${commandType}`);
    this.name = "CommandNotRegisteredError";
  }
}

export class QueryNotRegisteredError extends Error {
  constructor(queryType: string) {
    super(`Query handler not registered for query: ${queryType}`);
    this.name = "QueryNotRegisteredError";
  }
}

export class DuplicateHandlerError extends Error {
  constructor(type: string, handlerType: "command" | "query") {
    super(`${handlerType} handler already registered for type: ${type}`);
    this.name = "DuplicateHandlerError";
  }
}
