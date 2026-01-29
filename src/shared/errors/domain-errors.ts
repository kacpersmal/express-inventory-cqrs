/**
 * Base class for domain/application errors.
 * These errors are agnostic of HTTP and will be mapped by the error handler middleware.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly timestamp: string;

  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  readonly code = "ENTITY_NOT_FOUND";

  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    details?: unknown,
  ) {
    super(`${entityType} with id ${entityId} not found`, details);
  }
}

export class EntityAlreadyExistsError extends DomainError {
  readonly code = "ENTITY_ALREADY_EXISTS";

  constructor(
    public readonly entityType: string,
    public readonly field: string,
    public readonly value: string,
    details?: unknown,
  ) {
    super(`${entityType} with ${field} "${value}" already exists`, details);
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = "INSUFFICIENT_STOCK";

  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly availableStock: number,
    public readonly requestedQuantity: number,
  ) {
    super(
      `Insufficient stock for product "${productName}". Available: ${availableStock}, Requested: ${requestedQuantity}`,
      { productId, productName, availableStock, requestedQuantity },
    );
  }
}

export class BusinessRuleViolationError extends DomainError {
  readonly code = "BUSINESS_RULE_VIOLATION";
}

export class InvalidOperationError extends DomainError {
  readonly code = "INVALID_OPERATION";
}
