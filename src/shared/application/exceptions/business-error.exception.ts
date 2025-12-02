import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionParams } from './param.exception'

export class BusinessErrorException extends HttpException {
  public readonly messageKey: string;
  public readonly params?: Record<string, any>;
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance }: ExceptionParams) {
    const statusMap: Record<string, number> = {
      resource_not_found: HttpStatus.NOT_FOUND,
      resource_conflict: HttpStatus.CONFLICT,
      state_conflict: HttpStatus.CONFLICT,
      resource_gone: HttpStatus.GONE,
    };

    const status = statusMap[messageKey] || HttpStatus.BAD_REQUEST;

    super(
      {
        messageKey: `business_error.${messageKey}`,
        params,
      },
      status,
    );

    this.messageKey = `business_error.${messageKey}`;
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
