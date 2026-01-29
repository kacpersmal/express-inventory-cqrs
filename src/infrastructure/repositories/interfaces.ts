import type { ClientSession } from "mongoose";

export interface IUnitOfWork {
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  getSession(): ClientSession | null;
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export interface IReadRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

export interface IWriteRepository<TEntity, TId = string> {
  create(entity: Omit<TEntity, "id">): Promise<TEntity>;
  update(id: TId, entity: Partial<TEntity>): Promise<TEntity | null>;
  delete(id: TId): Promise<boolean>;
  setUnitOfWork(uow: IUnitOfWork): void;
}

export interface IRepository<TEntity, TId = string>
  extends IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId> {}
