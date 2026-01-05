export interface ICommand {
  readonly type: string;
}

export interface IQuery<TResult = unknown> {
  readonly type: string;
}

export interface ICommandHandler<TCommand extends ICommand> {
  execute(command: TCommand): Promise<void>;
}

export interface IQueryHandler<
  TQuery extends IQuery<TResult>,
  TResult = unknown
> {
  execute(query: TQuery): Promise<TResult>;
}

export type CommandHandlerClass<TCommand extends ICommand> = new (
  ...args: unknown[]
) => ICommandHandler<TCommand>;

export type QueryHandlerClass<
  TQuery extends IQuery<TResult>,
  TResult = unknown
> = new (...args: unknown[]) => IQueryHandler<TQuery, TResult>;
