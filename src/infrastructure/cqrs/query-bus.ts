import type { IQuery, IQueryHandler, QueryHandlerClass } from "./interfaces";
import { QueryNotRegisteredError, DuplicateHandlerError } from "./errors";
import { logger } from "../../shared/logger";

export class QueryBus {
  private static instance: QueryBus;
  private handlers = new Map<string, IQueryHandler<IQuery, unknown>>();

  private constructor() {}

  static getInstance(): QueryBus {
    if (!QueryBus.instance) {
      QueryBus.instance = new QueryBus();
    }
    return QueryBus.instance;
  }

  register<TQuery extends IQuery<TResult>, TResult = unknown>(
    queryType: string,
    HandlerClass: QueryHandlerClass<TQuery, TResult>,
    dependencies: unknown[] = []
  ): void {
    if (this.handlers.has(queryType)) {
      throw new DuplicateHandlerError(queryType, "query");
    }

    const handler = new HandlerClass(...dependencies);
    this.handlers.set(queryType, handler as IQueryHandler<IQuery, unknown>);
    logger.info({ queryType }, "Query handler registered");
  }

  async execute<TResult>(query: IQuery<TResult>): Promise<TResult> {
    const handler = this.handlers.get(query.type);

    if (!handler) {
      throw new QueryNotRegisteredError(query.type);
    }

    logger.debug({ queryType: query.type }, "Executing query");

    try {
      const result = await handler.execute(query);
      logger.debug({ queryType: query.type }, "Query executed successfully");
      return result as TResult;
    } catch (error) {
      logger.error(
        { err: error, queryType: query.type },
        "Query execution failed"
      );
      throw error;
    }
  }

  getRegisteredQueries(): string[] {
    return Array.from(this.handlers.keys());
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const queryBus = QueryBus.getInstance();
