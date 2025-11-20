import { HttpStatus } from '@nestjs/common';

export interface ApplicationExceptionParams {
  messageKey: string;
  params?: Record<string, any>;
  instance?: string;
}

export class ApplicationException extends Error {
  public readonly messageKey: string;
  public readonly params: Record<string, any>;
  public readonly httpStatus: HttpStatus;
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance }: ApplicationExceptionParams) {
    super(messageKey);
    this.name = 'ApplicationException';
    this.messageKey = messageKey;
    this.params = params;
    this.httpStatus = HttpStatus.BAD_REQUEST; // 400 - Use case failure
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
