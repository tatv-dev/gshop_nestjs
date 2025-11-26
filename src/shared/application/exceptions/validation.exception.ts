import { HttpStatus } from '@nestjs/common';

export interface ValidationError {
  field: string;
  value: any;
  messageKey: string;
  params?: Record<string, any>;
}

export interface ValidationExceptionParams {
  errors: ValidationError[];
  instance?: string;
}

export class ValidationException extends Error {
  public readonly messageKey = 'validation_error';
  public readonly errors: ValidationError[];
  public readonly httpStatus: HttpStatus;
  public readonly instance?: string;

  constructor({ errors, instance }: ValidationExceptionParams) {
    super('validation_error');
    this.name = 'ValidationException';
    this.errors = errors;
    this.httpStatus = HttpStatus.UNPROCESSABLE_ENTITY; // 422
    this.instance = instance;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      messageKey: this.messageKey,
      errors: this.errors,
      httpStatus: this.httpStatus,
      instance: this.instance,
    };
  }
}
