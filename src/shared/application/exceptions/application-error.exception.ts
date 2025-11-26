import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application Error Exception
 * Used for: missing_parameter, etc.
 */
export class ApplicationErrorException extends HttpException {
  constructor(
    public readonly messageKey: string,
    public readonly params?: Record<string, any>,
    public readonly instance?: string,
  ) {
    super(
      {
        messageKey: `application_error.${messageKey}`,
        params,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  get httpStatus(): number {
    return HttpStatus.BAD_REQUEST;
  }
}
