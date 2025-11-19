import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  InvalidCredentialsError,
  AccountLockedError,
  NoActiveWorkspaceError,
} from '../../domain/errors/authentication.error';

@Catch(InvalidCredentialsError, AccountLockedError, NoActiveWorkspaceError)
export class AuthenticationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthenticationExceptionFilter.name);

  catch(
    exception: InvalidCredentialsError | AccountLockedError | NoActiveWorkspaceError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Authentication failed';
    let code = 'AUTHENTICATION_ERROR';
    let lockTime: number | null = null;

    if (exception instanceof InvalidCredentialsError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid username or password';
      code = 'INVALID_CREDENTIALS';
    } else if (exception instanceof AccountLockedError) {
      status = HttpStatus.FORBIDDEN;
      message = 'Account is locked due to too many failed login attempts';
      code = 'ACCOUNT_LOCKED';
      lockTime = exception.lockTime;
    } else if (exception instanceof NoActiveWorkspaceError) {
      status = HttpStatus.FORBIDDEN;
      message = 'User has no active workspace';
      code = 'NO_ACTIVE_WORKSPACE';
    }

    const errorResponse = {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(lockTime !== null && { lockTime }),
    };

    this.logger.warn(
      `${request.method} ${request.url} - ${code}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }
}