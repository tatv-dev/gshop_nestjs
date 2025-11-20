import { HttpStatus } from '@nestjs/common';

export interface DomainExceptionParams {
  messageKey: string;
  params?: Record<string, any>;
  instance?: string;
}

export class DomainException extends Error {
  public readonly messageKey: string;
  public readonly params: Record<string, any>;
  public readonly httpStatus: HttpStatus;
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance }: DomainExceptionParams) {
    super(messageKey);
    this.name = 'DomainException';
    this.messageKey = messageKey;
    this.params = params;
    this.httpStatus = HttpStatus.BAD_REQUEST; // 400 - Business rule violation
    this.instance = instance;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      messageKey: this.messageKey,
      params: this.params,
      httpStatus: this.httpStatus,
      instance: this.instance,
    };
  }
}
