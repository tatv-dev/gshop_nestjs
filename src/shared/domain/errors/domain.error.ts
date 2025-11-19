// src/shared/domain/errors/domain.error.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string) {
    super(`Business rule violation: ${rule}`);
    this.name = 'BusinessRuleViolationError';
  }
}

export class AggregateNotFoundError extends DomainError {
  constructor(aggregateType: string, id: string) {
    super(`${aggregateType} with id ${id} not found`);
    this.name = 'AggregateNotFoundError';
  }
}