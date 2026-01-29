export interface ICommand<_TResult = void> {
  readonly type: string;
}

export interface IQuery<_TResult = unknown> {
  readonly type: string;
}

export interface ICommandHandler<
  TCommand extends ICommand<TResult>,
  TResult = void,
> {
  execute(command: TCommand): Promise<TResult>;
}

export interface IQueryHandler<
  TQuery extends IQuery<TResult>,
  TResult = unknown,
> {
  execute(query: TQuery): Promise<TResult>;
}

export type CommandHandlerClass<
  TCommand extends ICommand<TResult>,
  TResult = void,
  // biome-ignore lint/suspicious/noExplicitAny: Handler classes can have any constructor signature
> = new (...args: any[]) => ICommandHandler<TCommand, TResult>;

export type QueryHandlerClass<
  TQuery extends IQuery<TResult>,
  TResult = unknown,
  // biome-ignore lint/suspicious/noExplicitAny: Handler classes can have any constructor signature
> = new (...args: any[]) => IQueryHandler<TQuery, TResult>;
