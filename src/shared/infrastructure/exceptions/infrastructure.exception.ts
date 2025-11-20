import { HttpStatus } from '@nestjs/common';

export interface InfrastructureExceptionParams {
  messageKey: string;
  params?: Record<string, any>;
  instance?: string;
  cause?: Error;
}

export class InfrastructureException extends Error {
  public readonly messageKey: string;
  public readonly params: Record<string, any>;
  public readonly httpStatus: HttpStatus;
  public readonly instance?: string;
  public readonly cause?: Error;

  constructor({ messageKey, params = {}, instance, cause }: InfrastructureExceptionParams) {
    super(messageKey);
    this.name = 'InfrastructureException';
    this.messageKey = messageKey;
    this.params = params;
    this.httpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // 500 - Technical failure
    this.instance = instance;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      messageKey: this.messageKey,
      params: this.params,
      httpStatus: this.httpStatus,
      instance: this.instance,
      cause: this.cause?.message,
    };
  }
}
