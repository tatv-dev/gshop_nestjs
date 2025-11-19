import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid username or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountLockedError extends DomainError {
  public readonly lockTime: number;

  constructor(lockTime: number) {
    super('Account is locked due to too many failed login attempts');
    this.name = 'AccountLockedError';
    this.lockTime = lockTime;
  }
}

export class NoActiveWorkspaceError extends DomainError {
  constructor() {
    super('User has no active workspace');
    this.name = 'NoActiveWorkspaceError';
  }
}
