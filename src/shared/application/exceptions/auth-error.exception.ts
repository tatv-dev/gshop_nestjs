import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionParams } from './param.exception'

export class AuthErrorException extends HttpException {
  public readonly messageKey: string;
  public readonly params?: Record<string, any>;
  public readonly instance?: string;

  constructor({ messageKey, params = {}, instance }: ExceptionParams) {
    const statusMap: Record<string, number> = {
      authentication_required: HttpStatus.UNAUTHORIZED,
      auth_token_expired: HttpStatus.UNAUTHORIZED,
      auth_invalid_credentials: HttpStatus.UNAUTHORIZED,
      forbidden: HttpStatus.FORBIDDEN,
      account_locked: HttpStatus.FORBIDDEN,
    };

    const status = statusMap[messageKey] || HttpStatus.UNAUTHORIZED;

    super(
      {
        messageKey: `auth_error.${messageKey}`,
        params,
      },
      status,
    );
    this.messageKey = `auth_error.${messageKey}`;
    this.params = params;
    this.instance = instance;
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
