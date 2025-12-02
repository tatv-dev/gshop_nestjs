import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * System Error Exception
 * Used for: bad_request, endpoint_not_found, method_not_allowed, not_acceptable, rate_limit_exceeded,
 *           internal_error, database_connection_error, not_implemented, service_unavailable,
 *           third_party_error, payload_too_large
 */
export class SystemErrorException extends HttpException {
  constructor(
    public readonly messageKey: string,
    public readonly params?: Record<string, any>,
    public readonly instance?: string,
  ) {
    const statusMap: Record<string, number> = {
      bad_request: HttpStatus.BAD_REQUEST,
      endpoint_not_found: HttpStatus.NOT_FOUND,
      method_not_allowed: HttpStatus.METHOD_NOT_ALLOWED,
      not_acceptable: HttpStatus.NOT_ACCEPTABLE,
      rate_limit_exceeded: HttpStatus.TOO_MANY_REQUESTS,
      internal_error: HttpStatus.INTERNAL_SERVER_ERROR,
      database_connection_error: HttpStatus.SERVICE_UNAVAILABLE,
      not_implemented: HttpStatus.NOT_IMPLEMENTED,
      service_unavailable: HttpStatus.SERVICE_UNAVAILABLE,
      third_party_error: HttpStatus.BAD_GATEWAY,
      payload_too_large: HttpStatus.PAYLOAD_TOO_LARGE,
    };

    const status = statusMap[messageKey] || HttpStatus.INTERNAL_SERVER_ERROR;

    super(
      {
        messageKey: `system_error.${messageKey}`,
        params,
      },
      status,
    );
    this.messageKey = `system_error.${messageKey}`;
    this.params = params;
    this.instance = instance;
  }

  get httpStatus(): number {
    return this.getStatus();
  }
}
