import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Business Error Exception
 * Used for: resource_not_found, resource_conflict, state_conflict, resource_gone
 */
export class BusinessErrorException extends HttpException {
  constructor(
    public readonly messageKey: string,
    public readonly params?: Record<string, any>,
    public readonly instance?: string,
  ) {
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
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
