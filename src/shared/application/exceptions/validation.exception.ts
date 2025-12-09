import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError, ExceptionParams } from './param.exception';

export class ValidationException extends HttpException {
  public readonly messageKey: string;
  public readonly errors: ValidationError[];
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance, errors }: ExceptionParams) {
    super(
      {
        messageKey: `validation_error.${messageKey}`,
        params,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    this.messageKey = 'validation_error.general';
    this.errors = errors || [];
    this.instance = instance;
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
