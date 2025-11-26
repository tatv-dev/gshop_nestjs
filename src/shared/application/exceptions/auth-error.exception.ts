import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Authentication/Authorization Error Exception
 * Used for: authentication_required, auth_token_expired, auth_invalid_credentials, forbidden, account_locked
 */
export class AuthErrorException extends HttpException {
  constructor(
    public readonly messageKey: string,
    public readonly params?: Record<string, any>,
    public readonly instance?: string,
  ) {
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
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
