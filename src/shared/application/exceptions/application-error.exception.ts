import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionParams } from './param.exception'
export class ApplicationErrorException extends HttpException {
  public readonly messageKey: string;
  public readonly params?: Record<string, any>;
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance }: ExceptionParams) {
    super(
      {
        messageKey: `application_error.${messageKey}`,
        params,
      },
      HttpStatus.BAD_REQUEST,
    );
    this.messageKey = `application_error.${messageKey}`;
    this.params = params;
    this.instance = instance;
  }

  get httpStatus(): number {
    return HttpStatus.BAD_REQUEST;
  }
}
